/**
created by NOD
pageBase
천재교육 진도 학습 콘텐츠 GNB 메뉴 및 플레이어 연동 관리
*/

(function (pb) {

    var m_nStepCount, m_nNowStep, m_nStudiedStep;
    var m_funcChangeStep;
    var m_mcBgContainer, m_mcGNBContainer, m_mcGNB, m_mcContentsContainer, m_mcContents, m_mcStep;
    var m_arrStepContents;
    var m_libraryContent;

    /**
     * 초기화
     * @prams strPath               해당 메뉴 js 파일 경로
     * @prams funcCompleteSetting   세팅 완료 콜백
     */
    pb.init = function (strPath, funcCompleteSetting) {
        setLayers();

        externalManager.setOnPausedContent(onPausedContent);
        externalManager.setOnResumeContent(onResumeContent);
        loadGNB(onCompleteLoadGNB);

        function onCompleteLoadGNB() {
            loadContents(strPath, onCompleteLoadContents);
        }

        function onCompleteLoadContents() {
            funcCompleteSetting();
            checkBeforeStudy();
        }
    }

    /**
     * 스탭 변경 콜백 등록
     * @prams funcChangeStep    스탭변경 콜백
     */
    pb.onChangeStep = function (funcChangeStep) {
        m_funcChangeStep = funcChangeStep;
    }

    /**
     * 현재 활성화 된 스탭 무비클립을 리턴한다.
     */
    pb.getContentClip = function () {
        return m_mcContents;
    }

    /**
     * contents canvas element에 있는 콘텐츠 무비클립을 리턴한다.
     */
    pb.getStepClip = function () {
        //m_mcStep.popup = new popupConstructor(m_mcStep);
        return m_mcStep;
    }

    /**
     * 동적으로 원하는 Depth에 elements 를 생성 ( 이후 추가 )
     * Video 객체 및 활용을 위함
     */
    pb.addElement = function (strID, strType, nDepth) {

    }

    /*
     * 현재 로드된 라이브러리 리턴
     */
    pb.getMenuLib = function() {
        return m_libraryContent;
    }

    /**
     * 현재 스탭완료를 호출한다.
     */
    pb.completeStep = function ( bControlGNB = false ) {
        if (m_nNowStep == m_nStepCount - 1) {
            externalManager.completeContents();
        }

        if ( m_nStudiedStep <= m_nNowStep ) m_nStudiedStep = m_nNowStep + 1;

        if( bControlGNB ) return;
        //checkGNB();
        showCompleteGuide();
    }

    /**
     * 다음 스탭을 호출한다.
     */
    pb.changeStep = function (bNext) {
        pauseAllSounds();
        setStep(m_nNowStep + (bNext ? 1 : -1));
    }

    /**
     * 지정된 스탭으로 즉시 이동한다.
     */
    pb.gotoStep = function ( nStepIndex ) {
        if( nStepIndex == m_nNowStep ) return;
        //pauseAllSounds();
        setStep( nStepIndex );
    }

    /**
     * 효과음을 재생한다
     * effComplete
     * effFindRight
     * effFindWrong
     * effRight
     * effWrong
     * effClick
     */
    pb.playEffect = function (strSound, nVolumn, strFunc) {
        externalManager.seekSound(strSound, 0);
        externalManager.playSound(strSound, false, nVolumn, strFunc);
    }

    /**
     * 현재 학습이 완료되었는지 체크한다
     */
    pb.isCompleteStep = function() {
        var bRet = externalManager.getNowStatus() == 2;
        if( !bRet && m_nNowStep < externalManager.getLastStep() )
            bRet = true;
        return bRet; 
    }

    /**
     * gnb 무비클립 순서
     */
    pb.getGNBContainer = function() {
        return m_mcGNBContainer;
    }

    /**
     * GNB의 시각화 설정.
     * @param {* 보여줄지 말지 결정함} bVisible 
     */
    pb.setVisibleGNB = function( bVisible ) {
        m_mcGNB.visible = bVisible;
    }

    pb.setGNBNextenable = function( bEnabledNext ) {
        m_mcGNB.mcNext.mouseEnabled = bEnabledNext;
        m_mcGNB.mcNext.alpha = bEnabledNext ? 1 : .5;
    }

    pb.setGNBenable = function( bEnabled, bAlphaCtrl ) {
        m_mcGNB.mcNext.mouseEnabled = bEnabled;
        m_mcGNB.mcPrev.mouseEnabled = bEnabled;

        if( bAlphaCtrl ) {
            m_mcGNB.mcNext.alpha = bEnabled ? 1 : .5;
            m_mcGNB.mcPrev.alpha = bEnabled ? 1 : .5;
        }
    }

    pb.setEnableStageTouch = function( bEnabled ) {
        var stage = cjsManager.getStage( "contents" );
        if( bEnabled ) {
            createjs.Touch.enable( stage, true );
        } else {
            if( stage.__touch ){
                createjs.Touch.disable( stage );
            }
        }
    }

    /**
     * 이전학습을 확인한다.
     */
    function checkBeforeStudy() {
        m_nStudiedStep = externalManager.getLastStep() - 1;

        var strData = externalManager.getInstantData();
        if (strData == "") {
            // 최초로 로드된 메뉴이고 이어하기를 선택 시
            if (externalManager.isFirstLoadedMenu() && externalManager.isContinueStudy()) {
                setStep(externalManager.getLastStep());
            } else {
                setStep(0);
            }
            return;
        }
        
        if( Number( strData.split("/")[ 0 ] ) == externalManager.getMenuIndex() ) {
            externalManager.setInstantData( "" );
            var step = Number( strData.split("/")[ 1 ] );
            setStep( step+1 );
            return;
        } else {
            //if( strData != "PRESSPREVNAVI" ) externalManager.setInstantData( "" );
            setStep(0);
        }

    }

    /**
     * 지정된 스탭을 시작한다.
     */
    function setStep(nStep) {
        if( externalManager.getMenuIndex() == externalManager.getMenuCount() - 1 && nStep > m_mcContents.totalFrames - 1 ) {
            externalManager.nextMenu();
            return;
        }

        m_nNowStep = nStep;
        if (m_nStudiedStep < m_nNowStep) m_nStudiedStep = m_nNowStep;

        /*
        var bLastStep = externalManager.getInstantData() == "PRESSPREVNAVI";
        if( bLastStep ) {
            m_nNowStep = m_mcContents.totalFrames - 1;
        }*/

        externalManager.setLastStep(m_nNowStep);

        checkGNB();

        if ( m_mcStep != null ) {
            m_mcStep.parent.removeChild(m_mcStep);
            m_mcStep = null;
        }

        if (nStep < 0) {
            externalManager.prevMenu();
            return;
        } else if (nStep > m_mcContents.totalFrames - 1) {
            externalManager.nextMenu();
            return;
        }
        pb.setEnableStageTouch( false );
        externalManager.setInstantData("");

        m_mcContents.gotoAndStop(m_nNowStep);

        m_mcStep = new m_libraryContent["constStep" + m_nNowStep]();
        m_mcContents.addChild(m_mcStep);
        cjsManager.resetSound();

        if (m_funcChangeStep != null) m_funcChangeStep(m_nNowStep);
    }

    /**
     * 메뉴 콜텐츠 js 파일 로드
     * @prams strPath               해당 메뉴 js 파일 경로
     * @prams funcComplete          세팅 완료 콜백
     */
    function loadContents(strPath, funcComplete) {
        cjsManager.loadCJSObject(strPath, onCompleteLoad);

        function onCompleteLoad(lib) {
            m_libraryContent = lib;
            var arrTemp = strPath.split("/");
            var strFileName = arrTemp[arrTemp.length - 1];
            var strLinName = strFileName.split(".")[0];

            m_mcContents = new lib[strLinName]();
            m_mcContentsContainer.addChild(m_mcContents);

            m_nStepCount = m_mcContents.totalFrames;

            funcComplete();
        }
    }

    /**
     * GNB 메뉴를 로드한다.
     */
    function loadGNB(funcComplete) {
        cjsManager.loadCJSObject("../common/gnb.js", onCompleteLoadGNB);

        function onCompleteLoadGNB(lib) {
            m_mcGNB = new lib.gnb();
            m_mcGNBContainer.addChild(m_mcGNB);

            m_mcGNB.mcPrev.visible = m_mcGNB.mcNext.visible = false;

            m_mcGNB.mcPrev.addEventListener("click", onClickNavi.bind(this));
            m_mcGNB.mcNext.addEventListener("click", onClickNavi.bind(this));

            funcComplete();
        }
    }

    /**
     * 현재 Menu와 Step 상황을 고려한 GNB 세팅을 한다.
     */
    function checkGNB() {
        var nFrameNext = isLastStudy() && m_nNowStep == m_nStepCount - 1 ? 2 : 0;
        if (nFrameNext != m_mcGNB.mcNext.currentFrame) {
            m_mcGNB.mcNext.gotoAndStop(nFrameNext);
        }

        var bShowPrev = externalManager.getMenuIndex() > 0 || m_nNowStep > 0;
        m_mcGNB.mcPrev.visible = bShowPrev;

        var bShowNext = externalManager.getMenuIndex() < externalManager.getMenuCount() || m_nNowStep < m_nStepCount - 1;
        m_mcGNB.mcNext.visible = bShowNext;

        var bEnabledNext = externalManager.getNowStatus() == 2 || m_nNowStep < m_nStudiedStep;
        m_mcGNB.mcNext.mouseEnabled = bEnabledNext;
        m_mcGNB.mcNext.alpha = bEnabledNext ? 1 : .5;
    }

    function onClickNavi(e) {
        var stage = cjsManager.getStage("contents");
        var event = new createjs.Event("changeStep");
        stage.dispatchEvent(event);

        m_inputBox = document.getElementById('input1');
        if(m_inputBox != null) {
            m_inputBox.blur();
        }

        pauseAllSounds();
        var bPrev = e.currentTarget == m_mcGNB.mcPrev;
        /*
        if( m_nNowStep + (bPrev ? -1 : +1) < 0 ) {
            externalManager.setInstantData( "PRESSPREVNAVI" );
        }*/
        setStep( m_nNowStep + (bPrev ? -1 : +1) );
    }

    /**
     * 레이어를 구분하여 세팅한다.
     * 이후 관리 편의성의 위해 이벤트를 받는 객체들을 관리하는 Element의 레이어를 구분한다.
     */
    function setLayers() {
        cjsManager.makeCanvasElements("contents", 1280, 800);
        var stage = cjsManager.getStage("contents");

        m_mcContentsContainer = new createjs.MovieClip();
        stage.addChild(m_mcContentsContainer);

        m_mcGNBContainer = new createjs.MovieClip();
        stage.addChild(m_mcGNBContainer);
    }

    /**
     * 상황에 맞는 다음학습 안내 및 학습 종료를 설정한다.
     */
    function showCompleteGuide() {
        Util.log("showCompleteGuide");

        m_mcGNB.mcNext.mouseEnabled = true;
        m_mcGNB.mcNext.alpha = 1;

        m_mcGNB.mcNext.gotoAndStop( /*isLastStudy() ? 3: 1 */  1 );
    }

    /**
     *  마지막 학습 페이지 여부를 확인한다.
     */
    function isLastStudy() {
        return externalManager.getMenuIndex() == externalManager.getMenuCount() - 1 && m_nNowStep == m_nStepCount - 1;
    }

    /**
    * 플레이어가 deactive 될 때 호출
    */
    function onPausedContent() {
        var stage = cjsManager.getStage("contents");
        createjs.Ticker.removeEventListener("tick", stage);
    }
    /**
     * 플레이어가 active 될 때 호출
     */
    function onResumeContent() {
        var stage = cjsManager.getStage("contents");
        createjs.Ticker.addEventListener("tick", stage);
    }

    function pauseAllSounds() {
        var arrSoundIds = cjsManager.getPlayingIds();
        if (arrSoundIds.size == 0) return;
        for (let id of arrSoundIds) {
            if (bgmExceptionHandling(id)) {
                externalManager.seekSound(id, 0);
                externalManager.pauseSound(id);       
            }
        }
        cjsManager.resetPlayingIds();

    }
    
    function bgmExceptionHandling(id) {
        var idExceptionBgm = id.substring( id.length - "exceptionBgm".length );
        return idExceptionBgm == "exceptionBgm" ? false : true;
    }

    function resumeAllSounds() {
        var arrSoundIds = cjsManager.getPlayingIds();
        if (arrSoundIds.size == 0) return;
        for (let id of arrSoundIds) {
            externalManager.resumeSound();
        }

        cjsManager.resetPlayingIds();
    }

})(pageBase = pageBase || {});
var pageBase;
