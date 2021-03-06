const request = require('request');

const ssoAddress = 'http://apis.newegg.org/framework/v1/keystone/sso-auth-data';
const access_token = 'giOjDe8n4nEm7qOw4SrRmgMHUgotaAjb7c7OnFQ0';

exports.getSSOUser = (ssoToken) => {
  return new Promise((resolve, reject) => {
    var option = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      url: ssoAddress,
      body: JSON.stringify({ Token: ssoToken })
    };

    request(option, (error, response, resBody) => {
      if (error || response.statusCode >= 400) {
        error = error || JSON.parse(resBody);
        reject(error);
      } else {
        var resUser = JSON.parse(resBody).UserInfo;
        var user = {
          userName: resUser.UserID,
          displayName: resUser.FullName,
          email: resUser.EmailAddress
        };
        resolve(user);
      }
    })
  })
}