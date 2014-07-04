'use strict';

(function() {

  // remove padding from main content div on home.html
  function MainContentHideHomePaddingDirective($route) {
    return {
      controller: ['$rootScope', '$element', function($rootScope, $element) {
        $rootScope.$on('$routeChangeSuccess', function(event, currentRoute) {
          if (currentRoute.loadedTemplateUrl === "partials/home.html") {
            $element.addClass('no-pad');
          } else {
            $element.removeClass('no-pad');
          }
        });
      }]
    };
  }

  angular.module('ubsApp.hidePadding', [])
    .directive('ubsMainContentHideHomePadding', MainContentHideHomePaddingDirective);

})();
