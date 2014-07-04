'use strict';

(function() {

  function GiphyEmbedDirective() {
    return {
      templateUrl: 'components/giphy/giphy.html',
      replace: true,
      controller: 'GiphyEmbedCtrl'
    };
  }

  function GiphyEmbedCtrl($scope, $sce) {
    var giphyIds,
        giphyUrl;

    giphyIds = [
      'ft9uGbxZvIGM8', 'OQxmEv6imvBdu', 'PwUEE2fhR00xi', 'ZCmDhIFeF1s2c',
      'r8wQTzXr7xia4', 'SEN2Ho9K96BHy', 'Mj1QjRKM14ifC', 'g0gepFYqKiYqQ',
      'GA4FHsS2tE8ta', 'CX1dZhBXfSQU0', 'imzbK7mXHqV6E', 'SCnmKSVG4zdQc',
      '11gYYbySTvUC2s'];

    // TODO: use giphy api to get width and height
    giphyUrl = 'http://giphy.com/embed/' + _.sample(giphyIds);
    $scope.safeGiphyUrl = $sce.trustAsResourceUrl(giphyUrl);
  }

  GiphyEmbedCtrl.$inject = [
    '$scope',
    '$sce'
  ];

  angular.module('ubsApp.giphyEmbed', [])
    .directive('giphyEmbed', GiphyEmbedDirective)
    .controller('GiphyEmbedCtrl', GiphyEmbedCtrl);

})();
