
const myAudio = document.querySelector('.video');
const btnPlay = document.querySelector('.btnPlay');
const btnStop = document.querySelector('.btnStop');
const btnMute = document.querySelector('.btnMute');
const fast_f = document.querySelector('.fast_f');
const volume = document.querySelector('#volume');
const fullScreen = document.querySelector('.fullScreen');
const videoContainer = document.querySelector('#videoContainer');

let toggle = "true";

// 재생, 일시정지 토글 함수
function togglePlay() {
  if (toggle == "true") {    
    toggle = "false";
    myAudio.play();
    btnPlay.classList.add('on');   
  } else {    
    toggle = "true";
    myAudio.pause();
    btnPlay.classList.remove('on');
  }
}

btnPlay.addEventListener('click', togglePlay);

// 정지버튼 동작시
btnStop.addEventListener('click', () => {
  myAudio.pause();
  myAudio.currentTime = 0;
  btnPlay.classList.remove('on');
  toggle = "true";
});

// 음소거 토글
btnMute.addEventListener('click', () => {  
  myAudio.muted = !myAudio.muted;
  if (myAudio.muted) {
    btnMute.classList.add('on');
  } else {
    btnMute.classList.remove('on');
  }
});

// 빨리감기
let idx = 0;
fast_f.addEventListener('click', function(){
  idx += 1;   
  if (idx == 1) {
    myAudio.playbackRate = 2;  
    fast_f.style.background = "url(img/ui_img/icon2.webp)";
  } else if( idx == 2) {
    myAudio.playbackRate = 4;
    fast_f.style.background = "url(img/ui_img/icon4.webp)";
  } else if( idx == 3 ){
    myAudio.playbackRate = 6;
    fast_f.style.background = "url(img/ui_img/icon6.webp)";
  } else {
    myAudio.playbackRate = 1;
    fast_f.style.background = "url(img/ui_img/controls_icon.png) -231px -418px";
    idx = 0;
  }
});

// 오디오 볼륨 조절
volume.addEventListener('input', ({target}) => {
  myAudio.volume = target.value;      
  target.style.backgroundSize = target.value * 100 + '% 100%';
  
  if (target.value == 0) {
    myAudio.muted = true;
    btnMute.classList.add('on');
  } else {
    myAudio.muted = false;
    btnMute.classList.remove('on');
  }
});

// 전체시간 표시
myAudio.addEventListener('loadeddata', () => {
  const tottime = document.querySelector('.tottime');
  const duration = myAudio.duration || 0;  
  const min = Math.floor(duration / 60);  
  const sec = Math.floor(duration % 60);  
  const totmin = min.toString().padStart(2, '0');  
  const totsec = sec.toString().padStart(2, '0');  
  tottime.innerText = `${totmin}:${totsec}`;
});

// 현재시간 표시 및 프로그레스 바 업데이트
myAudio.addEventListener('timeupdate', () => {
  const playTime = document.querySelector('.playTime');  
  const progress = document.querySelector('.bar');  
  let ctTime = myAudio.currentTime; 
  const duration = myAudio.duration || 0;  

  const progBar = (ctTime / duration) * 100 + '%'; 
  progress.style.width = progBar;  
  let min = Math.floor(ctTime / 60);  
  let sec = Math.floor(ctTime % 60);  
  let ctMin = min.toString().padStart(2, '0');  
  let ctSec = sec.toString().padStart(2, '0');  
  playTime.innerText = `${ctMin}:${ctSec}`;
});

// 전체 화면 전환 (컨트롤바 포함 전체 컨테이너를 전체화면으로 지정)
fullScreen.addEventListener('click', () => {
  myRequestFullScreen(videoContainer);
});

function myRequestFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) { /* 사파리 지원 */
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { /* IE/Edge 지원 */
    element.msRequestFullscreen();
  }
}

