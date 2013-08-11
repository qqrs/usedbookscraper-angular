'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, XisbnService) {

    $scope.altEditions = null;
    $scope.queryISBN =  '9780465067107';
    //$scope.queryISBN =  '0312241356';
    $scope.queryISBNList =  '9780465067107, 0312241356';
    $scope.editionSortKey = function editionSortKey(ed) {
      return ed.year || '0000';
    };


    $scope.submitISBN = function submitISBN(isbn) {
      XisbnService.getEditions(isbn, function (editions) {
          $scope.altEditions = editions;
      });
    };

    $scope.submitISBNList = function submitISBNList(isbnlist) {
      //var isbns = isbnlist.split(',:|\r\n ');
      // split on comma, colon, pipe, or whitespace
      var isbns = isbnlist.split(/[,:|\s]+/);
      console.log(isbns);
    };

  }

  MyCtrl1.$inject = [
    '$scope',
    'XisbnService'
  ];

// =============================================================================

  function MyCtrl2() {

  }

  MyCtrl2.$inject = [
  ];

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
