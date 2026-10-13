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
  // TEST 캡쳐연습
  this.btnCapture = document.querySelector('.btnCapture');
  this.paintingContainer = document.querySelector("#painting_container");   
  this.drawingBoard = document.querySelector("#drawing_board");
  this.drawingBoard2 = document.querySelector("#drawing_board2");   
  this.portfolioContent = document.querySelector("#portfolio_content");  
  this.pictureImg = document.querySelector("#pictureImg");
  this.portfolioImg = document.querySelector("#portfolioImg");            
  this.portfolioImg2 = document.querySelector("#portfolioImg2");      
  this.step3 = document.querySelector('.step3');


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

  // TEST 공부중
  this.userData = {
    device: null,
    complete: false,
    keyboard: false,
    str: undefined,
    id: undefined,
    inName: undefined,
    outName: undefined,
    canvasRep: undefined,
    canvasImg: [],
    text: null,
    format: ".jpg",
    textLen: 0,
    grade: 0,
    globalAlpha: 0.08

  }

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
      
      cv.bgmAudio.volume = 0;
      ContentAudio.audio.volume = 0.5;
      isAudio.audio.volume = 0.5;


      // 260902 : TEST API 연습
      cv.onDeviceAgent() //디바이스 확인
      cv.userIntentContent(); // 밀크T 사용자 getIntentData 체크
      
      

    }
  };

  //==========================================================================
  //==========================================================================

  /*
  * 디바이스 확인 
  * sm-610, sm-p580, sm-p600
  */
  cv.onDeviceAgent = function() {
    let deviceUserAgent = navigator.userAgent.toLowerCase();
    if(deviceUserAgent.includes('sm-p610')) {
      cv.userData.device = "sm-p610";
    } else if(deviceUserAgent.includes('sm-p580')) {
      cv.userData.device = "sm-p580";
    } else if(deviceUserAgent.includes('sm-p600')) {
      cv.userData.device = "sm-p600";
    } else {
      cv.userData.device= "pc";
    }
    console.log(cv.userData.device);
  }

  /**     
     * 밀크T 사용자 getIntentData 체크
     */
    cv.userIntentContent = function() {                   
      let inUserStr = null;
      let inSplitSysUserID = null;
      let inSplitUserGrade = null;        
      
      if (cv.userData.device == "pc") {
            inUserStr = "id=webdevj4&mCode=T0NE90U26001&zipPath=http://cdata.hbstudy.co.kr/hbstudy/flash/Event/240416/T0NE90U26001_240404_1631.zip&createdDate=2024/04/04/16/31/00&optionPath=http://cdata.hbstudy.co.kr/hbstudy/flash/MultiPlayer/default_option.xml&test=T&dictionary=&movieControl=auto&swfControl=auto&edubase=N&testStudy=N&similar=N&similarStudy=N&challenge=N&challengeStudy=N&strSysUserID=f453b348-5123-48d0-ab20-9ae6d66ff69d&sttType=&sttModel=&userGrade=4";                                        
      } else {
          inUserStr = window.HybridApp.getIntentData(); 
      }                
      // console.log(inUserStr);   

      setTimeout(() => { 
          inSplitSysUserID = inUserStr.split("&strSysUserID=", 2);                 
          inSplitUserGrade = inSplitSysUserID[1].split("&userGrade=", 2);                         
          // console.log(inSplitSysUserID);               
          // console.log(inSplitUserGrade);
                                    
          setTimeout(function() {  
            cv.userData.id = inSplitSysUserID[1].substring(0, inSplitSysUserID[1].indexOf('&sttType'));                                 
            cv.userData.grade = inSplitUserGrade[1];
            cv.userData.name = cv.userData.id[1]; 
            console.log("[inStr]:", inUserStr); // 전체 정보                  
            console.log("[userGrade]:", cv.userData.grade); // 학년                
            console.log("[strSysUserID]:", cv.userData.id); // User ID
          }, 100);
      }, 200);                                              
    };


    // 캡쳐할때 실행 함수 :: 앱이 화면캡쳐요청
    cv.onCaptureHtml = function() { 

      try {                                                
          window.HybridApp.capture("onCaptureBase64");
      } 
      catch (error) {
          console.log(error);
      }        
    }; 


    // 앱이 화면을 캡처하여 Base64 텍스트로 변환 후 웹으로 전달    
    window.onCaptureBase64 = function(outdata) {                 
      let outSaveName = cv.userData.id + ".jpg";
      let outStrRep = outdata;
      console.log(outSaveName);
      /**            
       * Base64로 인코딩 된 이미지 데이터를 지정된 이미지 파일로 변환
       * saveBase64ImgToPng(strFile, strBase64)
       *  strFile: 이미지 파일명(String)
       *  strBase64: Base64 인코딩 이미지 데이터 String)
       */        
      try {                                                
        // Base64 데이터를 로컬파일 .jpg로 저장
          window.HybridApp.saveBase64ImgToPng(outSaveName, outStrRep);
          window.HybridApp.onImageSaved = cv.onImageSaveComplete;
          // onImageSaved : 저장한 이미지 파일이 위치한 디바이스 경로
      } 
      catch (error) {
          console.log(error);
      }                                 
    }; 

     /**
     * onImageSaved callback     
     * @param {*} strAbsolutePath 저장된 이미지 파일 경로 + 파일명(저장한 이미지 파일이 위치한 디바이스 경로)
     */
    // 태블릿 저장소에 생성된 이미지 파일을 앱의 업로드 API를 통해 지정도니 서버로 전송하는 단계 
    // (업로드 요청)
    cv.onImageSaveComplete = function(strAbsolutePath) {   
        let inStrAbsolutePath = strAbsolutePath;   
        
        /**
         * (변경) 이미지 업로드 API 호출 (v1.1.22 추가)
         * localPath = 디바이스에 저장된 이미지 전체 경로(strAbsolutePath) 
         * * strAbsolutePath --> ex) /storage/emulated/0/CJHP_DATA/파일명/MENU_01/파일명.jpg
         * uploadPath = 업로드할 서버 경로, 파일명 불필요         
         * /Files_Event/Event20240416/usergrade/strSysUserID
         */         
        
        
        let inUploadPath = "/Files_Event/Event20240416/" + cv.userData.grade + "/" + cv.userData.id;
        // console.log(inUploadPath);    
        
        window.HybridApp.uploadImgPath(inStrAbsolutePath, inUploadPath);        
        window.HybridApp.uploadResult = cv.onUploadImgResult;                   
    };
    
    /**
     * 업로드 결과 전달
     * @param {*} int (0:성공, 1:실패)  
     */   
    cv.onUploadImgResult = function(int) {  
        let inInt = int;         
        console.log("@ upload result: " + inInt);                 
        setTimeout(function() {
            cv.onCloseContents();
        }, 300);
    };   
    
    


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
  }

  cv.contentQuiz2 = function(){

    cv.dragContentIn();
    let tid = setTimeout(() => {
      cv.guideUpdate(1);
    }, 500);
    cv.timeoutList.push(tid);

    
  }

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
