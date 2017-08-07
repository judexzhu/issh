toastr.options = {
  "closeButton": true,
  "debug": false,
  "progressBar": true,
  "preventDuplicates": true,
  "positionClass": "toast-top-right",
  "onclick": null,
  "showDuration": "400",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

$(document).ready(function () {
  $('input').attr('autocomplete', 'off');
});

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

var globalLoading = {

  count: 0,

  add: function () {
    if (this.count === 0) {
      this.show();
    }
    this.count++;
  },

  sub: function () {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      this.hide();
    }
  },

  show: function () {
    $('#global-loading').show();
  },

  hide: function () {
    setTimeout(function () {
      $('#global-loading').hide();
    }, 200);
  }

}