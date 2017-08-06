var app = angular.module('iSSH', []);
app.config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}]);

app.run(['$rootScope', '$http', '$location', function ($rootScope, $http, $location) {
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
      $rootScope.token = $location.search().t;      
      if ($rootScope.token) {
        $.ajax({
          url: '/api/user/ssologin',
          method: 'post',
          data: JSON.stringify({ token: $rootScope.token }),
          contentType: 'application/json',
          async: false,
          success: function (data) {
            if (data) {
              $rootScope.isLogin = true;
              $rootScope.UserInfo = data;
              $location.url($location.path());
            }
          },
          error: function (errRes) {

          }
        })
      }
    }
  });
}]);