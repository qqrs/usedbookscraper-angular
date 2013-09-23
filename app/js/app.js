'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers'])
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
    //$routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    //$routeProvider.when('/view3', {templateUrl: 'partials/partial3.html', controller: 'MyCtrl3'});
    $routeProvider.otherwise({redirectTo: '/user'});
  }]);
