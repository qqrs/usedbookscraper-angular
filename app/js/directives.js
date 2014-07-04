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

  angular.module('ubsApp.directives', [])
    .directive('ubsBookOptions', BookOptionsDirective)
    .directive('ubsSellerBookListings', SellerBookListingsDirective)
    .directive('ubsSellerBooks', SellerBooksDirective);
  }
)();
