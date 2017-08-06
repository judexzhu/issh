const Datastore = require('nedb');
const path = require('path');

let db = new Datastore({ filename: path.join(__dirname, 'ssh.db'), autoload: true });

// schema
// {
//   userName: 'jy25', 
//   displayName: 'james.y.yang', 
//   email: 'james.y.yang@newegg.com', 
//   password: '123456',
//   servers: [
//       {
//         displayName: 'my server'
//         ip: '10.16.75.24',
//         port: 22,
//         user: 'leon',
//         password: 'leon',
//         group: group1,
//         _id: leon@10.16.75.24
//       }
//     ]
// }

exports.findUserByName = (userName) => {
  return new Promise((resolve, reject) => {
    db.findOne({ userName: userName }, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    })
  })
}

exports.insertUser = (user) => {
  return new Promise((resolve, reject) => {
    db.insert(user, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })
}

exports.findUserServerById = (userName, serverId) => {
  return new Promise((resolve, reject) => {
    db.findOne({ $and: [{ userName: userName }, { servers: { $elemMatch: { _id: serverId } } }] }, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    })
  })
}

exports.updateUserServers = (userName, server) => {
  return new Promise((resolve, reject) => {
    db.update({ userName: userName }, { $addToSet: { servers: server } }, (err, numReplaced) => {
      if (err) {
        reject(err);
      } else if (numReplaced === 0) {
        reject(new Error(`user: ${userName} not exists`));
      } else {
        resolve();
      }
    })
  })
}

exports.removeUserServers = (userName, server) => {
  return new Promise((resolve, reject) => {
    db.update({ userName: userName }, { $pull: { servers: server } }, (err, numReplaced) => {
      if (err) {
        reject(err);
      } else if (numReplaced === 0) {
        reject(new Error(`user: ${userName} not exists`));
      } else {
        resolve();
      }
    })
  })
}