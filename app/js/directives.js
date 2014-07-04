'use strict';

/* Directives */

(function() {

  function BookOptionsDirective() {
    return {
      templateUrl: 'partials/book_options.html',
      replace: false,
      scope: {
        options: '=ubsBookOptions',
        defaultOptions: '=ubsBookOptionsDefaults'
      },
      controller: 'BookOptionsCtrl'
    };
  }

  function SellerBooksDirective() {
    return {
      templateUrl: 'partials/seller_books.html',
      replace: true,
      scope: { seller: '=ubsSellerBooks' },
      controller: 'SellerBooksCtrl'
    };
  }

  function SellerBookListingsDirective() {
    return {
      templateUrl: 'partials/seller_book_listings.html',
      replace: false,
      scope: { sbook: '=ubsSellerBookListings' },
      controller: 'SellerBookListingsCtrl'
    };
  }

  function ErrorAlertsDirective() {
    return {
      replace: false,
      controller: 'ErrorAlertsCtrl',
      template: '<div class="alert alert-error" ng-show="alertsList.length">' +
            '<ul><li ng-repeat="alert in alertsList">{{alert}}</li></ul></div>'
    };
  }

  function PagerDirective() {
    return {
      templateUrl: 'partials/pager.html',
      replace: false,
      scope: {
        numPages: '=pagerNumPages',
        perPage: '=pagerPerPage',
        currentPage: '=pagerCurrentPage'
      },
      controller: 'PagerCtrl'
    };
  }

  // remove padding from main content div on home.html
  function MainContentHideHomePaddingDirective($route) {
    return {
      controller: ['$rootScope', '$element', function($rootScope, $element) {
        $rootScope.$on('$routeChangeSuccess', function(event, currentRoute) {
          if (currentRoute.loadedTemplateUrl === "partials/home.html") {
            $element.addClass('no-pad');
          } else {
            $element.removeClass('no-pad');
          }
        });
      }]
    };
  }

  angular.module('ubsApp.directives', [])
    .directive('ubsBookOptions', BookOptionsDirective)
    .directive('ubsSellerBookListings', SellerBookListingsDirective)
    .directive('ubsSellerBooks', SellerBooksDirective)
    .directive('ubsErrorAlerts', ErrorAlertsDirective)
    .directive('ubsPager', PagerDirective)
    .directive('ubsMainContentHideHomePadding', MainContentHideHomePaddingDirective);
  }
)();
