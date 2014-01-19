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

  function GiphyEmbed() {
    return {
      templateUrl: 'partials/giphy_embed.html',
      replace: true,
      controller: 'GiphyEmbedCtrl'
    };
  }

  angular.module('myApp.directives', [])
    .directive('ubsSellerBookListings', SellerBookListingsDirective)
    .directive('ubsSellerBooks', SellerBooksDirective)
    .directive('giphyEmbed', GiphyEmbed);
  }
)();
