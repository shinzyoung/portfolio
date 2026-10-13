/**
 * ==========================================================================
 * fnLottieAnimation (Lottie Controller)
 * ==========================================================================
 * 
 * 파일: fnLottieAnimation.js
 * 버전: 2026-04-10 v1
 *
 * [Lifecycle]
 * load → setData → start → setFrameData → (loop / complete)
 *
 * [Features]
 * - frame segment 재생 (index 기반)
 * - loop / speed 제어
 * - enterFrame 종료 감지
 * - CustomEvent 콜백 전달
 * ==========================================================================
 */
function fnLottieAnimation() { 		
	this.root = null;	
	this.container = null;
	this.requestId = null;	
	this.listClass = null;
	this.isData1 = null;
	this.isData2 = null;
	this.isData3 = null; 				
	this.data = []; 
	this.func = [];
	this.cpData = [];
	this.condisions = {};  
	this.complete = {};	
	this.instance = {};						
	this.svgClass = (document.getElementsByClassName("lottieAnimation") !== null) ? document.getElementsByClassName("lottieAnimation") : null;	
					
	
	/**
	 * *****************************************************************
	 * 애니메이션 실행
	 * @param {Object} options
	 * @param {HTMLElement|string} options.target 대상 (element 또는 id)
	 * @param {number} options.frame frame index (default: 0)
	 * @param {boolean} options.loop 반복 여부 (default: false)
	 * @param {number} options.speed 재생 속도 (default: 1)
	 * @param {boolean} options.complete 완료 이벤트 여부
	 *
	 * [내부 전달]
	 * - target → name(id)으로 변환
	 * - frame → data.idx
	 * - loop → data.loop
	 * - speed → data.speed
	 * - complete → data.callbackComplete
	 * → setFrameData(data) 호출
	 */	
	fnLottieAnimation.prototype.start = function(options) {   		
		var self = this;		
		var opt = options || {};		

		var inTarget = opt.target;
		var inIdx = (opt.frame === undefined) ? 0 : opt.frame;
		var inLoop = (opt.loop === undefined) ? false : opt.loop;
		var inSpeed = opt.speed || 1;
		var inComplete = opt.complete || false;		
		var inData = null;						
		
		if (inTarget === null || inTarget === undefined || inTarget.length === 0) {
			console.log("@ Lottie animation not target");
			return;
		}					

		inTarget = (opt.target.id === undefined) ? opt.target : opt.target.id;										
					
		for (var i=0; i<self.data.length; i++) {				
			if (self.data[i].name === inTarget) {					
				inData = self.data[i];				
				inData.idx = inIdx;					
				inData.loop = inLoop;		
				inData.speed = inSpeed;			
				inData.callbackComplete = inComplete;	
								
				self.setFrameData(inData);						
			}				
		}	

	};	

	
	/**
	 * *****************************************************************
	 * frame segment 설정 및 재생
	 * @param {Object} data (start에서 전달)
	 *
	 * [내부 처리]
	 * - data.idx → frame 배열 index 선택
	 * - frame[idx] → {start, end} 추출
	 * - item.playSegments([start, end], true)
	 * - item.setSpeed(data.speed)
	 *
	 * [이벤트 전달]
	 * - enterFrame → 종료 시점 감지
	 * - loop === true → setFrameLoop(data) 재호출
	 * - callbackComplete === true → setEventListener(data)
	 */
	fnLottieAnimation.prototype.setFrameData = function(data) {	
		var self = this;	

		var inData = data;				
		var inStart = null;
		var inEnd = null;				
		var inFind = null;
		var inPlaySeg = [];		
		var inSeg = {start:0,end:0};												
		
		for (var i=0; i<self.cpData.length; i++) {
			if (self.cpData[i].name == inData.name) {
				inFind = self.cpData[i];
				break;
			}
		}

		if (self.cpData.length === 0) {
			self.cpData.push({name:inData.name, idx:inData.idx});
		} else {
			if (inFind === null) {
				self.cpData.push({name:inData.name, idx:inData.idx});
			}
		}		
		
		if (inData.frame.length === 0 || inData.frame === undefined) {
			inSeg.start = 0;
			inSeg.end = inData.item.totalFrames;
			inPlaySeg = [0, inData.item.totalFrames-1];
			inData.item.goToAndPlay(0, true);			
		}			
		else {											
			if (inData.frame[inData.idx] === undefined) {
				inStart = inData.frame[0].start;
				inEnd = inData.frame[0].end;				
			} else {								
				inStart = inData.frame[inData.idx].start;
				inEnd = inData.frame[inData.idx].end;				
			}				

			inSeg.start = inStart;
			inSeg.end = inEnd;
			inPlaySeg = [inStart, inEnd];
			inData.item.playSegments(inPlaySeg, true);				
		}		

		inData.item.setSpeed(inData.speed);
		inData.start = inSeg.start;
		inData.end = inSeg.end;		

		var seqEnd = parseInt(inSeg.end-inSeg.start) - 1;					

		// console.log("***********************************");		
		// console.log(inData.name, inData.idx, inData);						
		
		if (inData._enterFrameHandler) {
			inData.item.removeEventListener("enterFrame", inData._enterFrameHandler, false);
		}		
		
		inData._enterFrameHandler = function(animation) {			
			if (animation.currentTime >= seqEnd) {
				inData.item.pause();
				inData.item.removeEventListener("enterFrame", inData._enterFrameHandler, false);

				requestAnimationFrame(() => {					
					
					if (inData.loop === true) {
						self.setFrameLoop(inData);						
					}		

					if (inData.callbackComplete === true) {
						self.setEventListener(inData);
					}

				});												
			}
		};		
		
		requestAnimationFrame(() => {
			inData.item.addEventListener("enterFrame", inData._enterFrameHandler, false);
			// self.startData(inData, inFrameName, inIdx);
		});
				  				
	};				
	
	
	/**
	 * *****************************************************************
	 * frame loop 처리
	 * @param {Object} data
	 *
	 * [내부 전달]
	 * - 기존 data 그대로 setFrameData(data) 재호출
	 */	
	fnLottieAnimation.prototype.setFrameLoop = function(data) {
		var inData = data;			
		this.setFrameData(inData);	
	};

	
	/**
	 * *****************************************************************
	 * 완료 이벤트 발생
	 * @param {Object} data
	 *
	 * [이벤트 전달]
	 * - CustomEvent("complete")
	 * - detail → data 전체 전달
	 */
	fnLottieAnimation.prototype.setEventListener = function(data) {						
		var self = this;
		if (!data || !data.item || !data.item.wrapper) return;
		var wrapper = data.item.wrapper;
		
		if (!self._onAnimationComplete) {
			self._onAnimationComplete = function (e) { };
		}		
		wrapper.removeEventListener("complete", self._onAnimationComplete, false);

		var event;		
		if (typeof window.CustomEvent === "function") {
			try {
				event = new CustomEvent("complete", {
					bubbles: true,
					cancelable: true,
					detail: data
				});
			} catch (e) {					
				event = document.createEvent("CustomEvent");
				event.initCustomEvent("complete", true, true, data);
			}
		} else {			
			event = document.createEvent("CustomEvent");
			event.initCustomEvent("complete", true, true, data);
		}

		wrapper.dispatchEvent(event);
	};

	
	/**
	 * *****************************************************************
	 * 이벤트 등록 헬퍼
	 * @param {string} name instance key
	 * @param {string} eventName 이벤트명
	 * @param {Function} callback
	 *
	 * [전달]
	 * - event.detail → callback(detail)
	 */
	fnLottieAnimation.prototype.addEvent = function (name, eventName, callback) {
		var inst = this.instance[name];		
		if (!inst || !inst.wrapper) return;
  
		var wrapper = inst.wrapper;  		
		if (!wrapper._eventStore) wrapper._eventStore = {};  

		if (wrapper._eventStore[eventName]) {
			 wrapper.removeEventListener(eventName, wrapper._eventStore[eventName], false);
		}  		
		
		var handler = function(e) {
			 var detail = e.detail || {};
			 callback(detail);
		};
  
		wrapper._eventStore[eventName] = handler;  
		wrapper.addEventListener(eventName, handler, false);
    };	
	
	
	/**
	 * *****************************************************************
	 * 애니메이션 일시정지
	 * @param {string|object} dataTarget
	 *
	 * [내부 전달]
	 * - target → name(id) 추출
	 * - name → data[index] 매칭
	 * - item.pause() 호출
	 */
	fnLottieAnimation.prototype.pause = function (dataTarget) {
		var self = this;
		var inTarget = dataTarget;
		var inString = self.getString(inTarget);
		var inName = null;
		var i, max;
		
		if (typeof inTarget === "undefined") {
			for (i=0, max=self.data.length; i < max; i++) {
				self.getDataItemPause(i);
			}
			return;
		}
	
		if (inString === true) {
			inName = inTarget;
		} else if (typeof inTarget.id === "undefined") {
			inName = inTarget.wrapper.id;
		} else {
			inName = inTarget.id;
		}
	
		for (i=0, max=self.data.length; i<max; i++) {
			if (inName === self.data[i].name) {
				self.getDataItemPause(i);
				break;
			}
		}					
	};

	
	/**
	 * *****************************************************************
	 * 애니메이션 초기화 (0 frame)
	 * @param {string|object} dataTarget
	 *
	 * [내부 전달]
	 * - target → name 변환
	 * - item.playSegments([0,1])
	 * - item.goToAndStop(0)
	 */
	fnLottieAnimation.prototype.reset = function (dataTarget) {
		var self = this;
		var inTarget = dataTarget;
		var inString = self.getString(inTarget);
		var inName = null;
		var i, max;	
		
		if (typeof inTarget === "undefined") {
			for (i=0, max=self.data.length; i<max; i++) {
				self.getDataItemReset(i);
			}
			return;
		}	
		
		if (inString === true) {
			inName = inTarget;
		} else if (typeof inTarget.id === "undefined") {
			inName = inTarget.wrapper.id;
		} else {
			inName = inTarget.id;
		}	
		
		for (i= 0, max=self.data.length; i<max; i++) {
			if (inName === self.data[i].name) {
				self.getDataItemReset(i);
				break;
			}
		}
	};

	
	/**
	 * *****************************************************************
	 * 애니메이션 제거
	 * @param {object} dataTarget
	 *
	 * [내부 처리]
	 * - target.wrapper.id → name 추출
	 * - DOM(svg/canvas) 제거
	 * - data / cpData 배열에서 제거
	 */  
	fnLottieAnimation.prototype.remove = function(dataTarget) {
		var self = this;
		var inTarget = dataTarget;
		var i, obj, el;
	
		self.pause(inTarget);
	
		for (i=0; i<self.data.length; i++) {
			obj = self.data[i];
	
			if (obj.name == inTarget.wrapper.id) {	
				if (obj.item.animType == "canvas") {
					el = inTarget.wrapper.querySelector("canvas");
				} else {
					el = inTarget.wrapper.querySelector("svg");
				}
	
				if (el && el.parentNode) {
					el.parentNode.removeChild(el);
				}
	
				self.data.splice(i, 1);
				self.cpData.splice(i, 1);
				break;
			}
		}		
	};


	/**
	 * 내부 pause 처리
	 * @param {number} idx data index
	 *
	 * [전달]
	 * - data[idx].item.pause()
	 */
	fnLottieAnimation.prototype.getDataItemPause = function(idx) {
		var inIdx = (this.data[idx].item === undefined) ? 0 : idx;	
		this.data[inIdx].item.pause();	
	};	


	/**
	 * 내부 reset 처리
	 * @param {number} idx data index
	 *
	 * [전달]
	 * - item.pause()
	 * - item.playSegments([0,1])
	 * - item.goToAndStop(0)
	 */
	fnLottieAnimation.prototype.getDataItemReset = function(idx) {	
		var inIdx = (this.data[idx] === undefined) ? 0 : idx;	
		this.data[inIdx].item.pause();
		this.data[inIdx].item.playSegments([0,1], true);
		this.data[inIdx].item.goToAndStop(0, true);	
	};		


	
	/**
	 * *****************************************************************
	 * 애니메이션 로드
	 * @param {string|object} target
	 *
	 * [내부 전달]
	 * - string → LottieManager.data[target]
	 * - object → 그대로 사용
	 * → setData(item, frame) 호출
	 */
	fnLottieAnimation.prototype.load = function(target) {	
		var self = this;
		var manager = null;		

		if (typeof target === "string") {
			manager = window.LottieManager && LottieManager.data[target];					
		} else {
			manager = target;			
		}		

		if (!manager) {
			console.warn("Lottie not found:", target);
			return;		
		}	
		
		self.setData(manager.item, manager.frame);																										
	};		


	
	/**
	 * *****************************************************************
	 * 데이터 등록
	 * @param {Object} obj lottie instance
	 * @param {Array} frame frame segment 정보
	 *
	 * [내부 전달]
	 * - obj → data.item
	 * - obj.wrapper.id → data.name
	 * - frame → data.frame
	 * - markers → data.markers
	 *
	 * [후처리]
	 * - instance[name] = obj 저장
	 * - loadComplete(data) 호출
	 */
	fnLottieAnimation.prototype.setData = function(obj, frame) {
		var self = this;	
		var item = obj;
		var itemFrame = frame;
		var wrapper = obj.wrapper || {};
		var markers = (obj.animationData && obj.animationData.markers) ? obj.animationData.markers : null;
	
		var itemData = {
			item: undefined,
			name: undefined,
			type: undefined,
			loop: undefined,
			start: undefined,
			end: undefined,
			speed: undefined,
			idx: undefined,
			callbackComplete: undefined,
			request: null,			
			markers: [],
			frame: []			
		};

		self.data.push(itemData);
		self.instance[wrapper.id] = item;
	
		var itemIdx = self.data.length-1;	
		self.data[itemIdx].item = item;
		self.data[itemIdx].name = wrapper.id;
		self.data[itemIdx].frame = itemFrame;
		self.data[itemIdx].type = item.animType;
		self.data[itemIdx].loop = false;				
	
		if (!markers || !markers.length) {
			self.data[itemIdx].markers = null;
		} else {
			for (var j=0; j<markers.length; j++) {
				self.data[itemIdx].markers.push(markers[j]);
			}
		}												

		self.getDelay(1).then(() => {         
		    self.loadComplete(self.data[itemIdx]);
		}); 				
	};			

	
	/**
	 * *****************************************************************
	 * 비동기 delay
	 * @param {number} ms
	 *
	 * [전달]
	 * - Promise resolve → then()
	 */
	fnLottieAnimation.prototype.getDelay = function(ms) {
		return new Promise((r) => setTimeout(r, ms));
	};	


	/**
	 * *****************************************************************
	 * 배열 index 검색
	 * @param {Array} list
	 * @param {*} obj
	 *
	 * [반환]
	 * - 일치 index 반환
	 */
	fnLottieAnimation.prototype.index = function(list, obj) {	
		var lis = list;
		for (var i=0, len=lis.length; i<len; i++) {
			if (obj === lis[i]) return i;                
		}
	};		
	
	
	/**
	 * *****************************************************************
	 * 문자열 타입 체크
	 * @param {*} value
	 *
	 * [반환]
	 * - string 여부 boolean
	 */
	fnLottieAnimation.prototype.getString = function(value) {
		return typeof value === 'string' || value instanceof String;
	};			


	/**
	 * *****************************************************************
	 * 사용자 정의 콜백 (override)
	 *
	 * @param {Object} data
	 */
	fnLottieAnimation.prototype.loadComplete = function(data) {};
	fnLottieAnimation.prototype.startData = function(data, name, idx) {};	
	
};