// --------------------------------------------------
// [추가요청] 화면이 열리고 2~3초 뒤 자동 플레이 실행
// (참고: 브라우저 정책상 사운드가 켜진 상태의 자동재생은 막히므로, 
//  안전하게 음소거 상태로 자동 재생 후 사용자가 소리를 켤 수 있게 설정합니다)
// --------------------------------------------------
// window.addEventListener('DOMContentLoaded', () => {
//   setTimeout(() => {
//     myAudio.muted = true; // 브라우저 자동재생 정책 우회용 음소거 처리
//     myAudio.play().then(() => {
//       toggle = "false";
//       btnPlay.classList.add('on');
//       // 만약 처음부터 소리가 나게 하고 싶다면 아래 주석을 해제할 수 있으나 정책상 차단될 수 있습니다.
//       // myAudio.muted = false; 
//       // btnMute.classList.remove('on');
//     }).catch(error => {
//       console.log("자동 재생이 브라우저 정책에 의해 차단되었습니다:", error);
//     });
//   }, 2500); // 2.5초 뒤 실행
// });

function handleFirstInteraction() {
  // 소리를 켠 상태(muted = false)로 재생 시도
  myAudio.muted = false;
  myAudio.play().then(() => {
    toggle = "false";
    btnPlay.classList.add('on');
    // 재생이 성공적으로 시작되면 이벤트를 제거하여 중복 실행 방지
    window.removeEventListener('click', handleFirstInteraction);
  }).catch(error => {
    console.log("재생 실패:", error);
  });
}

// 페이지 어디든 사용자가 처음 클릭하는 순간 위 함수가 실행됩니다.
window.addEventListener('click', handleFirstInteraction);







// 재생, 일시정지 토글
// btnPlay.addEventListener('click', () => {  
//   if (toggle == "true") {    
//     toggle = "false";
//     myAudio.play();
//     myAudio.playbackRate = 1;
//     btnPlay.classList.add('on');   
//   } else {    
//     toggle = "true";
//     myAudio.pause();
//     btnPlay.classList.remove('on');
//   }
// });

// // 정지버튼 동작시 - 재생버튼 play상태로, toggle은 off상태로
// btnStop.addEventListener('click', () => {
//   myAudio.pause();
//   myAudio.currentTime = 0;
//   btnPlay.classList.remove('on');
//   toggle = "true";
// });

// // 음소거 토글
// btnMute.addEventListener('click', () => {  
//   if (toggle == "false") {    
//     toggle = "true";
//     myAudio.muted = !myAudio.muted;  //미디어출력 boolean으로 값을 반화해서 같은지 아닌지 확인
//     console.log(myAudio.muted);
//     btnMute.classList.add('on');
//   } else {    
//     toggle = "false";
//     myAudio.muted = !myAudio.muted;
//     console.log(myAudio.muted);
//     btnMute.classList.remove('on');
//   }
// });

// // 빨리감기
// // 빨리감기를 반복해서 동작시키는데, 1번 누를땐, 2배속, 2번 누를땐 4배속, 3번 누를땐 6배속, 4번 누르면 1배속으로 반복시킨다
// let idx = 0;
// fast_f.addEventListener('click', function(){
//   idx += 1;   //빨리감기 버튼 누를때마다 idx 값으 1씩 증가하고, 
//   if (idx == 1) {
//     myAudio.playbackRate = 2;   // 재생속도를 설정, 정상속도는 1.0
//     fast_f.style.background = "url(img/ui_img/icon2.webp)";
//     console.log(myAudio.playbackRate);
//   } else if( idx == 2) {
//     myAudio.playbackRate = 4;
//     fast_f.style.background = "url(img/ui_img/icon4.webp)";
//     console.log(myAudio.playbackRate);
//   }else if( idx == 3 ){
//     myAudio.playbackRate = 6;
//     fast_f.style.background = "url(img/ui_img/icon6.webp)";
//     console.log(myAudio.playbackRate);
//   }else{
//     myAudio.playbackRate = 1;
//     fast_f.style.background = "url(img/ui_img/controls_icon.png) -231px -418px";
//     idx = 0;
//     console.log(myAudio.playbackRate);
//   }
// });



