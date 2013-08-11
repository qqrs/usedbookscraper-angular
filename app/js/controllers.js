'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, XisbnService) {

    XisbnService.get_editions(
      {isbn: '9780465067107'},
      function(data, status) { console.log(data); },
      function(data, status) { console.log('Error: ' + status); }
    );

  }

  function MyCtrl2() {

  }

  MyCtrl1.$inject = [
    '$scope',
    'XisbnService'
  ];

  MyCtrl2.$inject = [
  ];

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
