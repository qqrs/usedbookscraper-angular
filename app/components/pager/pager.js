'use strict';

(function() {

  function PagerDirective() {
    return {
      templateUrl: 'partials/pager.html',
      replace: false,
      scope: {
        numPages: '=pagerNumPages',
        perPage: '=pagerPerPage',
        currentPage: '=pagerCurrentPage'
      },
      controller: 'PagerCtrl'
    };
  }

  function PagerCtrl($scope, $anchorScroll) {
    $scope.pagePrev = function() {
      $scope.currentPage = Math.max($scope.currentPage - 1, 0);
      $anchorScroll();
    };
    $scope.pageNext = function() {
      $scope.currentPage = Math.min($scope.currentPage + 1, $scope.numPages - 1);
      $anchorScroll();
    };
    $scope.setPage = function(pageNum) {
      $scope.currentPage = pageNum;
      $anchorScroll();
    };
    $scope.pageNumbers = _.range(0, $scope.numPages);
  }

  PagerCtrl.$inject = [
    '$scope',
    '$anchorScroll'
  ];


  angular.module('ubsApp.pager', [])
    .directive('ubsPager', PagerDirective)
    .controller('PagerCtrl', PagerCtrl);

})();
