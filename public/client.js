var socket = io();
var auth_code = '';
var unique_id = '';
$(document).ready(function(){
  // Server has authenticated login [Token authentication redirect]
  if(window.location.href.includes('code')){
    document.getElementById('btn-login').remove();
    const urlParams = new URLSearchParams(window.location.search);
    auth_code = urlParams.get('code');
    socket.emit('request-id');
    socket.on('id-response', newId=>{
      unique_id = newId;
      retrieve_token();
    });
  }
});


// Login button has been pressed [Credential authentication]
function authorize_login(){
  socket.emit('login');
  socket.on('login-response', res=>{
    window.location.href = res;
  });
}

// Called from after login....
function retrieve_token(){
  socket.emit('token', {auth_code: auth_code, uid: unique_id});
  socket.on('token-response', ()=>{
    load('/app', startApp);
  });
}

// User searched for a song
function request(){
  document.getElementById('load-gif').style.visibility = 'visible';
  if(document.getElementById('search-input').value  == ''){
    return;
  }
  socket.emit('ask', {user_req: document.getElementById('search-input').value, uid: unique_id});
  socket.on('ask-response', res=>{
    let result_box = document.getElementById('results');
    result_box.innerHTML = '';
    let data = res;
    for(var i = 0; i < data.songs.length; i++){
      let uri = data.songs[i].uri;
      let img = data.songs[i].img;
      let id = data.songs[i].id;
      let title = data.songs[i].title;
      let artist = data.songs[i].artist
      let uuid = unique_id;

      let song = document.createElement('div');
      song.classList.add('song-item')
      song.addEventListener('click', ()=>{
        socket.emit('play', {uri: uri, uid: uuid});
      });
      
      let image = document.createElement('img');
      image.classList.add('img-item');
      image.src = img;
      image.crossOrigin = "Anonymous";
      image.onload = function(){
        getAverageColor(image, song);
      };

      let text_container = document.createElement('div');
      text_container.classList.add('text-container');

      let text = document.createElement('p');
      text.innerHTML = title + `<br><span class='artist-text'>` + artist + `</span>`;
      
      text_container.insertAdjacentElement('beforeend', text);
      song.insertAdjacentElement('beforeend', image);
      song.insertAdjacentElement('beforeend', text_container);

      // document.getElementById("search-input").addEventListener("keypress", function(e) {
      //   forceKeyPressUppercase(e);
      // }, false);
      result_box.insertAdjacentElement('beforeend', song);
    }
    document.getElementById('load-gif').style.visibility = 'hidden';
  });
}

function getAverageColor(image, song){
  let cnv = document.getElementById('myCanvas');
  let ctx = cnv.getContext('2d');
  ctx.drawImage(image, 0, 0, 100, 100);
  const imageData = ctx.getImageData(0,0,100,100);
  var r = 0;
  var g = 0;
  var b = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    r += imageData.data[i + 0];
    g += imageData.data[i + 1];
    b += imageData.data[i + 2];
  }
  r = Math.floor(r/(imageData.data.length/4));
  g = Math.floor(g/(imageData.data.length/4));
  b = Math.floor(b/(imageData.data.length/4));
  song.style.borderColor = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
  song.classList.add('visible');
}

function openPage(e){
  console.log(e.target.innerHTML)
  if(e.target.innerHTML == 'Search'){
    document.getElementById('content').style.display = 'flex';
  }
}

function load(page, callback){
  fetch(page).then(resp=>resp.text()).then(res=>{
    document.body.innerHTML = res;
    if(callback !== undefined){
      callback();
    }
  });
}