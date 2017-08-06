app.controller('MainCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

  console.log($rootScope.UserInfo)
  $scope.groups = ($rootScope.UserInfo.servers || []).map(x => x.group);
  if ($scope.groups.length === 0) {
    $scope.groups.push('Default');
  }

  $scope.init = function () {
    $scope.connectToServerInfo = {
      displayName: '',
      host: '',
      port: null,
      user: '',
      password: '',
      saveToCloud: true,
      rememberPass: false,
      group: $scope.groups[0]
    };
    $scope.connectToServerSubmitted = false;
  }

  $scope.init();

  $scope.toggleSidebar = function () {
    $('body').toggleClass('mini-sidebar');
  }

  $scope.$on('UserCtrlChange', function (event, msg) {
    $rootScope.isLogin = !!msg.isLogin;
  });

  $scope.showConnectToServerModal = function () {
    $scope.init();
    $("#connect_server_modal").modal({ backdrop: 'static' }).modal('show');
  }

  $scope.connectToServer = function () {
    $scope.connectToServerSubmitted = true;
    if ($scope.connectServerForm.$invalid) return;
    console.log($scope.connectToServerInfo)
  }

}]);