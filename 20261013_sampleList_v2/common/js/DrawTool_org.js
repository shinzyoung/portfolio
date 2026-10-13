/**
 * ==========================================================================
 * DrawTool
 * ==========================================================================
 *
 * 파일: DrawTool_org.js
 * 버전: 2026-06-25 v1
 */
var drawTool = (function ()
{
    var canvasList = [];
    var currentIndex = -1;

    var canvas;
    var context;

    var penButton;
    var eraseButton;
    var eraseAllButton;

    var canvasOffsetLeft;
    var canvasOffsetTop;

    var oldPt = {};
    var oldMidPt = {};

    var mode = "pen";

    var lineWidth = 6;
    var eraseWidth = 50;

    var activated = false;
    var opStatus = false;
    var onFirstDraw = null;   

    var strokeStyle = "#000000";
    var lineJoin = "round";

    var isTouchSupported = "ontouchstart" in window;

    var startEvent = isTouchSupported ? "touchstart" : "mousedown";
    var moveEvent = isTouchSupported ? "touchmove" : "mousemove";
    var endEvent = isTouchSupported ? "touchend" : "mouseup";

    var PEN_SOUND = "tool/audio/pen_click";


    /**
     * ==========================================================
     * init
     * ==========================================================
     */
    var init = function ($spec) {
        penButton = $spec.control.penButton;
        eraseButton = $spec.control.eraseButton;
        eraseAllButton = $spec.control.eraseAllButton;

        if ($spec.hasOwnProperty("strokeStyle")) {
            strokeStyle = $spec.strokeStyle;
        }

        if ($spec.hasOwnProperty("lineJoin")) {
            lineJoin = $spec.lineJoin;
        }

        if ($spec.hasOwnProperty("lineWidth")) {
            lineWidth = $spec.lineWidth;
        }

        if ($spec.hasOwnProperty("eraseWidth")) {
            eraseWidth = $spec.eraseWidth;
        }

        if (typeof $spec.onFirstDraw === "function") {
            onFirstDraw = $spec.onFirstDraw;
        }

        penButton.addEventListener("click", hnSetPenMode, false);
        eraseButton.addEventListener("click", hnSetEraseMode, false);
        // eraseAllButton.addEventListener("click", hnEraseAll, false);

        setActivation(false);
    };

    
    /**
     * ==========================================================
     * canvas 추가
     * ==========================================================
     */
    function addCanvas($canvas) {
        var ctx = $canvas.getContext("2d");

        ctx.strokeStyle = strokeStyle;
        ctx.lineJoin = lineJoin;
        ctx.lineCap = "round";
        ctx.lineWidth = lineWidth;

        canvasList.push({
            canvas : $canvas,
            context : ctx,
            isDrawn : false
        });        

        $canvas.addEventListener(startEvent, hnStartDraw, false);
    }


    /**
     * ==========================================================
     * 활성 canvas 변경
     * ==========================================================
     */
    function setCanvas($index) {
        if (!canvasList[$index]) return;

        currentIndex = $index;
        canvas = canvasList[$index].canvas;
        context = canvasList[$index].context;        

        /**
         * NOTE:
         * 전환 시 offset 재계산
         */
        canvasOffsetLeft = Amt.Util.getGlobalOffset(canvas).x;
        canvasOffsetTop = Amt.Util.getGlobalOffset(canvas).y;        
    }

    function setActivation($bool) {
        activated = $bool;        
        // console.log(activated, canvasList[currentIndex]);
    }

    function getDrawStatus() {
        var result = [];
    
        for (var i = 0; i < canvasList.length; i++) {    
            result.push({
                index : i,
                isDrawn : canvasList[i].isDrawn
            });
        }    
        return result;
    }


    /**
     * ==========================================================
     * draw start
     * ==========================================================
     */
    function hnStartDraw(e) {
        e.preventDefault();

        if (!activated) return;

        /**
         * 현재 canvas 자동 찾기
         */
        for (var i = 0; i < canvasList.length; i++) {
            if (canvasList[i].canvas === e.currentTarget) {
                setCanvas(i);
                break;
            }
        }

        var eventPosX;
        var eventPosY;

        if (isTouchSupported) {
            eventPosX = e.changedTouches[0].pageX;
            eventPosY = e.changedTouches[0].pageY;
        }
        else {
            eventPosX = e.pageX;
            eventPosY = e.pageY;
        }

        oldPt.x = eventPosX - canvasOffsetLeft;
        oldPt.y = eventPosY - canvasOffsetTop;

        oldMidPt.x = oldPt.x;
        oldMidPt.y = oldPt.y;

        canvas.addEventListener(moveEvent, hnDraw, false);
        document.addEventListener(endEvent, hnEndDraw, false);
    }


    /**
     * ==========================================================
     * draw
     * ==========================================================
     */
    function hnDraw(e) {
        e.preventDefault();

        // 최초 드로잉 여부 체크
        if (!canvasList[currentIndex].isDrawn) {
            canvasList[currentIndex].isDrawn = true;            

            if (onFirstDraw) {
                onFirstDraw({
                    index : currentIndex,
                    canvas : canvasList[currentIndex].canvas
                });

                getDrawStatus();
            }
        }


        var eventPosX;
        var eventPosY;

        if (isTouchSupported) {
            eventPosX = e.changedTouches[0].pageX;
            eventPosY = e.changedTouches[0].pageY;
        }
        else {
            eventPosX = e.pageX;
            eventPosY = e.pageY;
        }

        var midPt = {};
        midPt.x = oldPt.x + eventPosX - canvasOffsetLeft >> 1;
        midPt.y = oldPt.y + eventPosY - canvasOffsetTop >> 1;

        if (mode === "pen") {
            context.globalCompositeOperation = "source-over";
            context.lineWidth = lineWidth;
        }
        else {
            context.globalCompositeOperation = "destination-out";
            context.lineWidth = eraseWidth;
        }

        context.beginPath();
        context.moveTo(midPt.x, midPt.y);
        context.quadraticCurveTo(
            oldPt.x,
            oldPt.y,
            oldMidPt.x,
            oldMidPt.y
        );

        context.closePath();
        context.stroke();

        oldPt.x = eventPosX - canvasOffsetLeft;
        oldPt.y = eventPosY - canvasOffsetTop;

        oldMidPt.x = midPt.x;
        oldMidPt.y = midPt.y;
    }    


    /**
     * ==========================================================
     * draw end
     * ==========================================================
     */
    function hnEndDraw(e) {        
        canvas.removeEventListener(moveEvent, hnDraw, false);
        document.removeEventListener(endEvent, hnEndDraw, false);
    }

    function hnSetPenMode(e) {
        var button = e.currentTarget;

        if (button.classList.contains("inactivation-pen")) {            
            isAudio.play(PEN_SOUND);

            mode = "pen";            
            activatePen();            
            inactivateErase();            
            setActivation(true);
            
            opStatus = true;            
        }
        else {            
            inactivatePen();
            setActivation(false);
            
            opStatus = false; 
        }                
    }

    function hnSetEraseMode(e) {
        var button = e.currentTarget;        

        if (button.classList.contains("inactivation-erase")) {
            isAudio.play(PEN_SOUND);
            
            mode = "erase";            
            activateErase();
            inactivatePen();
            setActivation(true);
            
            opStatus = true;
        }
        else {            
            inactivateErase();
            setActivation(false);
            
            opStatus = false;
        }          
    }

    function hnEraseAll() {
        if (!context) return;

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    function activatePen() {
        penButton.classList.remove("inactivation-pen");
        penButton.classList.add("activation-pen");
    }

    function inactivatePen() {
        penButton.classList.remove("activation-pen");
        penButton.classList.add("inactivation-pen");
    }

    function activateErase() {
        eraseButton.classList.remove("inactivation-erase");
        eraseButton.classList.add("activation-erase");
    }

    function inactivateErase() {
        eraseButton.classList.remove("activation-erase");
        eraseButton.classList.add("inactivation-erase");
    }

    function setInactivatePen() {
        mode = "pen";            
        activatePen();            
        inactivateErase();            
        setActivation(true);
        
        opStatus = true;     
    }
    

    return {
        init : init,
        addCanvas : addCanvas,
        setCanvas : setCanvas,
        clear : hnEraseAll,
        getDrawStatus : getDrawStatus,        
        setActivation : setActivation,
        setInactivatePen : setInactivatePen        
    }

}());