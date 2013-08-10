'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, $http, $resource) {
    /*
    $http.jsonp(url)
      .success(function(data, status) {
          console.log(data);
      }).error(function(data, status) {
          console.log('Error: ' + status);
      });
    */

    //var url = "http://xisbn.worldcat.org/webservices/xid/isbn/9780465067107?method=getEditions&fl=form,lang,author,ed,year,isbn,title&format=json&callback=JSON_CALLBACK";
    var xisbn_url = "http://xisbn.worldcat.org/webservices/xid/isbn/:isbn";
    var xisbn_params = {
      method: 'getEditions',
      fl: 'form,lang,author,ed,year,isbn,title',
      format: 'json',
      callback: 'JSON_CALLBACK',
    };

    var xisbn = $resource( xisbn_url, {}, {
          get_editions: {
            method: 'JSONP',
            params: xisbn_params
          }
        });
    //var obj = xisbn.get_editions();
    //console.log(obj.list);
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
