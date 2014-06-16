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
    };

    $scope.submitIsbnList = function (isbnText) {
      var isbnList = _.compact(isbnText.replace('-', '').split(/[,;\s]+/));
      BookScraperMaster.buildIsbnBooks(isbnList);
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

  function ShelvesCtrl($scope, $rootScope, $location, $log, BookScraperMaster, GoodreadsApi) {
    console.log('ShelvesCtrl: ' + BookScraperMaster.goodreadsUserId);
    $scope.selectedShelves = [];
    $scope.loading = true;

    GoodreadsApi.getShelves(BookScraperMaster.goodreadsUserId,
      function successFn(shelves) {
        BookScraperMaster.shelves = shelves;
        $scope.shelves = shelves;
        $scope.finishLoading();
      },
      function failureFn(response, msg) {
        $rootScope.$broadcast('errorAlerts.addAlert',
          'error: unable to get goodreads shelves -- check user id/url');
        $log.error('GoodreadsApi request failed: ' + msg);
        $scope.loading = false;
      }
    );

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
    '$rootScope',
    '$location',
    '$log',
    'BookScraperMaster',
    'GoodreadsApi'
  ];


// =============================================================================

  function BooksCtrl($scope, $rootScope, $location, $timeout, $log,
                      BookScraperMaster, GoodreadsApi, HalfService) {
    var defaultSelection;

    $scope.loading = true;
    $scope.failure = false;
    $scope.bookConditions = HalfService.bookConditions();

    var finishLoading = function () {
      // default selection includes all books with valid isbn
      defaultSelection = _.map($scope.books, function(book) {
        return (book.isbn !== null);
      });
      $scope.setAllSelections(true);
      $scope.loading = false;
      // TODO: testing: continue with all books selected
      //$timeout(function () {$scope.submitSelectedBooks($scope.selected_books);});
    };
    var failureFn = function(response, msg) {
      $rootScope.$broadcast('errorAlerts.addAlert',
        'error: unable to get goodreads shelf books -- wait and try again');
      $log.error('GoodreadsApi request failed: ' + msg);
      $scope.loading = false;
      $scope.failure = true;
    };

    BookScraperMaster.fetchShelfBooks(finishLoading, failureFn);

    $scope.books = BookScraperMaster.books;

    $scope.desirabilityChoices = [
      ['Must-have', 10.0],
      ['High', 3.0],
      ['Normal', 1.0],
      ['Add-on', 0.1]
    ];

    $scope.selection = [];

    $scope.setAllSelections = function (value) {
      if (value) {
        $scope.selection = angular.copy(defaultSelection);
      } else {
        $scope.selection = _.map(defaultSelection, function() {return false;});
      }
    };

    $scope.submitSelectedBooks = function () {
      BookScraperMaster.selected_books = _.filter($scope.books, function(book, i) {
        return $scope.selection[i] && book.isbn !== null;
      });
      if (!BookScraperMaster.selected_books.length) {
        $rootScope.$broadcast('errorAlerts.addAlert',
          'no books selected');
        return;
      }
      $location.path('/editions');
    };

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
    var books = $scope.books = BookScraperMaster.selected_books;

    $scope.loading = true;

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

    var finishLoading = function () {
      $scope.setAllSelections(true);
      $scope.loading = false;
    };
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
    $scope.editions = BookScraperMaster.editions;

    $scope.submitSelectedEditions = function (selection) {
      // TODO: error if too many books or editions
      BookScraperMaster.edition_selections = selection;
      $location.path('/listings');
    };
  }

  EditionsCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$log',
    'BookScraperMaster'
  ];

// =============================================================================

  function ListingsCtrl($scope, $rootScope, $location, $log, BookScraperMaster, HalfService) {
    $scope.books = BookScraperMaster.selected_books;

    var finishLoading = function () {
      $location.path('/sellers');
    };
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
  }

  ListingsCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$log',
    'BookScraperMaster',
    'HalfService'
  ];

// =============================================================================

  function SellersCtrl($scope, BookScraperMaster) {
    var sellers,
        pageBreaks;

    BookScraperMaster.buildSellersFromListings();
    sellers = BookScraperMaster.getSortedSellers();

    // build paginated sellers array
    $scope.currentPage = 0;
    $scope.perPage = 20;
    pageBreaks = _.range(0, sellers.length, $scope.perPage);
    $scope.pagedSellers = _.map(pageBreaks, function (pageStart) {
      return sellers.slice(pageStart, pageStart + $scope.perPage);
    });

    console.log(BookScraperMaster);
    console.log($scope.pagedSellers);
  }

  SellersCtrl.$inject = [
    '$scope',
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

  function SellerBookListingsCtrl($scope, $element, $attrs, $transclude, BookScraperMaster) {
    $scope.showListings = false;
    $scope.setShowListings = function (value) {
      $scope.showListings = value;
    };

    $scope.onChange = function () {
      $scope.$parent.updateOrderTotalCost();
    };
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
