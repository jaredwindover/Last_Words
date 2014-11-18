var express = require('express');
var cookie = require('cookie-parser');

var app = express();

var port = 8080;


app.use(function(req, res, next){
  console.log("Request URL: " +req.originalUrl);
  next();
});

app.use(function(req, res, next){
  console.log("Request Type: " + req.method);
  next();
});

app.use(cookie());

app.use(function(req, res, next){
  console.log("Cookies");
  console.log(req.cookies);
  next();
});

app.get('/*',function(req, res, next){
  console.log("Request: " + req);
  res.cookie("Cookie!", 42, {maxAge: 30000});
  next();
});

app.get('/*', express.static(__dirname + '/web'));

app.get('/addScore', function(req,res,next){
  console.log("Name:" + req.params.Name);
  console.log("Score:" + req.params.Score);
  res.sendFile(__dirname + '/web/comment.html');
});


app.get('/*',function(req, res, next){
  console.log("C");
  res.end("Hello World");
  next();
});

app.listen(port);

console.log('App listening on port: ' + port); 
