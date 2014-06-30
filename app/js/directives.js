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

  function GiphyEmbedDirective() {
    return {
      templateUrl: 'partials/giphy_embed.html',
      replace: true,
      controller: 'GiphyEmbedCtrl'
    };
  }

  function ProgressTrackerDirective() {
    return {
      replace: false,
      controller: 'ProgressTrackerCtrl',
      template: '<div class="wizard"><a ng-repeat="step in progressSteps" ' +
        'ng-href="{{step.href}}" ng-class="step.sclass">{{step.name}}</a></div>'
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

  angular.module('ubsApp.directives', [])
    .directive('ubsBookOptions', BookOptionsDirective)
    .directive('ubsSellerBookListings', SellerBookListingsDirective)
    .directive('ubsSellerBooks', SellerBooksDirective)
    .directive('giphyEmbed', GiphyEmbedDirective)
    .directive('ubsProgressTracker', ProgressTrackerDirective)
    .directive('ubsErrorAlerts', ErrorAlertsDirective)
    .directive('ubsPager', PagerDirective);
  }
)();
