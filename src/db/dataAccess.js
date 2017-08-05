const Datastore = require('nedb');
const path = require('path');

let db = new Datastore({filename: path.join(__dirname, 'ssh.db'), autoload: true});

// schema
// {
//   userName: 'jy25', 
//   displayName: 'james.y.yang', 
//   email: 'james.y.yang@newegg.com', 
//   password: '123456',
//   servers: {
//     group1: [
//       {
//         displayName: 'my server'
//         ip: '10.16.75.24',
//         port: 22,
//         user: 'leon',
//         password: 'leon'
//       }
//     ]
//   }
// }

exports.findUserByName = (userName) => {
  return new Promise((resolve, reject) => {
    db.findOne({userName: userName}, (err, doc) => {
      if(err){
        reject(err);
      }else{
        resolve(doc);
      }
    })
  })
}

exports.insertUser = (user) => {
  return new Promise((resolve, reject) => {
    db.insert(user, (err, doc) => {
      if(err){
        reject(err);
      }else{
        resolve();
      }
    })
  })
}

exports.updateUserServers = (user) => {
  return new Promise((resolve, reject) => {
    db.update({userName: user.userName}, {$set: {servers: user.servers}}, (err, numReplaced) => {
      if(err){
        reject(err);
      }else if(numReplaced === 0){
        reject(new Error(`user: ${user.userName} not exists`));
      }else{
        resolve();
      }
    })
  })
}