/** 
 * ==================================================
 * common function js
 * 2026-05-07 v1
 * ================================================== 
*/


/**
  * *****************************************************************
 * navigator Detect Utility
 */
const navigatorUtil = (function () {
    var ua = navigator.userAgent.toLowerCase();
    var platform = navigator.platform ? navigator.platform.toLowerCase() : "";

    function detectBrowser() {
        if (ua.indexOf("edg/") > -1) return "edge";
        if (ua.indexOf("edge") > -1) return "edge";
        if (ua.indexOf("opr") > -1 || ua.indexOf("opera") > -1) return "opera";
        if (ua.indexOf("chrome") > -1) return "chrome";
        if (ua.indexOf("trident") > -1 || ua.indexOf("msie") > -1) return "ie";
        if (ua.indexOf("firefox") > -1) return "firefox";
        if (ua.indexOf("safari") > -1) return "safari";
        return "other";
    }
    function detectOS() {
        if (ua.indexOf("android") > -1) return "android";
        if (/iphone|ipad|ipod/.test(ua)) return "ios";
        if (platform.indexOf("win") > -1) return "windows";
        if (platform.indexOf("mac") > -1) return "mac";
        if (platform.indexOf("linux") > -1) return "linux";
        return "unknown";
    }
    function detectMobile() {
        return /(android|iphone|ipad|ipod|iemobile|opera mini)/.test(ua);
    }    
    function detectTouch() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    var info = {
        ua: ua,
        browser: detectBrowser(),
        os: detectOS(),
        mobile: detectMobile(),
        touch: detectTouch()
    };

    info.device = info.mobile ? "Mobile" : "PC";

    return {
        info: info,
        isMobile: function () {
            return info.mobile;
        },
        isIOS: function () {
            return info.os === "ios";
        },
        isAndroid: function () {
            return info.os === "android";
        },
        isPC: function () {
            return !info.mobile;
        },
        isTouch: function () {
            return info.touch;
        },
        getBrowser: function () {
            return info.browser;
        },
        getOS: function () {
            return info.os;
        }
    };    
})();
console.log('navigator util', navigatorUtil.info);   


/**
  * *****************************************************************
 * addEventListener event 
 */
const isTouch = {
    mobile: undefined,
    down: undefined,
    move: undefined,
    up: undefined,
    click: undefined,
    eventSelector: function() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            isTouch.mobile = true;
            isTouch.down = "touchstart";
            isTouch.move = "touchmove";
            isTouch.up = "touchend";
            isTouch.click = "click";
        } else {            
            isTouch.mobile = false;
            isTouch.down = "mousedown";
            isTouch.move = "mousemove";
            isTouch.up = "mouseup";
            isTouch.click = "click";
        }
    }    
};
isTouch.eventSelector();


/**
 * *****************************************************************
 * content sound play 
 */
var ContentAudio = {
    audio: new Audio(),
    begin: undefined,
    end: undefined,
    playbackRate: 1,
    dur: 0,

    set_rate: function(rate) {
        this.playbackRate = rate;
        if (this.audio) this.audio.playbackRate = rate;
    },

    set_rate_remote: function(rate) {
        this.set_rate(rate);
    },

    play: function(id, begin, end) {
        var self = this;
        var audio = self.audio;
        
        audio.oncanplaythrough = null;
        audio.onloadedmetadata = null;
        audio.onended = null;
        
        if (!audio.paused) {
            audio.pause();
        }

        self.begin = begin;
        self.end = end;
        
        audio.src = id + ".mp3";
        audio.load();
        
        audio.playbackRate = self.playbackRate;
        
        var onReady = function() {
            self.dur = audio.duration || 0;
            if (self.begin) {
                self.begin();
            }
        };

        audio.onloadedmetadata = onReady;
        audio.oncanplay = onReady;

        var playAudio = function() {
            var promise = audio.play();   
            if (promise && promise.then) {
                promise.catch(function() {                    
                });
            }
        };
        
        if (navigatorUtil.info && navigatorUtil.info.os === 'ios') {
            audio.muted = true;
            playAudio();
            audio.muted = false;
        } else {
            playAudio();
        }
        
        audio.onended = function() {
            audio.pause();
            self.dur = 0;
            self.begin = undefined;

            if (self.end) {         
                setTimeout(function() {
                    self.end();
                }, 0);
            }
        };
    }
};

// ContentAudio.play(audio,
// function() {                               
// },
// function() {          
// });



/**
 * *****************************************************************
 * effect sound callback
 */
