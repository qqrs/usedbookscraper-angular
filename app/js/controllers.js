'use strict';

/* Controllers */

(function() {

  // TODO: clear alerts message on every view change
  // TODO: quickstart button
  // TODO: delete unnecessary deps for all controllers
  // TODO: function() styling
  // TODO: new relic
  // TODO: google analytics
  // TODO: add books, editions, API results page limits
  // TODO: rename user step
  // TOOD: grunt/gulpfile and minified build
  function GoodreadsUserCtrl($scope, $rootScope, $location, BookScraperMaster) {
    // TODO: for testing only
    $scope.goodreadsProfileUrl = 'http://www.goodreads.com/user/show/5123156-russ';
    $scope.isbnText = '0679736662, 9780393326550, 978-0618249060';
    if (BookScraperMaster.goodreadsUserId) {
      $scope.goodreadsProfileUrl = '' + BookScraperMaster.goodreadsUserId;
    }
    if (BookScraperMaster.isbnList) {
      $scope.isbnText = BookScraperMaster.isbnList.join(', ');
    }

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
      BookScraperMaster.isbnList = null;
      $location.path('/shelves');
    };

    $scope.submitIsbnList = function (isbnText) {
      var isbnList = _.compact(isbnText.replace('-', '').split(/[,;\s]+/));
      BookScraperMaster.buildIsbnBooks(isbnList);
      this.goodreadsUserId = null;
      this.goodreadsSelectedShelves = null;
      $location.path('/editions');
    }
  }

  GoodreadsUserCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    'BookScraperMaster'
  ];

// =============================================================================

  function ShelvesCtrl($scope, $rootScope, $location, $log, BookScraperMaster) {
    if (!BookScraperMaster.goodreadsUserId) {
      $location.path('/user');
      return;
    }

    var init = function() {
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
    var loadData = function () {
      BookScraperMaster.fetchShelves(
        finishLoading,
        function failureFn(response, msg) {
          $rootScope.$broadcast('errorAlerts.addAlert',
            'error: unable to get goodreads shelves -- check user id/url');
          $log.error('GoodreadsApi request failed: ' + msg);
          $scope.loading = false;
        }
      );
    };
    var finishLoading = function () {
      $scope.shelves = BookScraperMaster.shelves;
      $scope.loading = false;
      // TODO: testing: select last shelf
      //$scope.submitGoodreadsShelves([$scope.shelves[$scope.shelves.length - 1]]);
    };

    $scope.submitGoodreadsShelves = function (shelves) {
      BookScraperMaster.goodreadsSelectedShelves = shelves;
      BookScraperMaster.books = null;
      BookScraperMaster.selected_books = null;
      $location.path('/books');
    };

    init();
  }

  ShelvesCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$log',
    'BookScraperMaster'
  ];


// =============================================================================

  function BooksCtrl($scope, $rootScope, $location, $timeout, $log,
                      BookScraperMaster, GoodreadsApi, HalfService) {
    if (!BookScraperMaster.shelves ||
        !BookScraperMaster.goodreadsSelectedShelves) {
      $location.path('/shelves');
      return;
    }

    var init = function() {
      $scope.failure = false;
      $scope.bookConditions = HalfService.bookConditions();
      $scope.desirabilityChoices = [
        ['Must-have', 10.0],
        ['High', 3.0],
        ['Normal', 1.0],
        ['Add-on', 0.1]
      ];

      if (BookScraperMaster.books && BookScraperMaster.selected_books) {
        // show previously loaded data on back-navigation
        $scope.books = BookScraperMaster.books;
        $scope.selection = _.map($scope.books, function(book) {
          return !!_.find(BookScraperMaster.selected_books, book);
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
        $rootScope.$broadcast('errorAlerts.addAlert',
          'error: unable to get goodreads shelf books -- wait and try again');
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
      // TODO: testing: continue with all books selected
      //$timeout(function () {$scope.submitSelectedBooks($scope.selected_books);});
    };

    $scope.setAllSelections = function (value) {
      // only select books with valid isbn
      if (value) {
        $scope.selection = _.map($scope.books, function(book) {
          return (book.isbn !== null);
        });
      } else {
        $scope.selection = _.map($scope.books, function() {return false;});
      }
    };

    $scope.submitSelectedBooks = function () {
      // TODO: error if too many books or editions
      BookScraperMaster.selected_books = _.filter($scope.books, function(book, i) {
        return $scope.selection[i] && book.isbn !== null;
      });
      if (!BookScraperMaster.selected_books.length) {
        $rootScope.$broadcast('errorAlerts.addAlert',
          'no books selected');
        return;
      }
      BookScraperMaster.editions = null;
      BookScraperMaster.edition_selections = null;
      $location.path('/editions');
    };

    init();
  }

  BooksCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    '$log',
    'BookScraperMaster',
    'GoodreadsApi',
    'HalfService'
  ];

// =============================================================================

  function BookOptionsCtrl($scope, $location, $timeout, BookScraperMaster, GoodreadsApi) {
  }

  BookOptionsCtrl.$inject = [
    '$scope',
    '$location',
    '$timeout',
    'BookScraperMaster',
    'GoodreadsApi'
  ];


// =============================================================================

  function EditionsCtrl($scope, $rootScope, $location, $log, BookScraperMaster) {
    var books;

    if (!BookScraperMaster.books ||
        !BookScraperMaster.selected_books) {
      $location.path('/books');
      return;
    }

    var init = function() {
      books = $scope.books = BookScraperMaster.selected_books;
      if (BookScraperMaster.editions && BookScraperMaster.edition_selections) {
        // show previously loaded data on back-navigation
        $scope.editions = BookScraperMaster.editions;
        $scope.selection = BookScraperMaster.edition_selections;
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
        // TODO: better error msg
        if (msg === 'invalidId') {
          $rootScope.$broadcast('errorAlerts.addAlert',
            'invalid isbn: fix query or continue with partial results');
        } else {
          $rootScope.$broadcast('errorAlerts.addAlert',
            'editions lookup error: try again or continue with partial results');
        }
        $log.warn('XisbnApi request failed: ' + msg);
      };
      BookScraperMaster.fetchAltEditions(finishLoading, failureFn);
    };
    var finishLoading = function () {
      $scope.editions = BookScraperMaster.editions;
      $scope.setAllSelections(true);
      $scope.loading = false;
    };

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
      BookScraperMaster.listings = null;
      $location.path('/listings');
    };

    init();
  }

  EditionsCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$log',
    'BookScraperMaster'
  ];

