(function() {

  var video        = document.querySelector('#video'),
      cover        = document.querySelector('#cover'),
      canvas       = document.querySelector('#canvas'),
      vidcontainer = document.querySelector('#videocontainer')

  var audio = new Audio('snap.wav');

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
    audio.play();
    $('#flash').fadeIn(100, function() {
      $('#flash').fadeOut();
    });
    upload();
  }

  function upload() {
    var head = /^data:image\/(png|jpeg);base64,/;
    var cn = $('#camnum').val();
    setstate('uploading');
    data = canvas.toDataURL('image/jpeg', 0.8).replace(head, '');
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
/*
  document.addEventListener('keydown', function(ev) {
    
    if (ev.which === 32) {
      ev.preventDefault();
      setstate('reviewing');
      takepicture();
    }
  },false);
    */

  /*
  PREVIOUS TRIGGER
  var fb = new Firebase('https://poofytoo.firebaseIO.com/exitsign');
  fb.child('easy').on('value', function(data) {
    if (data.val().trigger == 1) {
      setstate('reviewing');
      takepicture();
      fb.child('easy').child('trigger').set(0);
    }
  });
  */

  var socket = io('http://18.242.7.123:8001');

  var triggerExtract;
  socket.on('triggerhappy', function (data) {
    triggerExtract = data.t
    console.log('receivedData - taking photo at ' + data.t);
  });

  socket.on('pingbot', function (data) {
    $('body').prepend('<div class="ping">ping</div>');
    $('.ping').delay(5000).fadeOut(3000);
  });

  setstate('playing');
  init();


  document.addEventListener('keydown', function(ev) {
    if (ev.which === 32) {
      if (timer < 1){
        setInterval(clock, 200);
      }
    }
  });
  $('#camnum').on('keydown', function(ev) {
    if (ev.which == 13) {
      console.log('losefocus');
      $(this).blur();

    }
  })

  var timer = 0;
  var triggerExtract = 20000000;

  clock = function() {
    timer ++;
    console.log(timer);

    if (timer >= triggerExtract) {
      setstate('reviewing');
      takepicture();
      triggerExtract = 20000000;
    }

    if (triggerExtract < 20000000) {
      if ((triggerExtract - timer)/5 == 1) {
        $('body').prepend('<div class="countdown">1</div>');
        $('.countdown').delay(700).fadeOut(200);
      }
      if ((triggerExtract - timer)/5 == 2) {
        $('body').prepend('<div class="countdown">2</div>');
        $('.countdown').delay(700).fadeOut(200);
      }
      if ((triggerExtract - timer)/5 == 3) {
        $('body').prepend('<div class="countdown">3</div>');
        $('.countdown').delay(700).fadeOut(200);
      }
    }

  }


})();


