var app = angular.module('iSSH', []);

app.controller('MainCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

  $scope.toggleSidebar = function () {
    $('body').toggleClass('mini-sidebar');
  }

  $scope.$on('UserCtrlChange', function (event, msg) {
    $rootScope.isLogin = !!msg.isLogin;
  });

}]);

app.run(['$rootScope', '$http', function ($rootScope, $http) {
  $http.get('/api/user')
    .then(function (res) {
      if (res.data) {
        $rootScope.isLogin = true;
        $rootScope.UserInfo = res.data;
      }
    }, function (errRes) {
      $rootScope.isLogin = false;
    });
}]);