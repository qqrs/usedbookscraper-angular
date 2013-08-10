'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope) {

  }

  function MyCtrl2() {

  }

  MyCtrl1.$inject = [
    '$scope'
  ];

  MyCtrl2.$inject = [
  ];

  angular.module('myApp.controllers', [])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
