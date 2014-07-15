'use strict';

(function() {

  function ErrorAlertsDirective() {
    return {
      replace: false,
      controller: 'ErrorAlertsCtrl',
      template: '<div class="alert alert-error" ng-show="alertsList.length">' +
            '<ul><li ng-repeat="alert in alertsList">{{alert}}</li></ul></div>'
    };
  }

  function ErrorAlertsCtrl($scope, $rootScope, $anchorScroll) {
    $scope.alertsList = [];

    var deregAddAlert = $rootScope.$on('errorAlerts.addAlert',
      function(event, msg) {
        if (!_.contains($scope.alertsList, msg)) {
          $scope.alertsList.push(msg);
        }
        $anchorScroll();
      }
    );
    var deregClearAlerts = $rootScope.$on('errorAlerts.clearAlerts', function() {
      $scope.alertsList = [];
    });
    var deregRouteChange = $rootScope.$on('$routeChangeStart', function() {
      $scope.alertsList = [];
    });

    $scope.$on('$destroy', deregAddAlert);
    $scope.$on('$destroy', deregClearAlerts);
    $scope.$on('$destroy', deregRouteChange);
  }

  ErrorAlertsCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$anchorScroll'
  ];

  function ErrorAlertsService($rootScope, $window) {
    var addAlert = function(msg) {
      $rootScope.$broadcast('errorAlerts.addAlert', msg);
    };

    addAlert.clearAlerts = function() {
      $rootScope.$broadcast('errorAlerts.clearAlerts');
    };

    // Google analytics
    addAlert.ga = function(action, label, value) {
      $window.ga('send', 'event', 'error', action, label, value);
    };

    return addAlert;
  }

  ErrorAlertsService.$inject = ['$rootScope', '$window'];


  angular.module('ubsApp.errorAlert', [])
    .directive('ubsErrorAlerts', ErrorAlertsDirective)
    .controller('ErrorAlertsCtrl', ErrorAlertsCtrl)
    .factory('errorAlert', ErrorAlertsService);

})();
