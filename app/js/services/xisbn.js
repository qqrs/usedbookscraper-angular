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

  var XisbnApi = function XisbnApi($resource, $cacheFactory, $log) {
    var xisbnResource,
        xisbnCache;

    // manage cache manually -- Angular HTTP cache option doesn't work for JSONP
    xisbnCache = $cacheFactory('xisbn');

    xisbnResource = $resource(
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
            failureFn({}, data.stat);
            return;
          }
          successFn(mungeXisbnEditions(data.list));
        };

        if (cached) {
          handleSuccess(cached);
        } else {
          xisbnResource.getEditions({isbn: isbn}, handleSuccess, failureFn);
        }
      }
    };
  }

  /**
   * Simulate HTTP failures for one in three requests.
   */
  var XisbnApiTest = function XisbnServiceTest() {
    var service = XisbnApi.apply(this, arguments),
        fn = service.getEditions;
    service.getEditions = function(isbn, successFn, failureFn) {
      _.sample([fn, fn, function() {
        (failureFn || _.noop)({}, 'XisbnApiTest mock error');
      }]).apply(this, arguments);
    };
    return service;
  }

  XisbnApi.$inject = ['$resource', '$cacheFactory', '$log'];
  XisbnApiTest.$inject = XisbnApi.$inject;

  angular.module('myApp.services.xisbn', ['ngResource'])
    .factory('XisbnApi', XisbnApi)
})();
