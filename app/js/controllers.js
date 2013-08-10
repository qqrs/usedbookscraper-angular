'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, $http, $resource) {

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

    xisbn.get_editions(
      {isbn: '9780465067107'},
      function(data, status) { console.log(data); },
      function(data, status) { console.log('Error: ' + status); }
    );

  }

  function MyCtrl2() {

  }

  MyCtrl1.$inject = [
    '$scope',
    '$http',
    '$resource'
  ];

  MyCtrl2.$inject = [
  ];

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