// // 사운드 길이 확인가능 : 초단위로 표시
// myAudio.addEventListener('loadedmetadata', () => {
//   console.log(myAudio.duration)
// });

// // 오디오 볼륨 조절
// let nowVolume = 1;
// volume.value = 1;
// //볼륨 input 이벤트가 발생하면(사용자가 값을 수정할때마다 발생 -range바 움직일때마다) - 현재 이벤트가 실행된 대상 
// volume.addEventListener('input', ({target}) => {
//   // nowVolume = target.value;
//   myAudio.volume = target.value;      
//   target.style.backgroundSize = target.value * 100 + '% 100%'; // 입력되는 볼륨 값으로 target의 backgroundSize를 수정해준다
// })



// // 전체시간 표시
// // loadeddata 는 미디어의 현재 재생 위치에 있는 프레임 로드가 다~~완료되면 이벤트가 시작된다
// myAudio.addEventListener('loadeddata', () => {
//   const tottime = document.querySelector('.tottime');
//   const duration = myAudio.duration || 0; //비디오 전체 지속시간을 초단위로 duration에 넣어라  
//   const min = Math.floor(duration / 60);  //초단위를 분으로 계산하는데,반올림해서 가장 큰 정수로 반환해서 min에 넣기  
//   const sec = Math.floor(duration % 60); // 초단위를 분으로 계산한 나머지를 sec 에 넣어라  
//   const totmin = min.toString().padStart(2, '0');  //문자열 앞뒤에 원하는 문자열 채우기 maxlength 2자리이고,  padstart(앞에) 0을 채워주고, 
//   const totsec = sec.toString().padStart(2, '0');  //min&sec 을 문자열로 반환해서 totmin/totsec에 넣어라
//   tottime.innerText = `${totmin}:${totsec}`;
// });

// // 현재시간 표시
// // timeupdate 는 비디오의 재생시간이 업데이트 될때 일어날 이벤트를 작성
// myAudio.addEventListener('timeupdate', () => {
//   const playTime = document.querySelector('.playTime');  //재생시간
//   const progress = document.querySelector('.bar');  //플레이어 바(재생되는)
//   let ctTime = myAudio.currentTime; // 비디오의 현재 재생 위치를 반환해서 ctTime에 넣어라
//   // console.log(ctTime);
//   const duration = myAudio.duration || 0;  // 비디오가 있으면 비디오 duration을 넣고, 아니면 0 값을 duration에 넣어라(오류방지)

  
//   // 프로그램스 바 업데이트    
//   const progBar = (ctTime / duration) * 100 + '%'; // 재생되는 시간을 계산해서 progBar에 % 로 넣어라
//   progress.style.width = progBar;  //진행된 시간을 %로 프로그레스바 width 값으로 넣어라
//   let min = Math.floor(ctTime / 60);  // 분단위로 계산해서 정수값으로 반환해서 min에 넣고
//   let sec = Math.floor(ctTime % 60);  // 나머지값은 정수값으로 반환해서 sec에 넣어라
//   let ctMin = min.toString().padStart(2, '0');  //두자리값에서 padStart로 값이 없으면 앞에서부터 0을 채워준다/ min값을 문자열로 반환해서 넣는거임
//   let ctSec = sec.toString().padStart(2, '0');  // padEnd는 뒤에서부터 채워주는거를 말하는거였음 예로 id값 shin**이런식으로 만들때 사용
//   playTime.innerText = `${ctMin}:${ctSec}`;
// });


// // 전체 화면 전환
// fullScreen.addEventListener('click',()=>{
//   myRequestFullScreen(myAudio);
// });

// // element라는 매개변수를 가진 myrequestFullscreen 을 호출하면 전체화면에 띄우고자하는 element가 실행
// function myRequestFullScreen(element){
//   if (element.requestFullscreen) {
//     //표준사양
//     element.requestFullscreen();
//   } 
// };


