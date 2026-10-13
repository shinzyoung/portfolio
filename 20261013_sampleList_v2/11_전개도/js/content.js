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

  // 전개도 content 
  this.wIdx = 0; //오답수
  this.controls = document.querySelector('#controls');
  this.btnBoard = document.querySelector('#btn_board');
  this.ansGuide = document.querySelector('#ansGuide');
  

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

   // 전개도
    this.removeBtn = false;
    this.canDraw = true;

  


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

      // 전개도 호출
      cv.controls.classList.remove('pointNone');
      cv.btnBoard.classList.remove('pointNone');
      cv.deployment(); //전개도 관련 함수호출
      
      cv.bgmAudio.volume = 0;
      ContentAudio.audio.volume = 0.5;
      isAudio.audio.volume = 0.5;

    }
  };

  //==========================================================================
  //==========================================================================
  // 전개도 관련
  // 전개도 오답시 정답 노출 deployment 
    cv.deployment = function () {
        
        // --- 기본 설정 ---      
        var WIDTH = 536;
        var HEIGHT = 396;
        var CANVAS_COLS = 19;
        var CANVAS_ROWS = 14;
        var GRID_SIZE_X = WIDTH / CANVAS_COLS;
        var GRID_SIZE_Y = HEIGHT / CANVAS_ROWS;

        // --- 캔버스 세팅 ---
        var container = document.getElementById('canvas-container');
        var backgroundCanvas = document.getElementById('backgroundCanvas');
        var drawingCanvas = document.getElementById('drawingCanvas');

        backgroundCanvas.width = WIDTH;
        backgroundCanvas.height = HEIGHT;
        drawingCanvas.width = WIDTH;
        drawingCanvas.height = HEIGHT;

        var bgCtx = backgroundCanvas.getContext('2d');
        var drawCtx = drawingCanvas.getContext('2d');

        console.log('Canvas initialized');

        // --- 상태값 ---
        var isDrawing = false;
        var startPoint = null;
        var currentEndPoint = null;
        var lineType = 'solid';
        var drawnLines = [];

        // --- 버튼 요소 ---
        var solidBtn = document.getElementById('solidBtn');
        var dashedBtn = document.getElementById('dashedBtn');
        var resetBtn = document.getElementById('resetBtn');
        var checkBtn = document.getElementById('checkBtn'); //  정답 확인 버튼
        var showAnswerBtn = document.getElementById('showAnswerBtn'); //  정답 확인 버튼

        //  ==================== 정답 데이터 ====================
        //  2. 정답 데이터 수정 (ansImg1, ansImg2 기준)
        var correctAnswers = [
            // 정답 케이스 1 (ansImg1)     
            {
            "name": "정답 케이스1",
            "lines": [
                {"startX": 310, "startY": 141, "endX": 310, "endY": 255, "type": "dashed"},
                {"startX": 310, "startY": 141, "endX": 423, "endY": 141, "type": "dashed"},
                {"startX": 423, "startY": 141, "endX": 423, "endY": 255, "type": "solid"},
                {"startX": 310, "startY": 255, "endX": 423, "endY": 255, "type": "solid"},
                {"startX": 226, "startY": 255, "endX": 310, "endY": 368, "type": "solid"},
                {"startX": 310, "startY": 255, "endX": 310, "endY": 368, "type": "solid"},
                {"startX": 310, "startY": 141, "endX": 310, "endY": 57, "type": "solid"},
                {"startX": 310, "startY": 57, "endX": 423, "endY": 141, "type": "solid"}
            ]
            },
            {
            "name": "정답 케이스2",
            "lines": [
                {"startX": 310, "startY": 141, "endX": 310, "endY": 255, "type": "solid"},
                {"startX": 310, "startY": 255, "endX": 310, "endY": 368, "type": "dashed"},
                {"startX": 226, "startY": 255, "endX": 310, "endY": 368, "type": "solid"},
                {"startX": 310, "startY": 255, "endX": 423, "endY": 255, "type": "solid"},
                {"startX": 310, "startY": 368, "endX": 423, "endY": 368, "type": "solid"},
                {"startX": 423, "startY": 255, "endX": 423, "endY": 368, "type": "dashed"},
                {"startX": 423, "startY": 255, "endX": 508, "endY": 255, "type": "solid"},
                {"startX": 508, "startY": 255, "endX": 423, "endY": 368, "type": "solid"}
            ]
            }
        ];

        // 오답 3번 이상일 경우
        var correctAnswers2 = [
            // 정답 케이스 1 (ansImg1)     
            {
            "name": "정답 케이스1",
            "lines": [
                {"startX": 310, "startY": 141, "endX": 423, "endY": 141, "type": "dashed"},
                {"startX": 423, "startY": 141, "endX": 423, "endY": 255, "type": "solid"},
                {"startX": 310, "startY": 255, "endX": 423, "endY": 255, "type": "solid"},
                {"startX": 310, "startY": 141, "endX": 310, "endY": 57, "type": "solid"},
                {"startX": 310, "startY": 57, "endX": 423, "endY": 141, "type": "solid"}
            ]
            },
        ];


        // 문제 입력 , 문제 영역좌표
        function drawQuestionShape() {
            bgCtx.strokeStyle = 'black';
            bgCtx.lineWidth = 2;

            // 문제 전개도 (예시)
            const questionLines = [
                // 실선
                { x1: 71, y1: 119, x2: 190, y2: 119, solid: false },
                { x1: 71, y1: 119, x2: 71, y2: 214, solid: false },
                { x1: 71, y1: 214, x2: 190, y2: 214, solid: false },
                { x1: 190, y1: 119, x2: 190, y2: 214, dashed: true },
                { x1: 190, y1: 119, x2: 261, y2: 119, solid: false },
                { x1: 190, y1: 214, x2: 261, y2: 214, dashed: true },
            ];

            questionLines.forEach(line => {
                if (line.dashed) {
                    // bgCtx.setLineDash([5, 5]);
                    bgCtx.setLineDash([8, 3]);
                } else {
                    bgCtx.setLineDash([]);
                }

                bgCtx.beginPath();
                bgCtx.moveTo(line.x1, line.y1);
                bgCtx.lineTo(line.x2, line.y2);
                bgCtx.stroke();
            });

            bgCtx.setLineDash([]);
            console.log("문제 전개도 라인 표시 완료");
        }


        //  오차 허용 범위 (픽셀)
        var TOLERANCE = 20; // 20픽셀 이내면 정답으로 인정

        //  ==================== 좌표 계산 ====================
        function getEventCoordinates(e) {
            var rect = drawingCanvas.getBoundingClientRect();
            var clientX, clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            var scaleX = drawingCanvas.width / rect.width;
            var scaleY = drawingCanvas.height / rect.height;

            var x = (clientX - rect.left) * scaleX;
            var y = (clientY - rect.top) * scaleY;

            return { x: x, y: y };
        }

        // --- 배경 격자 그리기 ---
        function drawBackground() {
            bgCtx.clearRect(0, 0, WIDTH, HEIGHT);
            bgCtx.strokeStyle = '#aae0f2';
            // bgCtx.strokeStyle = 'lightblue';
            // bgCtx.strokeStyle = 'transparent'; //투명 전개도
            bgCtx.lineWidth = 1;
            bgCtx.setLineDash([2, 2]);

            for (var i = 0; i <= CANVAS_COLS; i++) {
                bgCtx.beginPath();
                bgCtx.moveTo(i * GRID_SIZE_X, 0);
                bgCtx.lineTo(i * GRID_SIZE_X, HEIGHT);
                bgCtx.stroke();
            }
            
            for (var j = 0; j <= CANVAS_ROWS; j++) {
                bgCtx.beginPath();
                bgCtx.moveTo(0, j * GRID_SIZE_Y);
                bgCtx.lineTo(WIDTH, j * GRID_SIZE_Y);
                bgCtx.stroke();
            }

            bgCtx.setLineDash([]);
        }

        // --- 가장 가까운 격자점 ---
        function getClosestGridPoint(x, y) {
            var gridX = Math.round(x / GRID_SIZE_X) * GRID_SIZE_X;
            var gridY = Math.round(y / GRID_SIZE_Y) * GRID_SIZE_Y;
            
            if (gridX < 0 || gridX > WIDTH || gridY < 0 || gridY > HEIGHT) {
                return null;
            }
            return { x: gridX, y: gridY };
        }

        //  ==================== 선 중복 제거 (같은 위치에 다른 타입 선 그리기) ====================
        function removeDuplicateLine(newLine) {
            for (var i = drawnLines.length - 1; i >= 0; i--) {
                var existingLine = drawnLines[i];
                
                // 같은 위치의 선인지 확인 (시작점과 끝점이 같거나 반대 방향)
                var sameDirection = 
                    existingLine.startX === newLine.startX &&
                    existingLine.startY === newLine.startY &&
                    existingLine.endX === newLine.endX &&
                    existingLine.endY === newLine.endY;
                    
                var reverseDirection = 
                    existingLine.startX === newLine.endX &&
                    existingLine.startY === newLine.endY &&
                    existingLine.endX === newLine.startX &&
                    existingLine.endY === newLine.startY;
                
                if (sameDirection || reverseDirection) {
                    console.log('기존 선 제거:', existingLine);
                    drawnLines.splice(i, 1);
                }
            }
        }

        // --- 모든 선 다시 그리기 ---
        function redrawUserLines() {
            // console.log('@redrawUserLines');
            drawCtx.clearRect(0, 0, WIDTH, HEIGHT);
            drawCtx.globalAlpha = 1.0;
            
            console.log('Redrawing', drawnLines.length, 'lines');
            
            for (var i = 0; i < drawnLines.length; i++) {
                var line = drawnLines[i];
                
                drawCtx.strokeStyle = '#007eff';
                drawCtx.lineWidth = 3;
                drawCtx.lineCap = 'round';
                
                if (line.type === 'dashed') {
                    drawCtx.setLineDash([5, 5]);
                } else {
                    drawCtx.setLineDash([]);
                }
                
                drawCtx.beginPath();
                drawCtx.moveTo(line.startX, line.startY);
                drawCtx.lineTo(line.endX, line.endY);
                drawCtx.stroke();
            }
            
            drawCtx.setLineDash([]);
        }

        // --- 미리보기 선 ---
        function drawPreviewLine(x1, y1, x2, y2) {
            redrawUserLines();
            
            drawCtx.strokeStyle = 'rgba(80, 120, 255, 0.5)';
            drawCtx.lineWidth = 3;
            drawCtx.lineCap = 'round';
            
            if (lineType === 'dashed') {
                drawCtx.setLineDash([5, 5]);
            } else {
                drawCtx.setLineDash([]);
            }
            
            drawCtx.beginPath();
            drawCtx.moveTo(x1, y1);
            drawCtx.lineTo(x2, y2);
            drawCtx.stroke();
            
            drawCtx.setLineDash([]);
        }

        //  ==================== 정답 체크 함수 ====================
        function checkAnswer() {
            console.log('==================== 정답 확인 시작 ====================');
            console.log('그린 선 개수:', drawnLines.length);
            
            // 경우의 수별로 체크:: 수정_251127
            if(cv.wIdx < 3){
                for (var caseIdx = 0; caseIdx < correctAnswers.length; caseIdx++) {
                    var answerCase = correctAnswers[caseIdx];
                    console.log('체크 중:', answerCase.name);
                    
                    if (compareLines(drawnLines, answerCase.lines)) {
                        console.log('정답!', answerCase.name);
                        showCorrectFeedback();
                        return true;
                    }
                }
            } else {
                for (var caseIdx = 0; caseIdx < correctAnswers2.length; caseIdx++) {
                    var answerCase = correctAnswers2[caseIdx];
                    console.log('체크 중:', answerCase.name);
                    
                    if (compareLines(drawnLines, answerCase.lines)) {
                        console.log('정답!', answerCase.name);
                        showCorrectFeedback();
                        return true;
                    }
                }
            }
            
            console.log('오답');
            isAudio.play(cv.isSound.wrong, true); // 오답 효과음
            // 추가:: 251104 ================ //
            drawnLines = [];
            
            drawCtx.clearRect(0, 0, WIDTH, HEIGHT);
            console.log('Reset');

            cv.wIdx ++;
            console.log('wIdx:: ', cv.wIdx);

            if(cv.wIdx == 3){
                cv.ansGuide.classList.remove('hidden');
                cv.ansGuide.classList.add('fade-in');
                // cv.ansGuide.classList.add('guide_fade_ani');
                // setTimeout(() => {
                //     cv.ansGuide.classList.add('hidden');
                //     cv.ansGuide.classList.remove('guide_fade_ani');
                // }, 2000);
            }
            // ============================= //
            return false;
        }
        
        
        // =================== 정답 보기 함수 ====================
        function showAnswer() {
            isAudio.play(cv.isSound.click, true);
            console.log('======= 정답 유형보기 ========');
            cv.answerBox.classList.remove('hidden');

            cv.closeBtn.addEventListener(isTouch.click, function() {
            cv.answerBox.classList.add('hidden');
            }, false);
            
        }

        
        //  두 선이 같은지 비교 (오차 허용)
        function isSameLine(line1, line2, tolerance) {
            // 같은 방향
            var sameDirection = 
                Math.abs(line1.startX - line2.startX) <= tolerance &&
                Math.abs(line1.startY - line2.startY) <= tolerance &&
                Math.abs(line1.endX - line2.endX) <= tolerance &&
                Math.abs(line1.endY - line2.endY) <= tolerance &&
                line1.type === line2.type;
            
            // 반대 방향
            var reverseDirection = 
                Math.abs(line1.startX - line2.endX) <= tolerance &&
                Math.abs(line1.startY - line2.endY) <= tolerance &&
                Math.abs(line1.endX - line2.startX) <= tolerance &&
                Math.abs(line1.endY - line2.startY) <= tolerance &&
                line1.type === line2.type;
            
            return sameDirection || reverseDirection;
        }

        //  선 목록 비교
        function compareLines(userLines, correctLines) {
            // 개수가 다르면 오답
            if (userLines.length !== correctLines.length) {
                console.log('선 개수 불일치:', userLines.length, '!==', correctLines.length);
                return false;
            }
            
            // 정답의 각 선에 대해 사용자가 그은 선 중 매칭되는 것이 있는지 확인
            var matched = [];
            
            for (var i = 0; i < correctLines.length; i++) {
                var found = false;
                
                for (var j = 0; j < userLines.length; j++) {
                    if (matched.indexOf(j) !== -1) continue; // 이미 매칭된 선은 스킵
                    
                    if (isSameLine(userLines[j], correctLines[i], TOLERANCE)) {
                        matched.push(j);
                        found = true;
                        console.log('매칭 성공:', i, '-', j);
                        break;
                    }
                }
                
                if (!found) {
                    console.log('매칭 실패: 정답 선', i, '에 해당하는 선을 찾지 못함');
                    return false;
                }
            }
            
            return true;
        }

        //  정답 피드백
        function showCorrectFeedback() {
            // alert('정답입니다!');
            isAudio.play(cv.isSound.correct, true); // 정답 효과음
            console.log('정답 효과음 재생');

            //pointNone
            let canvas = document.querySelector('#drawingCanvas');
            canvas.classList.add('pointNone');
            cv.btnBoard.classList.add('pointNone');
            cv.controls.classList.add('pointNone');
            // cv.hintBtn.classList.add('pointNone');

            // setTimeout(() => {
            //     isAudio.play(cv.isSound.stamp, true);
            //     fnLottieAnimation.start(lottie_stamp, "labels", 1, true, 1);

            //     // let stamp = document.querySelector('#stamp');
            //     // stamp.classList.remove('hidden');
            //     // stamp.classList.add('stamp');
            //     setTimeout(() => {
            //         cv.flowBtnComplete(cv.fIdx, cv.userData.nowStatus); //추가::250915
            //         if(cv.fIdx == 1) cv.onContentComplete(); //@ {공통:미디어} 콘텐츠 완료
            //     }, 500);
            // }, 1000);
            setTimeout(() => {
                cv.flowBtnComplete(cv.fIdx, cv.userData.nowStatus); //추가::250915
                cv.onContentComplete();
                // if(cv.fIdx == 1) cv.onContentComplete(); //@ {공통:미디어} 콘텐츠 완료
            }, 1000);
        }

        

        // --- 이벤트 핸들러 ---
        function handleStart(e) {
            
            console.log('removeBtn:: ', cv.removeMode);
            console.log('canDraw:: ', cv.canDraw);

            if(cv.removeMode || !cv.canDraw) return; //추가::251127

            e.preventDefault();

            document.addEventListener('mousemove', handleMove, false);
            document.addEventListener('touchmove', handleMove, false);
            document.addEventListener('mouseup', handleEnd, false);
            document.addEventListener('touchend', handleEnd, false);

            var coords = getEventCoordinates(e);
            startPoint = getClosestGridPoint(coords.x, coords.y);
            isDrawing = !!startPoint;
            
            console.log('Start:', startPoint);
        }

        function handleMove(e) {

            if (!isDrawing || !startPoint) return;
            if(cv.removeMode || !cv.canDraw) return; //추가::251127

            e.preventDefault();
            
            var coords = getEventCoordinates(e);
            var currentPoint = getClosestGridPoint(coords.x, coords.y);
            
            if (currentPoint) {
                currentEndPoint = currentPoint;
                drawPreviewLine(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);
            }
        }

        function handleEnd(e) {

            if(cv.removeMode || !cv.canDraw) return; //추가::251127

            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchend', handleEnd);

            if (!isDrawing || !startPoint) {
                isDrawing = false;
                startPoint = null;
                return;
            }

            var coords = getEventCoordinates(e);
            var endPoint = getClosestGridPoint(coords.x, coords.y);
            isDrawing = false;

            console.log('End:', endPoint);

            if (endPoint && (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y)) {
                var newLine = {
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: endPoint.x,
                    endY: endPoint.y,
                    type: lineType
                };
                
                //  중복 선 제거 (같은 위치에 다른 타입 선 그리기)
                removeDuplicateLine(newLine);
                
                drawnLines.push(newLine);
                console.log('Line saved. Total:', drawnLines.length);
            }

            startPoint = null;
            redrawUserLines();
        }

        // --- 이벤트 등록 ---
        drawingCanvas.addEventListener('mousedown', handleStart, false);
        drawingCanvas.addEventListener('touchstart', handleStart, false);

        drawingCanvas.addEventListener('mouseleave', function() {
            if (isDrawing) {
                isDrawing = false;
                startPoint = null;
                redrawUserLines();
            }
        }, false);
        
        solidBtn.addEventListener(isTouch.click, function() {
            addBtnPointNone();
            lineType = 'solid';
            solidBtn.className = 'active';
            dashedBtn.className = '';
            removeBtn.className = '';
            isAudio.play(cv.isSound.click, true);
            
            cv.removeMode = false;
            cv.canDraw = true;
        }, false);

        dashedBtn.addEventListener(isTouch.click, function() {
            addBtnPointNone();
            lineType = 'dashed';
            dashedBtn.className = 'active';
            solidBtn.className = '';
            removeBtn.className = '';
            isAudio.play(cv.isSound.click, true);

            cv.removeMode = false;
            cv.canDraw = true;
        }, false);

        removeBtn.addEventListener(isTouch.click, function(){
            // console.log('=======지우개모드 시작========');
            addBtnPointNone();
            isAudio.play(cv.isSound.click, true);
            cv.removeMode = true;
            cv.canDraw = false;
            solidBtn.className = '';
            dashedBtn.className = '';
            removeBtn.classList.add('active');
        });

        function addBtnPointNone (){
            let board = document.querySelector('#btn_board');
            board.classList.add('pointNone');
            setTimeout(() => {
                board.classList.remove('pointNone');
            }, 1000);
        }

        // 선 클릭 감지
        // --- 이벤트 등록 ---
        drawingCanvas.addEventListener('mousedown', removeLine, false);
        drawingCanvas.addEventListener('touchstart', removeLine, false);

        function removeLine (e){
            
            console.log('삭제 선 클릭');
            e.preventDefault();
            if(!cv.removeMode) return;

            const rect = drawingCanvas.getBoundingClientRect();
            const scaleX = drawingCanvas.width / rect.width;
            const scaleY = drawingCanvas.height / rect.height;

            let clientX, clientY;
            let x, y;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;

                x = (e.touches[0].clientX - rect.left) * scaleX;
                y = (e.touches[0].clientY - rect.top) * scaleY;

            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;

                x = (e.changedTouches[0].clientX - rect.left) * scaleX;
                y = (e.changedTouches[0].clientY - rect.top) * scaleY;

            } else {
                clientX = e.clientX;
                clientY = e.clientY;

                x = (e.clientX - rect.left) * scaleX;
                y = (e.clientY - rect.top) * scaleY;
            }

            const clickedLine = getLineAtPosition(x, y);
            console.log('@@clickedLine:: ', clickedLine);

            if(clickedLine){
                const idx = drawnLines.indexOf(clickedLine);
                if(idx !== -1){
                    drawnLines.splice(idx, 1);
                    // if(lineType == 'solid'){
                    //     solidBtn.classList.add('active');
                    // } else {
                    //     dashedBtn.classList.add('active');
                    // }
                    // removeBtn.classList.remove('active');
                    redrawUserLines();
                }
            }

            // cv.removeMode = false;
            // cv.canDraw = true; //추가::251127
        }

        // 특정 위치의 선 찾기
        function getLineAtPosition(x, y) {
            // 선의 두께(클릭 허용 범위) – 필요하면 조절
            // const hitRange = 20;
            const hitRange = 200;

            //마지막 그린 선부터 체크
            for (let i = drawnLines.length - 1; i >= 0; i--) {
                const line = drawnLines[i];
                console.log(line)
                if (isPointNearLine(x, y, line.endX, line.endY, line.startX, line.startY, hitRange)) {
                    return line;
                }
            }
            return null;
        }

        // 점이 선에 가까운지 체크
        function isPointNearLine(px, py, x1, y1, x2, y2, threshold) {
            console.log(px, py, x1, y1, x2, y2, threshold);
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) param = dot / lenSq;

            let xx, yy;
            if (param < 0) { xx = x1; yy = y1; }
            else if (param > 1) { xx = x2; yy = y2; }
            else { xx = x1 + param * C; yy = y1 + param * D; }

            const dx = px - xx;
            const dy = py - yy;
            const dist = dx * dx + dy * dy;
            return dist <= threshold;
        }

        // 정답 확인 버튼
        if (checkBtn) {
            checkBtn.addEventListener(isTouch.click, function() {
                checkAnswer();
            }, false);
        }

        // 정답 보기 버튼(정답 유형 보기)
        if (showAnswerBtn) {
            showAnswerBtn.addEventListener(isTouch.click, function() {
                showAnswer();
            }, false);
        }


        // 251024 정답좌표 : 입력후 주석처리
        // document.getElementById("exportAnswerBtn").addEventListener("click", function () {
        //     if (drawnLines.length === 0) {
        //         alert("아직 그린 선이 없습니다.");
        //         return;
        //     }

        //     // 정답 케이스 형태로 출력
        //     const answerSet = {
        //         name: "정답 케이스 " + (new Date()).toLocaleTimeString(),
        //         lines: drawnLines.map(line => ({
        //             startX: Math.round(line.startX),
        //             startY: Math.round(line.startY),
        //             endX: Math.round(line.endX),
        //             endY: Math.round(line.endY),
        //             type: line.type
        //         }))
        //     };

        //     console.clear();
        //     console.log("=== 정답 좌표 출력 ===");
        //     console.log(JSON.stringify(answerSet, null, 2));
        //     alert("콘솔에서 정답 좌표(JSON)를 확인하세요!");
        // });

        // 3. 초기화 부분에 추가
        // drawBackground(); //test_251209
        // drawQuestionShape(); //test_251209
        console.log('Deployment complete');
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
