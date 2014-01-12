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
    $scope.loading = true;

    GoodreadsService.getShelves(BookScraperMaster.goodreadsUserId,
      function (shelves) {
        BookScraperMaster.shelves = shelves;
        $scope.shelves = shelves;
        $scope.finishLoading();
      }
    );
    // TODO: failure callback for 404

    $scope.submitGoodreadsShelves = function (shelves) {
      BookScraperMaster.goodreadsSelectedShelves = shelves;
      $location.path('/books');
    };
    $scope.finishLoading = function () {
      $scope.loading = false;
      // TODO: testing: select last shelf
      $scope.submitGoodreadsShelves([$scope.shelves[$scope.shelves.length - 1]]);
    };
  }

  ShelvesCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster',
    'GoodreadsService'
  ];


// =============================================================================

  function BooksCtrl($scope, $location, $timeout, BookScraperMaster, GoodreadsService) {
    var books = [];

    console.log(BookScraperMaster);

    $scope.loading = true;
    $scope.remaining_requests = 0;

    // get book isbns for each shelf using GoodreadsService
    angular.forEach(BookScraperMaster.goodreadsSelectedShelves, function(shelf){
      console.log(shelf.name);
      $scope.remaining_requests++;
      GoodreadsService.getBooks(BookScraperMaster.goodreadsUserId, shelf.name,
        function (shelf_books) {
          Array.prototype.push.apply(books, shelf_books);
          console.log(books);
          $scope.remaining_requests--;
      });
    });
    $scope.$watch('remaining_requests', function () {
      if ($scope.remaining_requests === 0) {
        $scope.finishLoading();
      }
    }, true);

    // TODO: sort results by author?
    // TODO: per-book filter settings: max price, condition, exclude library, desirability weight (must-have, normal, add-on only)

    //books = [{"id":2659696,"isbn":"0198570503","title":"Global Catastrophic Risks","author":"Nick Bostrom","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/2659696-global-catastrophic-risks"},{"id":12311305,"isbn":"1741797152","title":"Lonely Planet Vietnam","author":"Iain Stewart","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/12311305-lonely-planet-vietnam"},{"id":3990666,"isbn":"0864426704","title":"Lonely Planet Cambodia","author":"Nick Ray","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/3990666-lonely-planet-cambodia"},{"id":552702,"isbn":"1562790692","title":"Pharmako/Poeia: Plant Powers, Poisons, and Herbcraft","author":"Dale Pendell","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1330212138m/552702.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1330212138s/552702.jpg","link":"http://www.goodreads.com/book/show/552702.Pharmako_Poeia"},{"id":828377,"isbn":"1843303299","title":"Men and Sheds","author":"Gordon Thorburn","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/828377.Men_and_Sheds"},{"id":27333,"isbn":"0618249060","title":"Silent Spring","author":"Rachel Carson","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/27333.Silent_Spring"},{"id":249049,"isbn":"0312361653","title":"Men's Style: The Thinking Man's Guide to Dress","author":"Russell Smith","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/249049.Men_s_Style"},{"id":12952273,"isbn":null,"title":"Race Against The Machine: How the Digital Revolution is Accelerating Innovation, Driving Productivity, and Irreversibly Transforming Employment and the Economy","author":"Erik Brynjolfsson","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1329373179m/12952273.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1329373179s/12952273.jpg","link":"http://www.goodreads.com/book/show/12952273-race-against-the-machine"},{"id":639076,"isbn":"0393326551","title":"Opening Skinner's Box: Great Psychological Experiments of the Twentieth Century","author":"Lauren Slater","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1361744788m/639076.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1361744788s/639076.jpg","link":"http://www.goodreads.com/book/show/639076.Opening_Skinner_s_Box"},{"id":254497,"isbn":"0192805851","title":"Consciousness: A Very Short Introduction","author":"Susan J. Blackmore","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/254497.Consciousness"},{"id":415,"isbn":"0143039946","title":"Gravity's Rainbow","author":"Thomas Pynchon","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1327868134m/415.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1327868134s/415.jpg","link":"http://www.goodreads.com/book/show/415.Gravity_s_Rainbow"},{"id":6759,"isbn":"0316921173","title":"Infinite Jest","author":"David Foster Wallace","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/6759.Infinite_Jest"},{"id":14185,"isbn":null,"title":"The Three Stigmata of Palmer Eldritch","author":"Philip K. Dick","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1338461946m/14185.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1338461946s/14185.jpg","link":"http://www.goodreads.com/book/show/14185.The_Three_Stigmata_of_Palmer_Eldritch"}];
    BookScraperMaster.books = books;
    $scope.books = books;

    $scope.selection = [];
    $scope.setAllSelections = function (value) {
      $scope.selection = [];
      for (var i = 0; i < books.length; i++) {
        if (books[i].isbn === null) {
          $scope.selection.push(false);
        } else {
          $scope.selection.push(value);
        }
      }
    };

    // update $scope.selected_books when selection changes
    $scope.$watch('selection', function () {
      $scope.selected_books = [];
      angular.forEach($scope.selection, function (is_selected, index) {
        if (is_selected && $scope.books[index].isbn !== null) {
          $scope.selected_books.push($scope.books[index]);
        }
      });
    }, true);

    $scope.submitSelectedBooks = function (selected_books) {
      BookScraperMaster.selected_books = selected_books;
      $location.path('/editions');
    };

    $scope.finishLoading = function () {
      $scope.setAllSelections(true);
      $scope.loading = false;
      // TODO: testing: continue with all books selected
      $timeout(function () {$scope.submitSelectedBooks($scope.selected_books);});
    };
  }

  BooksCtrl.$inject = [
    '$scope',
    '$location',
    '$timeout',
    'BookScraperMaster',
    'GoodreadsService'
  ];

