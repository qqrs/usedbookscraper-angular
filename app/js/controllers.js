'use strict';

/* Controllers */

(function() {


  function GoodreadsUserCtrl($scope, $location, BookScraperMaster) {
    // TODO: for testing only
    $scope.goodreadsUserId = '5123156';

    $scope.submitGoodreadsUserId = function (userId) {
      BookScraperMaster.goodreadsUserId = userId;
      $location.path('/shelves');
    };
  }

  GoodreadsUserCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster'
  ];

// =============================================================================

  function ShelvesCtrl($scope, $location, BookScraperMaster, GoodreadsService) {
    console.log('ShelvesCtrl: ' + BookScraperMaster.goodreadsUserId);
    $scope.selectedShelves = [];

    GoodreadsService.getShelves(BookScraperMaster.goodreadsUserId,
      function (shelves) {
        BookScraperMaster.shelves = shelves;
        $scope.shelves = shelves;
      }
    );
    // TODO: failure callback for 404
    // TODO: spinner

    $scope.submitGoodreadsShelves = function (shelves) {
      BookScraperMaster.goodreadsSelectedShelves = shelves;
      $location.path('/books');
    };
  }

  ShelvesCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster',
    'GoodreadsService'
  ];


// =============================================================================

  function BooksCtrl($scope, BookScraperMaster, GoodreadsService) {
    var books = [];
    console.log(BookScraperMaster);

    // get book isbns for each shelf using GoodreadsService
    angular.forEach(BookScraperMaster.goodreadsSelectedShelves, function(shelf){
      console.log(shelf.name);
      GoodreadsService.getBooks(BookScraperMaster.goodreadsUserId, shelf.name,
        function (shelf_books) {
          Array.prototype.push.apply(books, shelf_books);
          console.log(books);
      });
    });

    // TODO: checkbox select/deselect books
    // TODO: per-book filter settings: max price, condition, exclude library, desirability weight
    // TODO: spinner

    BookScraperMaster.books = books;
    $scope.books = books
  }

  BooksCtrl.$inject = [
    '$scope',
    'BookScraperMaster',
    'GoodreadsService'
  ];

// =============================================================================

  function EditionsCtrl($scope, BookScraperMaster, XisbnService) {

    var books = BookScraperMaster.books;
    var editions = [];

    BookScraperMaster.editions = editions;
    $scope.editions = editions;

    // get alternate editions for each book
    angular.forEach(books, function(book) {
      XisbnService.getEditions(book.isbn, function (book_editions) {
        book['editions'] = book_editions
        angular.forEach(book_editions, function(ed) { ed.book = book } );
        Array.prototype.push.apply(editions, book_editions);
        console.log(BookScraperMaster);
      });
    });

    $scope.editionSortKey = function (ed) {
      return ed.year || '0000';
    };

    // TODO: checkbox select/deselect editions
    // TODO: spinner
  }

  EditionsCtrl.$inject = [
    '$scope',
    'BookScraperMaster',
    'XisbnService'
  ];

