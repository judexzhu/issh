app.controller('UserCtrl', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {

  $scope.localUrl = location.protocol + "//" + location.host;

  $scope.submitted = false;

  $scope.init = function () {
    $scope.signinInfo = {
      username: '',
      password: ''
    }

    $scope.registerInfo = {
      userName: '',
      password: '',
      displayName: '',
      email: ''
    }

    $scope.submitted = false;
  }

  $scope.init();

  $scope.showSignIn = function () {
    $('.signin-panel').slideDown();
    $('.register-panel').slideUp();
    $scope.init();
  }

  $scope.signin = function () {
    $scope.submitted = true;
    if ($scope.signinForm.$invalid) return;
    $http.post('/api/user/login', $scope.signinInfo)
      .then(function (res) {
        toastr.success("Sign in suceed.");
        $rootScope.UserInfo = res.data;
        $scope.$emit("UserCtrlChange", { isLogin: true });
      }, function (errRes) {
        toastr.error('Username or Password is not correct');
      });
  }

  $scope.showRegister = function () {
    $('.signin-panel').slideUp();
    $('.register-panel').slideDown();
    $scope.init();
  }

  $scope.register = function () {
    $scope.submitted = true;
    if ($scope.registerForm.$invalid) return;
    $http.post('/api/user/register', $scope.registerInfo)
      .then(function (res) {
        toastr.success('Register succeed');
        $scope.showSignIn();
      }, function (errRes) {
        toastr.error('Register failed - ' + errRes.data.error.message);
      });
  }

}]);