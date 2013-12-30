'use strict';

/* Services */

(function() {

  function BookScraperMaster() {
    return {
      goodreadsUserId: null,  // Goodreads user ID as string
      goodreadsSelectedShelves: null,   // Goodreads shelves selected for search
      //goodreadsUserId: 5123156,
      //goodreadsSelectedShelves: ['to-read', 'coffee-table'],

      shelves: null,    // array of shelf names
      books: null,      // array of ISBN strings
      editions: null,   // array of edition objects
      listings: null,   // array of listing objects
      sellers: null,    // array of seller objects

      selected_books: null,
      edition_selections: null
    };
  }

  BookScraperMaster.$inject = [
  ];

// =============================================================================


  function XisbnAPI($resource) {
    return $resource(
      "http://xisbn.worldcat.org/webservices/xid/isbn/:isbn",
      {
        format: 'json',
        callback: 'JSON_CALLBACK',
      },
      {
        getEditions: {
          method: 'JSONP',
          params: {
            method: 'getEditions',
            fl: 'form,lang,author,ed,year,isbn,title'
          }
      }
    });
  }

  XisbnAPI.$inject = [
    '$resource'
  ];

// =============================================================================


  // TODO: caching
  // TODO: handle overlimit response HTTP 200: {"stat":"overlimit"}
  function XisbnService(XisbnAPI) {
    return {
      'getEditions': function(isbn, successCallback) {
        XisbnAPI.getEditions(
          {isbn: isbn},
          function(data) {
            console.log(data);
            successCallback(mungeXisbnEditions(data.list));
          },
          // TODO: failure callback
          function(data, status) { console.log('Error: ' + status); }
        );
      }
    };
  }

  XisbnService.$inject = [
    'XisbnAPI'
  ];

  // filter unwanted editions and munge each edition object
  function mungeXisbnEditions(raw_editions) {
    var editions = [];

    angular.forEach(raw_editions, function(ed) {
      // filter to English and book formats (BA=book BB=hardcover BC=paperback)
      if (ed.lang === 'eng' && ed.form[0] &&
          (ed.form[0] === 'BA' || ed.form[0] === 'BB' || ed.form[0] === 'BC')) {
        this.push({
          'isbn':     ed.isbn[0],
          'title':    ed.title,
          'author':   ed.author,
          'lang':     ed.lang,
          'ed':       ed.ed,
          'year':     ed.year
        });
      }
    }, editions);

    console.log(editions);
    return editions;
  }

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
      'bookConditions': function () { return _conditions; }
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
    .factory('XisbnAPI', XisbnAPI)
    .factory('XisbnService', XisbnService)
    .factory('HalfAPI', HalfAPI)
    .factory('HalfService', HalfService)
    .factory('GoodreadsAPI', GoodreadsAPI)
    .factory('GoodreadsService', GoodreadsService);

})();
