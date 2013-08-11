'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, BookScraperMaster, XisbnService) {

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

      var books = [];
      var editions = [];

      angular.forEach(isbns, function(isbn) {
        var book = {isbn: isbn};
        books.push(book);
        XisbnService.getEditions(isbn, function (book_editions) {
          book['editions'] = book_editions
          angular.forEach(book_editions, function(ed) { ed.book = book } );
          //editions = editions.concat(book_editions);
          Array.prototype.push.apply(editions, book_editions);
          console.log(BookScraperMaster);
        });
      });

      BookScraperMaster.books = books;
      BookScraperMaster.editions = editions;
      $scope.altEditions = editions;
    };

  }

  MyCtrl1.$inject = [
    '$scope',
    'BookScraperMaster',
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
