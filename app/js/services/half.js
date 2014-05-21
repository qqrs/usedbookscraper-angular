'use strict';

(function() {


  //TODO: caching
  //TODO: move progress handling into this module and create a HalfQueryBatch
  function HalfService($resource) {

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

    function HalfQueryBatch() {
      this.completionCallback = null;
      this.progress = {
        call: { request: 0, response: 0, percent: 0, finished: false },
        page: { request: 0, response: 0, percent: 0, finished: false }
      };
    }

    HalfQueryBatch.prototype.registerCompletionCallback = function(callback) {
      this.completionCallback = callback;
      this.checkCompletion();
    };

    HalfQueryBatch.prototype.updateProgress = function(requestType, eventType) {
      var count = this.progress[requestType];
      count[eventType] += 1;
      count.percent = 100 * (count.response / count.request);
      this.checkCompletion();
    };

    HalfQueryBatch.prototype.checkCompletion = function() {
      if (!this.completionCallback) {
        return;
      }
      this.progress.call.finished =
        (this.progress.call.request === this.progress.call.response);
      this.progress.page.finished =
        (this.progress.page.request === this.progress.page.response);
      if (this.progress.call.finished && this.progress.page.finished) {
        this.completionCallback();
      }
    };

    // TODO: refactor and add failure handler

    // HalfQueryBatch.findItems -- request first page and queue additional
    // requests for more pages and better book conditions if needed
    HalfQueryBatch.prototype.findItems = function(params, successFn, failureFn) {
      var condIndex,
          paramsCopy,
          i;

      // call success callback and run additional requests for subsequent pages
      var handleSuccessFirstPage = function(data) {
        var paramsCopy,
            i;
        successFn(data);
        if (data.total_pages !== undefined && data.total_pages > 1) {
          for (i = 2; i <= data.total_pages; i++) {
            paramsCopy = angular.copy(params);
            paramsCopy.page = i;
            halfResource.findItems(paramsCopy, handleSuccessOtherPage, handleFailureOtherPage);
            this.updateProgress('page', 'request');
          }
        }
        this.updateProgress('call', 'response');
      }.bind(this);

      var handleFailureFirstPage = function(response, msg) {
        failureFn(response, msg);
        this.updateProgress('call', 'response');
      }.bind(this);

      var handleSuccessOtherPage = function(data) {
        successFn(data);
        this.updateProgress('page', 'response');
      }.bind(this);

      var handleFailureOtherPage = function(response, msg) {
        failureFn(response, msg);
        this.updateProgress('page', 'response');
      }.bind(this);


      // run request for specified parameters
      halfResource.findItems(params, handleSuccessFirstPage, handleFailureFirstPage);
      this.updateProgress('call', 'request');

      // run requests for better conditions
      if (params.condition) {
        _.each(getBetterConditions(params.condition), function (cond) {
          var paramsCopy = angular.copy(params);
          paramsCopy.condition = cond;
          halfResource.findItems(paramsCopy, handleSuccessFirstPage, handleFailureFirstPage);
          this.updateProgress('call', 'request');
        }, this);
      }
    };

    // =================================
    // Testing
    // =================================
    // Simulate HTTP failures for one in three requests.
    /*
    (function () {
      var fn = halfResource.findItems,
          count = 0;
      halfResource.findItems = function (params, successFn, failureFn) {
        count += 1;
        if (count % 3 === 0) {
          setTimeout(function(){
            failureFn({}, 'HalfServiceTest mock error')
          }, _.random(500, 2000));
        } else {
          fn.apply(this, arguments);
        }
      };
    }());
    */

    // =================================
    // Half service exposed methods
    // =================================
    return {
      newQueryBatch: function () { return new HalfQueryBatch(); },
      bookConditions: function () { return conditions; },
      getValueForCondition: getValueForCondition,
      getListingMarginalShippingCost: getListingMarginalShippingCost
    };
  }

  HalfService.$inject = ['$resource'];

  angular.module('ubsApp.services.half', ['ngResource'])
    .factory('HalfService', HalfService);
})();
