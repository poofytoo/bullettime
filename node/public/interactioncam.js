(function() {

  var video        = document.querySelector('#video'),
      cover        = document.querySelector('#cover'),
      canvas       = document.querySelector('#canvas'),
      vidcontainer = document.querySelector('#videocontainer')

  var ctx    = canvas.getContext('2d'),
     streaming    = false,
     width  = 600,
     height = 450,
     state  = 'intro';

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
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, finalheight);
    ctx.restore();
    ctx.scale(1, 1);
    upload();
  }

  function upload() {
    var head = /^data:image\/(png|jpeg);base64,/;
    var cn = $('#camnum').val();
    setstate('uploading');
    data = canvas.toDataURL('image/jpeg', 0.9).replace(head, '');
    ctx.clearRect(0, 0, width, finalheight);

    // Send Photo to Server
    $.post('savephoto', {photo: data, camnum: cn}, function(data) {
      console.log(data);
    })

    setstate('playing');
  }
  
 function setstate(newstate) {
    state = newstate;
    document.body.className = newstate;
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
    if (ev.which === 32) {
      ev.preventDefault();
      setstate('reviewing');
      takepicture();
    }
  },false);

  var fb = new Firebase('https://poofytoo.firebaseIO.com/exitsign');
  fb.child('easy').on('value', function(data) {
    if (data.val().trigger == 1) {
      setstate('reviewing');
      takepicture();
      fb.child('easy').child('trigger').set(0);
    }
  });

  setstate('playing');
  init();


})();


