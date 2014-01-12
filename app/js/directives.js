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

  angular.module('myApp.directives', [])
    .directive('ubsSellerBooks', SellerBooksDirective);
  }
)();
