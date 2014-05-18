'use strict';

(function() {

  function GoodreadsAPI($resource) {

    var goodreadsProxyResource = $resource(
      "http://cryptic-ridge-1093.herokuapp.com/api/goodreads/:collection",
      {
        callback: 'JSON_CALLBACK',
      },
      {
        getShelves: { method: 'JSONP', params: {collection: 'shelves'} },
        getBooks: { method: 'JSONP', params: {collection: 'books'} }
    });

  // TODO: caching
    return {
      'getShelves': function(user_id, successCallback) {
        goodreadsProxyResource.getShelves(
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
        goodreadsProxyResource.getBooks(
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

  GoodreadsAPI.$inject = [
    '$resource'
  ];
 


// =============================================================================


  angular.module('myApp.services.goodreads', ['ngResource'])
    .factory('GoodreadsAPI', GoodreadsAPI);
})();