// =============================================================================

  function ListingsCtrl($scope, BookScraperMaster, HalfService) {
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
    });
    $scope.$on('halfService.findItems.call.response', function () {
      var progress = $scope.apiRequestProgress.call;
      progress.responses++;
      progress.percent = 100 * (progress.responses / progress.requests);
    });
    $scope.$on('halfService.findItems.page.request', function () {
      var progress = $scope.apiRequestProgress.page;
      progress.requests++;
    });
    $scope.$on('halfService.findItems.page.response', function () {
      var progress = $scope.apiRequestProgress.page;
      progress.responses++;
      progress.percent = 100 * (progress.responses / progress.requests);
    });
    // TODO: advance after all requests complete


    // get Half.com listings for each edition of each book
    angular.forEach(books, function (book) {
      book['listings'] = [];
      angular.forEach(book.editions, function (ed) {
        ed['listings'] = [];
        HalfService.findItems(
          {isbn: ed.isbn, page: '1', condition: 'Good', maxprice: 4.00},
          function(response) { 
            var ed_listings = response.items;
            angular.forEach(ed_listings, function(el) { 
              el['book'] = book; 
              el['edition'] = ed;
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

  ListingsCtrl.$inject = [
    '$scope',
    'BookScraperMaster',
    'HalfService'
  ];

// =============================================================================

  function SellersCtrl($scope, BookScraperMaster) {
    var sellers = {};
    var listings = BookScraperMaster.listings;

    BookScraperMaster.sellers = sellers;

    angular.forEach(listings, function (listing) {
      var seller;
      if (sellers.hasOwnProperty(listing.seller)) {
        seller = sellers[listing.seller];
      } else {
        seller = {
          name: listing.seller,
          feedback_count: listing.feedback_count,
          feedback_rating: listing.feedback_rating,
          books: [],
          editions: [],
          listings: []
        };
        sellers[listing.seller] = seller;
      }

      if (seller.books.indexOf(listing.book) === -1) {
        seller.books.push(listing.book);
      }
      if (seller.editions.indexOf(listing.edition) === -1) {
        seller.editions.push(listing.edition);
      }
      seller.listings.push(listing);
      //TODO: either delete if reverse lookup not needed or create array on book
      //listing.book['sellers'].push(seller);
      //listing.edition['sellers'].push(seller);
    });

    $scope.sellerSortKey = function (seller) {
      return seller.books.length;
    };

    // convert sellers object to array for rendering
    $scope.sellers = [];
    angular.forEach(sellers, function (val, key) {
      $scope.sellers.push(val);
    });

    console.log('BookScraperMaster');
    console.log(BookScraperMaster);
    console.log($scope.sellers);
  }

  SellersCtrl.$inject = [
    '$scope',
    'BookScraperMaster'
  ];

// =============================================================================


/*
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
    });
    $scope.$on('halfService.findItems.call.response', function () {
      var progress = $scope.apiRequestProgress.call;
      progress.responses++;
      progress.percent = 100 * (progress.responses / progress.requests);
    });
    $scope.$on('halfService.findItems.page.request', function () {
      var progress = $scope.apiRequestProgress.page;
      progress.requests++;
    });
    $scope.$on('halfService.findItems.page.response', function () {
      var progress = $scope.apiRequestProgress.page;
      progress.responses++;
      progress.percent = 100 * (progress.responses / progress.requests);
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
              el['edition'] = ed;
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
    var sellers = {};
    var listings = BookScraperMaster.listings;

    BookScraperMaster.sellers = sellers;

    angular.forEach(listings, function (listing) {
      var seller;
      if (sellers.hasOwnProperty(listing.seller)) {
        seller = sellers[listing.seller];
      } else {
        seller = {
          name: listing.seller,
          feedback_count: listing.feedback_count,
          feedback_rating: listing.feedback_rating,
          books: [],
          editions: [],
          listings: []
        };
        sellers[listing.seller] = seller;
      }

      if (seller.books.indexOf(listing.book) === -1) {
        seller.books.push(listing.book);
      }
      if (seller.editions.indexOf(listing.edition) === -1) {
        seller.editions.push(listing.edition);
      }
      seller.listings.push(listing);
      //TODO: either delete if reverse lookup not needed or create array on book
      //listing.book['sellers'].push(seller);
      //listing.edition['sellers'].push(seller);
    });

    $scope.sellerSortKey = function (seller) {
      return seller.books.length;
    };

    // convert sellers object to array for rendering
    $scope.sellers = [];
    angular.forEach(sellers, function (val, key) {
      $scope.sellers.push(val);
    });

    console.log('BookScraperMaster');
    console.log(BookScraperMaster);
    console.log($scope.sellers);
  }

  MyCtrl3.$inject = [
    '$scope',
    'BookScraperMaster'
  ];
*/

// =============================================================================

  angular.module('myApp.controllers', ['ngResource'])
    .controller('GoodreadsUserCtrl', GoodreadsUserCtrl)
    .controller('ShelvesCtrl', ShelvesCtrl)
    .controller('BooksCtrl', BooksCtrl)
    .controller('EditionsCtrl', EditionsCtrl)
    .controller('ListingsCtrl', ListingsCtrl)
    .controller('SellersCtrl', SellersCtrl)
    /*.controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2)
    .controller('MyCtrl3', MyCtrl3)*/;
})();
