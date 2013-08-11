'use strict';

/* Services */

(function() {

  function XisbnAPI($resource) {
    return $resource(
      "http://xisbn.worldcat.org/webservices/xid/isbn/:isbn",
      {
        format: 'json',
        callback: 'JSON_CALLBACK',
      },
      {
        getEditions: {
          method: 'JSONP',
          params: {
            method: 'getEditions',
            fl: 'form,lang,author,ed,year,isbn,title'
          }
      }
    });
  }

  XisbnAPI.$inject = [
    '$resource'
  ];

// =============================================================================


  function XisbnService(XisbnAPI) {
    return {
      'getEditions': function(isbn, successCallback) {
        XisbnAPI.getEditions(
          {isbn: isbn},
          function(data) { 
            console.log(data); 
            successCallback(mungeXisbnEditions(data.list));
          },
          // TODO: failure callback
          function(data, status) { console.log('Error: ' + status); }
        );
      }
    };
  }

  XisbnService.$inject = [
    'XisbnAPI'
  ];

  // filter unwanted editions and munge each edition object
  function mungeXisbnEditions(raw_editions) {
    var editions = [];

    angular.forEach(raw_editions, function(ed) {
      // filter to English and book formats (BA=book BB=hardcover BC=paperback)
      if (ed.lang === 'eng' && ed.form[0] && 
          (ed.form[0] === 'BA' || ed.form[0] === 'BB' || ed.form[0] === 'BC')) {
        this.push({
          'isbn':     ed.isbn[0],
          'title':    ed.title,
          'author':   ed.author,
          'lang':     ed.lang,
          'ed':       ed.ed,
          'year':     ed.year
        });
      }
    }, editions);

    console.log(editions);
    return editions;
  }

// =============================================================================

  angular.module('myApp.services', ['ngResource'])
    .value('version', '0.1')
    .factory('XisbnAPI', XisbnAPI)
    .factory('XisbnService', XisbnService);

})();
