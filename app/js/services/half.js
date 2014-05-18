'use strict';

(function() {


  //TODO: caching
  //TODO: get all listings with condition >= cond, maxprice <= xx.xx, all pages
  function HalfService($rootScope, $resource) {

   // =================================
   // Utility functions and data
   // =================================
    var conditions = ['Acceptable', 'Good', 'VeryGood', 'LikeNew', 'BrandNew'];

    var getValueForCondition = function (cond) {
      var val = conditions.indexOf(cond);
      return (val >= 0 ? val : -Infinity);
    };

    // get shipping cost for adding this item to an order
    var getListingMarginalShippingCost = function (listing) {
      if (listing.shipping_cost === 3.99) {         // hardback
        return 2.49;
      } else if (listing.shipping_cost === 3.49) {  // paperback
        return 1.89;
      } else if (listing.shipping_cost === 2.99) {  // audio/video media
        return 1.89;
      } else {                                      // should not happen
        return listing.shipping_cost;
      }
    };

   // =================================
   // Half API calls and helpers
   // =================================
    var halfResource = $resource(
      "http://cryptic-ridge-1093.herokuapp.com/api/half/find_items",
      {
        callback: 'JSON_CALLBACK',
      },
      {
        findItems: { method: 'JSONP' }
    });

    // TODO: refactor and add failure handler

    // half findItems call -- request first page and queue additional
    // requests for more pages and better book conditions if needed
    function half_findItemsCall(params, successCallback) {
      var condIndex,
          paramsCopy,
          i;
      // run request for specified parameters
      halfResource.findItems(
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
        condIndex = conditions.indexOf(params.condition);
        if (condIndex !== -1 && condIndex + 1 < conditions.length) {
          paramsCopy = angular.copy(params);
          paramsCopy.condition = conditions[condIndex + 1];
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
      halfResource.findItems(
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

   // =================================
   // Half service exposed methods
   // =================================
    return {
      findItems: half_findItemsCall,
      bookConditions: function () { return conditions; },
      getValueForCondition: getValueForCondition,
      getListingMarginalShippingCost: getListingMarginalShippingCost
    };

  }

  HalfService.$inject = [
    '$rootScope',
    '$resource'
  ];


  /*
  // Simulate HTTP failures for one in three requests.
  var XisbnApiTest = function XisbnServiceTest() {
    var service = XisbnApi.apply(this, arguments),
        fn = service.getEditions;
    service.getEditions = function(isbn, successFn, failureFn) {
      _.sample([fn, fn, function() {
        (failureFn || _.noop)({}, 'XisbnApiTest mock error');
      }]).apply(this, arguments);
    };
    return service;
  }

  XisbnApi.$inject = ['$resource', '$cacheFactory', '$log'];
  XisbnApiTest.$inject = XisbnApi.$inject;
  */

  angular.module('ubsApp.services.half', ['ngResource'])
    .factory('HalfService', HalfService);
})();
