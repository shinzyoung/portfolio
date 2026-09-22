"use strict";

onload = async () => {
    

    /* =====================================================
    * * 우클릭 방지 / 사용자 제한 / 개발자도구 / 소스보기 / 검사도구 방지
    * @param {*} idx {0:적용, 1:미적용} 
    ========================================================*/
    // 작업완료 후 주석 해제하기
    // blockListenerUtil(0); //설정{0:적용, 1:미적용}


    const $ = function(sel){return document.querySelector(sel)};
    const $$ = function(sel){return document.querySelectorAll(sel)};

    const vdo = $('#vdo');
    const playBtn = $('.play-btn');
    const progressBar = $('.progress-bar');
    const progressBarWrap = $('.progress-bar-wrap');

    const submit = $('.submitBtn');
    const textArea = $('.content03 .textArea');
    const popupBg = $('.content03 .popupBg');
    const userTextDisplay = $('.content03 .userText');
    const closeBtn = $('.content03 .closeBtn');

    // 1. 비디오 재생/정지 토글 함수
    function togglePlay () {
        if(vdo.paused) {
            vdo.play();
            playBtn.classList.remove('is-playing');
        } else {
            vdo.pause();
            playBtn.classList.add('is-playing');
        }
    }

    if(vdo && playBtn) {
        vdo.addEventListener(isTouch.click, togglePlay);
        playBtn.addEventListener(isTouch.click, togglePlay);
    }

    // 프로그레스 바 (진행률) 연동 로직
    if(vdo && progressBar) {
        vdo.addEventListener('timeupdate', ()=>{
            const current = vdo.currentTime;
            const duration = vdo.duration;
            if( duration > 0 ) {
                const percent = (current / duration) *100;
                progressBar.style.width=`${percent}%`;
            }
        });
    }

    // 프로그래스 바를 클릭시 해당 위치로 영상 이동
    if(progressBarWrap) {
        progressBarWrap.addEventListener(isTouch.click, (e)=>{
            const rect = progressBarWrap.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const duration = vdo.duration;
            if(duration > 0) {
                const clickedPercent = clickX / width;
                vdo.currentTime =  clickedPercent * duration;
            }
        });
    }

    // 3. 비디오 순차 재생 제어
    const waitForVideoEnd = (videoElement) =>{
        return new Promise((resolve) =>{
            if(videoElement.ended) {
                resolve();
                return;
            }
            videoElement.addEventListener('ended', ()=>{
                resolve();                
            }, { once: true});
        });
    };1

    // 순차재생 비동기 메인 함수
    async function runVideoSequence() {
        try {
            console.log("첫번째 영상 재생");
            await vdo.play();

            await waitForVideoEnd(vdo);
            console.log("첫번째 영상 종료 / 다음 영상 교체");

            vdo.src="./video/play03.mp4";
            vdo.load();

            console.log("두번째 영상 재생");
            await vdo.play();
            
        } catch (error) {
            console.error("비디오 자동 재생이 차단되었거나 오류 발생:", error);
            vdo.pause();
            playBtn.classList.add('is-playing');

        }
    }
    runVideoSequence();


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
