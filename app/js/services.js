'use strict';

/* Services */

(function() {

  //TODO: make sure this gets reset to defaults when starting over
  function BookScraperMaster() {
    return {
      goodreadsUserId: null,  // Goodreads user ID as string
      goodreadsSelectedShelves: null,   // Goodreads shelves selected for search
      isbnList: null,   // ISBNs entered directly by user
      //goodreadsUserId: 5123156,
      //goodreadsSelectedShelves: ['to-read', 'coffee-table'],

      shelves: null,    // array of shelf names
      books: null,      // array of ISBN strings
      editions: null,   // array of edition objects
      listings: null,   // array of listing objects
      sellers: null,    // array of seller objects

      selected_books: null,
      edition_selections: null,

      book_options_defaults: {
        desirability: 1.0,
        maxprice: 4.00,
        condition: 'Good',
        excludeLibrary: true,
        excludeCliffsNotes: true
      }
    };
  }

  BookScraperMaster.$inject = [
  ];

// =============================================================================

  function HalfAPI($resource) {
    return $resource(
      "http://cryptic-ridge-1093.herokuapp.com/api/half/find_items",
      {
        callback: 'JSON_CALLBACK',
      },
      {
        findItems: { method: 'JSONP' }
    });
  }

  HalfAPI.$inject = [
    '$resource'
  ];

// =============================================================================

  //TODO: caching
  //TODO: get all listings with condition >= cond, maxprice <= xx.xx, all pages
  function HalfService($rootScope, HalfAPI) {
    var _conditions = ['Acceptable', 'Good', 'VeryGood', 'LikeNew', 'BrandNew'];
    return {
      'findItems': half_findItemsCall,
      'bookConditions': function () { return _conditions; },
      'getValueForCondition': function (cond) {
        var val = _conditions.indexOf(cond);
        return (val >= 0 ? val : -Infinity);
      },
      'getListingMarginalShippingCost': getListingMarginalShippingCost
    };

    // half findItems call -- request first page and queue additional
    // requests for more pages and better book conditions if needed
    function half_findItemsCall(params, successCallback) {
      var condIndex,
          paramsCopy,
          i;
      // run request for specified parameters
      HalfAPI.findItems(
        params,
        function(data) {
          successCallback(data);
          $rootScope.$broadcast('halfService.findItems.call.response');
          if (data.total_pages !== undefined && data.total_pages > 1) {
            for (i = 2; i <= data.total_pages; i++) {
              paramsCopy = angular.copy(params);
              paramsCopy.page = i;
              half_findItemsPage(paramsCopy, successCallback);
            }
          }
        },
        // TODO: failure callback
        function(data) {
          $rootScope.$broadcast('halfService.findItems.call.response');
        }
      );
      $rootScope.$broadcast('halfService.findItems.call.request');

      // recursively run request for next better condition if not best
      if (params.condition) {
        condIndex = _conditions.indexOf(params.condition);
        if (condIndex !== -1 && condIndex + 1 < _conditions.length) {
          paramsCopy = angular.copy(params);
          paramsCopy.condition = _conditions[condIndex + 1];
          half_findItemsCall(paramsCopy, successCallback);
        }
      }
    }

    // half findItems page -- request for results page >= 2
    function half_findItemsPage(params, successCallback) {
      var condIndex,
          paramsCopy,
          i;
      // run request for specified parameters
      HalfAPI.findItems(
        params,
        function(data) {
          successCallback(data);
          $rootScope.$broadcast('halfService.findItems.page.response');
        },
        // TODO: failure callback
        function(data) {
          $rootScope.$broadcast('halfService.findItems.page.response');
        }
      );
      $rootScope.$broadcast('halfService.findItems.page.request');
    }

    function getListingMarginalShippingCost(listing) {
      if (listing.shipping_cost === 3.99) {         // hardback
        return 2.49;
      } else if (listing.shipping_cost === 3.49) {  // paperback
        return 1.89;
      } else if (listing.shipping_cost === 2.99) {  // audio/video media
        return 1.89;
      } else {                                      // should not happen
        return listing.shipping_cost;
      }
    }

  }

  HalfService.$inject = [
    '$rootScope',
    'HalfAPI'
  ];

// =============================================================================

  function GoodreadsAPI($resource) {
    return $resource(
      "http://cryptic-ridge-1093.herokuapp.com/api/goodreads/:collection",
      {
        callback: 'JSON_CALLBACK',
      },
      {
        getShelves: { method: 'JSONP', params: {collection: 'shelves'} },
        getBooks: { method: 'JSONP', params: {collection: 'books'} }
    });
  }

  GoodreadsAPI.$inject = [
    '$resource'
  ];
 
  // TODO: caching
  function GoodreadsService(GoodreadsAPI) {
    return {
      'getShelves': function(user_id, successCallback) {
        GoodreadsAPI.getShelves(
          {user_id: user_id},
          function(data) {
            console.log(data);
            successCallback(data.results);
          },
          // TODO: failure callback
          function(data, status) { console.log('Error: ' + status); }
        );
      },
      'getBooks': function(user_id, shelf_name, successCallback) {
        GoodreadsAPI.getBooks(
          {user_id: user_id, shelf_name: shelf_name},
          function(data) {
            console.log(data);
            successCallback(data.results);
          },
          // TODO: failure callback
          function(data, status) { console.log('Error: ' + status); }
        );
      }
    };
  }


  GoodreadsService.$inject = [
    'GoodreadsAPI'
  ];


// =============================================================================

  angular.module('myApp.services', ['ngResource'])
    .value('version', '0.1')
    .factory('BookScraperMaster', BookScraperMaster)
    .factory('HalfAPI', HalfAPI)
    .factory('HalfService', HalfService)
    .factory('GoodreadsAPI', GoodreadsAPI)
    .factory('GoodreadsService', GoodreadsService);

})();
