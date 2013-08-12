'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, BookScraperMaster, XisbnService) {

    $scope.altEditions = null;
    $scope.queryISBNList =  '9780465067107, 0312241356';
    $scope.editionSortKey = function editionSortKey(ed) {
      return ed.year || '0000';
    };

    $scope.submitISBNList = function submitISBNList(isbnlist) {
      // split on comma, colon, pipe, or whitespace
      var isbns = isbnlist.split(/[,:|\s]+/);

      var books = [];
      var editions = [];

      BookScraperMaster.books = books;
      BookScraperMaster.editions = editions;
      $scope.editions = editions;

      angular.forEach(isbns, function(isbn) {
        var book = {isbn: isbn};
        books.push(book);
        XisbnService.getEditions(isbn, function (book_editions) {
          book['editions'] = book_editions
          angular.forEach(book_editions, function(ed) { ed.book = book } );
          Array.prototype.push.apply(editions, book_editions);
          console.log(BookScraperMaster);
        });
      });
    };

  }

  MyCtrl1.$inject = [
    '$scope',
    'BookScraperMaster',
    'XisbnService'
  ];

// =============================================================================

  function MyCtrl2($scope, BookScraperMaster, HalfAPI) {
    var books = BookScraperMaster.books;
    var editions = BookScraperMaster.editions;
    var listings = [];

    BookScraperMaster.listings = listings;
    $scope.books = books;

    angular.forEach(books, function (book) {
      book['listings'] = [];
      angular.forEach(book.editions, function (ed) {
        ed['listings'] = [];
        HalfAPI.findItems(
          {isbn: ed.isbn, page: '1', condition: 'Good'},
          function(response) { 
            var ed_listings = response.items;
            angular.forEach(ed_listings, function(el) { 
              el['book'] = book; 
              el['ed'] = ed;
            });
            Array.prototype.push.apply(listings, ed_listings);
            Array.prototype.push.apply(book.listings, ed_listings);
            Array.prototype.push.apply(ed.listings, ed_listings);
            console.log(BookScraperMaster);
          },
          // TODO: failure callback
          function(data) {}
        );
      });
    });
  }

  MyCtrl2.$inject = [
    '$scope',
    'BookScraperMaster',
    'HalfAPI'
  ];

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
