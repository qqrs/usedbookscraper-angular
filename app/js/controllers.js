'use strict';

/* Controllers */

(function() {

  // TODO: clear alerts message on every view change
  function GoodreadsUserCtrl($scope, $rootScope, $location, BookScraperMaster) {
    // TODO: for testing only
    $scope.goodreadsProfileUrl = 'http://www.goodreads.com/user/show/5123156-russ';
    $scope.isbnText = '0679736662, 9780393326550, 978-0618249060';

    $scope.submitGoodreadsProfileUrl = function (profileUrl) {
      var userId = null,
          matches;
          
      matches = profileUrl.match(/^.*goodreads.com\/user\/show\/([0-9]+)-.+$/);
      if (matches) {
        userId = matches[1];
      } else {
        matches = profileUrl.match(/^\s*([0-9]+)\s*$/);
        if (matches) {
          userId = matches[1];
        }
      }

      if (!userId) {
        $rootScope.$broadcast('errorAlerts.addAlert', 'error: invalid goodreads profile url');
        return;
      }

      BookScraperMaster.goodreadsUserId = parseInt(userId, 10);
      $location.path('/shelves');
      $rootScope.$broadcast('errorAlerts.clearAlerts');
    };

    $scope.submitIsbnList = function (isbnText) {
      var isbnList = _.compact(isbnText.replace('-', '').split(/[,;\s]+/));
      BookScraperMaster.isbnList = isbnList;
      console.log(isbnList);
      $location.path('/editions');
      $rootScope.$broadcast('errorAlerts.clearAlerts');
    }
  }

  GoodreadsUserCtrl.$inject = [
    '$scope',
    '$rootScope',
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
      //$scope.submitGoodreadsShelves([$scope.shelves[$scope.shelves.length - 1]]);
    };
  }

  ShelvesCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster',
    'GoodreadsService'
  ];


