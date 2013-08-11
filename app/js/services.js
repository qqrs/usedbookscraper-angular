'use strict';

/* Services */

(function() {

  function XisbnService($resource) {
    var xisbn = $resource(
      "http://xisbn.worldcat.org/webservices/xid/isbn/:isbn",
      {
        format: 'json',
        callback: 'JSON_CALLBACK',
      },
      {
        get_editions: {
          method: 'JSONP',
          params: {
            method: 'getEditions',
            fl: 'form,lang,author,ed,year,isbn,title'
          }
      }
    });

    return xisbn;
  }

  XisbnService.$inject = [
    '$resource'
  ];

  angular.module('myApp.services', ['ngResource'])
    .value('version', '0.1')
    .factory('XisbnService', XisbnService);

})();
