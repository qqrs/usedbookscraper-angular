'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, $http) {
    var url = "http://xisbn.worldcat.org/webservices/xid/isbn/9780465067107?method=getEditions&fl=form,lang,author,ed,year,isbn,title&format=json&callback=JSON_CALLBACK";
    $http.jsonp(url)
      .success(function(data, status) {
          console.log(data);
      }).error(function(data, status) {
          console.log('Error: ' + status);
      });

  }

  function MyCtrl2() {

  }

  MyCtrl1.$inject = [
    '$scope',
    '$http'
  ];

  MyCtrl2.$inject = [
  ];

  angular.module('myApp.controllers', [])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