// =============================================================================

  function BooksCtrl($scope, $location, $timeout, BookScraperMaster, GoodreadsService, HalfService) {
    var books = [];

    console.log(BookScraperMaster);

    $scope.loading = true;
    $scope.remaining_requests = 0;

    // get book isbns for each shelf using GoodreadsService
    angular.forEach(BookScraperMaster.goodreadsSelectedShelves, function(shelf) {
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

    // TODO: remove duplicate books
    // TODO: sort results by author?

    BookScraperMaster.books = books;
    $scope.books = books;

    $scope.desirabilityChoices = [
      ['Must-have', 10.0],
      ['High', 3.0],
      ['Normal', 1.0],
      ['Add-on', 0.1]
    ];

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
      // TODO: book option master defaults
      // TODO: per-shelf book options defaults
      // TODO: per-book filter settings: max price, condition, exclude library and cliffs notes, desirability weight (must-have, normal, add-on only)
      // per-book search/filter options defaults
      _.forEach(books, function (book) {
        //TODO: use the default options and only copy as needed
        book.options = angular.copy(BookScraperMaster.book_options_defaults);
      });
      $scope.bookConditions = HalfService.bookConditions();
      $scope.setAllSelections(true);
      $scope.loading = false;
      // TODO: testing: continue with all books selected
      //$timeout(function () {$scope.submitSelectedBooks($scope.selected_books);});
    };
  }

  BooksCtrl.$inject = [
    '$scope',
    '$location',
    '$timeout',
    'BookScraperMaster',
    'GoodreadsService',
    'HalfService'
  ];

// =============================================================================

  function BookOptionsCtrl($scope, $location, $timeout, BookScraperMaster, GoodreadsService) {
  }

  BookOptionsCtrl.$inject = [
    '$scope',
    '$location',
    '$timeout',
    'BookScraperMaster',
    'GoodreadsService'
  ];


// =============================================================================

  function EditionsCtrl($scope, $rootScope, $location, $log, BookScraperMaster, XisbnService) {
    var books = BookScraperMaster.selected_books;
    var isbnList = BookScraperMaster.isbnList;
    var editions = [];
    var editionSortFn;

    BookScraperMaster.editions = editions;
    $scope.editions = editions;
    $scope.books = books;

    $scope.loading = true;
    $scope.remaining_requests = 0;

    if (isbnList !== null) {
      books = _.map(isbnList, function (isbn) {
        return {
          isbn: isbn,
          title: null,
          author: null,
          options: BookScraperMaster.book_options_defaults
        };
      });
      BookScraperMaster.books = books;
      BookScraperMaster.selected_books = books;
      $scope.books = books;
    }

    // get alternate editions for each book
    //TODO: add error handler to decrement remaining requests
    angular.forEach(books, function (book) {
      $scope.remaining_requests++;
      XisbnService.getEditions(book.isbn, function successFn(book_editions) {
        if (isbnList !== null && book_editions) {
          book.title = book_editions[0].title;
          book.author = book_editions[0].author;
        }

        book_editions = _.sortBy(book_editions, function (ed) {
          return ((-Number(ed.year)) || 0);
        });
        book.editions = book_editions;
        angular.forEach(book_editions, function(ed) { ed.book = book } );
        Array.prototype.push.apply(editions, book_editions);
        console.log(BookScraperMaster);
        $scope.remaining_requests--;
      },
      function failureFn(data, stat, msg) {
        var userMsg = ((data.stat === 'invalidId') ? 'invalid isbn: fix query'
                        : 'editions lookup error: try again');
        $rootScope.$broadcast('errorAlerts.addAlert',
          userMsg + ' or continue with partial results');
        $log.warn('XisbnService request failed ' + stat +': ' + msg);
        $scope.remaining_requests--;
      });
    });
    $scope.$watch('remaining_requests', function () {
      if ($scope.remaining_requests === 0) {
        $scope.finishLoading();
      }
    }, true);

    $scope.selection = [];
    var buildSelectionsForBook = function (book, value) {
      return _.map(book.editions, function (ed) {
        // disallow selection of edition if it has no isbn
        return (!ed.isbn) ? false : value;
      });
    };
    $scope.setAllSelections = function (value) {
      $scope.selection = _.map(books, function (book) {
        return buildSelectionsForBook(book, value);
      });
    };
    $scope.setAllSelectionsForBook = function (book_index, value) {
      var book = books[book_index];
      $scope.selection[book_index] = buildSelectionsForBook(book, value);
    }

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
    '$rootScope',
    '$location',
    '$log',
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
      call: { requests: 0, responses: 0, percent: 0, finished: false },
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
      if (progress.responses === progress.requests) {
        progress.finished = true;
      }
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
          //{isbn: ed.isbn, page: '1', condition: 'Good', maxprice: 4.00},
          //{isbn: ed.isbn, page: '1', condition: 'Good', maxprice: ((book.author === "Lauren Slater") ? 8.00 : 4.00)},
          // TODO: maxprice safe if user enters non-number?
          {isbn: ed.isbn, page: '1', condition: book.options.condition, maxprice: book.options.maxprice},
          function(response) { 
            ed.half_title = ed.half_title || response.title;
            ed.half_image_url = ed.half_image_url || response.image;
            var ed_listings = _.filter(response.items, function (listing) {
              if (book.options.excludeLibrary && 
                  /library/i.test(listing.comments)) {
                console.log('excluding library');
                console.log(listing);
                return false;
              }
              if (book.options.excludeCliffsNotes && 
                  /cliff'?s? notes?/i.test(listing.comments)) {
                console.log('excluding cliffs notes');
                console.log(listing);
                return false;
              }
              return true;
            });
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

  function SellersCtrl($scope, BookScraperMaster, HalfService) {
    var bookIndex,
        sellers = {},
        listings = BookScraperMaster.listings;

    var populateNewSeller = function (listing) {
      var seller = {
        name: listing.seller,
        feedback_count: listing.feedback_count,
        feedback_rating: listing.feedback_rating,
        books: [],
      };
      return seller;
    };

    BookScraperMaster.sellers = sellers;

    angular.forEach(listings, function (listing) {
      var seller, 
          sellerBook;
      if (sellers.hasOwnProperty(listing.seller)) {
        seller = sellers[listing.seller];
      } else {
        seller = populateNewSeller(listing);
        sellers[listing.seller] = seller;
      }

      sellerBook = _.find(seller.books, {book: listing.book});
      if (!sellerBook) {
        sellerBook = {
          book: listing.book,
          listings: [listing],
          //bestListing: listing
        };
        seller.books.push(sellerBook);
      } else {
        sellerBook.listings.push(listing);
      }
      // TODO: sort listings and choose actual best
    });

    // TODO: use Array.sort and compare a/b instead of sort key
    // TODO: account for year, -listing.edition.year
    var sellerBookListingsSortKey = function (listing) {
      var cond = HalfService.getValueForCondition(listing.condition),
          ship_cost = HalfService.getListingMarginalShippingCost(listing),
          cost = listing.price + ship_cost;
      return (cost - (0.5 * cond));
    };
    var sellerBooksScore = function (sbook) {
      return sbook.book.options.desirability;
    };
    var sellerBooksSortKey = function (sbook) {
      //return _.contains(sbook.book.shelves, 'coffee-table') ? 1 : 0;
      return -sellerBooksScore(sbook);
    };

    _.each(sellers, function (seller) {
      var score = 0.0;
      _.each(seller.books, function (book) {
        book.listings = _.sortBy(book.listings, sellerBookListingsSortKey);
        book.bestListing = book.listings[0];
        score += sellerBooksScore(book);
      });
      seller.booksScore = score;
      seller.books = _.sortBy(seller.books, sellerBooksSortKey);
    });

    /*
    $scope.sellerSortKey = function (seller) {
      return seller.books.length;
    };
    */

    // TODO: sort sellers.books by priority, name
    // TODO: overwrite sellers

    $scope.sellers = _.chain(sellers)
      .toArray()
      .sortBy(function (seller) {
        return -seller.booksScore;
      }).value();

    // build paginated sellers array
    $scope.currentPage = 0;
    $scope.perPage = 20;
    $scope.pagedSellers = _.map(
      _.range(0, $scope.sellers.length, $scope.perPage), 
      function (start) {
        return $scope.sellers.slice(start, start + $scope.perPage);
      }
    );

    console.log('BookScraperMaster');
    console.log(BookScraperMaster);
    console.log($scope.sellers);
    console.log($scope.pagedSellers);
  }

  SellersCtrl.$inject = [
    '$scope',
    'BookScraperMaster',
    'HalfService'
  ];

// =============================================================================

  function SellerBooksCtrl($scope, $element, $attrs, $transclude, BookScraperMaster, HalfService) {
    $scope.marginalShippingCost = HalfService.getListingMarginalShippingCost;

    $scope.updateOrderTotalCost = function () {
      $scope.baseShippingBook = _.max($scope.seller.books, function (sbook) {
        return sbook.bestListing.shipping_cost;
      });
      $scope.baseShippingCost = $scope.baseShippingBook.bestListing.shipping_cost;

      // order total = books cost + base ship + marginal ship of other books
      $scope.orderTotalCost = $scope.baseShippingCost;
      _.forEach($scope.seller.books, function (sbook) {
        $scope.orderTotalCost += sbook.bestListing.price;
        if ($scope.baseShippingBook !== sbook) {
          $scope.orderTotalCost += 
            $scope.marginalShippingCost(sbook.bestListing);
        }
      });

      $scope.avgBookCost = $scope.orderTotalCost / $scope.seller.books.length;
    };

    $scope.updateOrderTotalCost();
  }

  SellerBooksCtrl.$inject = [
    '$scope',
    '$element',
    '$attrs',
    '$transclude',
    'BookScraperMaster',
    'HalfService'
  ];

// =============================================================================

  function SellerBookListingsCtrl($scope, $element, $attrs, $transclude, BookScraperMaster) {
    $scope.showListings = false;
    $scope.setShowListings = function (value) {
      $scope.showListings = value;
    };

    $scope.$watch('sbook.bestListing', function (newval, oldval) {
      if (newval !== oldval) {
        console.log('bestListing changed');
        $scope.$parent.updateOrderTotalCost();
      }
    });
  }

  SellerBookListingsCtrl.$inject = [
    '$scope',
    '$element',
    '$attrs',
    '$transclude',
    'BookScraperMaster'
  ];

// =============================================================================

  function GiphyEmbedCtrl($scope, $element, $attrs, $transclude, $sce) {
    var giphyIds,
        giphyUrl;

    giphyIds = [ 
      'ft9uGbxZvIGM8', 'OQxmEv6imvBdu', 'PwUEE2fhR00xi', 'ZCmDhIFeF1s2c',
      'r8wQTzXr7xia4', 'SEN2Ho9K96BHy', 'Mj1QjRKM14ifC', 'g0gepFYqKiYqQ',
      'GA4FHsS2tE8ta', 'CX1dZhBXfSQU0', 'imzbK7mXHqV6E', 'SCnmKSVG4zdQc',
      '11gYYbySTvUC2s'];

    // TODO: use giphy api to get width and height
    giphyUrl = 'http://giphy.com/embed/' + _.sample(giphyIds);
    $scope.safeGiphyUrl = $sce.trustAsResourceUrl(giphyUrl);
  }

  GiphyEmbedCtrl.$inject = [
    '$scope',
    '$element',
    '$attrs',
    '$transclude',
    '$sce',
  ];

// =============================================================================

  function ProgressTrackerCtrl($scope, $element, $attrs, $transclude, $location) {
    var splitPath,
        _steps;

    _steps = [
      'user', 'shelves', 'books', 'editions', 'listings', 'sellers'
    ];

    $scope.$on('$routeChangeSuccess', function (event, current) {
      var splitPath,
          currentStep,
          isBeyondCurrent;

      splitPath = $location.path().split('/');
      currentStep = ((splitPath.length >= 2) ? splitPath[1] : '');
      isBeyondCurrent = (currentStep === '' || !_.contains(_steps, currentStep));

      $scope.progressSteps = _.map(_steps, function (step) {
        var href = '',
            sclass;

        if (step === currentStep) {
          sclass = 'current';
          isBeyondCurrent = true;
        } else if (isBeyondCurrent) {
          sclass = 'wizard-disabled';
        } else {
          sclass = ''
          href = '#' + step;
        }

        return { 'name': step, 'sclass': sclass, 'href': href };
      });
    });
  }

  ProgressTrackerCtrl.$inject = [
    '$scope',
    '$element',
    '$attrs',
    '$transclude',
    '$location'
  ];

// =============================================================================

  function ErrorAlertsCtrl($scope, $rootScope, $element, $attrs, $transclude) {
    $scope.alertsList = [];

    var deregAddAlert = $rootScope.$on('errorAlerts.addAlert', 
      function (event, msg) {
        if (!_.contains($scope.alertsList, msg)) {
          $scope.alertsList.push(msg);
          // TODO: scroll to top of page
        }
      }
    );
    var deregClearAlerts = $rootScope.$on('errorAlerts.clearAlerts', function () {
      $scope.alertsList = [];
    });

    $scope.$on('$destroy', deregAddAlert);
    $scope.$on('$destroy', deregClearAlerts);
  }

  ErrorAlertsCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$element',
    '$attrs',
    '$transclude'
  ];

// =============================================================================

  function PagerCtrl($scope, $anchorScroll) {
    $scope.pagePrev = function () {
      $scope.currentPage = Math.max($scope.currentPage - 1, 0);
      $anchorScroll();
    };
    $scope.pageNext = function () {
      $scope.currentPage = Math.min($scope.currentPage + 1, $scope.numPages - 1);
      $anchorScroll();
    };
    $scope.setPage = function (pageNum) {
      $scope.currentPage = pageNum;
      $anchorScroll();
    };
    $scope.pageNumbers = _.range(0, $scope.numPages);
  }

  PagerCtrl.$inject = [
    '$scope',
    '$anchorScroll',
  ];

// =============================================================================

  function TestCtrl($scope, BookScraperMaster) {
    $scope.msg = 'TESTME';
    $scope.sbook = {
      listings: [null, null, null]
    };
    $scope.sellers = [1,2,3,4,5,6,7,8,9,10,11,12];
    var perPage = 5;
    $scope.perPage = perPage;
    $scope.pagedSellers = _.map(_.range(0, $scope.sellers.length, perPage), 
      function (start) {
        return $scope.sellers.slice(start, start + perPage);
      }
    );

    $scope.currentPage = 0;
  }

  TestCtrl.$inject = [
    '$scope',
    'BookScraperMaster'
  ];

// =============================================================================

  angular.module('myApp.controllers', ['ngResource'])
    .controller('GoodreadsUserCtrl', GoodreadsUserCtrl)
    .controller('ShelvesCtrl', ShelvesCtrl)
    .controller('BooksCtrl', BooksCtrl)
    .controller('BookOptionsCtrl', BookOptionsCtrl)
    .controller('EditionsCtrl', EditionsCtrl)
    .controller('ListingsCtrl', ListingsCtrl)
    .controller('SellersCtrl', SellersCtrl)
    .controller('SellerBooksCtrl', SellerBooksCtrl)
    .controller('SellerBookListingsCtrl', SellerBookListingsCtrl)
    .controller('GiphyEmbedCtrl', GiphyEmbedCtrl)
    .controller('ProgressTrackerCtrl', ProgressTrackerCtrl)
    .controller('ErrorAlertsCtrl', ErrorAlertsCtrl)
    .controller('PagerCtrl', PagerCtrl)
    .controller('TestCtrl', TestCtrl);
})();
