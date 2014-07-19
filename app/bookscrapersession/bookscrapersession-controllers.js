'use strict';

/* Controllers */

(function() {

  function GoodreadsUserCtrl($scope, $location, $window, BookScraperMaster, errorAlert) {
    $scope.goodreadsProfileUrl = 'http://www.goodreads.com/user/show/32853571-usedbookscraper';
    $scope.isbnText = '';
    if (BookScraperMaster.goodreadsUserId) {
      $scope.goodreadsProfileUrl = '' + BookScraperMaster.goodreadsUserId;
    }
    if (BookScraperMaster.isbnList) {
      $scope.isbnText = BookScraperMaster.isbnList.join(', ');
    }

    var resetSession = function() {
      angular.extend(BookScraperMaster, {
        goodreadsUserId: null,
        shelves: null,
        goodreadsSelectedShelves: null,

        isbnList: null,
        editions: null,
        editionSelections: null
      });
    };

    $scope.submitGoodreadsProfileUrl = function(profileUrl) {
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
        errorAlert('error: invalid goodreads profile url');
        return;
      }

      resetSession();
      BookScraperMaster.goodreadsUserId = parseInt(userId, 10);

      $window.ga('send', 'event', 'submit', 'user', userId);
      $location.path('/shelves');
    };

    $scope.submitIsbnList = function(isbnText) {
      var isbnList = _.compact(isbnText.replace('-', '').split(/[,;\s]+/));
      if (!isbnList.length) {
        errorAlert('no isbns entered');
        return;
      }
      resetSession();
      BookScraperMaster.buildIsbnBooks(isbnList);

      $window.ga('send', 'event', 'submit', 'isbns', ''+isbnList.length);
      $location.path('/editions');
    }
  }

  GoodreadsUserCtrl.$inject = [
    '$scope',
    '$location',
    '$window',
    'BookScraperMaster',
    'errorAlert'
  ];

// =============================================================================

  // FUTURE: quickstart button
  function ShelvesCtrl($scope, $location, $log, BookScraperMaster, errorAlert) {
    if (!BookScraperMaster.goodreadsUserId) {
      $location.path('/start');
      return;
    }

    var init = function() {
      $scope.showAdvanced = true;
      $scope.defaultBookOptions = BookScraperMaster.bookOptionsDefaults;

      if (BookScraperMaster.shelves &&
          BookScraperMaster.goodreadsSelectedShelves) {
        // show previously loaded data on back-navigation
        $scope.shelves = BookScraperMaster.shelves;
        $scope.selectedShelves = BookScraperMaster.goodreadsSelectedShelves;
        $scope.loading = false;
      } else {
        $scope.selectedShelves = [];
        $scope.shelves = null;
        $scope.loading = true;
        loadData();
      }
    };
    var loadData = function() {
      BookScraperMaster.fetchShelves(
        finishLoading,
        function failureFn(response, msg) {
          errorAlert('error: unable to get goodreads shelves -- check user id/url');
          errorAlert.ga('request', 'goodreads_shelves');
          $log.error('GoodreadsApi request failed: ' + msg);
          $scope.loading = false;
        }
      );
    };
    var finishLoading = function() {
      $scope.shelves = BookScraperMaster.shelves;

      var toRead = _.find($scope.shelves, {name: 'to-read'});
      if (toRead) {
        $scope.selectedShelves.push(toRead);
      }

      $scope.loading = false;
      // TESTING: testing: select last shelf
      //$scope.submitGoodreadsShelves([$scope.shelves[$scope.shelves.length - 1]]);
    };

    $scope.submitGoodreadsShelves = function(shelves) {
      if (!shelves.length) {
        errorAlert('no shelves selected');
        return;
      }
      BookScraperMaster.goodreadsSelectedShelves = shelves;
      BookScraperMaster.books = null;
      BookScraperMaster.selectedBooks = null;
      $location.path('/books');
    };

    init();
  }

  ShelvesCtrl.$inject = [
    '$scope',
    '$location',
    '$log',
    'BookScraperMaster',
    'errorAlert'
  ];


// =============================================================================

  function BooksCtrl($scope, $location, $window, $timeout, $log, BookScraperMaster, errorAlert) {
    if (!BookScraperMaster.shelves ||
        !BookScraperMaster.goodreadsSelectedShelves) {
      $location.path('/shelves');
      return;
    }

    var init = function() {
      $scope.failure = false;
      $scope.showAdvanced = true;
      $scope.ignoreTooMany = false;

      if (BookScraperMaster.books && BookScraperMaster.selectedBooks) {
        // show previously loaded data on back-navigation
        $scope.books = BookScraperMaster.books;
        $scope.selection = _.map($scope.books, function(book) {
          return !!_.find(BookScraperMaster.selectedBooks, book);
        });
        $scope.loading = false;
      } else {
        $scope.books = null;
        $scope.selection = null;
        $scope.loading = true;
        loadData();
      }
    };
    var loadData = function() {
      var failureFn = function(response, msg) {
        errorAlert('error: unable to get goodreads shelf books -- wait and try again');
        errorAlert.ga('request', 'goodreads_books');
        $log.error('GoodreadsApi request failed: ' + msg);
        $scope.loading = false;
        $scope.failure = true;
      };

      BookScraperMaster.fetchShelfBooks(finishLoading, failureFn);
    };
    var finishLoading = function() {
      $scope.books = BookScraperMaster.books;
      $scope.setAllSelections(true);
      $scope.loading = false;
      // TESTING: testing: continue with all books selected
      //$timeout(function() {$scope.submitSelectedBooks($scope.selectedBooks);});
    };

    $scope.setAllSelections = function(value) {
      // only select books with valid isbn
      if (value) {
        $scope.selection = _.map($scope.books, function(book) {
          return (book.isbn !== null);
        });
      } else {
        $scope.selection = _.map($scope.books, function() {return false;});
      }
    };

    $scope.submitSelectedBooks = function() {
      BookScraperMaster.selectedBooks = _.filter($scope.books, function(book, i) {
        return $scope.selection[i] && book.isbn !== null;
      });
      if (!BookScraperMaster.selectedBooks.length) {
        errorAlert('no books selected');
        return;
      } else if (BookScraperMaster.selectedBooks.length > 50) {
        errorAlert(BookScraperMaster.selectedBooks.length +
            ' books selected — queries of > 25 may be very slow — ' +
            'select ≤ 50 and try again');
        return;
      } else if (!$scope.ignoreTooMany &&
                  BookScraperMaster.selectedBooks.length > 25) {
        errorAlert(BookScraperMaster.selectedBooks.length +
            ' books selected — queries of > 25 may be very slow — ' +
            'click continue again if you still want to proceed');
        $scope.ignoreTooMany = true;
        return;
      }
      BookScraperMaster.editions = null;
      BookScraperMaster.editionSelections = null;
      $window.ga('send', 'event', 'submit', 'books', ''+BookScraperMaster.selectedBooks.length);
      $location.path('/editions');
    };

    init();
  }

  BooksCtrl.$inject = [
    '$scope',
    '$location',
    '$window',
    '$timeout',
    '$log',
    'BookScraperMaster',
    'errorAlert'
  ];

// =============================================================================

  function BookOptionsCtrl($scope, HalfService) {
    $scope.bookConditions = HalfService.bookConditions();
    $scope.desirabilityChoices = [
      ['Must-have', 10.0],
      ['High', 3.0],
      ['Normal', 1.0],
      ['Low', 0.1]
    ];

    $scope.edit = (!$scope.defaultOptions || $scope.defaultOptions !== $scope.options);
    $scope.toggleEdit = function() {
      $scope.edit = !$scope.edit;
      if ($scope.edit) {
        // create a duplicate of the default options object for editing
        $scope.options = $scope.defaultOptions.clone();
      } else {
        $scope.options = $scope.defaultOptions;
      }
    };
  }

  BookOptionsCtrl.$inject = [
    '$scope',
    'HalfService'
  ];


// =============================================================================

  function EditionsCtrl($scope, $location, $window, $log, BookScraperMaster, errorAlert) {
    var books;

    if (!BookScraperMaster.books ||
        !BookScraperMaster.selectedBooks) {
      $location.path('/books');
      return;
    }

    var init = function() {
      $scope.ignoreTooMany = false;
      books = $scope.books = BookScraperMaster.selectedBooks;
      if (BookScraperMaster.editions && BookScraperMaster.editionSelections) {
        // show previously loaded data on back-navigation
        $scope.editions = BookScraperMaster.editions;
        $scope.selection = BookScraperMaster.editionSelections;
        $scope.loading = false;
      } else {
        $scope.editions = null;
        _.each(books, function(book) {
          book.editions = null;
        });
        $scope.selection = null;
        $scope.loading = true;
        loadData();
      }
    };
    var loadData = function() {
      var failureFn = function(response, msg) {
        if (msg === 'invalidId') {
          errorAlert('invalid isbn: go back and fix query or continue with partial results');
          errorAlert.ga('request', 'xisbn_invalid');
        } else {
          errorAlert('editions lookup error: go back and try again or continue with partial results');
          errorAlert.ga('request', 'xisbn');
        }
        $log.warn('XisbnApi request failed: ' + msg);
      };
      BookScraperMaster.fetchAltEditions(finishLoading, failureFn);
    };
    var finishLoading = function() {
      $scope.editions = BookScraperMaster.editions;
      $scope.setAllSelections(true);
      $scope.loading = false;
    };

    var buildSelectionsForBook = function(book, value) {
      return _.map(book.editions, function(ed) {
        // disallow selection of edition if it has no isbn
        return (!ed.isbn) ? false : value;
      });
    };
    var countSelectedEditions = function() {
      var count = 0;
      _.each($scope.selection, function(bookSel) {
        _.each(bookSel, function(edSel) {
          if (edSel) {
            count += 1;
          }
        });
      });
      return count;
    };
    $scope.setAllSelections = function(value) {
      $scope.selection = _.map(books, function(book) {
        return buildSelectionsForBook(book, value);
      });
    };
    $scope.setAllSelectionsForBook = function(bookIndex, value) {
      var book = books[bookIndex];
      $scope.selection[bookIndex] = buildSelectionsForBook(book, value);
    }

    $scope.submitSelectedEditions = function(selection) {
      var count = countSelectedEditions();
      if (!count) {
        errorAlert('no editions selected');
        return;
      } else if (count > 1000) {
        errorAlert(count +
            ' editions selected — queries of > 500 may be very slow — ' +
            'select ≤ 1000 and try again');
        return;
      } else if (!$scope.ignoreTooMany && count > 500) {
        errorAlert(count +
            ' editions selected — queries of > 500 may be very slow — ' +
            'click continue again if you still want to proceed');
        $scope.ignoreTooMany = true;
        return;
      }
      BookScraperMaster.editionSelections = selection;
      BookScraperMaster.listings = null;
      $window.ga('send', 'event', 'submit', 'editions', ''+count);
      $location.path('/listings');
    };

    init();
  }

  EditionsCtrl.$inject = [
    '$scope',
    '$location',
    '$window',
    '$log',
    'BookScraperMaster',
    'errorAlert'
  ];

// =============================================================================

  function ListingsCtrl($scope, $location, $timeout, $log, BookScraperMaster, errorAlert) {
    var stepChangeTimer,
        loading;

    if (!BookScraperMaster.editions || !BookScraperMaster.editionSelections) {
      $location.path('/editions');
      return;
    }

    var init = function() {
      if (BookScraperMaster.listings) {
        loading = false;
        // delay before advancing to allow back navigation
        stepChangeTimer = $timeout(function() {
          $location.path('/sellers');
        }, 1000);
      } else {
        loading = true;
        clearListings();
        loadData();
      }
    };
    var loadData = function() {
      var handleFetchListingsFailure = function(response, msg) {
        if (!$scope.apiRequestProgress.canceled) {
          errorAlert('half.com item lookup error: continuing with partial results');
          errorAlert.ga('request', 'half_listings');
          $log.warn('half.com request failed: ' + msg);
        }
      };
      $scope.apiRequestProgress = BookScraperMaster.fetchListings(
        finishLoading,
        handleFetchListingsFailure
      );
    };
    var finishLoading = function() {
      loading = false;
      BookScraperMaster.sellers = null;
      $location.path('/sellers');
    };
    $scope.$on('$destroy', function() {
      $timeout.cancel(stepChangeTimer);
      if (loading) {
        $scope.apiRequestProgress.cancelRequests();
        clearListings();
      }
    });

    var clearListings = function() {
      BookScraperMaster.listings = null;
      _.each(BookScraperMaster.books, function(book) {
        book.listings = null;
      });
      _.each(BookScraperMaster.editions, function(ed) {
        ed.listings = null;
      });
    };

    init();
  }

  ListingsCtrl.$inject = [
    '$scope',
    '$location',
    '$timeout',
    '$log',
    'BookScraperMaster',
    'errorAlert'
  ];

// =============================================================================

  function SellersCtrl($scope, $location, $window, BookScraperMaster) {
    var sellers,
        pageBreaks;

    if (!BookScraperMaster.listings) {
      $location.path('/listings');
      return;
    }

    var init = function() {
      if (BookScraperMaster.sellers) {
        finishLoading();
      } else {
        loadData();
      }
    };
    var loadData = function() {
      BookScraperMaster.buildSellersFromListings();
      finishLoading();
    };
    var finishLoading = function() {
      sellers = BookScraperMaster.getSortedSellers();

      // build paginated sellers array
      $scope.currentPage = 0;
      $scope.perPage = 20;
      pageBreaks = _.range(0, sellers.length, $scope.perPage);
      $scope.pagedSellers = _.map(pageBreaks, function(pageStart) {
        return sellers.slice(pageStart, pageStart + $scope.perPage);
      });
    };

    $scope.handleBuyNowClick = function() {
      $window.ga('send', 'event', 'click', 'buynow');
    };

    init();
  }

  SellersCtrl.$inject = [
    '$scope',
    '$location',
    '$window',
    'BookScraperMaster'
  ];

// =============================================================================

  function SellerBooksCtrl($scope, HalfService) {
    $scope.marginalShippingCost = HalfService.getListingMarginalShippingCost;

    // find total cost for order and identify base shipping cost book
    $scope.updateOrderTotalCost = function() {
      $scope.baseShippingBook = _.max($scope.seller.books, function(sbook) {
        return sbook.bestListing.shipping_cost;
      });
      $scope.baseShippingCost = $scope.baseShippingBook.bestListing.shipping_cost;

      // order total = books cost + base ship + marginal ship of other books
      $scope.orderTotalCost = $scope.baseShippingCost;
      _.each($scope.seller.books, function(sbook) {
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
    'HalfService'
  ];

// =============================================================================

  function SellerBookListingsCtrl($scope) {
    $scope.showListings = false;
    $scope.setShowListings = function(value) {
      $scope.showListings = value;
    };

    $scope.onChange = function() {
      $scope.$parent.updateOrderTotalCost();
    };
  }

  SellerBookListingsCtrl.$inject = [
    '$scope'
  ];

// =============================================================================

  angular.module('ubsApp.bookScraperSession.controllers', ['ngResource'])
    .controller('GoodreadsUserCtrl', GoodreadsUserCtrl)
    .controller('ShelvesCtrl', ShelvesCtrl)
    .controller('BooksCtrl', BooksCtrl)
    .controller('BookOptionsCtrl', BookOptionsCtrl)
    .controller('EditionsCtrl', EditionsCtrl)
    .controller('ListingsCtrl', ListingsCtrl)
    .controller('SellersCtrl', SellersCtrl)
    .controller('SellerBooksCtrl', SellerBooksCtrl)
    .controller('SellerBookListingsCtrl', SellerBookListingsCtrl);
})();
