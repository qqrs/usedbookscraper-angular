'use strict';


// Declare app level module which depends on filters, and services
angular.module('ubsApp', [
    'ngRoute',
    'ubsApp.filters',
    'ubsApp.services',
    'ubsApp.services.goodreads',
    'ubsApp.services.xisbn',
    'ubsApp.services.half',
    'ubsApp.directives',
    'ubsApp.controllers',
    'ubsApp.progressTracker',
    'ubsApp.errorAlert',
    'ubsApp.giphyEmbed'
    ])
  /*
  .config(['$locationProvider',
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }
  ])
  */
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/home.html'});
    $routeProvider.when('/about', {templateUrl: 'partials/about.html'});

    $routeProvider.when('/start', {templateUrl: 'partials/user.html', controller: 'GoodreadsUserCtrl'});
    $routeProvider.when('/shelves', {templateUrl: 'partials/shelves.html', controller: 'ShelvesCtrl'});
    $routeProvider.when('/books', {templateUrl: 'partials/books.html', controller: 'BooksCtrl'});
    $routeProvider.when('/editions', {templateUrl: 'partials/editions.html', controller: 'EditionsCtrl'});
    $routeProvider.when('/listings', {templateUrl: 'partials/listings.html', controller: 'ListingsCtrl'});
    $routeProvider.when('/sellers', {templateUrl: 'partials/sellers.html', controller: 'SellersCtrl'});

    $routeProvider.otherwise({redirectTo: '/'});
  }])
  .run(['$route', angular.noop]);