// =============================================================================

  function EditionsCtrl($scope, $location, BookScraperMaster, XisbnService) {
    var books = BookScraperMaster.selected_books;
    var editions = [];
    var editionSortFn;

    //books = [{"id":2659696,"isbn":"0198570503","title":"Global Catastrophic Risks","author":"Nick Bostrom","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/2659696-global-catastrophic-risks"},{"id":12311305,"isbn":"1741797152","title":"Lonely Planet Vietnam","author":"Iain Stewart","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/12311305-lonely-planet-vietnam"},{"id":3990666,"isbn":"0864426704","title":"Lonely Planet Cambodia","author":"Nick Ray","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/3990666-lonely-planet-cambodia"},{"id":552702,"isbn":"1562790692","title":"Pharmako/Poeia: Plant Powers, Poisons, and Herbcraft","author":"Dale Pendell","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1330212138m/552702.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1330212138s/552702.jpg","link":"http://www.goodreads.com/book/show/552702.Pharmako_Poeia"},{"id":828377,"isbn":"1843303299","title":"Men and Sheds","author":"Gordon Thorburn","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/828377.Men_and_Sheds"},{"id":27333,"isbn":"0618249060","title":"Silent Spring","author":"Rachel Carson","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/27333.Silent_Spring"},{"id":249049,"isbn":"0312361653","title":"Men's Style: The Thinking Man's Guide to Dress","author":"Russell Smith","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/249049.Men_s_Style"},{"id":12952273,"isbn":null,"title":"Race Against The Machine: How the Digital Revolution is Accelerating Innovation, Driving Productivity, and Irreversibly Transforming Employment and the Economy","author":"Erik Brynjolfsson","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1329373179m/12952273.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1329373179s/12952273.jpg","link":"http://www.goodreads.com/book/show/12952273-race-against-the-machine"},{"id":639076,"isbn":"0393326551","title":"Opening Skinner's Box: Great Psychological Experiments of the Twentieth Century","author":"Lauren Slater","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1361744788m/639076.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1361744788s/639076.jpg","link":"http://www.goodreads.com/book/show/639076.Opening_Skinner_s_Box"},{"id":254497,"isbn":"0192805851","title":"Consciousness: A Very Short Introduction","author":"Susan J. Blackmore","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/254497.Consciousness"},{"id":415,"isbn":"0143039946","title":"Gravity's Rainbow","author":"Thomas Pynchon","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1327868134m/415.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1327868134s/415.jpg","link":"http://www.goodreads.com/book/show/415.Gravity_s_Rainbow"},{"id":6759,"isbn":"0316921173","title":"Infinite Jest","author":"David Foster Wallace","image_url":"http://www.goodreads.com/assets/nocover/111x148.png","small_image_url":"http://www.goodreads.com/assets/nocover/60x80.png","link":"http://www.goodreads.com/book/show/6759.Infinite_Jest"},{"id":14185,"isbn":null,"title":"The Three Stigmata of Palmer Eldritch","author":"Philip K. Dick","image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1338461946m/14185.jpg","small_image_url":"http://d202m5krfqbpi5.cloudfront.net/books/1338461946s/14185.jpg","link":"http://www.goodreads.com/book/show/14185.The_Three_Stigmata_of_Palmer_Eldritch"}];

    BookScraperMaster.editions = editions;
    $scope.editions = editions;
    $scope.books = books;

    $scope.loading = true;
    $scope.remaining_requests = 0;

    // get alternate editions for each book
    angular.forEach(books, function (book) {
      $scope.remaining_requests++;
      XisbnService.getEditions(book.isbn, function (book_editions) {
        book_editions.sort(editionSortFn);
        book.editions = book_editions
        angular.forEach(book_editions, function(ed) { ed.book = book } );
        Array.prototype.push.apply(editions, book_editions);
        console.log(BookScraperMaster);
        $scope.remaining_requests--;
      });
    });
    $scope.$watch('remaining_requests', function () {
      if ($scope.remaining_requests === 0) {
        $scope.finishLoading();
      }
    }, true);

    editionSortFn = function (a,b) {
      if (a.year === b.year) {
        return 0;
      } else if (!a.year) {
        return 1;
      } else if (!b.year) {
        return -1;
      } else if (a.year > b.year) {
        return -1;
      } else if (a.year < b.year) {
        return 1;
      } else {
        return 0;   // should not reach this case
      }
    };

    $scope.selection = [];
    $scope.setAllSelections = function (value) {
      var book_sel;
      $scope.selection = [];
      for (var i = 0; i < books.length; i++) {
        book_sel = [];
        for (var j = 0; j < books[i].editions.length; j++) {
          if (books[i].editions[j].isbn === null) {
            book_sel.push(false);
          } else {
            book_sel.push(value);
          }
        }
        $scope.selection.push(book_sel);
      }
    };
    $scope.setAllSelectionsForBook = function (book_index, value) {
      var book_sel, prev_sel;
      prev_sel = $scope.selection;
      $scope.selection = [];
      for (var i = 0; i < books.length; i++) {
        if (i !== book_index) {
          $scope.selection.push(prev_sel[i]);
        } else {
          book_sel = [];
          for (var j = 0; j < books[i].editions.length; j++) {
            if (books[i].editions[j].isbn === null) {
              book_sel.push(false);
            } else {
              book_sel.push(value);
            }
          }
          $scope.selection.push(book_sel);
        }
      }
    };

    $scope.submitSelectedEditions = function (selection) {
      // TODO: error if too many books or editions
      BookScraperMaster.edition_selections = selection;
      $location.path('/listings');
    };

    $scope.finishLoading = function () {
      $scope.setAllSelections(true);
      $scope.loading = false;
    };
  }

  EditionsCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster',
    'XisbnService'
  ];

