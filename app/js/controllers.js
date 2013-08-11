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
      // split on comma, colon, pipe, or whitespace
      var isbns = isbnlist.split(/[,:|\s]+/);

      $scope.altEditions = [];
      angular.forEach(isbns, function(isbn) {
        XisbnService.getEditions(isbn, function (editions) {
            $scope.altEditions = $scope.altEditions.concat(editions);
        });
      });
    };

  }

  MyCtrl1.$inject = [
    '$scope',
    'XisbnService'
  ];

// =============================================================================

  function MyCtrl2($scope, HalfAPI) {
    $scope.queryISBN = '0465067107';

    $scope.submitISBN = function submitISBN(isbn) {
      HalfAPI.findItems(
        {isbn: isbn, page: '1', condition: 'Good'},
        function(data) { 
          console.log(data); 
          $scope.findItemsResponse = data;
        },
        // TODO: failure callback
        function(data, status) { console.log('Error: ' + status); }
      );
    };
  }

  MyCtrl2.$inject = [
    '$scope',
    'HalfAPI'
  ];

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
