var Firebase = require("firebase");
var http = require('http');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var fs = require('fs');
var mkdirp = require('mkdirp');

var server = app.listen(8001, function() {
    console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io')(server);
var folderNum = 0;
var series = Math.floor((Math.random() * 10000) + 1);

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get('/', function(req, res) {
  res.render('snappycam');
});

app.get('/shutter', function(req, res) {
  res.render('shutter');
  folderNum ++;
});


io.on('connection', function (socket) {
  socket.on('trigger', function (data) {
    console.log('trigger detected, emitting triggerhappy')
    console.log('time to shoot: ' + data.triggered);
    io.emit('triggerhappy', {t: data.triggered});
  });

  socket.on('pingtest', function (data) {
    console.log('ping attempt')
    io.emit('pingbot', {hello: 'world'});
  });
});

app.post('/savephoto', function(req, res) {
  res.send('photo received');
  var b64string = req.body.photo;
  var cn = req.body.camnum;
  console.log(req.body.camnum);
  var buf = new Buffer(b64string, 'base64');
  var folderAppend = folderNum + '-' + series;
  mkdirp('public/photos/take' + folderAppend, function(err) { 
    console.log(err);
    fs.writeFile("public/photos/take" + folderAppend + "/save-"+cn+".png", buf, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Oh, hello there!");
        }
    }); 
  });


})