var isAudio = {
    audio: new Audio(),
    begin: undefined,
    end: undefined,
    dur: 0,

    isPlaying: function() {
        var a = this.audio;
        return a && !a.paused && !a.ended && a.readyState > 2;
    },

    play: function(id, ans, begin, end) {
        var self = this;
        var audio = self.audio;
        
        audio.oncanplay = null;
        audio.onloadedmetadata = null;
        audio.onended = null;
        
        if (self.isPlaying() && !ans) {
            audio.pause();
            if (self.end) self.end();
        } else {
            if (self.end) self.end();
        }

        self.begin = begin;
        self.end = end;
        
        audio.src = id + ".mp3";
        audio.preload = "auto";
        audio.load();
        
        var onReady = function() {
            self.dur = audio.duration || 0;
            if (self.begin) {
                self.begin();
            }
        };

        audio.onloadedmetadata = onReady;
        audio.oncanplay = onReady;
        
        var playAudio = function() {
            var promise = audio.play();

            if (promise && promise.then) {
                promise.catch(function() {                    
                });
            }
        };
        
        if (navigatorUtil.info && navigatorUtil.info.os === 'ios') {
            audio.muted = true;
            playAudio();
            audio.muted = false;
        } else {
            playAudio();
        }
        
        audio.onended = function() {
            audio.pause();

            if (self.end) {
                self.end();
            }

            self.begin = undefined;
            self.end = undefined;
            self.dur = 0;
        };
    }
};
// isAudio.play(audio, true);

// isAudio.play(audio,
// function() {                               
// },
// function() {          
// });


       

/**
 * *****************************************************************
 * animation css callback
 */
var ContentAnimate = {
    play: function (id, name, begin, end, deletion) {
        var obj = id;
        var clsName = name;
        var startFn = null;
        var endFn = null;

        if (deletion !== undefined) {
            startFn = end;
            endFn = deletion;
        } else {
            startFn = begin;
            endFn = end;
        }
        
        function createEvent(name) {
            if (typeof CustomEvent === "function") {
                return new CustomEvent(name, { bubbles: true });
            } else {
                var evt = document.createEvent("Event");
                evt.initEvent(name, true, true);
                return evt;
            }
        }

        function addClass(el, cls) {
            if (!el) return;
            if (el.classList) {
                el.classList.remove(cls);
                el.classList.add(cls);
            } else {
                el.className = el.className.replace(cls, "") + " " + cls;
            }
        }

        function removeClass(el, cls) {
            if (!el) return;
            if (el.classList) {
                el.classList.remove(cls);
            } else {
                el.className = el.className.replace(cls, "");
            }
        }

        function animationEndEvent() {
            var el = document.createElement("div");
            var events = {
                animation: "animationend",
                WebkitAnimation: "webkitAnimationEnd",
                MozAnimation: "animationend",
                OAnimation: "oAnimationEnd"
            };

            for (var t in events) {
                if (el.style[t] !== undefined) {
                    return events[t];
                }
            }
            return "animationend";
        }

        var animEnd = animationEndEvent();

        function animateBegin() {
            obj.removeEventListener("eventContentAnimate", animateBegin);

            if (typeof startFn === "function") {
                startFn();
            }

            removeClass(obj, clsName);            
            obj.offsetWidth;
            addClass(obj, clsName);

            obj.addEventListener(animEnd, animateEnd);
        }

        function animateEnd() {
            removeClass(obj, clsName);
            obj.removeEventListener(animEnd, animateEnd);

            if (typeof endFn === "function") {
                setTimeout(function () {
                    endFn();
                }, 0);
            }
        }

        obj.removeEventListener("eventContentAnimate", animateBegin);
        obj.addEventListener("eventContentAnimate", animateBegin);
        obj.dispatchEvent(createEvent("eventContentAnimate"));
    }
};

// ContentAnimate.play(obj, name,
// function() {                               
// },
// function() {          
// });



/**
 * *************************************************************
 * video play,end callback
 */
let ContentVideo = { 
    obj: null,     
    begin: null,
    end: null,    
        
    play: function(id, begin, end) {
        let self = this;                        
        self.obj = id;        
        self.begin = begin;
        self.end = end;                  
        
        // _videoBegin(id);
        self.obj.removeEventListener("eventContentVideo", _videoBegin, false);
        self.obj.addEventListener("eventContentVideo", _videoBegin, false);
        let _dispatch = new CustomEvent('eventContentVideo', {bubbles: true});
        self.obj.dispatchEvent(_dispatch);        

        function _videoBegin() {  
            self.obj.removeEventListener("eventContentVideo", _videoBegin, false);

            if (self.begin) self.begin();             
            let inRequestId = null;            
            let inVideo = (obj.tagName === "VIDEO") ? obj:obj.querySelector("video");                        
            inVideo.play();	                    
            let inRender = function() {			
                inRequestId = window.requestAnimationFrame(inRender);            
                if (inVideo.currentTime >= inVideo.duration) {							                
                    inVideo.pause();
                    window.cancelAnimationFrame(inRequestId);	
                    _videoEnd(inVideo);
                    inRequestId = null;
                    inVideo = null;
                }													            
            }
            inRequestId = window.requestAnimationFrame(inRender);                             
        }               
        function _videoEnd(video) {                                                                          
            setTimeout(function () {
                self.end();                
            }, 0);            
        }                   
    } 
};

