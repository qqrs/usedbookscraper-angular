'use strict';

(function() {

  function GoodreadsAPI($resource, $log) {
    var goodreadsProxyResource,
        service;

    service = {};

    goodreadsProxyResource = $resource(
      "http://cryptic-ridge-1093.herokuapp.com/api/goodreads/:collection",
      {
        callback: 'JSON_CALLBACK',
      },
      {
        getShelves: { method: 'JSONP', params: {collection: 'shelves'} },
        getBooks: { method: 'JSONP', params: {collection: 'books'} }
    });

    service.getShelves = function(user_id, successFn, failureFn) {
      goodreadsProxyResource.getShelves(
        {user_id: user_id},
        function(data) {
          console.log(data);
          successFn(data.results);
        },
        // TODO: failure callback
        function(data, status) { console.log('Error: ' + status); }
      );
    };

    service.getBooks = function(user_id, shelf_name, successFn, failureFn) {
      goodreadsProxyResource.getBooks(
        {user_id: user_id, shelf_name: shelf_name},
        function(data) {
          console.log(data);
          successFn(data.results);
        },
        // TODO: failure callback
        function(data, status) { console.log('Error: ' + status); }
      );
    };

    return service;
  }

  /**
   * Simulate HTTP failures for getShelves and getBooks methods, respectively.
   */
  var GoodreadsAPITestShelves = function GoodreadsAPITestShelves() {
    var service = GoodreadsAPI.apply(this, arguments);
    service.getShelves = function(user_id, successFn, failureFn) {
      (failureFn || _.noop)('', 400, 'GoodreadsAPITest mock error');
    };
    return service;
  }
  var GoodreadsAPITestBooks = function GoodreadsAPITestBooks() {
    var service = GoodreadsAPI.apply(this, arguments);
    service.getBooks = function(user_id, shelf_name, successFn, failureFn) {
      (failureFn || _.noop)('', 400, 'GoodreadsAPITest mock error');
    };
    return service;
  }


  GoodreadsAPI.$inject = ['$resource', '$log'];
  GoodreadsAPITestShelves.$inject = GoodreadsAPI.$inject;
  GoodreadsAPITestBooks.$inject = GoodreadsAPI.$inject;
 
  angular.module('myApp.services.goodreads', ['ngResource'])
    .factory('GoodreadsAPI', GoodreadsAPI);
})();
