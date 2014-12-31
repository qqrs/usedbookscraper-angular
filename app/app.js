'use strict';


// Declare app level module which depends on filters, and services
angular.module('ubsApp', [
    'ngRoute',
    'ubsApp.bookScraperSession',
    'ubsApp.services.goodreads',
    'ubsApp.services.xisbn',
    'ubsApp.services.half',

    'ubsApp.progressTracker',
    'ubsApp.errorAlert',
    'ubsApp.pager',
    'ubsApp.hidePadding',
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
    $routeProvider.when('/example', {templateUrl: 'partials/example.html'});

    $routeProvider.when('/start', {templateUrl: 'bookscrapersession/partials/user.html', controller: 'GoodreadsUserCtrl'});
    $routeProvider.when('/shelves', {templateUrl: 'bookscrapersession/partials/shelves.html', controller: 'ShelvesCtrl'});
    $routeProvider.when('/books', {templateUrl: 'bookscrapersession/partials/books.html', controller: 'BooksCtrl'});
    $routeProvider.when('/editions', {templateUrl: 'bookscrapersession/partials/editions.html', controller: 'EditionsCtrl'});
    $routeProvider.when('/listings', {templateUrl: 'bookscrapersession/partials/listings.html', controller: 'ListingsCtrl'});
    $routeProvider.when('/sellers', {templateUrl: 'bookscrapersession/partials/sellers.html', controller: 'SellersCtrl'});

    $routeProvider.otherwise({redirectTo: '/'});
  }])
  .run(['$route', angular.noop])

  .factory('baseApiUrl', ['$location', function($location) {
    if ($location.host() === 'usedbookscraper.herokuapp.com') {
      return 'http://usedbookscraper.herokuapp.com/api/';
    } else if ($location.host() === 'www.bookscraper.com') {
      return 'http://www.bookscraper.com/api/';
    } else {
      return 'http://cryptic-ridge-1093.herokuapp.com/api/';
    }
  }]);
