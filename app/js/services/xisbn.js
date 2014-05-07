'use strict';

(function() {
  /**
   * Filter unwanted editions and munge each edition object
   */
  var mungeXisbnEditions = function(raw_editions) {
    var editions = _.chain(raw_editions)
      .filter(function(ed) {
        // filter to English and book formats (BA=book BB=hardcover BC=paperback)
        return (ed.lang === 'eng' && ed.form &&
            (_.intersection(['BA','BB','BC'], ed.form).length > 0));
      }).map(function(ed) {
        return {
          isbn:     ed.isbn[0],
          title:    ed.title,
          author:   ed.author,
          lang:     ed.lang,
          ed:       ed.ed,
          year:     ed.year
        };
      }).value();
    return editions;
  }

  var XisbnService = function XisbnService($resource, $cacheFactory, $log) {
    var xisbnAPI,
        xisbnCache;

    xisbnCache = $cacheFactory('xisbn');

    xisbnAPI = $resource(
      "http://xisbn.worldcat.org/webservices/xid/isbn/:isbn", {
        format: 'json',
        callback: 'JSON_CALLBACK',
      }, {
        getEditions: {
          method: 'JSONP',
          params: {
            method: 'getEditions',
            fl: 'form,lang,author,ed,year,isbn,title'
          }
      }
    });

    return {
      'getEditions': function(isbn, successFn, failureFn) {
        var cached = xisbnCache.get(isbn),
            handleSuccess,
            handleFailure;

        handleSuccess = function(data) {
          if (!cached) {
            xisbnCache.put(isbn, data);
          }
          if (data.stat !== "ok") {
            failureFn(data, 200, data.stat);
            return;
          }
          successFn(mungeXisbnEditions(data.list));
        };
        handleFailure = function(data, stat) {
          failureFn(data, stat, ''); 
        };

        if (cached) {
          handleSuccess(cached);
        } else {
          xisbnAPI.getEditions({isbn: isbn}, handleSuccess, handleFailure);
        }
      }
    };
  }

  /**
   * Simulate HTTP failures for one in three requests.
   */
  var XisbnServiceTest = function XisbnServiceTest() {
    var service = XisbnService.apply(this, arguments),
        fn = service.getEditions;
    service.getEditions = function(isbn, successFn, failureFn) {
      _.sample([fn, fn, function() {
        (failureFn || _.noop)('', 400, 'XisbnServiceTest mock error');
      }]).apply(this, arguments);
    };
    return service;
  }

  XisbnService.$inject = ['$resource', '$cacheFactory', '$log'];
  XisbnServiceTest.$inject = XisbnService.$inject;

  angular.module('myApp.services.xisbn', ['ngResource'])
    .factory('XisbnService', XisbnService)
})();
