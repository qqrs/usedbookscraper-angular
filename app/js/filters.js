'use strict';

/* Filters */

angular.module('ubsApp.filters', []).
  filter('bookConditionHuman', function() {
    return function(cond) {
      return String(cond).replace(/[A-Z]/g, ' $&').substr(1);
    }
  });