// ContentVideo.play(obj, 
// function() {                               
// },
// function() {          
// });


/**
 * *************************************************************
 * time countdown               
 */
var timeCountdown = {                            
    requestId: null,
    value: null, 
    loop: null,
    seconds: 1,
    
    start: function(value, loop) {
        var self = this;
        self.requestId = null;
        self.value = value;   
        self.loop = loop;          
        self.seconds = 1;                         
        
        var lastTime = (new Date()).getTime();             
        window.requestAnimFrame = (function() {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        })();
        window.cancelAnimFrame = (function() {
            return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame            
        })();                                        

        var timer = function() {
            self.requestId = requestAnimFrame(timer);                              
            var currentTime = (new Date()).getTime(); 
            if (currentTime - lastTime >= 1000) {                    
                lastTime = currentTime;                                                              
                self.progress(self.seconds);                   
                if (self.seconds == self.value) { 
                    cancelAnimFrame(self.requestId);                           
                    if (self.loop === true) {
                        self.seconds = 1;                            
                        self.requestId = requestAnimFrame(timer);
                    }
                    return self.end();                        
                } else {                    
                    self.seconds ++;                                                        
                }                                                           
            }             
        };
        self.requestId = requestAnimFrame(timer);            
    },
    progress: function() {
        var self = this;
    },
    end: function() {
        var self = this;                         
    },
    stop: function() {
        var self = this;            
        if (self.requestId !== null) cancelAnimFrame(self.requestId);            
    }                        
}; 

// timeCountdown.stop(); // 중지
// timeCountdown.start(value, loop); // 시작(초), 반복여부(true|false)       
// timeCountdown.progress = function(value) {}; // 카운터 진행 콜백   
// timeCountdown.end = function() {}; // 카운터 완료(종료) 콜백      


/**
 * *************************************************************
 * time delay
 */
var timeRender = {
    delay: 0,
    begin: null,
    end: null,
    timeRid: null,
    timeIdx: 0,

    animate: function(delay, begin, end) {
        var self = this;

        self.delay = delay || 0;
        self.begin = typeof begin === "function" ? begin : null;
        self.end = typeof end === "function" ? end : null;
        self.timeIdx = 0;
        
        var raf = window.requestAnimationFrame || function(cb) {
            return setTimeout(cb, 16);
        };
        var caf = window.cancelAnimationFrame || function(id) {
            clearTimeout(id);
        };

        function render() {
            self.timeRid = raf(render);

            if (self.timeIdx >= self.delay) {
                caf(self.timeRid);
                self.timeRid = null;
                renderEnd();
                return;
            }

            self.timeIdx++;
        }

        function renderEnd() {
            self.timeIdx = 0;

            if (self.end) {
                setTimeout(function() {
                    self.end();
                }, 0);
            }
        }

        if (self.begin) self.begin();

        self.timeRid = raf(render);
    }
};

// timeReander.animate(30,
// function() {      
// },
// function() {  
// });



/**
 * *************************************************************
 * 사용자 제한 설정
 * 우클릭 방지
 * 드래그/텍스트 선택 방지
 * 개발자도구/소스보기/검사도구 방지
 * @param {*} idx {0:적용, 1:미적용} 
 */
var blockListenerUtil = function(idx) {
    if (idx === 1) return;

    // 1. 우클릭(컨텍스트 메뉴) 금지
    function blockMenu(e) {
        e = e || window.event;

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return false;
    }

    // 최신 브라우저
    if (document.addEventListener) {
        document.addEventListener("contextmenu", blockMenu, false);
    }
    // 구형 IE
    else {
        document.attachEvent("oncontextmenu", blockMenu);
    }

    // 2. 드래그 및 텍스트 선택 방지
    function blockDrag(e) {
        e = e || window.event;

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return false;
    }

    if (document.addEventListener) {
        document.addEventListener("dragstart", blockDrag, false); // 이미지,텍스트 드래그 시작 차단
        document.addEventListener("selectstart", blockDrag, false); // 텍스트 선택 시작 차단
    } else {
        document.attachEvent("ondragstart", blockDrag);
        document.attachEvent("onselectstart", blockDrag);
    }

    // 3. 일부 단축키 차단 - 개발자도구 / 소스보기 / 검사도구 대응
    document.onkeydown = function (e) {
        e = e || window.event;
        var key = e.keyCode || e.which;

        // F12 : 개발자도구
        if (key == 123) {
            return false;
        }

        // Ctrl + U : 페이지 소스 보기
        if (e.ctrlKey && key == 85) {
            return false;
        }

        // Ctrl + Shift + I : 개발자도구
        // Ctrl + Shift + J : 콘솔
        // Ctrl + Shift + C : 요소 검사
        if (e.ctrlKey && e.shiftKey && (key == 73 || key == 74 || key == 67)) {
            return false;
        }
    };
};



/*
* animate easing (jQuery)
*/
// jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});