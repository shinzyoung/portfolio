"use strict";

onload = async () => {
    const $ = function(sel){return document.querySelector(sel)};
    const $$ = function(sel){return document.querySelectorAll(sel)};

    const vdo = $('#vdo');
    const playBtn = $('.play-btn');
    const submit = $('.submitBtn');
    const textArea = $('.content03 .textArea');
    const popupBg = $('.content03 .popupBg');
    const userTextDisplay = $('.content03 .userText');
    const closeBtn = $('.content03 .closeBtn');

    // 비디오 재생/정지 버튼 함수
    function togglePlay () {
        if(vdo.paused) {
            vdo.play();
        } else {
            vdo.pause();
        }
    }

    function updatePlayButton() {
        if(vdo.paused) {
            playBtn.classList.remove('is-playing');
        } else {
            playBtn.classList.add('is-playing');
        }
    }

    if(vdo && playBtn) {
        vdo.addEventListener(isTouch.click, togglePlay);
        playBtn.addEventListener(isTouch.click, togglePlay);
        vdo.addEventListener('play', updatePlayButton);
        vdo.addEventListener('pause', updatePlayButton);
    }


    submit.addEventListener(isTouch.click, () => {
        console.log("확인");
        const textValue = textArea.innerText.trim();

        // 입력내용 x경우 안내
        if(textValue == "") {
            alert('하고 싶은 말을 입력해 주세요');
            textArea.focus();
            return;
        }

        userTextDisplay.innerText = textValue;
        popupBg.style.display = "flex";
    });

    closeBtn.addEventListener(isTouch.click, ()=>{
        popupBg.style.display = 'none';
        textArea.innerText = "";
    });





    

}
