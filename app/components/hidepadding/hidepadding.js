'use strict';

(function() {

  var addTopMargin = {
    'partials/home.html': true,
    'partials/about.html': true,
    'bookscrapersession/partials/user.html': true,
    'bookscrapersession/partials/shelves.html': true,
    'bookscrapersession/partials/listings.html': true
  };

  // remove padding from main content div on home.html
  function MainContentHideHomePaddingDirective($route) {
    return {
      controller: ['$rootScope', '$element', '$window', function($rootScope, $element, $window) {
        $rootScope.$on('$routeChangeSuccess', function(event, currentRoute) {
          if (currentRoute.loadedTemplateUrl === "partials/home.html") {
            $element.addClass('no-pad');
          } else {
            $element.removeClass('no-pad');
          }

          if (true || addTopMargin[currentRoute.loadedTemplateUrl]) {
            console.log($window.innerHeight);
            $element.addClass('topmargin');
            /*
            if ($window.innerHeight > 1300) {
              $element.addClass('topmargin-small');
              //$element.css('margin-top', '200px');
            } else if ($window.innerHeight > 1000) {
              $element.addClass('topmargin-large');
              //$element.css('margin-top', '100px');
            }
            */
          } else {
            $element.removeClass('topmargin');
          }
        });
      }]
    };
  }

  angular.module('ubsApp.hidePadding', [])
    .directive('ubsMainContentHideHomePadding', MainContentHideHomePaddingDirective);

})();
