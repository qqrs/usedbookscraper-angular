'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, XisbnService) {

    $scope.altEditions = null;
    $scope.queryISBN =  '9780465067107';

    $scope.submitISBN = function submitISBN() {
      XisbnService.getEditions(
        {isbn: $scope.queryISBN},
        function(data, status) { 
          $scope.altEditions = data.list;
          console.log(data); 
        },
        function(data, status) { console.log('Error: ' + status); }
      );
    };

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
