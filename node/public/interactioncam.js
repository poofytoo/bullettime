(function() {

  var video        = document.querySelector('#video'),
      cover        = document.querySelector('#cover'),
      canvas       = document.querySelector('#canvas'),
      vidcontainer = document.querySelector('#videocontainer'),
      resetbutton  = document.querySelector('#resetbutton'),
      startbutton  = document.querySelector('#startbutton'),
      uploadbutton = document.querySelector('#uploadbutton'),
      urlfield     = document.querySelector('#uploaded input'),
      urllink      = document.querySelector('#uploaded a');
      
 var ctx    = canvas.getContext('2d'),
     streaming    = false,
     width  = 600,
     height = 450,
     state  = 'intro';

 var audio = document.querySelectorAll('audio'),
     sounds = {
        shutter: audio[0],
        rip:     audio[1],
        takeoff: audio[2]
      };

  if (location.hostname.indexOf('localhost')!== -1) {
    document.querySelector('#imgurform').style.display = 'none';
  }

  setstate(state);

  function init() {
    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
        }
        video.play();
        video.style.width = width + 'px';
        video.style.height = height + 'px';
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );
  }

  function takepicture() {
    sounds.shutter.play();
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, finalheight);
    ctx.restore();
    ctx.scale(1, 1);


      upload();
  }

  function reshoot() {
    if (state === 'reviewing') {
      sounds.rip.play();
    }
    if (state === 'reviewing' || state === 'uploaded') {
      canvas.width = width;
      canvas.height = finalheight;
      setstate('playing');
    }
  }

  function initiateupload() {
    if (state === 'reviewing') {
      sounds.takeoff.play();
      setstate('uploading');
      upload();
    }
  }

  function upload() {
    var head = /^data:image\/(png|jpeg);base64,/,
        data = '',
        fd = new FormData(),
        xhr = new XMLHttpRequest();

    setstate('uploading');
    
    data = canvas.toDataURL('image/jpeg', 0.9).replace(head, '');
    console.log('UPLOAD SCRIPT GOES HERE');

    $.post('savephoto', {msg: 'hi', photo: data}, function(data) {
      console.log(data);
    })

    setstate('playing');

  }
  
 function setstate(newstate) {
    state = newstate;
    document.body.className = newstate;
  }
  function store(name) {
    if (localStorage.interactionphotos === undefined) {
      localStorage.interactionphotos = '';
    }
    localStorage.interactionphotos += ' '+ name;
  }

  /* Event Handlers */

  video.addEventListener('play', function(ev){
    if (!streaming) {
      console.log(video.clientHeight);
      finalheight = video.clientHeight / (video.clientWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', finalheight);
      canvas.width = width;
      canvas.height = finalheight;
      streaming = true;
      vidcontainer.classname = 'playing';
    }
  }, false);

  document.addEventListener('keydown', function(ev) {
    if (ev.which === 32 || ev.which === 37 || ev.which === 39) {
      ev.preventDefault();
    }
    if (ev.which === 32) {

        console.log('take picture!');
        setstate('reviewing');
        takepicture();
    }
    if (ev.which === 37) {
      reshoot();
    }
    if (ev.which === 39) {
      initiateupload();
    }
  },false);

  video.addEventListener('click', function(ev){
    setstate('reviewing');
    takepicture();
  }, false);

  resetbutton.addEventListener('click', function(ev){
    if (state === 'reviewing') {
      setstate('playing');
    }
    ev.preventDefault();
  }, false);

  startbutton.addEventListener('click', function(ev){
      setstate('playing');
    ev.preventDefault();
  }, false);

  uploadbutton.addEventListener('click', function(ev){
    if (state === 'reviewing') {
      setstate('uploading');
    }
    ev.preventDefault();
  }, false);


        setstate('playing');
        init();

var fb = new Firebase('https://poofytoo.firebaseIO.com/exitsign');
fb.child('easy').on('value', function(data) {
  if (data.val().trigger == 1) {

        console.log('say cheese!');
        setstate('reviewing');
        takepicture();
        fb.child('easy').child('trigger').set(0);
  }
});

})();


