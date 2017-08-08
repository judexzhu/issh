app.controller('MainCtrl', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {

  $scope.sidebarInfo = {};

  $scope.selectedConnectServer;
  $scope.passwordPromptValue;
  $scope.passPromptSubmitted;
  $scope.activeTab;
  $scope.multiExecMode = false;

  $scope.connectedServer = [];
  $scope.webSockets = [];

  $scope.resize = function () {
    setTimeout(() => {
      var colsAndRows = $scope.getColsAndRows();
      $scope.webSockets.forEach(x => {
        x.send('^_^' + colsAndRows.rows + '|' + colsAndRows.cols);
        x.server.term.resize(colsAndRows.cols, colsAndRows.rows);
      });
    }, 301);
  }

  $(document).ready(function () {
    $(window).resize(function () {
      $scope.resize();
    });
  })

  $scope.init = function (server) {
    if ($rootScope.isLogin) {
      $rootScope.UserInfo.servers = $rootScope.UserInfo.servers || [];
      var groups = $rootScope.UserInfo.servers.map(x => x.group);
      if (groups.length === 0) {
        groups.push('Default');
      } else {
        groups = _.uniq(groups);
      }
      $scope.groups = groups;
    }
    $scope.isEditServer = !!server;
    if (server) {
      $scope.connectToServerInfo = _.cloneDeep(server);
    } else {
      $scope.connectToServerInfo = {
        displayName: '',
        ip: '',
        port: null,
        user: '',
        password: '',
        saveToCloud: true,
        rememberPass: false,
        group: $scope.groups ? $scope.groups[0] : ''
      };
    }
    $scope.connectToServerSubmitted = false;
  }

  $scope.init();

  $scope.buildSidebar = function () {
    $http.get('/api/user')
      .then(function (res) {
        $rootScope.isLogin = true;
        $rootScope.UserInfo = res.data;
        var servers = $rootScope.UserInfo.servers || [];
        $scope.sidebarInfo = _.groupBy(servers, 'group');
        if (_.isEmpty($scope.sidebarInfo)) {
          $scope.sidebarInfo = {
            'Default': []
          }
        }
      }, function (errRes) {
        $rootScope.isLogin = false;
        $rootScope.UserInfo = null;
        $rootScope.$apply();
      });
  }
  $scope.buildSidebar();

  $scope.toggleSidebar = function () {
    $('body').toggleClass('mini-sidebar');
    $scope.resize();
  }

  $scope.$on('UserCtrlChange', function (event, msg) {
    $rootScope.isLogin = !!msg.isLogin;
    if ($rootScope.isLogin) {
      $scope.buildSidebar();
    }
  });

  $scope.showConnectToServerModal = function () {
    $scope.init();
    $scope.showConnectServerModal();
  }

  $scope.connectToServer = function () {
    $scope.connectToServerSubmitted = true;
    if ($scope.connectServerForm.$invalid) return;
    var data = _.cloneDeep($scope.connectToServerInfo);
    if (data.group === '__new_group__') {
      data.group = data.newGroup;
      delete data.newGroup;
    }
    data.port = data.port || 22;
    data._id = data._id || (data.user + '@' + data.ip + (data.port === 22 ? '' : ':' + data.port));
    if (data.saveToCloud) {
      var pass = data.password;
      if (!data.rememberPass) {
        data.password = '';
      }
      $http.put('/api/user/servers', data)
        .then(function (resData) {
          $scope.buildSidebar();
          if (!$scope.isEditServer) {
            data.password = pass;
            $scope.addConnectedServer(data);
          }
          $scope.hideConnectServerModal();
        }, function (errData) {
          $scope.hideConnectServerModal();
        });
    } else {      
      $scope.addConnectedServer(data);
      $scope.hideConnectServerModal();
    }
  }

  $scope.showConnectServerModal = function () {
    $("#connect_server_modal").modal({ backdrop: 'static' }).modal('show');
  }

  $scope.hideConnectServerModal = function () {
    $("#connect_server_modal").modal('hide');
  }

  $scope.toggleServerList = function (id) {
    $('#' + id).slideToggle();
    $('#parent_' + id).toggleClass('expaned');
  }

  $scope.connectServer = function (server) {
    $scope.selectedConnectServer = server;
    if (!server.password) {
      $scope.showPasswordPrompt();
    } else {
      $scope.addConnectedServer(server);
    }
  }

  $scope.editServer = function (server) {
    $scope.init(server);
    $scope.showConnectServerModal();
  }

  $scope.deleteServer = function () {
    if (!$scope.connectToServerInfo._id) return;
    $http.delete('/api/user/servers/' + $scope.connectToServerInfo._id)
      .then(function (resData) {
        toastr.success("Deleted");
        $scope.buildSidebar();
        $scope.hideConnectServerModal();
      }, function (errRes) {
        toastr.error("Delete server failed. Please try again.");
        console.log(errRes.data);
      });
  }

  $scope.showPasswordPrompt = function () {
    $scope.passPromptSubmitted = false;
    $scope.passwordPromptValue = '';
    $("#server_password_modal").modal({ backdrop: 'static' }).modal('show');
    $("form[name='serverPasswordInputForm'] input[name=password]").focus();
  }

  $scope.hidePasswordPrompt = function () {
    $("#server_password_modal").modal('hide');
  }

  $scope.submitPasswodPrompt = function () {
    $scope.passPromptSubmitted = true;
    if ($scope.serverPasswordInputForm.$invalid) return;
    $scope.addConnectedServer($scope.selectedConnectServer, $scope.passwordPromptValue);
    $scope.hidePasswordPrompt();
  }

  $scope.getColsAndRows = function () {
    var cols = 80;
    var rows = 20;
    var contentElement = document.getElementById('content_panel');
    if (contentElement) {
      if ($scope.multiExecMode) {
        cols = Math.floor((contentElement.offsetWidth - 37) / 2 / 9);
        if ($scope.connectedServer.length > 1 && $scope.connectedServer.length < 5) {
          rows = Math.floor((contentElement.offsetHeight - 85) / 2 / 21);
        } else {
          rows = Math.floor((contentElement.offsetHeight - 85) / 3 / 21);
        }
      } else {
        cols = Math.floor((contentElement.offsetWidth - 37) / 9);
        rows = Math.floor((contentElement.offsetHeight - 60) / 21);
      }
    }
    if (rows < 15) rows = 15;
    var data = {
      cols: cols,
      rows: rows
    };
    return data;
  }

  $scope.addConnectedServer = function (server, password) {
    var notClosed = _.countBy($scope.connectedServer, function (x) {
      return !!x._closed;
    });
    if (notClosed > 10) {
      toastr.error('Up to 10 servers can be connected');
      return;
    }
    var server = _.cloneDeep(server);
    server._id = server._id + '_' + new Date().valueOf();
    $scope.connectedServer.push(server);
    $scope.activeTab = server._id;

    var colsAndRows = $scope.getColsAndRows();

    var wsUrl = 'ws://' + location.host + '?rows=' + colsAndRows.rows + '&cols=' + colsAndRows.cols;
    wsUrl += '&user=' + server.user;
    wsUrl += '&password=' + (server.password || password);
    wsUrl += '&host=' + server.ip;
    wsUrl += '&port=' + server.port;
    wsUrl += '&t=' + new Date().valueOf();

    let ws = new WebSocket(wsUrl);
    ws._id = new Date().valueOf() + '' + server._id;
    server._wsid = ws._id;
    ws.server = server;
    ws.onopen = function () {
      var selfWs = this;
      var term = new Terminal({
        cols: colsAndRows.cols,
        rows: colsAndRows.rows,
        useStyle: true,
        convertEol: true,
        screenKeys: true,
        cursorBlink: false,
        visualBell: true,
        colors: Terminal.xtermColors
      });
      server.term = term;

      term.on('key', function (key, ev) {
        if (!$scope.multiExecMode) return;
        var self = this;
        $scope.webSockets.forEach(function (x) {
          if (!x.server.disableMultiExec && x.server._wsid !== selfWs._id) {
            x.send(key);
          }
        });
      });

      term.on('paste', function (data, ev) {
        term.write(data);
      });

      term.attach(ws);
      setTimeout(() => {
        var element = document.getElementById('term_' + server._id);
        if (element) {
          term.open(element, { focus: true });
        }
      }, 500);
    };
    ws.onclose = function (e) {
      var self = this;
      _.remove($scope.webSockets, function (x) {
        return x._id === self._id;
      });
      $scope.delConnectedServer(self.server._id);
      console.log("Disconnected. Current sockets nums: ", $scope.webSockets.length);
    };
    $scope.webSockets.push(ws);
  }

  $scope.delConnectedServer = function (id) {
    $scope.connectedServer.forEach(function (x) {
      if (x._id === id) {
        x._closed = true;
      }
    });
    var notClosed = _.filter($scope.connectedServer, function (x) {
      return !x._closed;
    });
    if (notClosed.length === 0) {
      $scope.connectedServer = [];
      $scope.multiExecMode = false;
    } else if ($scope.activeTab === id) {
      $scope.activeTab = notClosed[0] ? notClosed[0]._id : '';
    }
    $scope.$apply();
  }

  $scope.setActiveTab = function (item) {
    $scope.activeTab = item._id;
  }

  $scope.closeTab = function (evt, item) {
    evt.stopPropagation();
    var ws = _.find($scope.webSockets, function (x) {
      return x._id === item._wsid;
    });
    ws.close();
  }

  $scope.multiExec = function () {
    if ($scope.connectedServer.length < 2) return;
    $scope.multiExecMode = !$scope.multiExecMode;
    $scope.connectedServer.forEach(function (x) {
      x.disableMultiExec = false;
    });
    $scope.resize();
  }

  $scope.signOut = function () {
    $http.get('/api/user/logout')
      .then(function (data) {
        location.href = '/';
      }, function (errData) {
        toastr.error('Sign out failed. Please try again.')
      });
  }
}]);