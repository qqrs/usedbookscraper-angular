'use strict';

(function() {

  function ProgressTrackerDirective() {
    return {
      replace: false,
      controller: 'ProgressTrackerCtrl',
      template: '<div class="wizard"><a ng-repeat="step in progressSteps" ' +
        'ng-href="{{step.href}}" ng-class="step.sclass">{{step.name}}</a></div>'
    };
  }

  function ProgressTrackerCtrl($scope, $rootScope, $location, $window) {
    var splitPath,
        _steps;

    _steps = [
      'start', 'shelves', 'books', 'editions', 'listings', 'sellers'
    ];

    $rootScope.$on('$routeChangeSuccess', function(event, current) {
      var splitPath,
          currentStep,
          isBeyondCurrent;

      // Google analytics
      $window.ga('send', 'pageview', { page: $location.path() });

      splitPath = $location.path().split('/');
      currentStep = ((splitPath.length >= 2) ? splitPath[1] : '');
      isBeyondCurrent = (currentStep === '' || !_.contains(_steps, currentStep));

      $scope.progressSteps = _.map(_steps, function(step) {
        var href = '',
            sclass;

        if (isBeyondCurrent && step === _steps[0]) {
          sclass = '';
          href = '#' + step;
        } else if (step === currentStep) {
          sclass = 'current';
          isBeyondCurrent = true;
        } else if (isBeyondCurrent) {
          sclass = 'wizard-disabled';
        } else {
          sclass = ''
          href = '#' + step;
        }

        return {name: step, sclass: sclass, href: href};
      });
    });
  }

  ProgressTrackerCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    '$window'
  ];


  angular.module('ubsApp.progressTracker', [])
    .directive('ubsProgressTracker', ProgressTrackerDirective)
    .controller('ProgressTrackerCtrl', ProgressTrackerCtrl);

})();
