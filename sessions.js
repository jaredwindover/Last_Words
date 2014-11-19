var crypto = require('crypto');
var cookie = require('cookie-parser');
var mongo = require('mongodb');

SessionAO = function(db, collName, secret){ 
  this.validateId = function (signedId, callback) {
    var arr = signedId.split('|');
    var id = arr[0];
    var digest = arr[1];
    var shasum = crypto.createHash('sha256');
    shasum.update(id);
    shasum.update(secret);
    var digestTest = shasum.digest('hex');
    if (digestTest === digest) {
      callback(null,id);
      return;
    }
    else {
      callback(err,null);
      return;
    }
  }
  
  this.newSession = function (doc, callback) {
    db.collection(collName).insert(doc, function(err, records) {
      if (err) {
	callback(err, null);
	return;
      }
      else {
	var id = records[0]._id;
	var shasum = crypto.createHash('sha256');
	shasum.update(String(id));
	shasum.update(secret);
	var digest = shasum.digest('hex');
	result = id + '|' + digest;
	callback(null,result);
	return;
      }
    });
  }
  
  this.getSession = function (signedId, callback) {
    this.validateId(signedId,function(err,id){ 
      if (err) {
	callback (err, null);
	return;
      }
      else {
	var ObjId = new mongo.ObjectID.createFromHexString(id);
	db.collection(collName).findOne({'_id':ObjId},callback);
      }
    });
  }

  this.saveSession = function (signedId, doc, callback) {
    this.validateId(signedId, function(err0,id){
      if (err0) {
	callback(err,null);
	return;
      }
      else {
	db.collection(collName).update({'_id':doc._id},doc,function(err1,numUpdated) {
	  if (err1) {
	    callback(err1, null);
	    return;
	  }
	  else if (numUpdated === 0){
	    callback(Error("No such document"),null);
	  }
	  else {
	    callback(null,1);
	    return;
	  }
	});
      }
    });
  }
}

mongo.connect('mongodb://localhost:27017/sessions', function(err, db) {
  if (err) {throw err;}

  SAO = new SessionAO(db,'sessions', 'S3CR3T');

  SAO.newSession({},function(err0,result){
    if (err0) {throw err0;}
    SAO.getSession(result, function(err1,doc){
      if (err1) {throw err1;}
      console.log(doc);
      doc.name = 'Jared';
      SAO.saveSession(result,doc,function(err2) {
	if (err2) {throw err2;}
	SAO.getSession(result, function(err3, doc){
	  if (err3) {throw err3;}
	  console.log(doc);
	})
      });
    });
  });
});
