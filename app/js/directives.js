'use strict';

/* Directives */

(function () {

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

  angular.module('myApp.directives', [])
    .directive('ubsSellerBookListings', SellerBookListingsDirective)
    .directive('ubsSellerBooks', SellerBooksDirective);
  }
)();
