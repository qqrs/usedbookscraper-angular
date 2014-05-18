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
    'ubsApp.controllers'])
  /*
  .config(['$locationProvider',
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }
  ])
  */
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/user', {templateUrl: 'partials/user.html', controller: 'GoodreadsUserCtrl'});
    $routeProvider.when('/shelves', {templateUrl: 'partials/shelves.html', controller: 'ShelvesCtrl'});
    $routeProvider.when('/books', {templateUrl: 'partials/books.html', controller: 'BooksCtrl'});
    $routeProvider.when('/editions', {templateUrl: 'partials/editions.html', controller: 'EditionsCtrl'});
    $routeProvider.when('/listings', {templateUrl: 'partials/listings.html', controller: 'ListingsCtrl'});
    $routeProvider.when('/sellers', {templateUrl: 'partials/sellers.html', controller: 'SellersCtrl'});

    $routeProvider.when('/test', {templateUrl: 'partials/test.html', controller: 'TestCtrl'});
    $routeProvider.otherwise({redirectTo: '/user'});
    //$routeProvider.otherwise({redirectTo: '/test'});
  }]);
