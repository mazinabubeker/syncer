var auth_code = '';
var auth_token = '';

var audioContext = null;
var meter = null;
var rafID = null;
var mediaStreamSource = null;

// Retrieve AudioContext with all the prefixes of the browsers
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// Get an audio context


$(document).ready(function(){
  // Server has authenticated login [Token authentication redirect]
  if(window.location.href.includes('code')){
    document.getElementById('btn-login').remove();
    const urlParams = new URLSearchParams(window.location.search);
    auth_code = urlParams.get('code');
    retrieve_token();
  }
});


// Login button has been pressed [Credential authentication]
function authorize_login(){
    fetch('/authorize_login')
    .then(resp => resp.text())
    .then(data=>{
        window.location.href = data;
    });
}


// Called from after login....
function retrieve_token(){
  fetch('/retrieve_token',
          {
            method: 'POST',
            headers: 
            {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({code: auth_code}),
          }
        )
  .then(resp => resp.text())
  .then(data=>{
    // API token has been recieved from server
    // Load main content and add search bar listener
    document.getElementById('centerer').style.justifyContent = 'start';
    let main_content = `
    <input placeholder='Search...' type='text' id='search-input' style='width: 200px;'></div>
    <img id='load-gif' style='visibility: hidden' src='assets/load.gif'/>
    <div id='results'></div>
    `
    document.getElementById('centerer').insertAdjacentHTML('beforeend', main_content);
    document.getElementById('search-input').addEventListener('keyup', e=>{
      if(e.keyCode == 13){
        request();
      }
    });
  });
}

function request(){
  // User searched for a song
  document.getElementById('load-gif').style.visibility = 'visible';
  if(document.getElementById('search-input').value  == ''){
    return;
  }
  fetch('/ask',
          {
            method: 'POST',
            headers: 
            {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_req: document.getElementById('search-input').value}),
          }
        )
  .then(resp => resp.text())
  .then(data=>{
    // API responded to search request
    let result_box = document.getElementById('results');
    result_box.innerHTML = '';
    data = JSON.parse(data);
    // var uri, img, id;
    for(var i = 0; i < data.songs.length; i++){
      let uri = data.songs[i].uri;
      let img = data.songs[i].img;
      let id = data.songs[i].id;

      let song = document.createElement('div');
      song.classList.add('song-item')
      song.addEventListener('click', ()=>{
        playSong(uri);
        // analyzeSong(id);
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
      text.innerHTML = data.songs[i].title + `<br><span class='artist-text'>` + data.songs[i].artist + `</span>`;
      
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

function playSong(uri){
  fetch('/play', {method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({id: uri})
                    })
    .then(resp => resp.text())
    .then(data=>{

    });
}

function analyzeSong(id){
  fetch('/analyze', {method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({id: id})
                    })
    .then(resp => resp.text())
    .then(data=>{
        data = JSON.parse(data);
        let bar = document.getElementById('vol-bar');
        console.log(data);
        for(var i = 0; i < data.segs.length; i++){
          // console.log(data.segs[i])
          let volume = data.segs[i].vol;
          let start = data.segs[i].start;
          setTimeout(function(){
            console.log((volume + 100).toString() + 'px')
            bar.style.width = ((volume + 100)*4).toString() + 'px';
          }, start*1000);
        }
    });
}

function getAverageColor(image, song){
  let cnv = document.getElementById('myCanvas');
  let ctx = cnv.getContext('2d');
  ctx.drawImage(image, 0, 0, 100, 100);
  const imageData = ctx.getImageData(0,0,100, 100);
  var r = 0;
  var g = 0;
  var b = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    r += imageData.data[i + 0];
    g += imageData.data[i + 1];
    b += imageData.data[i + 2];
  }
  r /= imageData.data.length / 4;
  g /= imageData.data.length / 4;
  b /= imageData.data.length / 4;
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  song.style.borderColor = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
  song.classList.add('visible');
}