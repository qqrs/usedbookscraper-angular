'use strict';

(function() {

  function GoodreadsApi($resource, $log, baseApiUrl) {
    var grResource,
        service;

    service = {};

    grResource = $resource(
      baseApiUrl + 'goodreads/:collection', {}, {
        getShelves: { method: 'GET', params: {collection: 'shelves'} },
        getBooks: { method: 'GET', params: {collection: 'books'} }
    });

    service.getShelves = function(user_id, successFn, failureFn) {
      var handleSuccess,
          handleFailure;

      handleSuccess = function(data) {
        successFn(data.results);
      };

      grResource.getShelves(
        {user_id: user_id},
        handleSuccess,
        failureFn
      );
    };

    service.getBooks = function(user_id, shelf_name, successFn, failureFn) {
      var handleSuccess,
          handleFailure;

      handleSuccess = function(data) {
        successFn(data.results);
      };

      grResource.getBooks(
        {user_id: user_id, shelf_name: shelf_name},
        handleSuccess,
        failureFn
      );
    };

    return service;
  }


  // Simulate HTTP failures for all getShelves calls
  var GoodreadsApiTestShelves = function GoodreadsApiTestShelves() {
    var service = GoodreadsApi.apply(this, arguments);
    service.getShelves = function(user_id, successFn, failureFn) {
      (failureFn || _.noop)({}, 'GoodreadsApiTest mock error');
    };
    return service;
  }

  // Simulate HTTP failures for every other getBooks call
  var GoodreadsApiTestBooks = function GoodreadsApiTestBooks() {
    var service = GoodreadsApi.apply(this, arguments),
        fn = service.getBooks,
        count = 0;
    service.getBooks = function(user_id, shelf_name, successFn, failureFn) {
      if (count % 2 === 1) {
        (failureFn || _.noop)({}, 'GoodreadsApiTest mock error');
      } else {
        fn.apply(this,arguments);
      }
      count++;
    };
    return service;
  }


  GoodreadsApi.$inject = ['$resource', '$log', 'baseApiUrl'];
  GoodreadsApiTestShelves.$inject = GoodreadsApi.$inject;
  GoodreadsApiTestBooks.$inject = GoodreadsApi.$inject;

  angular.module('ubsApp.services.goodreads', ['ngResource'])
    .factory('GoodreadsApi', GoodreadsApi);
})();
