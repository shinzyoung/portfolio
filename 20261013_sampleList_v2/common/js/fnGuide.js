/**
 * ========================================================================== 
 * fnGuide (사용자 가이드 애니메이션)
 * 
 * 파일: fnGuide.js
 * 버전: 2026-04-10 v1
 * 
 * - tab / drag 가이드 애니메이션 제공
 * - requestAnimationFrame 기반 부드러운 모션 처리
 * - sessionId 기반 애니메이션 충돌 방지
 * ========================================================================== 
 * 
 * [동작 흐름]
 * tab / drag 호출
 *   → stop (기존 애니메이션 정리)
 *   → _newSession (세션 갱신)
 *   → animateIn (초기 위치 + 진입 애니메이션)
 *   → animateTo (이동 애니메이션)
 *   → runAnimationCSS (종료 효과)
 *   → loop or end
 * ========================================================================== 
 */
function fnGuide() { 		
	this.type = null;		
	this.content = null;	
	this.target = null;			
	this.animateDragId = null;
	this.countRequestId = null;						
	
	this.START_LEFT = undefined;
	this.START_TOP = undefined;
	this.END_LEFT = undefined;
	this.END_TOP = undefined;		
	this.PUSH_LEFT = undefined;
	this.PUSH_TOP = undefined;						
	
	this.root = null;
	this.resizeRoot = null;
	this.condisions = {};
	this.instance = {}; 		
	this.resizeFactor = 1;	
	this.isPlatform = "win16|win32|win64|mac|macintel";          
	
	this.data = {
		type: null,
		target: null,
		start: null,
		end: null,		
		loop: false,
		count: 0,
		speed: 1,	
		resizeRoot: null,	
		startCSS: null,
		endCSS: null
	};	

	this.mdata = {
		offsetX: 0,
		offsetY: 0,
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
		dx: 0,
		dy: 0
	};			


	/**
	 * *****************************************************************
	 * 세션 ID 생성
	 * - 애니메이션 실행 단위를 구분하기 위한 고유 값
	 * - 기존 애니메이션과 충돌 방지
	 * 
	 * @returns {number} sessionId (증가값)
	 */
	fnGuide.prototype._newSession = function() {
		this._sessionId = (this._sessionId || 0) + 1;
		return this._sessionId;
	};
	
	
	/**
	 * *****************************************************************
	 * guide tab (클릭 유도 애니메이션)
	 * - 시작 위치에서 제자리 애니메이션 수행
	 * 
	 * @param {Object} options
	 * @param {HTMLElement} options.target   가이드 아이콘
	 * @param {HTMLElement} options.start    시작 기준 요소
	 * @param {boolean} [options.loop=false] 반복 여부
	 * @param {number}  [options.count=0]    반복 간격(초)
	 * @param {number}  [options.speed=0.9]  이동 속도 (초 단위)
	 * @param {HTMLElement} options.resize  스케일 기준 루트
	 * @param {string} options.startCSS     시작 CSS 애니메이션 클래스
	 * @param {string} options.endCSS       종료 CSS 애니메이션 클래스
	 */
	fnGuide.prototype.tab = function(options) {	
		var self = this;		
		var opt = options || {};							
				
		if (opt.start === null || opt.start === undefined || opt.start.length === 0) {
			console.log("@ fnGuide not target");
			return;
		}	

		self.stop();

		// 세션 생성 (이후 모든 비동기 흐름에서 검증)
		var sessionId = self._newSession();
		self._currentSessionId = sessionId;					

		// 내부 데이터 구성 (애니메이션 공통 데이터)
		self.data = {			
			type: 'tab',
			target: opt.target,
			start: opt.start,			
			loop: opt.loop,
			count: opt.count,
			speed: (opt.speed === undefined) ? 0.9 : opt.speed,
			resizeRoot: opt.resize,
			startCSS: opt.startCSS, 			
			endCSS: opt.endCSS 			
		};		
		
		self.scaleInit(self.data.resizeRoot);  // 스케일 초기화																	
		
		self.target = self.data.target;				
		self.loop = self.data.loop;				
		self.count = self.data.count;	
		
		self._currentGuideEl = self.target;						
		self.animateIn(self.data, sessionId);				
	};
	
	
	/**
	 * ***************************************************************** 
	 * guide drag (드래그 유도 애니메이션)
	 * - start → end 위치로 이동 애니메이션 
	 * 
	 * @param {Object} options
	 * @param {HTMLElement} options.target
	 * @param {HTMLElement} options.start
	 * @param {HTMLElement} options.end
	 * @param {boolean} options.loop
	 * @param {number} options.count
	 * @param {number} options.speed
	 * @param {HTMLElement} options.resize
	 * @param {string} options.startCSS
	 * @param {string} options.endCSS
	 */
	fnGuide.prototype.drag = function(options) {	
		var self = this;		
		var opt = options || {};							
				
		if (opt.start === null || opt.start === undefined || opt.start.length === 0) {
			console.log("@ fnGuide not target");
			return;
		}	

		self.stop();

		var sessionId = self._newSession();
		self._currentSessionId = sessionId;	
				
		self.data = {			
			type: 'drag',
			target: opt.target,
			start: opt.start,
			end: opt.end,		
			loop: opt.loop,
			count: opt.count,
			speed: (opt.speed === undefined) ? 0.9 : opt.speed,
			resizeRoot: opt.resize,
			startCSS: opt.startCSS, 			
			endCSS: opt.endCSS 			
		};		
		
		self.scaleInit(self.data.resizeRoot);																	
		
		self.target = self.data.target;				
		self.loop = self.data.loop;				
		self.count = self.data.count;	
		
		self._currentGuideEl = self.target;				
		self.animateIn(self.data, sessionId);				
	};		

	
	/**
	 * ***************************************************************** 
	 * animateIn (초기 진입 애니메이션)
	 * - start 요소 기준 위치 계산
	 * - target 초기 위치 세팅
	 * - 이후 animateTo 호출	 
	 * 
	 * @param {Object} data       내부 상태 데이터
	 * @param {number} sessionId  현재 세션 ID (비동기 검증용)
	 */
	fnGuide.prototype.animateIn = function(data, sessionId) {											
		var self = this;
		
		// 유효성 + 세션 체크
		if (!data || !data.start || !data.target) return;		
		if (sessionId !== self._currentSessionId) return;

		/**
		 * 위치 계산 흐름
		 * start.getBoundingClientRect()
		 * → resizeFactor 반영
		 * → target 중심 좌표로 변환
		 */
		var container = self.data.resizeRoot;
		var target = data.target;		
		var factor = fnGuide.resizeFactor;	
		
		var startRect = data.start.getBoundingClientRect();		
		var parentRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
		
		var startX = (startRect.left - parentRect.left + startRect.width / 2) / factor;
		var startY = (startRect.top  - parentRect.top  + startRect.height / 2) / factor;		
		
		var targetRect = target.getBoundingClientRect();
		var offsetX = targetRect.width / 2;
		var offsetY = targetRect.height / 2;

		target.style.position = "absolute";
		target.style.left = (startX - offsetX) + "px";
		target.style.top  = (startY - offsetY) + "px";
		target.style.transform = "translate3d(0,0,0)";
		target.style.webkitTransform = "translate3d(0,0,0)";
		target.style.opacity = 1;
		target.style.willChange = "transform";
		
		self.mdata.offsetX = offsetX;
		self.mdata.offsetY = offsetY;
		self.mdata.startX = startX;
		self.mdata.startY = startY;

		var inCss = (self.data.startCSS) ? self.data.startCSS : null;
		var inDuration = (self.data.startCSS) ? null : 500;								
		
		// type: tab
		if (self.data.type === 'tab') {			
			self.mdata.endX = startX;
			self.mdata.endY = startY;
			self.mdata.dx = 0;
			self.mdata.dy = 0;			

			self.runAnimationCSS(target, { cssName: inCss, type: 'in', duration: inDuration }, function() {								
				self.animateTo(target, self.mdata.dx, self.mdata.dy, data);				
			});						
		}		
		// type: drag		
		else if (self.data.type === 'drag') {
			if (!data.end) return;

			var endRect = data.end.getBoundingClientRect();
			var endX = (endRect.left - parentRect.left + endRect.width / 2) / factor;
			var endY = (endRect.top  - parentRect.top  + endRect.height / 2) / factor;

			var dx = endX - startX;
			var dy = endY - startY;

			self.mdata.endX = endX;
			self.mdata.endY = endY;
			self.mdata.dx = dx;
			self.mdata.dy = dy;			

			self.runAnimationCSS(target, { cssName: inCss, type: 'in', duration: inDuration }, function() {								
				self.animateTo(target, dx, dy, data);				
			});		
		}				
	};		
	
	
	/**
	 * *****************************************************************  
	 * runAnimationCSS
	 * - CSS 애니메이션 실행 or JS fallback
	 * - animationend / timeout 모두 대응 
	 * 
	 * @param {HTMLElement} el
	 * @param {Object} options
	 * @param {string} options.cssName   CSS 클래스명
	 * @param {string} options.type      'in' | 'out'
	 * @param {number} options.duration  fallback 시간(ms)
	 * @param {Function} callback        완료 콜백
	 */
	fnGuide.prototype.runAnimationCSS = function(el, options, callback) {
		var self = this;

		/**
		 * 실행 흐름
		 * 1. cssName 존재 → CSS animation 실행
		 * 2. 이벤트(animationend) 또는 timeout으로 종료 보장
		 * 3. 없으면 JS 애니메이션(_runFadeAnimation)
		 */	
		if (!el) {
			callback && callback();
			return;
		}		
	
		options = options || {};			
		var cssName = options.cssName || null;
		var type = options.type || 'in';
		var duration = Math.max(50, options.duration || 1000);
	
		var called = false;
		var timer = null;
		var sessionId = self._currentSessionId;				
	
		function done() {
			if (called) return;
			called = true;
	
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
	
			if (cssName) {
				el.classList.remove(cssName);	
				el.removeEventListener("animationend", done);
				el.removeEventListener("webkitAnimationEnd", done);
				el.removeEventListener("transitionend", done);
				el.removeEventListener("webkitTransitionEnd", done);
			}

			if (self._currentSessionId !== sessionId) return;	
			callback && callback();
		}
	
		// ✅ CSS
		if (cssName) {
			el.classList.remove(cssName);
			void el.offsetWidth;
	
			el.classList.add(cssName);
	
			el.addEventListener("animationend", done);
			el.addEventListener("webkitAnimationEnd", done);
			el.addEventListener("transitionend", done);
			el.addEventListener("webkitTransitionEnd", done);	
			
			timer = setTimeout(done, duration + 50);	
			return;
		}
	
		// ✅ JS fallback
		self._runFadeAnimation(el, done, type, sessionId);
	};
	
	
	/**
	 * ***************************************************************** 
	 * _runFadeAnimation (JS fallback 애니메이션)
	 * - opacity + scale 애니메이션
	 * - requestAnimationFrame 기반
	 * 
	 * @param {HTMLElement} el
	 * @param {Function} callback
	 * @param {string} type       'in' | 'out'
	 * @param {number} sessionId  세션 검증
	*/
	fnGuide.prototype._runFadeAnimation = function(el, callback, type, sessionId) {
		var self = this;

		var duration = 400; // ms
		var start = performance.now();	
		var isFadeOut = type === "out";				
			
		function animate(now) {							
			if (self._currentSessionId !== sessionId) {
				cancelAnimationFrame(self.animateDragId);
				return;
			}

			var progress = Math.min((now - start) / duration, 1);				
			var ease = 1 - Math.pow(1 - progress, 3);				
			var opacity = isFadeOut ? (1 - ease) : ease;

			var scale;
			if (isFadeOut) {				
				scale = 1 - 0.1 * ease;				
			} else {								
				scale = 1.1 - 0.1 * ease;
			}
	
			el.style.opacity = opacity;
			el.style.transform = "scale(" + scale + ")";
	
			if (progress < 1) {
				self.animateDragId = requestAnimationFrame(animate); // ✅ 여기만 유지				
			} else {				
				cancelAnimationFrame(self.animateDragId);
        		self.animateDragId = null;
				callback && callback();				
			}
		}
	
		self.animateDragId = requestAnimationFrame(animate);
	};
	
	
	/**
	 * *****************************************************************
	 * animateTo (이동 애니메이션)
	 * - dx, dy 기준으로 target 이동
	 * - 종료 후 endCSS 또는 loop 처리 
	 * 
	 * @param {HTMLElement} el
	 * @param {number} dx       이동 X 거리
	 * @param {number} dy       이동 Y 거리
	 * @param {Object} data     전체 옵션 데이터
	 */
	fnGuide.prototype.animateTo = function(el, dx, dy, data) {		
		var self = this;

		/**
		 * 흐름
		 * requestAnimationFrame
		 * → easeOutCubic 적용
		 * → transform 이동
		 * → 종료 후 위치 고정
		 * → 종료 애니메이션(runAnimationCSS)
		 * → loop or end
		 */
		var duration = (data.speed || 0.8) * 1000;
		var startTime = performance.now();
		
		var sessionId = self._currentSessionId;

		function animate(now) {						
			if (self._currentSessionId !== sessionId) {
				cancelAnimationFrame(self.animateDragId);
				return;
			}

			var elapsed = now - startTime;
			var progress = Math.min(elapsed / duration, 1);

			var ease = self.easeOutCubic(progress);

			var moveX = dx * ease;
			var moveY = dy * ease;

			var transform = "translate3d(" + moveX + "px," + moveY + "px,0)";
			el.style.transform = transform;
			el.style.webkitTransform = transform;			

			if (progress < 1) {
				self.animateDragId = requestAnimationFrame(animate);
			} else {
				cancelAnimationFrame(self.animateDragId);				
				self.animateDragId = null;
				
				el.style.left = (parseFloat(el.style.left) + dx) + "px";
				el.style.top  = (parseFloat(el.style.top) + dy) + "px";				

				el.style.transform = "translate3d(0,0,0)";
				el.style.webkitTransform = "translate3d(0,0,0)";									

				var inCss = (self.data.endCSS) ? self.data.endCSS : null;
				var inDuration = (self.data.endCSS) ? null : 500;	
				
				self.runAnimationCSS(el, { cssName: inCss, type: 'out', duration: inDuration }, function() {													
					el.style.opacity = 0;												
					self.stop();
					
					if (data.loop) {
						self.countdown(data.count, data.loop, sessionId);						
					} else {
						self.end(self.data);
					}				
				});				
			}
		}

		self.animateDragId = requestAnimationFrame(animate);
	};			

	
	/**
	 * ***************************************************************** 
	 * stop (애니메이션 강제 종료)
	 * - 모든 RAF / 타이머 제거
	 * - 스타일 초기화
	 * - 세션 갱신으로 기존 비동기 무효화	 
	 */
	fnGuide.prototype.stop = function() {	
		var self = this;

		cancelAnimationFrame(self.animateDragId);
		self.animateDragId = null;		
		
		self._newSession();				
		var el = self._currentGuideEl;
		self.resetCountdown();

		if (!el) return;						
		
		if (el._animDone) {
			el._animDone();
			el._animDone = null;
		}
		
		if (self.data.startCSS) el.classList.remove(self.data.startCSS);
		if (self.data.endCSS) el.classList.remove(self.data.endCSS);
		
		el.style.transform = "translate3d(0,0,0)";
		el.style.webkitTransform = "translate3d(0,0,0)";

		el.style.left = "0px";
		el.style.top  = "0px";

		el.style.opacity = 0;
		el.style.willChange = "auto";
		
		el.style.animation = "none";
		el.style.webkitAnimation = "none";
		el.style.transition = "none";
		el.style.webkitTransition = "none";

		void el.offsetWidth;
		
		el.style.animation = "";
		el.style.webkitAnimation = "";
		el.style.transition = "";
		el.style.webkitTransition = "";

		self._currentGuideEl = null;
	};			
					
	
	/**
	 * ***************************************************************** 
	 * countdown (루프 딜레이)
	 * - count 초 후 애니메이션 재시작	 
	 * 
	 * @param {number} value      대기 시간 (초)
	 * @param {boolean} loop      반복 여부
	 * @param {number} sessionId  세션 검증
	 */
	fnGuide.prototype.countdown = function(value, loop, sessionId) {
		var self = this;		

		self.resetCountdown();

		var countValue = value || 0;
		var countLoop = loop === true;

		var requestAnimFrame = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) { return setTimeout(callback, 16); };
		
		var now = Date.now();
		self._countStartTime = now;
		self._countSecond = 1;
		
		function loopTo() {			
			// if (self._currentSessionId !== sessionId) return;
			if (self._currentSessionId !== sessionId) {
				cancelAnimationFrame(self.animateDragId);
				return;
			}

			var current = Date.now();
			var elapsed = current - self._countStartTime;
			var nextSecond = Math.floor(elapsed / 1000) + 1;

			if (nextSecond !== self._countSecond) {
				self._countSecond = nextSecond;

				if (self._countSecond > countValue) {
					self.resetCountdown();

					if (typeof self.countdownEnd === "function") {
						self.countdownEnd();
					}

					if (countLoop) {
						self.animateIn(self.data, sessionId);
					}
					return;
				}
			}

			self.countRequestId = requestAnimFrame(loopTo);
		}

		self.countRequestId = requestAnimFrame(loopTo);		
	};		


	/**	 
	 * countdown reset
	 */
	fnGuide.prototype.resetCountdown = function() {
		var self = this;
	
		var cancelAnimFrame = window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelAnimationFrame ||
			function(id) { clearTimeout(id); };
	
		if (self.countRequestId) {
			cancelAnimFrame(self.countRequestId);
			self.countRequestId = null;
		}	
	
		self._countStartTime = null;
		self._countSecond = 1;
	};

	
	/**
	 * *****************************************************************
	 * easeOutCubic
	 * - 감속 애니메이션 easing 함수
	 * 
	 * @param {number} t (0~1)
	 * @returns {number}
	 */
	fnGuide.prototype.easeOutCubic = function(t) {
		return 1 - Math.pow(1 - t, 3);
	};

	
	/**
	 * *****************************************************************
	 * 사용자 정의 콜백 (override)
	 */
	fnGuide.prototype.loopComplete = function(data) {};	
	fnGuide.prototype.start = function(data) {};     	
	fnGuide.prototype.end = function(data) {};   	

	
	/**
	 * *****************************************************************
	 * 반응형 스케일 초기화
	 *
	 * @param {HTMLElement} root 기준 요소
	 *
	 * [flow]
	 * getScale(root) →
	 * resizeFactor 저장 →
	 *
	 * window resize or fnResponsive 연동 →
	 * scale 업데이트
	 */
	fnGuide.resizeInstances = [];
	fnGuide.resizeTimer = null;
	fnGuide.resizeBinded = false;	

	fnGuide.prototype.scaleInit = function(root) {	
		var self = this;		
		var inRoot = root;  		
		
		fnGuide.resizeInstances.push(self);

		function _updateScale(instance) {			
			fnGuide.resizeFactor = instance.getScale(inRoot);
			console.log('@ fnGuide responsive scale:', fnGuide.resizeFactor);	
		}		
		_updateScale(self);

		if (typeof fnResponsive === 'undefined' || fnResponsive.container === null) {			
			if (!fnGuide.resizeBinded) {
				fnGuide.resizeBinded = true;

				window.addEventListener('resize', function () {
					clearTimeout(fnGuide.resizeTimer);
					fnGuide.resizeTimer = setTimeout(function () {						
						_updateScale(self);						
					}, 200);
				});
			}
		} 
		else {						
			fnGuide.resizeFactor = fnResponsive.scaleRatio;			
			fnResponsive.release = function(ratio) {				
				fnGuide.resizeFactor = ratio;	
				clearTimeout(fnGuide.resizeTimer);
				fnGuide.resizeTimer = setTimeout(function () {						
					_updateScale(self);						
				}, 200);								
			};			
		}		
	};

	
	/**
	 * transform scale 값 추출
	 */
	fnGuide.prototype.getScale = function(el) {		
          // var style = window.getComputedStyle ? window.getComputedStyle(el, null) : el.currentStyle;
          if (el && el.nodeType === 1) {
               var style = window.getComputedStyle
                   ? window.getComputedStyle(el, null)
                   : el.currentStyle;                          
          } else {			
			// console.log("Invalid resize scale element:", el);
          }
          
		if (!style) return 1;

		var transform =
			style.transform ||
			style.webkitTransform ||
			style.mozTransform ||
			style.msTransform ||
			style.oTransform;

		if (!transform || transform === 'none') return 1;
		
		if (transform.indexOf('matrix3d') === 0) {
			var values = transform.substring(9, transform.length - 1).split(',');
			return parseFloat(values[0]) || 1;
		}		
		if (transform.indexOf('matrix') === 0) {
			var values = transform.substring(7, transform.length - 1).split(',');
			return parseFloat(values[0]) || 1;
		}		
		if (transform.indexOf('scale') === 0) {
			var values = transform.substring(6, transform.length - 1).split(',');
			return parseFloat(values[0]) || 1;
		}					

		return 1;
    };	
     
	
	/**
	 * *****************************************************************
	 * 디바이스 환경 체크
	 */
	fnGuide.prototype.navigatorType = function() {
		var self = this;
		if (navigator.platform) {
			if (self.isPlatform.indexOf(navigator.platform.toLowerCase()) < 0) {
				self.isDevice = true;                
			} else {
				self.isDevice = false;                                    
			}
		}
	}; 

};