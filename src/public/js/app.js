var app = angular.module('iSSH', []);

app.run(['$rootScope', '$http', function ($rootScope, $http) {
  $rootScope.isLogin = false;
  $.ajax({
    url: '/api/user',
    async: false,
    success: function (data) {
      if (data) {
        $rootScope.isLogin = true;
        $rootScope.UserInfo = data;
      }
    },
    error: function (errData) {

    }
  });
}]);