// =============================================================================

  function ListingsCtrl($scope, $location, BookScraperMaster, HalfService) {
    var books = BookScraperMaster.selected_books;
    var editions = BookScraperMaster.editions;
    var selection = BookScraperMaster.edition_selections;
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
      $scope.advanceIfFinished();
    });
    $scope.$on('halfService.findItems.page.request', function () {
      var progress = $scope.apiRequestProgress.page;
      progress.requests++;
    });
    $scope.$on('halfService.findItems.page.response', function () {
      var progress = $scope.apiRequestProgress.page;
      progress.responses++;
      progress.percent = 100 * (progress.responses / progress.requests);
      $scope.advanceIfFinished();
    });
    // TODO: advance after all requests complete

    // TODO: cancel requests if leaving controller

    // get Half.com listings for each edition of each book
    angular.forEach(books, function (book, book_index) {
      book.listings = [];
      angular.forEach(book.editions, function (ed, ed_index) {
        if (!selection[book_index][ed_index]) {
          console.log('         ed.isbn: ' + ed.isbn + '; book_index: ' + book_index + '; ed_index: ' + ed_index);
          return;
        }
        console.log('selected ed.isbn: ' + ed.isbn + '; book_index: ' + book_index + '; ed_index: ' + ed_index);
        ed.listings = [];
        HalfService.findItems(
          {isbn: ed.isbn, page: '1', condition: 'Good', maxprice: 4.00},
          function(response) { 
            var ed_listings = response.items;
            angular.forEach(ed_listings, function(el) { 
              el.book = book; 
              el.edition = ed;
            });
            Array.prototype.push.apply(listings, ed_listings);
            Array.prototype.push.apply(book.listings, ed_listings);
            Array.prototype.push.apply(ed.listings, ed_listings);
            console.log(BookScraperMaster);
          }
        );
      });
    });

    $scope.advanceIfFinished = function () {
      if (($scope.apiRequestProgress.call.requests ===
            $scope.apiRequestProgress.call.responses) &&
          ($scope.apiRequestProgress.page.requests ===
            $scope.apiRequestProgress.page.responses)) {
        $scope.finishLoading();
      }
    }

    $scope.finishLoading = function () {
      $location.path('/sellers');
    };
  }

  ListingsCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster',
    'HalfService'
  ];

