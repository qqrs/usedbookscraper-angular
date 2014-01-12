'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('bookConditionHuman', function(version) {
    return function(cond) {
      return String(cond).replace(/[A-Z]/g, ' $&').substr(1);
    }
  });
