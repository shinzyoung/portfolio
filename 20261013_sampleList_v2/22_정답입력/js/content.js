/**
 * content js
 */
function fnContent() {
  let cv = this;
  
  this.fIdx = 0;
  this.tIdx = 0;
  this.qIdx = 0;

  this.comState1 = null;
  this.comState2 = null;
  this.videoState = null;
  this.tabState = null;

  this.tab_content = document.querySelector('#tab_content');
  this.tab = document.querySelectorAll('.tab');

  this.quiz1 = document.querySelector('.quiz_1');
  this.quiz2 = document.querySelector('.quiz_2');

  this.btnSection = document.querySelectorAll(".btn-section"); // 0112 문제간 이동 화살표 add start
  this.preSecBtn = document.querySelector("#preSecBtn");
  this.nextSecBtn = document.querySelector("#nextSecBtn"); // add end

  this.ansItem = document.querySelector('.ans_item');
  this.ansNum = document.querySelector('.ans_num');

  this.btnPrev = document.querySelector("#btn_prev");
  this.btnNext = document.querySelector("#btn_next");

  this.bgmAudio = null;

  this.dropIdx = 0;
  this.dragTarget = undefined;
  this.dropTarget = undefined;
  this.dragOverlap = 10;

  this.drag_content = document.querySelector("#drag_content");
  this.drop_content = document.querySelector("#drop_content");
  this.dragItem = document.querySelectorAll(".dragItem");
  this.dropItem = document.querySelectorAll(".dropItem");

  //section1
  this.section1 = document.querySelector('#section1');
  this.quizBg1 = document.querySelector('#section1 .quiz-bg');
  this.tabContent1 = document.querySelector('#section1 #tab_content');
  this.tab1 = document.querySelectorAll('#section1 .tab');
  this.dragContent1 = document.querySelector('#section1 #drag_content');
  this.dropContent1 = document.querySelector('#section1 #drop_content');

  //section2
  this.createState = null;
  this.section2 = document.querySelector('#section2');
  this.quizBg2 = document.querySelector('#section2 .quiz-bg');
  this.tabContent2 = document.querySelector('#section2 #tab_content');
  this.tab2 = document.querySelectorAll('#section2 .tab');
  this.dragContent2 = document.querySelector('#section2 #drag_content');
  this.dropContent2 = document.querySelector('#section2 #drop_content');
  this.dropList2 = document.querySelectorAll('#section2 #drop_content > div');

  this.introVideo = document.querySelector("#vdo");

  this.timeoutList = [];
  

  this.userData = {
    load: false,
    nowStatus: 0,
    menuIndex: 0,
    menuCount: 0,
  };

  this.isSound = {
    right: "./sound/quiz_clear",
    wrong: "./sound/quiz_failed",
    end: "./audio/quiz_clear2",
    btn: "./audio/end",
    introSound: "./audio/intro_sound_edit", // 점프뛰용휘익
    charSay: "./audio/ready_00_2",
    guide: "./audio/click",
    effect_2: "./audio/effect_2",
    effect_3: "./audio/effect_3",
    effect_4: "./audio/effect_4",
    effect : "./audio/effect",
    dragStart : "./audio/drag_start",
    click: "./audio/click",
  };

  // NOTE: *** NEW :: 260323 *** ========================================================

  // 정답 입력 관련 
  this.countIncorrect = 0;
  this.qIdx = 1;
  
  /**
   * 📖 실전문제 인풋 중복체크 여부
   * true  → 중복체크 O (중복 입력 불가)
   * false → 중복체크 X (중복 입력 허용)
   */
  this.p_double_check = false;
  this.r_double_check = true;
  this.ok_ment = "잘했어! 정답이야!";
  this.effect_audio;

  /***
   * 📖 정답지 설정 설명
   *
   * input이 하나인 경우
   * this.answerObj = {
   *      1: [["1"]],
   * };
   *
   * input이 여러 개인 경우
   * this.answerObj = {
   *      1: [["1"], ["2"]],
   * };
   *
   * input이 여러 개 + 중복 답안 허용 시
   * this.answerObj = {
   *      1: [
   *          // 5,10 또는 10,5 둘 다 정답(복수 정답)
   *          ["5", "10"],
   *          ["10", "5"],
   *      ],
   * };
   */  
   this.answerObj = {
    // 1: [["64"], ["225"]],
    1: [["32","5"],["5","32"]],
  };
  this.exampleText ="마름모의 넓이는 = 한 대각선의 길이 × 다른 대각선의 길이 ÷ 2 입니다. 그러므로 정답은<br>마름모의 넓이 = 7×4÷2=14 (cm<sup>2</sup>) 입니다.";
  
  this.quizLength = Object.keys(cv.answerObj).length;
  this.quiz_arr = [];
  this.isQuizCompleted = new Array(cv.quizLength).fill(false);

  //

  //************************************************************************ */

  /**
   * init
   */
  cv.init = function () {
    if (ContentAudio.audio) ContentAudio.audio.pause();
    if (isAudio.audio) isAudio.audio.pause();
    if (cv.bgmAudio) cv.bgmAudio.pause();

    cv.onSetContent(0); //설정{0:완료, 1:테스트}
  };

  /**
   * setting content
   * @param {*} idx 작업설정{0:완료, 1:테스트}
   */
  cv.onSetContent = function (idx) {
    if (idx == 0) {
      inContent();
    } else {
      document
        .querySelector("body")
        .addEventListener(isTouch.click, removeEvent, false);
      function removeEvent() {
        this.removeEventListener(isTouch.click, removeEvent, false);
        inContent();
      }
    }

    function inContent() {
      cv.setBtnContent(); // 이전, 다음 버튼 설정
      cv.setSectionBtn(); //영역 이동 버튼
      cv.guideInit(); //가이드 설정
 
      document.querySelector('.loading').classList.add("hidden");
      cv.startContent();
      cv.bgmSound();
      // cv.bgmAudio.play();

      // 260323 키패드 입력
      // cv.setKeypad();
      cv.newQuizInit();
      cv.textarea();
      
      cv.bgmAudio.volume = 0;
      ContentAudio.audio.volume = 0.5;
      isAudio.audio.volume = 0.5;

    }
  };

  //==========================================================================
  //==========================================================================

      /************************************************************************************** */
    /**
     * MP4 비디오 오프닝
     */
    cv.videoLoadInit = function () {
      // cv.hasStarted = false;
      // cv.hasStarted = true;   

      document.querySelector('.loading').classList.add("hidden");
      cv.startContent();
      cv.bgmSound();
      cv.bgmAudio.play();
      
      cv.bgmAudio.volume = 0;
      ContentAudio.audio.volume = 0.5;
      isAudio.audio.volume = 0.5;
  };


  // cv.videoLoadInit = function () {
  //     cv.hasStarted = false;

      
  //     // MP4 비디오: 로드(완료)
  //     cv.introVideo.play();
  //     cv.introVideo.addEventListener("play", () => {
  //     // cv.introVideo.addEventListener("canplaythrough", () => {
  //         if (cv.hasStarted) return; // 이미 실행했다면 무시
  //         cv.hasStarted = true;

  //         console.log("비디오 로딩 완료");
  //         document.querySelector('.loading').classList.add("hidden");

  //         // cv.introVideo.play();
  //         cv.introVideo.loop = false;

  //         // cv.introVideo2.play();
  //         // cv.introVideo2.loop = true;  
  //     });

  //     cv.introVideo.onended = function(){
  //       console.log('@첫번째 인트로 재생 완료');
  //       cv.videoState = true;
  //       cv.introVideo.classList.add('hidden');
  //       cv.startContent();
  //       cv.bgmSound();
  //       cv.bgmAudio.play();

  //       // @@테스트 ...
  //       // cv.bgmAudio.volume = 0;
  //       // ContentAudio.audio.volume = 0.5;
  //       // isAudio.audio.volume = 0.5;

  //   }
  // };
  


  cv.startContent = function(){
    cv.onDragContent();

    if(cv.tabState == null){
      cv.tabState = true;
      for(let i=0; i<cv.tab.length; i++){
        cv.tab[i].addEventListener(isTouch.click, cv.tabEvent, false);
      }
    }

    cv.contentQuiz1();    
  }


  
  /**
   * NOTE: 260323 :: inputGroup 토글 기능 추가
   * NOTE: 260323 :: 숫자 키패드 이외의 입력(=내장 키보드 사용) 처리 추가
   * 키패드 초기화 및 이벤트 설정
   */
  cv.setKeypad = function () {
    const inputGroupArr = document.querySelectorAll("#container .input_group");
    const inputArr = document.querySelectorAll("#container input");

    // NOTE: 현재 활성화된(클릭된) input 요소를 저장할 변수 추가
    let currentInput = null;
    keypad.init({ container: "#container" });

    // ------------------------------------------------------------------
    // NOTE: 숫자 키패드에 없는 입력의 경우 => 기본 내장 키보드 사용 처리 (readonly 속성 적용 범위를 제한)
    // ------------------------------------------------------------------
    inputArr.forEach((inputItem) => {
      // 현재 inputItem이 속한 가장 가까운 quiz_group_ 찾기
      const quizGroup = inputItem.closest('[id^="quiz_group_"]');

      // --- 키패드 활성화 퀴즈일 경우 ---
      if (!quizGroup || quizGroup.dataset.keypad !== "disable") {
        inputItem.setAttribute("readonly", "readonly");
      }
      // --- 키패드 비활성화 퀴즈일 경우(data-keypad="disable") ---
      else {
        inputItem.removeAttribute("readonly");
      }
    });
    // ------------------------------------------------------------------

    // NOTE: 기존 키패드
    // 모든 input_group에 클릭 이벤트 등록
    inputGroupArr.forEach((inputGroupItem) => {
      inputGroupItem.addEventListener(isTouch.up, (e) => {
        const quizGroup = inputGroupItem.closest('[id^="quiz_group_"]');

        // 1. 이미 active 상태인지 확인
        const isActive = inputGroupItem.classList.contains("active");

        // --- 키패드 비활성화 퀴즈일 경우 (내장 키보드) ---
        if (quizGroup && quizGroup.dataset.keypad === "disable") {
          console.log("해당 퀴즈는 키패드가 비활성화 :: 내장 키보드 사용 가능");

          if (isActive) {
            // 이미 active면 포커스 해제 및 active 제거
            inputGroupItem.querySelector("input").blur();
            inputGroupItem.classList.remove("active");
          } else {
            document
              .querySelectorAll("#container .input_group")
              .forEach((el) => el.classList.remove("active"));
            keypad.hide();
            currentInput = null;
            inputGroupItem.querySelector("input").focus();
            inputGroupItem.classList.add("active");
          }
          return;
        }

        // --- 키패드 활성화 퀴즈일 경우 ---
        if (isActive) {
          // 2. 이미 활성화된 요소를 다시 클릭했다면 키패드 숨기기
          console.log("이미 활성화된 입력창 클릭 :: 키패드 숨김");
          keypad.hide();
          inputGroupItem.classList.remove("active");
          currentInput = null; // 선택된 input 정보 초기화
        } else {
          // 3. 새로운 요소를 클릭했다면 기존 active 제거 후 새로 활성화
          console.log("새로운 입력창 클릭 :: 키패드 표시");
          currentInput = inputGroupItem.querySelector("input");
          document
            .querySelectorAll("#container .input_group")
            .forEach((el) => el.classList.remove("active"));
          inputGroupItem.classList.add("active");
          keypad.show();
        }
      });
    });

    window.addEventListener(keypad.KEYPAD_INPUT, (e) => {
      let id = e.detail.id;
      // 3. 저장된 currentInput 변수를 사용하여 값 처리
      let input = currentInput;

      // input이 null이면 (아무것도 클릭 X) 처리 중지
      if (!input) {
        console.log("키패드 입력 대상 input이 지정되지 않았습니다.");
        return;
      }

      // let btn = document.querySelector(`#quiz_check_btn_${cv.qIdx}`); // 정답 처리는 따로

      switch (id) {
        case "enter":
          // if (btn) {btn.click();} // 정답 처리는 따로
          keypad.hide();
          currentInput.parentElement.classList.remove("active");
          currentInput = null;
          break;

        case "back":
          if (input.value.length > 0) input.value = input.value.slice(0, -1);
          break;

        default: // 숫자/점(.) 입력
          input.value += id;
          break;
      }
    });
  };
// ========================================================== //

  /**
   * 가이드 설정
   */
  cv.guideInit = function() {
      //@ fnGuide: 생성             
      cv.aGuide = new fnGuide();              
  };

  /**
  * 가이드 업데이트
  */
  cv.guideUpdate = function(idx) {        
    //@ fnGuide: 중지 ******************** */
    cv.aGuide.stop(); 
    
    // isAudio.play(cv.isSound.guide, true);
    isAudio.play(cv.isSound.click, true);

    //@ fnGuide: 시작(drag) ******************** */       
    if(idx === 0){
      cv.aGuide.drag({
        target: document.querySelector("#guide1"),
        start: cv.dragContent1.children[0],             
        end: cv.dropContent1.children[0],            
        loop: false, 
        count: 7, 
        speed: 0.9,                        
        resize: null,
        startCSS: "aniGuideFadeIn",
        endCSS: "aniGuideFadeOut"            
      });    
    }
    if(idx === 1){
      cv.aGuide.drag({
        target: document.querySelector("#guide1"),
        start: cv.dragContent2.children[0],             
        end: cv.dropContent2.children[0],            
        loop: false, 
        count: 7, 
        speed: 0.9,                        
        resize: null,
        startCSS: "aniGuideFadeIn",
        endCSS: "aniGuideFadeOut"            
      });  
    }

    //@ fnGuide: 시작(tab) ******************** */
    if(idx === 2){
      cv.aGuide.tab({
        target: document.querySelector("#guide1"),                        
        start: cv.tabContent2.children[0],                         
        loop: false, 
        count: 7, 
        speed: 0.9,                        
        resize: null,
        // startCSS: "aniGuideFadeIn",
        // endCSS: "aniGuideFadeOut"            
      });  
    }

    
    /**
     * @ fnGuide: 완료
     * loop false일 경우 활성화
     * @param {*} data          
     */
    cv.aGuide.end = function(data) {
        console.log('guide end', data);

        if(idx === 0){
          // cv.dragContent1.classList.remove('pointNone2');
        } else if(idx === 1){
          cv.dragContent2.classList.remove('pointNone2');
          // cv.tabContent1.classList.remove('pointNone');
        } else if(idx === 2){
          // cv.tabContent2.classList.remove('pointNone');
        }
        
    };            
        
  };

  cv.contentQuiz1 = function(){

    // let tid = setTimeout(() => {
    //   // isAudio.play(cv.isSound.effect_2, true);
    //   for(let i=0; i<cv.quizBg1.children.length-1; i++){
    //     cv.quizBg1.children[i].classList.remove('hidden');
    //   }
    //   let tid = setTimeout(() => {
    //     cv.guideUpdate(0);
    //   }, 1000);
    //   cv.timeoutList.push(tid);
    // }, 200);
    // cv.timeoutList.push(tid);

    // cv.dragContentIn();
    // let tid = setTimeout(() => {
    //   cv.guideUpdate(0);
    // }, 1000);
    // cv.timeoutList.push(tid);
    // [ 활동완료 ]
      for(let i=0; i<cv.btnSection.length; i++){
        cv.btnSection[i].classList.add('pointNone');
      }
      let tid = setTimeout(() => {
        cv.onContentComplete();
      }, 1000);
      cv.timeoutList.push(tid);
  }

  cv.contentQuiz2 = function(){

    cv.dragContentIn();
    let tid = setTimeout(() => {
      cv.guideUpdate(1);
    }, 500);
    cv.timeoutList.push(tid);

    
  }



  

  /**
   * NOTE: 260323 :: inputGroup 토글 기능 추가
   * NOTE: 260323 :: 숫자 키패드 이외의 입력(=내장 키보드 사용) 처리 추가
   * 키패드 초기화 및 이벤트 설정
   */
  cv.setKeypad = function () {
    const inputGroupArr = document.querySelectorAll("#container .input_group");
    const inputArr = document.querySelectorAll("#container input");

    // NOTE: 현재 활성화된(클릭된) input 요소를 저장할 변수 추가
    let currentInput = null;
    keypad.init({ container: "#container" });

    // ------------------------------------------------------------------
    // NOTE: 숫자 키패드에 없는 입력의 경우 => 기본 내장 키보드 사용 처리 (readonly 속성 적용 범위를 제한)
    // ------------------------------------------------------------------
    inputArr.forEach((inputItem) => {
      // 현재 inputItem이 속한 가장 가까운 quiz_group_ 찾기
      const quizGroup = inputItem.closest('[id^="quiz_group_"]');

      // --- 키패드 활성화 퀴즈일 경우 ---
      if (!quizGroup || quizGroup.dataset.keypad !== "disable") {
        inputItem.setAttribute("readonly", "readonly");
      }
      // --- 키패드 비활성화 퀴즈일 경우(data-keypad="disable") ---
      else {
        inputItem.removeAttribute("readonly");
      }
    });
    // ------------------------------------------------------------------

    // NOTE: 기존 키패드
    // 모든 input_group에 클릭 이벤트 등록
    inputGroupArr.forEach((inputGroupItem) => {
      inputGroupItem.addEventListener(isTouch.up, (e) => {
        const quizGroup = inputGroupItem.closest('[id^="quiz_group_"]');

        // 1. 이미 active 상태인지 확인
        const isActive = inputGroupItem.classList.contains("active");

        // --- 키패드 비활성화 퀴즈일 경우 (내장 키보드) ---
        if (quizGroup && quizGroup.dataset.keypad === "disable") {
          console.log("해당 퀴즈는 키패드가 비활성화 :: 내장 키보드 사용 가능");

          if (isActive) {
            // 이미 active면 포커스 해제 및 active 제거
            inputGroupItem.querySelector("input").blur();
            inputGroupItem.classList.remove("active");
          } else {
            document
              .querySelectorAll("#container .input_group")
              .forEach((el) => el.classList.remove("active"));
            keypad.hide();
            currentInput = null;
            inputGroupItem.querySelector("input").focus();
            inputGroupItem.classList.add("active");
          }
          return;
        }

        // --- 키패드 활성화 퀴즈일 경우 ---
        if (isActive) {
          // 2. 이미 활성화된 요소를 다시 클릭했다면 키패드 숨기기
          console.log("이미 활성화된 입력창 클릭 :: 키패드 숨김");
          keypad.hide();
          inputGroupItem.classList.remove("active");
          currentInput = null; // 선택된 input 정보 초기화
        } else {
          // 3. 새로운 요소를 클릭했다면 기존 active 제거 후 새로 활성화
          console.log("새로운 입력창 클릭 :: 키패드 표시");
          currentInput = inputGroupItem.querySelector("input");
          document
            .querySelectorAll("#container .input_group")
            .forEach((el) => el.classList.remove("active"));
          inputGroupItem.classList.add("active");
          keypad.show();
        }
      });
    });

    window.addEventListener(keypad.KEYPAD_INPUT, (e) => {
      let id = e.detail.id;
      // 3. 저장된 currentInput 변수를 사용하여 값 처리
      let input = currentInput;

      // input이 null이면 (아무것도 클릭 X) 처리 중지
      if (!input) {
        console.log("키패드 입력 대상 input이 지정되지 않았습니다.");
        return;
      }

      // let btn = document.querySelector(`#quiz_check_btn_${cv.qIdx}`); // 정답 처리는 따로

      switch (id) {
        case "enter":
          // if (btn) {btn.click();} // 정답 처리는 따로
          keypad.hide();
          currentInput.parentElement.classList.remove("active");
          currentInput = null;
          break;

        case "back":
          if (input.value.length > 0) input.value = input.value.slice(0, -1);
          break;

        default: // 숫자/점(.) 입력
          input.value += id;
          break;
      }
    });
  };
// ========================================================== //

  /**
   * 현재 cv.qIdx에 해당하는 퀴즈 그룹만 보이게 초기화 함수
   */
  cv.newQuizInit = function () {
    // 1. 모든 퀴즈 그룹(quiz_group_*) & 관련 이미지를 숨김처리(prev, next 처리로 인해서 추가함...!)
    for (let i = 1; i <= cv.quizLength; i++) {
      const quizGroup = document.getElementById(`quiz_group_${i}`);
      if (quizGroup) {
        quizGroup.classList.add("display_none");
        const quizBack = document.getElementById(`quiz_${i}_back`);
        if (quizBack) quizBack.classList.add("display_none");
      }
    }

    // 2. 현재 퀴즈 (cv.qIdx)만 보이게 처리
    const currentQuiz = document.getElementById(`quiz_group_${cv.qIdx}`);
    const currentBack = document.getElementById(`quiz_${cv.qIdx}_back`);
    const currentStep = document.querySelector(
      `#quiz_group_${cv.qIdx} .quiz_step`
    );

    if (currentQuiz) {
      currentQuiz.classList.remove("display_none");
    }
    if (currentBack) {
      currentBack.classList.remove("display_none");
    }
    if (currentStep) {
      currentStep.textContent = `step${cv.qIdx}`;
    }

    // 3. 이벤트 및 버튼 초기화
    cv.quiz_arr = Array.prototype.slice.call(
      document.getElementsByClassName(`quiz_${cv.qIdx}`)
    );
    cv.mouseEvtCreate(cv.quiz_arr);
  };



  /**
   * 전달 받은 배열 요소에 checkClick 이벤트 추가
   * @param {Array} $arr
   */
  cv.mouseEvtCreate = function ($arr) {
    // var i;
    for (let i = 0; i < $arr.length; ++i) {
      const mc = $arr[i];
      mc.addEventListener("click", cv.checkClick, false);
    }
  };
  
  

  /**
   * 전달 받은 배열 요소에 checkClick 이벤트 삭제
   * @param {Array} $arr
   */
  cv.mouseEvtRemove = function ($arr) {
    // var i;
    for (let i = 0; i < $arr.length; ++i) {
      const mc = $arr[i];
      mc.removeEventListener("click", cv.checkClick, false);
    }
  };

  /**
   * 확인 버튼 클릭 시, 호출되는 콜백 함수
   * @param {Event} e 이벤트 객체
   */
  cv.checkClick = function (e) {
    e.preventDefault();

    // 251231 확인버튼 클릭시 연습장 불투명창 / 펜,지우개 버튼 초기화
    // drawTool.resetDrawReset2();

    const mc = e.target; // 클릭 이벤트가 발생한 DOM요소

    const checkDouble = mc.parentNode.querySelectorAll(".input_group");
    keypad.hide();
    document.querySelectorAll("#container .input_group").forEach((el) => el.classList.remove("active"));

    if (checkDouble.length > 1) {
      cv.checkDoubleQuiz(mc); // 1문항에 input이 여러개일 때
    } else cv.checkSingleQuiz(mc); // 1문항에 input이 1개일 때
  };
  /**
   * 단일 입력 문항의 정답을 확인하고 처리
   * @param {HTMLElement} mc - 클릭된 확인 버튼 요소
   */
  cv.checkSingleQuiz = function (mc) {
    // const index = cv.practice_arr.indexOf(mc);
    const str = mc.parentNode.querySelector("input").value;
    const answer = cv.answerObj[cv.qIdx][0];
    let result = answer.indexOf(str) > -1 ? true : false;

    if (cv.qIdx >= cv.quizLength) {
      cv.setEndingPopup(result);
    } else {
      cv.setMiniPopup("single", result, mc, answer);

      // 퀴즈 완료 검사 후:
      if (cv.checkQuizComplete()) {
        console.log("현재 퀴즈 완료 -> 다음 버튼 활성화 필요");
        cv.mouseEvtRemove(cv.quiz_arr);

        // [수정 251111]: 현재 퀴즈의 완료 상태를 true로 저장
        cv.isQuizCompleted[cv.qIdx - 1] = true;

        // [수정 251111]: 버튼 상태 갱신 (다음 버튼 활성화)
        cv.setSectionBtnState();
      }
    }
  };

  /**
   * // NOTE: 260323 :: (중복 확인 수정본)
   * 다중 입력 문항(여러 Input)의 정답 및 중복을 확인하고 처리
   * @param {HTMLElement} mc - 클릭된 확인 버튼 요소
   */
  cv.checkDoubleQuiz = function (mc) {
    const _arr = mc.parentNode.querySelectorAll("input");
    const answerArr = cv.answerObj[cv.qIdx];
    const userInput = Array.from(_arr).map((input) => input.value); // 사용자 입력값 배열

    let isCorrect = true; // 최종 정답 여부
    let isDuplicated = false; // 입력값 자체 중복 여부

    mc.classList.add("event_none");

    // NOTE: 1. 정답 구조에 따른 검증 로직 분기

    // NOTE: A. Quiz 1처럼 다중 순서쌍이 허용된 경우 (answerArr의 첫 요소가 배열인 경우)
    if (
      answerArr.length > 0 &&
      Array.isArray(answerArr[0]) &&
      answerArr[0].length > 1
    ) {
      // 사용자의 입력(userInput)이 정답 순서쌍(answerArr) 중 하나와 정확히 일치하는지 확인
      isCorrect = answerArr.some(
        (validPair) =>
          validPair.length === userInput.length &&
          validPair.every((val, index) => val === userInput[index])
      );
    }

    // NOTE: B. Quiz 2처럼 각 Input 별 정답 배열이 설정된 경우 (기존 로직 그ㅜ대로)
    else {
      for (let i = 0; i < userInput.length; ++i) {
        const str = userInput[i];
        const correctAnswersForInput = answerArr[i] || []; // 해당 Input의 정답 배열

        if (correctAnswersForInput.indexOf(str) === -1) {
          isCorrect = false; // 오답 발생
          break;
        }
      }
    }

    // 2. 입력값 중복 확인 (모든 값이 정답이고, 중복 체크가 true일 때)
    if (isCorrect && cv.p_double_check) {
      const uniqueInputs = new Set(userInput);
      if (uniqueInputs.size !== userInput.length) {
        console.log("중복 정답 인식");
        isCorrect = false;
        isDuplicated = true;
      }
    }

    // 3. 팝업 및 완료 처리
    if (cv.qIdx >= cv.quizLength) {
      console.log(isCorrect);
      cv.setEndingPopup(isCorrect);
    } else {
      // setMiniPopup에 전달할 정답: 오답일 경우, 첫 번째 정답 쌍을 flat하게 전달
      const displayAnswer =
        answerArr[0] && Array.isArray(answerArr[0])
          ? answerArr[0]
          : answerArr.flat();

      cv.setMiniPopup("multi", isCorrect, mc, displayAnswer);

      // if (isCorrect && cv.checkQuizComplete()) {
      if (cv.checkQuizComplete()) {
        console.log("현재 퀴즈 완료 -> 다음 버튼 활성화 필요");
        cv.mouseEvtRemove(cv.quiz_arr);
        cv.isQuizCompleted[cv.qIdx - 1] = true;
        cv.setSectionBtnState();
      }
    }
  };

  /**
   * 마지막 문제 팝업 처리 함수
   * @param {*} result
   */
  cv.setEndingPopup = function (result) {

    if (result) {
      console.log("정답입니다");
      let inputArea = document.querySelectorAll(".input_group");
      for (let i = 0; i < inputArea.length; i++) {
        inputArea[i].classList.add('off');
      }
      isAudio.play(cv.isSound.correct, true);
      // externalManager.completeContents();     
      cv.getNext(); //quiz 전체문제개수(활동완료)
    } else {
      console.log("오답입니다");
      ++cv.countIncorrect;

      if (cv.countIncorrect > 1) {
        console.log("두번재오답");
        isAudio.play(cv.isSound.dragFail, true);
        // cv.failEndCheck();
        let inputArea = document.querySelectorAll(".input_group");
        for (let i = 0; i < inputArea.length; i++) {
          inputArea[i].classList.add('off');
        }       

        // 도장찍히고 다음 문제 넘어감(오답이라서 수정은 필요함)
        cv.getNext(); //quiz 전체문제개수(활동완료)
        
      } else {
        console.log("첫번재오답");
        isAudio.play(cv.isSound.dragFail, true);
        cv.failEndCheck();
      }
    }
  };

  cv.failEndCheck = function () {
    // 오답처리시 리셋
    //  active된 inputGroup이 있을 때만 active 클래스 제거 (에러 방지)
    let inputGroup = document.querySelector("#container .input_group.active");
    if (inputGroup) {
      inputGroup.classList.remove("active");
    }  

    // NOTE::  마지막 문제 재도전일 때 버튼 다시 눌리게 해야함
    const currentQuizBtn = document.querySelectorAll(
      `.check_btn.quiz_${cv.qIdx}`
    );
    currentQuizBtn.forEach((btn) => {
      btn.classList.remove("event_none");
    });

    // NOTE:: 재도전 시, input value 값 초기화
    // 페이지 이동 시 input 값 초기화
    const inputArr = document.querySelectorAll(`#quiz_ans_${cv.qIdx} input`);
    inputArr.forEach((item) => {
      item.value = "";
    });
  };

  

  


  //  textarea 예시답안 보기 함수
  cv.textarea = function(){
      const textArea = document.getElementById('textArea');
      const exampleBtn = document.getElementById('btn-example');

      let userAnswer = ""; // 사용자가 입력한 내용을 저장할 변수
      let isShowingExample = false; // 현재 예시답안 상태인지 체크

      exampleBtn.addEventListener('click', function() {
          if (!isShowingExample) {
              // 1. 예시답안을 보여주는 상태로 전환
              userAnswer = textArea.innerHTML;
              textArea.innerHTML = cv.exampleText;
              textArea.classList.add('is-example');            
              textArea.setAttribute('readonly', 'readonly'); // 예시답안일 땐 수정 방지

              this.textContent = "내 답변 보기";
              this.classList.add('active');
              isShowingExample = true;
          } else {
              // 2. 다시 사용자 답변으로 복구
              textArea.innerHTML = userAnswer;
              textArea.classList.remove('is-example');
              textArea.setAttribute('contenteditable', 'true'); // 다시 입력 가능하게

              this.textContent = "예시답안 보기";
              this.classList.remove('active');
              isShowingExample = false;
          }
      });
  };

  cv.dragContentOut = function(){
    let dragContent = cv.qIdx == 0 ? cv.dragContent1 : cv.dragContent2;
    dragContent.classList.remove("move_in");
    dragContent.classList.add("move_out");
    dragContent.classList.add("pointNone");
    // dragContent.classList.add("hidden"); //(수정:260529)
    let tid = setTimeout(() => {
      dragContent.classList.add("hidden");
    }, 1000);
    cv.timeoutList.push(tid);
  }

  cv.dragContentIn = function(){
    let dragContent = cv.qIdx == 0 ? cv.dragContent1 : cv.dragContent2;
    isAudio.play(cv.isSound.dragStart, true);
    dragContent.classList.remove("hidden");
    dragContent.classList.remove("pointNone");
    dragContent.classList.remove("move_out");
    dragContent.classList.add("move_in");
    // currentDrop.querySelectorAll(".dropItem")[cv.dropIdx].classList.remove("hidden");
  }

  cv.tabEvent = function () {
    // console.log("@tabEvent");
    let self = this;
    self.removeEventListener(isTouch.click, cv.tabEvent, false);
    self.addEventListener(isTouch.click, cv.tabEvent, false);
    // isAudio.play(cv.isSound.click, true);

    // ================================================================ //
    // ========================== 첫번째 활동 ========================== //
    if (cv.qIdx == 0) {
      self.querySelector(".ans").classList.remove("hidden");
      let checkAns = self.getAttribute("data-ans");
      if (checkAns == "true") {
        console.log("@ 정답");
        isAudio.play(cv.isSound.right, true);
        cv.tIdx++;
        cv.tabContent1.classList.add('pointNone');
        
        let tid = setTimeout(() => {
          isAudio.play(cv.isSound.effect_3, true);
          cv.quizBg1.children[1].classList.add('fade-out');
          cv.quizBg1.children[2].classList.add('right-move');
          let tid = setTimeout(() => {
            cv.nextQuiz();
          }, 2000);
          cv.timeoutList.push(tid);
        }, 1000);
        cv.timeoutList.push(tid);
        
      } else {
        console.log("@ 오답");
        isAudio.play(cv.isSound.wrong, true);
        let tid = setTimeout(() => {
          self.querySelector(".ans").classList.add("hidden");
        }, 500);
        cv.timeoutList.push(tid);
      }
    }
    // ================================================================ //
    // ========================== 두번째 활동 ========================== //
    else if (cv.qIdx == 1) {
      isAudio.play(cv.isSound.click, true);
      cv.tabContent2.classList.add('pointNone');
      self.querySelector(".glow").classList.remove("hidden");
      self.querySelector(".glow").classList.add("opacity_ani");

      // [ 활동완료 ]
      for(let i=0; i<cv.btnSection.length; i++){
        cv.btnSection[i].classList.add('pointNone');
      }
      let tid = setTimeout(() => {
        cv.onContentComplete();
      }, 1000);
      cv.timeoutList.push(tid);

      // self.parentNode.querySelector(".ans").classList.remove("hidden");
      // let checkAns = self.getAttribute("data-ans");

      // if (checkAns == "true") {
      //   console.log("@ 정답");
      //   isAudio.play(cv.isSound.right, true);
      //   // cv.tIdx++;
      //   // self.classList.add('pointNone');

      //   cv.tabContent2.classList.add("pointNone");
      //   let tid = setTimeout(() => {
      //     cv.onContentComplete();
      //   }, 1000);
      //   cv.timeoutList.push(tid);
      // } else {
      //   console.log("@ 오답");
      //   isAudio.play(cv.isSound.wrong, true);
      //   let tid = setTimeout(() => {
      //     self.parentNode.querySelector(".ans").classList.add("hidden");
      //   }, 500);
      //   cv.timeoutList.push(tid);
      // }
    }
  };

  cv.nextQuiz = function(){
    cv.qIdx = 1;
    cv.fIdx = 0;
    cv.comState1 = true;
    cv.section1.classList.add('hidden');
    cv.section2.classList.remove('hidden');
    cv.flowBtnContent(cv.qIdx, cv.userData.nowStatus);
    let tid = setTimeout(() => {
      cv.contentQuiz2();
    }, 200);
    cv.timeoutList.push(tid);
  }

  cv.onDragContent = function() {
      for(var i=0; i<cv.dropItem.length; i++) {
        cv.dropItem[i].setAttribute("data-user", 0);
        cv.dropItem[i].setAttribute("data-drop", 0);
      }

      // fnDraggable.init(cv.dragItem, cv.dropItem, cv.dragOverlap);
      //@ fnDraggable: 생성 ******************** */
        var aDraggable = new fnDraggable();

      //@ fnDraggable: 로드 ******************** */
      aDraggable.init({
          drag: cv.dragItem, 
          drop: cv.dropItem, 
          threshold: cv.dragOverlap,
          resize: null
      });  


      //@ fnDraggable: 드래그 시작 ******************** */
      aDraggable.start = function(target) {
        aDraggable.correctDrop = null; // ⭐ (수정) 260519
        ContentAudio.audio.pause();

        var inDrag = target;

        // isAudio.play(AUDIO.eff._Drag, true);

        // for (var i=0; i<cv.dragItem.length; i++) {    
        //   cv.dragItem[i].classList.add("pointNone");
        //   // cv.dragItem[i].classList.remove("zIndex");
        // }
        inDrag.classList.remove("pointNone");
        inDrag.classList.add("zIndex");
      };


      //@ fnDraggable: 드래그 활성화 ******************** */
      aDraggable.move = function (target) {
        let drag = target;
        let threshold = cv.dragOverlap;

        for (let i=0, max=cv.dropItem.length; i<max; i++) {  
          var drop = cv.dropItem[i];

          aDraggable.hitTest(drag, drop, threshold, function(result, info){
            // console.log(result, info);

            if(result === true){
              // console.log("★ result: true")
              if (drag.getAttribute("data-idx") == drop.getAttribute("data-idx") && drop.getAttribute("data-drop") != 1) {
                aDraggable.correctDrop = drop; // ⭐ (수정) 260519
                drop.setAttribute("data-user", 1);
                console.log("✅inDrop_MOVE:: ", drop)
                // break;
              }
              
            } else {
              // console.log("☆ result: false")
              drop.setAttribute("data-user", 0);
            }

          })
        }
      };

      aDraggable.end = function (drag, drop) {
        let inDrag = drag;
        // let inDrop = drop;
        // let inDataUser = (inDrop === null) ? 0 : inDrop.getAttribute("data-user");
        // ⭐ (수정) 260519
        let inDrop = aDraggable.correctDrop || null;
        let inDataUser = inDrop ? inDrop.getAttribute("data-user") : 0;

        // console.log("✅inDrop_END:: ", inDrop)
        // console.log("✅inDrop_end_DATAUSER:: ", inDataUser)

        if (inDataUser == 1) {
          console.log("@정답");
          inDrop.setAttribute("data-drop", 1);

          cv.fIdx++;
          isAudio.play(cv.isSound.right, true);

          inDrag.classList.add("hidden");
          inDrop.classList.add("hidden");
          inDrop.parentNode.querySelector('.ans').classList.remove('hidden');

          //=========================================================//
          //====================첫번째 영역일 경우====================//
          if(cv.qIdx == 0){
            console.log('fIdx_1:: ', cv.fIdx);

            if(cv.fIdx == cv.dropContent1.children.length){
              cv.dragContentOut();
              let tid = setTimeout(() => {
                // cv.onContentComplete();
                cv.nextQuiz();
              }, 1000);
              cv.timeoutList.push(tid);
            }
          }
          //=========================================================//
          //====================두번째 영역일 경우====================//
          else if(cv.qIdx == 1){
            console.log('fIdx_2:: ', cv.fIdx);

            if(cv.fIdx == 2){
              cv.dragContentOut();
              let tid = setTimeout(() => {
                // cv.dropContent2.querySelector('.quiz_2').classList.remove('hidden');
                // cv.dragContent2.querySelector('.quiz_1').classList.add('hidden');
                // cv.dragContent2.querySelector('.quiz_2').classList.remove('hidden');
                cv.dropList2[2].classList.remove('hidden');
                cv.dropList2[3].classList.remove('hidden');
                cv.dragContentIn();
              }, 1000);
              cv.timeoutList.push(tid);
            }


            if(cv.fIdx == cv.dropContent2.children.length){
              cv.dragContentOut();
              // cv.tabContent2.classList.remove('pointNone');
              // let tid = setTimeout(() => {
              //   cv.guideUpdate(2);
              // }, 1000);
              // cv.timeoutList.push(tid);
              
              // // [ 활동완료 ]
              for(let i=0; i<cv.btnSection.length; i++){
                cv.btnSection[i].classList.add('pointNone');
              }
              let tid = setTimeout(() => {
                cv.onContentComplete();
              }, 1000);
              cv.timeoutList.push(tid);
            }
          
          }

          // 아이템 다시 생김
          cv.onDraggableRelease(); 
          setTimeout(()=>{
            inDrag.classList.remove("hidden");  
            aDraggable.revert(inDrag, 0);                               
          },10);

        } else {
          aDraggable.revert(inDrag, 0.3);
          isAudio.play(cv.isSound.wrong, true);
        }

        setTimeout(function () {
          cv.onDraggableRelease();
        }, 200);
      };
    }

    /**
   * content: Draggable Release
   */
    cv.onDraggableRelease = function() {
      for (let i = 0, max = cv.dragItem.length; i < max; i++) {
        cv.dragItem[i].classList.remove("pointNone");
        cv.dragItem[i].classList.remove("zIndex");
      }
    }


  // 문제간 이동 버튼 추가
  cv.setSectionBtn = function() {        
    for(let i=0; i<cv.btnSection.length; i++){
      cv.btnSection[i].addEventListener(isTouch.click, cv.changeSection, false); 
    }
  }

  /**
   * (추가:250915) 활동 내부 이동 버튼      
   * @param {*} idx 활동 순번
   * @param {*} status 현재 메뉴의 학습 진행상태 {0:미진행, 1:진행중, 2:진행완료}     
   */
  cv.flowBtnContent = function (idx, status) {
    let inIdx = idx;
    let inStatus = status;
    // console.log(inIdx, inStatus);
    // alert(inIdx + ", " + inStatus);

    // ====================  첫번째 활동 ==================== //
    if (inIdx == 0 && ((inStatus == 1 || inStatus == 0) || cv.comState1 )) {
      console.log("✅ 0 1");
      // alert('1');
      cv.preSecBtn.classList.add("hidden");
      cv.preSecBtn.classList.remove("active");
      cv.nextSecBtn.classList.remove("hidden");
      cv.nextSecBtn.classList.remove("active");
      // cv.btnPrev.classList.add("css_block");
      cv.btnNext.classList.add("css_pointNone2");

      if(cv.comState1){
        cv.nextSecBtn.classList.add("active");
      }
    }
    if (inIdx == 0 && inStatus == 2) {
      console.log("✅ 0 2");
      // alert('2');
      cv.preSecBtn.classList.add("hidden");
      cv.preSecBtn.classList.remove("pointNone");
      cv.nextSecBtn.classList.remove("hidden");
      cv.nextSecBtn.classList.remove("pointNone");
      cv.nextSecBtn.classList.add("active");
      // cv.btnPrev.classList.add("css_block");
      cv.btnNext.classList.remove("css_pointNone2");
      cv.btnNext.classList.remove("pointNone");
    }

    // ====================  두번째 활동 ==================== //
    if (inIdx == 1 && ((inStatus == 1 || inStatus == 0) || cv.comState2)) {
      console.log("✅ 2 1");
      // alert('3');
      cv.preSecBtn.classList.remove("hidden");
      cv.preSecBtn.classList.add("active");
      cv.nextSecBtn.classList.add("hidden");
      cv.nextSecBtn.classList.remove("active");
      // cv.btnPrev.classList.add("css_block");
      cv.btnNext.classList.add("css_pointNone2");
    }
    if (inIdx == 1 && inStatus == 2) {
      console.log("✅ 2 2");
      // alert('4');
      cv.preSecBtn.classList.remove("hidden");
      cv.preSecBtn.classList.remove("pointNone");
      cv.preSecBtn.classList.add("active");
      cv.nextSecBtn.classList.add("hidden");
      // cv.btnPrev.classList.add("css_block");
      cv.btnNext.classList.add("css_block");
      cv.btnNext.classList.remove("css_pointNone2");
    }
  };


  /**
   * (추가:250915) 활동 내부 이동 버튼 :: 완료 시점      
   * @param {*} idx 활동 순번
   * @param {*} status 현재 메뉴의 학습 진행상태 {0:미진행, 1:진행중, 2:진행완료}     
   */
  cv.flowBtnComplete = function(idx, status) {
      let inIdx = idx;
      let inStatus = status;
              
      if (inIdx == 0 && inStatus == 1) {            
          cv.nextSecBtn.classList.add('active');              
      }                          
  };

  cv.reset = function(){
    cv.fIdx = 0;  
    cv.tIdx = 0;

    isAudio.audio.pause();
    ContentAudio.audio.pause();
    console.log("✅ 현재 페이지:: ", cv.fIdx);
    cv.aGuide.stop(); // 추가

    cv.dropItem.forEach(dropItem => {
      dropItem.setAttribute('data-drop','0');
      dropItem.classList.remove('hidden');
    });
    document.querySelectorAll('#drop_content .ans').forEach(el => el.classList.add('hidden'));
    
    cv.dragContent1.className = 'pointNone2 pointNone hidden';
    cv.dragContent2.className = 'pointNone2 pointNone hidden';

    // cv.tab_content.classList.remove('pointNone');
    // cv.tab.forEach(tab => {
    //   tab.classList.remove('pointNone');
    // });

    //guide
    const guide = document.querySelector('#guide1');
    guide.style.cssText = `z-index: 50; opacity: 0; pointer-events: none; position: absolute;`;                      

    // section 전환 시 모두 정리
    clearAllTimeouts();
    function clearAllTimeouts() {
        console.log('timeoutList:: ' ,cv.timeoutList);
        cv.timeoutList.forEach(id => clearTimeout(id));
        cv.timeoutList = []; // 비우기
    };

    // section1
    // for(let i=0; i<cv.quizBg1.children.length; i++){
    //   // cv.quizBg1.children[i].classList.add('hidden');
    //   cv.quizBg1.children[i].className = 'hidden'
    // }
    // cv.quizBg1.children[3].classList.remove('hidden');
    // cv.tabContent1.classList.add('pointNone')
    // for(let i=0; i<cv.tab1.length; i++){
    //   cv.tab1[i].querySelector('.ans').classList.add('hidden');
    // }

    // section2
    cv.dropList2[2].classList.add('hidden');
    cv.dropList2[3].classList.add('hidden');
    // cv.tabContent2.classList.add('pointNone');
    // cv.dragContent2.querySelector('.quiz_1').classList.remove('hidden');
    // cv.dragContent2.querySelector('.quiz_2').classList.add('hidden');
    // cv.dropContent2.querySelector('.quiz_1').classList.remove('hidden');
    // cv.dropContent2.querySelector('.quiz_2').classList.add('hidden');
    // cv.tab2[0].querySelector('.glow').classList.add('hidden');
    // cv.tab2[0].querySelector('.glow').classList.remove('opacity_ani');
  }


  cv.changeSection = function() {
    console.log('@changeSection');
      
    let self = this;
    self.removeEventListener(isTouch.click, cv.changeSection, false);  
    self.addEventListener(isTouch.click, cv.changeSection, false);    

    cv.reset();

    let id = self.getAttribute('id');

    //이전버튼 눌렀을 시 (quiz2 -> quiz1) & reset
    if(id == 'preSecBtn' && cv.qIdx == 1){
      console.log('@이전버튼: quiz2 -> quiz1');
      cv.qIdx = 0;
      let section = document.querySelectorAll('.section');
      section[0].classList.remove('hidden');
      section[1].classList.add('hidden');
      cv.contentQuiz1();
    }
    //이후버튼 눌렀을 시 (quiz1 -> quiz2)
    else if(id == 'nextSecBtn' && cv.qIdx == 0){
      console.log('@이후버튼: quiz1 -> quiz2');
      cv.qIdx = 1;
      let section = document.querySelectorAll('.section');
      section[0].classList.add('hidden');
      section[1].classList.remove('hidden');
      cv.contentQuiz2();
    } 

    cv.flowBtnContent(cv.qIdx, cv.userData.nowStatus);
  }

  //==========================================================================
  //==========================================================================
  /**
   * {공통} prev, next
   * 버튼 설정
   */
  cv.setBtnContent = function() {                  
        let inIdx = 4;         
        if (cv.userData.load === true) return;                

        cv.btnNext.classList.add("css_pointNone2"); 
        cv.btnPrev.addEventListener(isTouch.click, cv.onPrevContent, false);                
        cv.btnNext.addEventListener(isTouch.click, cv.onNextContent, false);                    
        
        setTimeout(() => { 
            console.log("@ 콘텐츠 로드");
            try {
                cv.userData.nowStatus = window.HybridApp.getNowStatus(); //현재 메뉴의 학습 진행상태 {0:미진행, 1:진행중, 2:진행완료}
                cv.userData.menuIndex = window.HybridApp.getMenuIndex(); //현재 메뉴 순번
                cv.userData.menuCount = window.HybridApp.getMenuCount(); //전체 메뉴 개수
                console.log("@ 진행 ", cv.userData.nowStatus, cv.userData.menuIndex, cv.userData.menuCount);                   
                
                if (cv.userData.nowStatus == 2) {
                    for(let i=0; i<cv.btnSection.length; i++){ //추가::250716
                        cv.btnSection[i].classList.remove('hidden'); 
                    }         
                    cv.nextSecBtn.classList.remove('hidden'); 
                    cv.nextSecBtn.classList.add('active');
                    cv.flowBtnContent(cv.fIdx, cv.userData.nowStatus); 
                } 
                else {  
                    cv.flowBtnContent(cv.fIdx, cv.userData.nowStatus); //추가::250915
                }                                   
            } 
            catch (error) {
                console.log(error);   
                cv.flowBtnContent(cv.fIdx, 1);
                // cv.flowBtnContent(cv.fIdx, 2);
            }  
            
            cv.userData.load = true;                 

        }, 500);
        
    }; 

  /**
   * {공통} 콘텐츠 완료
   */
  cv.onContentComplete = function () {
    console.log("@ 콘텐츠 완료 & next 버튼 활성화");

    try {
      externalManager.completeContents(); //학습완료
    } catch (error) {
      console.log(error);
    }

    let btn = "./sound/end";
    ContentAudio.play(btn);

    isAudio.play(btn, true);

    cv.preSecBtn.classList.add('pointNone');
    cv.preSecBtn.classList.remove('active');

    cv.btnNext.classList.add("css_block");
    cv.btnNext.classList.remove("pointNone");

    cv.btnNext.classList.remove("css_pointNone2");
    document.querySelector('.next_line').classList.add("Chapterblink");

    // cv.btnNext.querySelector(".elBtn2").classList.add("css_blink");
  };

  /**
   * {공통} 이전 메뉴 이동
   */
  cv.onPrevContent = function () {
    let self = this;
    self.removeEventListener(isTouch.click, cv.onPrevContent, false);
    self.addEventListener(isTouch.click, cv.onPrevContent, false);

    // cv.btnPrev.classList.add("css_pointNone");
    cv.btnNext.classList.add("css_pointNone");

    try {
      window.HybridApp.setMenu(cv.userData.menuIndex - 1); //메뉴 이동
    } catch (error) {
      console.log(error);
    }

    // 0: 인트로
    // 1: 복습퀴즈
    // 2: 교과서 맛보기
    // 3: 교과서 익히기
    // 4: 교과서 활동
    // 5: 한눈에 정리하기
  };

  /**
   * {공통} 다음 메뉴 이동
   */
  cv.onNextContent = function () {
    let self = this;
    self.removeEventListener(isTouch.click, cv.onNextContent, false);
    self.addEventListener(isTouch.click, cv.onNextContent, false);

    // cv.btnPrev.classList.add("css_pointNone");
    // cv.btnNext.querySelector(".elBtn2").classList.remove("css_blink");

    try {
      externalManager.completeContents(); //학습완료
      externalManager.nextMenu(); //다음 메뉴 이동
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * {공통} quiz 시작 시점
   * callback
   */
  cv.onMainBundleStart = function () {};

  //************************************************************************ */
  //************************************************************************ */

  /**
   * get index
   * @param {*} list
   * @param {*} obj
   */
  cv.getIndex = function (list, obj) {
    let lis = list;
    for (let i = 0, len = lis.length; i < len; i++) {
      if (obj === lis[i]) return i;
    }
  };

  /**
   * audio : bgm
   */
  cv.bgmSound = function () {
    cv.bgmAudio = null;
    cv.bgmAudio = new Audio();
    cv.bgmAudio.id = "bgmAudio";
    cv.bgmAudio.src = "./audio/bgm.mp3";
    cv.bgmAudio.volume = 0.8;
    cv.bgmAudio.load();
    cv.bgmAudio.loop = true;
    // cv.bgmAudio.play();
  };

  /**
   * stopContentSound
   */
  cv.stopContentSound = function () {
    ContentAudio.begin = undefined;
    ContentAudio.dur = undefined;
    ContentAudio.end = undefined;
    ContentAudio.cnt_obj = undefined;
    ContentAudio.cnt = 0;
    ContentAudio.midx = 0;
    ContentAudio.audio.pause();
  };

  /**
   * stopTimeReander
   */
  cv.stopTimeReander = function () {
    window.cancelAnimationFrame(timeReander.timeRid);
    timeReander.delay = undefined;
    timeReander.begin = undefined;
    timeReander.end = undefined;
    timeReander.timeIdx = 0;
    timeReander.timeRid = null;
  };

  /*
   * HTML5 플레이어 deactive 상태 호출 : Pause
   */
  // window.onPauseContents = function () {
  //     try {
  //         if (cv.bgmAudio.paused === false) cv.bgmAudio.pause();
  //         if (ContentAudio.audio.paused === true) {
  //             ContentAudio.audio.pause();
  //             cv.externalPath = ContentAudio.audio.src;
  //             cv.externalTime = ContentAudio.audio.currentTime;
  //         }
  //     } catch (error) {
  //         console.log(error);
  //     }
  // };

  /*
   * HTML5 플레이어 active 상태 호출 : Resume
   */
  // window.onResumeContents = function () {
  //     try {
  //         if (cv.bgmAudio.paused === true) cv.bgmAudio.play();
  //         if (ContentAudio.audio.paused === true && cv.externalPath !== null) {
  //             ContentAudio.audio.src = cv.externalPath;
  //             ContentAudio.audio.currentTime = cv.externalTime;
  //             ContentAudio.audio.play();
  //             cv.externalPath = null;
  //             cv.externalTime = null;
  //         }
  //     } catch (error) {
  //         console.log(error);
  //     }
  // };
}

/*
 * New fnContent
 */
var fnContent = new fnContent();
fnContent.init();