// =============================================================================

  function SellersCtrl($scope, BookScraperMaster) {
    var bookIndex;
    var sellers = {};
    var listings = BookScraperMaster.listings;

    BookScraperMaster.sellers = sellers;

    angular.forEach(listings, function (listing) {
      var seller, 
          sellerBook;
      if (sellers.hasOwnProperty(listing.seller)) {
        seller = sellers[listing.seller];
      } else {
        seller = {
          name: listing.seller,
          feedback_count: listing.feedback_count,
          feedback_rating: listing.feedback_rating,
          books: [],
          //editions: [],
          //listings: [],
        };
        sellers[listing.seller] = seller;
      }

      //bookIndex = seller.books.indexOf(listing.book);
      sellerBook = _.find(seller.books, {book: listing.book});
      //if (bookIndex === -1) {
      if (!sellerBook) {
        sellerBook = {
          book: listing.book,
          listings: [listing],
          bestListing: listing
        };
        seller.books.push(sellerBook);
      } else {
        sellerBook.listings.push(listing);
        //seller.book_listings[bookIndex].push(listing);
      }
      // TODO: sort listings and choose actual best
      //if (seller.editions.indexOf(listing.edition) === -1) {
        //seller.editions.push(listing.edition);
      //}
      //seller.listings.push(listing);
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

  angular.module('myApp.controllers', ['ngResource'])
    .controller('GoodreadsUserCtrl', GoodreadsUserCtrl)
    .controller('ShelvesCtrl', ShelvesCtrl)
    .controller('BooksCtrl', BooksCtrl)
    .controller('EditionsCtrl', EditionsCtrl)
    .controller('ListingsCtrl', ListingsCtrl)
    .controller('SellersCtrl', SellersCtrl)
})();