// =============================================================================

  // TODO: fix back-navigation
  function ListingsCtrl($scope, $rootScope, $location, $timeout, $log, BookScraperMaster) {
    var stepChangeTimer,
        loading;

    if (!BookScraperMaster.editions || !BookScraperMaster.edition_selections) {
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
        // TODO: better error msg
        $rootScope.$broadcast('errorAlerts.addAlert',
          'half.com item lookup error: continuing with partial results');
        $log.warn('half.com request failed: ' + msg);
      };
      // TODO: cancel requests if leaving controller
      $scope.apiRequestProgress = BookScraperMaster.fetchListings(
        finishLoading,
        handleFetchListingsFailure
      );
    };
    var finishLoading = function () {
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
    '$rootScope',
    '$location',
    '$timeout',
    '$log',
    'BookScraperMaster'
  ];

// =============================================================================

  function SellersCtrl($scope, $location, BookScraperMaster) {
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
      $scope.pagedSellers = _.map(pageBreaks, function (pageStart) {
        return sellers.slice(pageStart, pageStart + $scope.perPage);
      });
    };

    init();
  }

  SellersCtrl.$inject = [
    '$scope',
    '$location',
    'BookScraperMaster'
  ];

// =============================================================================

  function SellerBooksCtrl($scope, HalfService) {
    $scope.marginalShippingCost = HalfService.getListingMarginalShippingCost;

    // find total cost for order and identify base shipping cost book
    $scope.updateOrderTotalCost = function () {
      $scope.baseShippingBook = _.max($scope.seller.books, function (sbook) {
        return sbook.bestListing.shipping_cost;
      });
      $scope.baseShippingCost = $scope.baseShippingBook.bestListing.shipping_cost;

      // order total = books cost + base ship + marginal ship of other books
      $scope.orderTotalCost = $scope.baseShippingCost;
      _.each($scope.seller.books, function (sbook) {
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
    $scope.setShowListings = function (value) {
      $scope.showListings = value;
    };

    $scope.onChange = function () {
      $scope.$parent.updateOrderTotalCost();
    };
  }

  SellerBookListingsCtrl.$inject = [
    '$scope'
  ];

// =============================================================================

  function GiphyEmbedCtrl($scope, $sce) {
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
    '$sce'
  ];

// =============================================================================

  function ProgressTrackerCtrl($scope, $rootScope, $location) {
    var splitPath,
        _steps;

    _steps = [
      'user', 'shelves', 'books', 'editions', 'listings', 'sellers'
    ];

    // set default path on app load or page reload
    $location.path('/' + _steps[0]);

    $rootScope.$on('$routeChangeSuccess', function (event, current) {
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

        return {name: step, sclass: sclass, href: href};
      });
    });
  }

  ProgressTrackerCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location'
  ];

// =============================================================================

  function ErrorAlertsCtrl($scope, $rootScope, $anchorScroll) {
    $scope.alertsList = [];

    var deregAddAlert = $rootScope.$on('errorAlerts.addAlert', 
      function (event, msg) {
        if (!_.contains($scope.alertsList, msg)) {
          $scope.alertsList.push(msg);
          $anchorScroll();
        }
      }
    );
    var deregClearAlerts = $rootScope.$on('errorAlerts.clearAlerts', function () {
      $scope.alertsList = [];
    });
    var deregRouteChange = $rootScope.$on('$routeChangeStart', function () {
      $scope.alertsList = [];
    });

    $scope.$on('$destroy', deregAddAlert);
    $scope.$on('$destroy', deregClearAlerts);
    $scope.$on('$destroy', deregRouteChange);
  }

  ErrorAlertsCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$anchorScroll'
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
    '$anchorScroll'
  ];

// =============================================================================

  // TODO: delete this
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

  angular.module('ubsApp.controllers', ['ngResource'])
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
