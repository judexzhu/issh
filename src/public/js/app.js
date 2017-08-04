angular.module("iSSH", [])
  .controller("MainCtrl", function ($scope) {

    $scope.toggleSidebar = function () {
      $('body').toggleClass('mini-sidebar');
    }

  });