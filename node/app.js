var Firebase = require("firebase");
var http = require('http');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var fs = require('fs');

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res) {
  res.render('snappycam');
});

app.post('/savephoto', function(req, res) {
  res.send('something happened');
  var b64string = req.body.photo;
  var buf = new Buffer(b64string, 'base64');
  fs.writeFile("public/photos/save.png", buf, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("Oh, hello there!");
      }
  }); 

})

var server = app.listen(8001, function() {
    console.log('Listening on port %d', server.address().port);
});
