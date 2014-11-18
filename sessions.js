var crypto = require('crypto');
var cookie  = require('cookie-parser');
var express = require('express');
var mongo = require('mongodb');

SessionAO = function(db, secret){  
  this.newSession = function (doc, callback) {
    db.collection('session').insert(doc, function(err, records) {
      if (err) {callback(err, null);}
      var id = records[0]._id;
      var shasum = crypto.createHash('sha256');
      shasum.update(String(id));
      shasum.update(secret);
      var digest = shasum.digest('hex');
      result = id + '|' + digest;
      callback(null,result);
    });
  }

  this.getSession = function (signedId, callback) {
    var arr = signedId.split('|');
    var id = arr[0];
    var digest = arr[1];
    var shasum = crypto.createHash('sha256');
    shasum.update(id);
    shasum.update(secret);
    var digestTest = shasum.digest('hex');
    if (digestTest === digest) {
      var ObjId = new mongo.ObjectID.createFromHexString(id);
      db.collection('session').findOne({'_id':ObjId},callback);
    }
    else {
      callback(err,null);
    }
  }
  
}

mongo.connect('mongodb://localhost:27017/sessions', function(err, db) {
  if (err) {throw err;}

  SAO = new SessionAO(db, 'S3CR3T');

  var str = '54599c26c3b2e8460cbcadea|68e72a0812eb03739a06903213f48214867587ce3040c44a80fe80ceca1e0e7d';

  SAO.newSession({},function(err0,result){
    if (err0) {throw err0;}
    SAO.getSession(result, function(err1,doc){
      if (err1) {throw err1;}
      console.log(doc);
    });
  });
  
  SAO.getSession(str, function(err1, res1) {
    if (err1) {throw err1; }
    console.log(res1._id);
  });
});


