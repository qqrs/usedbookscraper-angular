'use strict';

(function() {


  //TODO: caching
  //TODO: move progress handling into this module and create a HalfQueryBatch
  function HalfService($rootScope, $resource) {

   // =================================
   // Utility functions and data
   // =================================
    var conditions = ['Acceptable', 'Good', 'VeryGood', 'LikeNew', 'BrandNew'];

    var getValueForCondition = function (cond) {
      var val = conditions.indexOf(cond);
      return (val >= 0 ? val : -Infinity);
    };

    // return array of all conditions better than cond
    var getBetterConditions = function (cond) {
      var index = _.indexOf(conditions, cond);
      if (index < 0) {
        return [cond];
      }
      return _.rest(conditions, index + 1);
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
    var half_findItems = function(params, successFn, failureFn) {
      var condIndex,
          paramsCopy,
          i;

      // call success callback and run additional requests for subsequent pages
      var handleSuccessFirstPage = function(data) {
        var paramsCopy,
            i;
        successFn(data);
        $rootScope.$broadcast('halfService.findItems.call.response');
        if (data.total_pages !== undefined && data.total_pages > 1) {
          for (i = 2; i <= data.total_pages; i++) {
            paramsCopy = angular.copy(params);
            paramsCopy.page = i;
            halfResource.findItems(paramsCopy, handleSuccessOtherPage, handleFailureOtherPage);
            $rootScope.$broadcast('halfService.findItems.page.request');
          }
        }
      };

      var handleFailureFirstPage = function(response) {
        failureFn(response);
        $rootScope.$broadcast('halfService.findItems.call.response');
      };

      var handleSuccessOtherPage = function(data) {
        successFn(data);
        $rootScope.$broadcast('halfService.findItems.page.response');
      };

      var handleFailureOtherPage = function(response) {
        failureFn(response);
        $rootScope.$broadcast('halfService.findItems.page.response');
      };


      // run request for specified parameters
      halfResource.findItems(params, handleSuccessFirstPage, handleFailureFirstPage);
      $rootScope.$broadcast('halfService.findItems.call.request');

      // run requests for better conditions
      if (params.condition) {
        _.each(getBetterConditions(params.condition), function (cond) {
          var paramsCopy = angular.copy(params);
          paramsCopy.condition = cond;
          halfResource.findItems(paramsCopy, handleSuccessFirstPage, handleFailureFirstPage);
          $rootScope.$broadcast('halfService.findItems.call.request');
        });
      }
    };

   // =================================
   // Half service exposed methods
   // =================================
    return {
      findItems: half_findItems,
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
