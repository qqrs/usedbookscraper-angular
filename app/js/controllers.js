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
      //TODO: fix ',294801943' format
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
          //TODO: skip setting title/author if already set
          book['title'] = book_editions[0].title;
          book['author'] = book_editions[0].author;
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

  function MyCtrl2($scope, BookScraperMaster, HalfService) {
    var books = BookScraperMaster.books;
    var editions = BookScraperMaster.editions;
    var listings = [];

    BookScraperMaster.listings = listings;
    $scope.books = books;

    $scope.apiRequestProgress = {
      call: { requests: 0, responses: 0, percent: 0 },
      page: { requests: 0, responses: 0, percent: 0 }
    };

    // update progress bar
    $scope.$on('halfService.findItems.call.request', function () {
      var progress = $scope.apiRequestProgress.call;
      progress.requests++;
      console.warn('progress: ' + progress.responses + ' / ' + progress.requests);
    });
    $scope.$on('halfService.findItems.call.response', function () {
      var progress = $scope.apiRequestProgress.call;
      progress.responses++;
      progress.percent = 100 * (progress.responses / progress.requests);
      //console.log('progress: ' + $scope.apiRequestProgress.responses + ' / ' + $scope.apiRequestProgress.requests);
      console.log('progress: ' + progress.percent + '%');
    });

    // get Half.com listings for each edition of each book
    angular.forEach(books, function (book) {
      book['listings'] = [];
      angular.forEach(book.editions, function (ed) {
        ed['listings'] = [];
        HalfService.findItems(
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
          }
        );
      });
    });

  }

  MyCtrl2.$inject = [
    '$scope',
    'BookScraperMaster',
    'HalfService'
  ];

// =============================================================================

  function MyCtrl3($scope, BookScraperMaster) {
    $scope.test = 'TEST TEST';
  }

  MyCtrl3.$inject = [
    '$scope',
    'BookScraperMaster'
  ];

// =============================================================================

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2)
    .controller('MyCtrl3', MyCtrl3);
})();
