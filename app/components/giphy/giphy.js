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
        giphyHeights,
        giphyUrl,
        randIndex;

    giphyIds = [
      'ft9uGbxZvIGM8', 'OQxmEv6imvBdu', 'PwUEE2fhR00xi', 'ZCmDhIFeF1s2c',
      'r8wQTzXr7xia4', 'SEN2Ho9K96BHy', 'Mj1QjRKM14ifC', 'g0gepFYqKiYqQ',
      'GA4FHsS2tE8ta', 'CX1dZhBXfSQU0', 'imzbK7mXHqV6E', 'SCnmKSVG4zdQc',
      '11gYYbySTvUC2s'];
    giphyHeights = [
      244, 373, 281, 311,
      295, 253, 281, 375,
      328, 389, 375, 256,
      288];

    randIndex = _.random(0, giphyIds.length - 1);
    giphyUrl = 'http://giphy.com/embed/' + giphyIds[randIndex];
    $scope.safeGiphyUrl = $sce.trustAsResourceUrl(giphyUrl);
    $scope.giphyHeight = giphyHeights[randIndex];
  }

  GiphyEmbedCtrl.$inject = [
    '$scope',
    '$sce'
  ];

  angular.module('ubsApp.giphyEmbed', [])
    .directive('giphyEmbed', GiphyEmbedDirective)
    .controller('GiphyEmbedCtrl', GiphyEmbedCtrl);

})();
