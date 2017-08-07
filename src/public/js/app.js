var app = angular.module('iSSH', []);

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push(function ($rootScope) {
    return {
      request: function (config) {
        globalLoading.add();
        return config;
      },
      response: function (response) {
        globalLoading.sub();
        return response;
      },
      responseError: function (rejection) {
        globalLoading.sub();
        return Promise.reject(rejection);
      }
    }
  })
}]);

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
      var token = getQueryString('t');
      if (token) {
        $.ajax({
          url: '/api/user/ssologin',
          method: 'post',
          data: JSON.stringify({ token: token }),
          contentType: 'application/json',
          async: false,
          success: function (data) {
            if (data) {
              $rootScope.isLogin = true;
              $rootScope.UserInfo = data;
              window.history.pushState(null, 'i-SSH', '/');
            }
          },
          error: function (errRes) {
            window.history.pushState(null, 'i-SSH', '/');
          }
        })
      }
    }
  });
}]);