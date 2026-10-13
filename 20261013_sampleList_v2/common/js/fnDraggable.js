/**
 * ==================================================
 * fnDraggable js 
 * 2026-04-09 v1  
 * ==================================================
 */
function fnDraggable() {             
     this.container = null;     
     this.dragItem = null;     
     this.dropItem = null;          
     this.dragTarget = null;     
     this.dropTarget = null;    
     this.resizeRoot = null;     
     
     this.touchPoints = [];               
     this.tempRect = {};          
     this.pos = {x:0, y:0};                            
     this.exceptionPos = {x:0, y:0};   
     this.startPos = {x:0, y:0, dragable:false};                                 

     this.pressDragable = false;
     this.moveDragable = false;
     this.endDragable = false;
     this._moved = false;
     this._moveThreshold = 10;    
          
     this.isDragEvent = null;    
     this.isDragPen = null;    
     this.isDragTouch = null;         
     this.isSetTouch = null;               
     this.isHitTest = null;    
     this.isTouchEnd = null; 	
     this.isEnter = null;                  
     this.isAnimated = null;     
     this.isDevice = false; 
     this.isMultiTouchis = false;
     this.isRightButton = false;        
     
     this.isThreshold = 50;             
     this.isEndUpdate = [];         
     this.isPlatform = "win16|win32|win64|mac|macintel";          
     this.resizeFactor = 1;	     

     this.insideRange = false;
     this.instances = [];

     
     //*********************************************************************** */     
     
     /**
	 * Draggable init
	 * @param options {	 	 
	 	 dragItem : object drag
	 	 dropItem : object drop	  
           threshold : {int} target threshold	 	 	            
	   }	 
	*/ 	
     fnDraggable.prototype.init = function(options) {                         
          var opt = options || {};			                                        
		
          if (opt.drag === null || opt.drag === undefined || opt.drag.length === 0) {
			console.log("@ Draggable not target");
			return;
          }

          this.dragItem = opt.drag;
          this.dropItem = opt.drop;
          this.isThreshold = (opt.threshold === undefined) ? 50 : opt.threshold;                    
          this.resizeRoot = opt.resize;
          
          this.scaleInit(this.resizeRoot);
          this.getDraggableItem();	                                                                    
     };


     //*********************************************************************** */
     /**
	 * get draggable item      	 
	 */
	fnDraggable.prototype.getDraggableItem = function() {
          var self = this;

          for (var i=0, max=self.dragItem.length; i<max; i++) {
               var item = self.dragItem[i];

               (function(currentItem) {                    
                    // currentItem.style.cursor = "move";            
                    currentItem.style.touchAction = "none";            
                    currentItem.style.userSelect = "none";                                                     
                    
                    currentItem.addEventListener("mousedown", function(e) { self.setListener(currentItem, e); }, false);		                                                            
                    currentItem.addEventListener("mouseup", function(e) { self.onRelease(currentItem, e); }, false);		
                    currentItem.addEventListener("touchstart", function(e) { self.setListener(currentItem, e); }, false);		                                             
                    currentItem.addEventListener("touchend", function(e) { self.onRelease(currentItem, e); }, false);		
                    currentItem.addEventListener("touchcancel", function(e) { self.onRelease(currentItem, e); }, false);	                                        
                    
                    if (self.isDevice === true) {                    
                         currentItem.addEventListener("pointerdown", self.setPointerListener, true);                    
                    }	
               })(item);               
          }                     

          self.pressDragable = true;                                        
     };


     //*********************************************************************** */
	/**
      * pointer event Listener 
      * {exp} pointerdown | pointermove | pointerup | pointerout      
      */       
     fnDraggable.prototype.setPointerListener = function(e) {   
		if (this.isDevice === false) return;

        switch (e.pointerType) {
            case "pen":
                this.isDragPen = true;
                this.isDragTouch = false;
                break;
            case "touch":
                this.isDragPen = false;
                this.isDragTouch = true;
                break;
        }

        if (e.preventDefault) e.preventDefault();
     };
     

     /**
	 * set listener
	 * {exp} mousedown | touchstart
	 */
	fnDraggable.prototype.setListener = function(target, e) {									          
		var evt = e || window.event;		
		var self = this;
          var inTarget = target;          

		if (evt.preventDefault) {
			if (evt.cancelable !== false) {
				evt.preventDefault();
			}
		} else {
			evt.returnValue = false;
		}		

		if (evt.type === "mousedown" || evt.type === "touchstart") {
			self.isTouchEnd = false;
			self.isRightButton = false;

			if (evt.type === "mousedown") {
				if (typeof evt.which !== "undefined") {
					self.isRightButton = (evt.which === 3);
				} else if (typeof evt.button !== "undefined") {
					self.isRightButton = (evt.button === 2);
				}
               }		                                    

			if (!self.isRightButton && self.pos && self.pressDragable === true) {
				if (typeof self.onPress === "function") {	                         
					self.onPress(inTarget, evt);
				}
			}
		}
	};


     //*********************************************************************** */			
	/**
	 * onPress	 
	 * @param {*} target 
	 * @param {*} e 
	 */
	fnDraggable.prototype.onPress = function(target, e) {	
          if (!this.pressDragable) return; 	
          if (e.cancelable) e.preventDefault();	
          
          var self = this;
          var inTarget = target;
          self.dragTarget = inTarget;              
          self.dropTarget = null;      
          
          self._initState(inTarget);          
          self.startX = e.clientX;
          self.startY = e.clientY;          
          inTarget.style.transition = "none";

          self.pressDragable = false;          
          self.moveDragable = true;                     
          self._hitInitialized = undefined;
          self._prevHit = undefined;
          
          self.dropTarget = null;                 
          self.isEnter = null;                    
          self.isHitTest = null;          
          self.isEndUpdate.length = 0;                
          self.exceptionPos.x = 0;    
          self.exceptionPos.y = 0;                                      
          self._moved = false;
                    
          var coors = self.getPosition(target, e); 
          var factor = fnDraggable.resizeFactor;          
          self.startPos.x = coors.x / factor;
          self.startPos.y = coors.y / factor;  
                    
          self.pos.x = (self.startPos.x + 0.5) | 0;
          self.pos.y = (self.startPos.y + 0.5) | 0;                      
          
          inTarget.style.willChange = "transform";
          inTarget.style.transform = "translateZ(0)";

          self._moveHandler = function(e) {
               self.onMove(inTarget, e);
          };       
          self._upHandler = function(e) {
               self.onRelease(inTarget, e);
          };                             
          
          document.addEventListener("mousemove", self._moveHandler, false);
          document.addEventListener("mouseup", self._upHandler, false);
          document.addEventListener("touchmove", self._moveHandler, { passive: false });
          document.addEventListener("touchend", self._upHandler, false);     
          
          self.start(inTarget);                      
     };
     

     //*********************************************************************** */			
	/**
	 * onMove	 
	 * @param {*} target 
	 * @param {*} e 
	 */
     fnDraggable.prototype.onMove = function(target, e) {          
          if (!this.moveDragable) return;                    

          var self = this;                                        
          var inTarget = self.dragTarget;          
          if (!inTarget) return;   
          
          self._lastEvent = e;
          if (self._raf) return;

          self._raf = requestAnimationFrame(function() {
               self._raf = null;
               var evt = self._lastEvent;
               var coors = self.getPosition(inTarget, evt);
               var factor = fnDraggable.resizeFactor;
               
               var chX = (coors.x / factor) - self.startPos.x;
               var chY = (coors.y / factor) - self.startPos.y;
               
               if (!self._moved) {
                    if ((chX > self._moveThreshold || chX < -self._moveThreshold) ||
                         (chY > self._moveThreshold || chY < -self._moveThreshold)) {
                         self._moved = true;
                    }
               }

               inTarget.style.willChange = "transform";
               inTarget.style[self.transformProp] = "translate3d(" + chX + "px," + chY + "px,0)";               
          });          
          
          self.move(inTarget);                                
     };


     /**
      * drag style translate
      */
     fnDraggable.prototype.transformProp = (function () {
          var style = document.createElement("div").style;
          if ("transform" in style) return "transform";
          if ("WebkitTransform" in style) return "WebkitTransform";
          if ("MozTransform" in style) return "MozTransform";
          if ("msTransform" in style) return "msTransform";
          if ("OTransform" in style) return "OTransform";
          return "transform";
     })();
     
     
     //*********************************************************************** */			
	/**
	 * onRelease	 
	 * @param {*} target 
	 * @param {*} e 
	 */
     fnDraggable.prototype.onRelease = function(target, e) {	
          if (e && e.preventDefault) e.preventDefault();

          var self = this;
          var inTarget = self.dragTarget;          

          var endUpdate = self.isEndUpdate;
          endUpdate[endUpdate.length] = self.isEnter;
          endUpdate[endUpdate.length] = self.isHitTest;
          inTarget.style.willChange = "auto";

          var startPos = self.startPos;
          startPos.dragable = false;
          startPos.x = 0;
          startPos.y = 0;

          self.pressDragable = true;
          self.moveDragable = false;
          self.endDragable = false;     
         
          var isException = false;
          if (!self._moved) {
               isException = true;
          } else {
               isException = false;
          }          
          
          self.touchPoints.length = 0;            
          
          document.removeEventListener("mousemove", self._moveHandler, false);
          document.removeEventListener("mouseup", self._upHandler, false);
          document.removeEventListener("touchmove", self._moveHandler, false);
          document.removeEventListener("touchend", self._upHandler, false);        
                    
          var state = inTarget._dragState;          
          var style = window.getComputedStyle(inTarget);
          var matrix = new WebKitCSSMatrix(style.transform);
          state.x = matrix.m41;
          state.y = matrix.m42;

          self.dragTarget = null;
                    
          if (isException === true) {
               self.revert(inTarget, 0);
          } else {
               self.end(inTarget, self.dropTarget);                              
          }                            
          
     };


     //*********************************************************************** */			
     /**
      * drag drop target hit test
      * @param {*} obj1 drag target
      * @param {*} obj2 drop target
      * @param {*} threshold threshold
      * @param {*} callback result
      */          
     fnDraggable.prototype.hitTest = function(obj1, obj2, threshold, callback) {
          var self = this;                             
          var result = false;
          var r1, r2;              
          
          this._hitStateMap = this._hitStateMap || new WeakMap();

          if (obj1 && obj2 && obj1 !== obj2) {
               r1 = self.getParseRect(obj1);
               r2 = self.getParseRect(obj2);

               if (r1 && r2) {
                    if (
                         r2.left < r1.right &&
                         r2.right > r1.left &&
                         r2.top < r1.bottom &&
                         r2.bottom > r1.top
                    ) {
                         threshold = (threshold != null) ? threshold : self.isThreshold;

                         if (!threshold) {
                              result = true;                              
                         } else {
                              var overlapW = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
                              var overlapH = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);

                              if (overlapW > 0 && overlapH > 0) {
                              if (typeof threshold === "string" && threshold.indexOf("%") > -1) {
                                   var ratio = parseFloat(threshold) * 0.01;
                                   var overlapArea = overlapW * overlapH;
                                   var minArea = Math.min(
                                        r1.width * r1.height,
                                        r2.width * r2.height
                                   );
                                   result = overlapArea >= minArea * ratio;
                              } else {
                                   result = overlapW > threshold && overlapH > threshold;
                              }
                              }
                         }
                    }
               }
          }
          
          var state = this._hitStateMap.get(obj2) || {
               initialized: false,
               prevHit: false,
               locked: false
          };
          
          // Initial state setting
          if (!state.initialized) {
               state.initialized = true;
               state.prevHit = result;
               this._hitStateMap.set(obj2, state);
               return result;
          }
          
          // Trigger callback once on enter and once on leave
          if (callback && state.prevHit !== result) {               
               self.dropTarget = obj2;               
               callback(result, {
                    result: result, // true = enter, false = leave
                    drag: obj1,
                    drop: obj2
               });
          }

          state.prevHit = result;
          this._hitStateMap.set(obj2, state);          

          return result;                             
     };  


     //*********************************************************************** */
     /**
      * parse rect      
      * @param {*} e drag target
      * @param {*} target drop target
      */
     fnDraggable.prototype.getParseRect = function(e, target) {
          var self = this;
                    
          if (e === window) {
               var w = window;
               var docEl = _docElement;
               var body = _doc.body;

               var width = w.innerWidth || docEl.clientWidth || body.clientWidth || 0;
               var height = w.innerHeight || docEl.clientHeight || body.clientHeight || 0;

               return {
                    left: 0,
                    top: 0,
                    right: width,
                    bottom: height,
                    width: width,
                    height: height
               };
          }          
          
          if (e && (e.pageX != null && e.pageY != null)) {                              
               var scrollLeft = self.getDocScroll().left;
               var scrollTop = self.getDocScroll().top;                              
               var x = e.pageX - scrollLeft;
               var y = e.pageY - scrollTop;               

               return {
                    left: x,
                    top: y,
                    right: x + 1,
                    bottom: y + 1,
                    width: 1,
                    height: 1
               };
          }
          
          var el = this.unwrapElement(e);
          if (!el) return null;
          
          if (el.getBoundingClientRect) {
               var rect = el.getBoundingClientRect();

               return {
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    width: rect.width || (rect.right - rect.left),
                    height: rect.height || (rect.bottom - rect.top)
               };
          }
          
          return this.oldIERect(el);
     };  

     fnDraggable.prototype.getDocScroll = function() {
          return {
               top: window.pageYOffset != null
                    ? window.pageYOffset
                    : (_docElement.scrollTop || _doc.body.scrollTop || 0),
          
               left: window.pageXOffset != null
                    ? window.pageXOffset
                    : (_docElement.scrollLeft || _doc.body.scrollLeft || 0)
          };
     };          
     
     fnDraggable.prototype.oldIERect = function(e) {
          var top = 0, left = 0;
          var width = el.offsetWidth;
          var height = el.offsetHeight;
      
          while (el) {
              top += el.offsetTop;
              left += el.offsetLeft;
              el = el.offsetParent;
          }
      
          return {
              top: top,
              left: left,
              right: left + width,
              bottom: top + height,
              width: width,
              height: height
          };
     };    

     fnDraggable.prototype.unwrapElement = function(value) {
          if (!value) {
               return value;
          }
          if (value.length && value !== window && value[0] && value[0].style && !value.nodeType) {
               value = value[0];
          }
          return (value === window || (value.nodeType && value.style)) ? value : null;
     };
     
     
     //*********************************************************************** */
     /**
      * drag target revert
      * @param {*} target dragItem 
      * @param {*} speed transition animation speed
      * @param {*} animated transition animation name
      */          
     fnDraggable.prototype.revert = function(target, speed, animated) {
          var self = this;
          var inSpeed = (speed === undefined) ? 0.2 : speed;
          self.isAnimated = animated;              
          
          self._initState(target);
          var state = target._dragState;
          var startX = state.x;
          var startY = state.y;
          var transitionEnd = self.getTransitionEnd();
          
          target.style.transition = "none";
          target.style.transform = "translate3d(" + startX + "px," + startY + "px,0)";

          requestAnimationFrame(function() {               
               target.style.transition = "transform " + inSpeed + "s ease-in-out";
               target.style.transform = "translate3d(0,0,0)";
               state.x = 0;
               state.y = 0;
          });

          function onEnd() {
               target.removeEventListener(transitionEnd, onEnd);

               requestAnimationFrame(function() {
                    self.transformRemove(target);

                    if (animated) {
                         self.cssAnimationStart(target, animated);
                    } else {
                         if (inSpeed > 0) {
                              self.revertComplete(target);                         
                              // self.setEventListener(target);
                         }                         
                    }
               });
          }

          if (inSpeed === 0) {
               onEnd();
          } else {
               target.addEventListener(transitionEnd, onEnd);
          }
     };

     fnDraggable.prototype.transformRemove = function(target) {          
          target.style.removeProperty("transform");
          target.style.removeProperty("transition"); 
     };

     fnDraggable.prototype.getTransitionEnd = function() {
          var el = document.createElement("div");
          var transitions = {
               "transition": "transitionend",
               "WebkitTransition": "webkitTransitionEnd",
               "MozTransition": "transitionend",
               "OTransition": "oTransitionEnd"
          };
          
          for (var t in transitions) {
               if (el.style[t] !== undefined) return transitions[t];
          }
          return "transitionend";
     };
      
     fnDraggable.prototype.getAnimationEnd = function() {
          var el = document.createElement("div");
          var animations = {
               "animation": "animationend",
               "WebkitAnimation": "webkitAnimationEnd",
               "MozAnimation": "animationend",
               "OAnimation": "oAnimationEnd"
          };
          
          for (var a in animations) {
               if (el.style[a] !== undefined) return animations[a];
          }
          return "animationend";
     };           

     fnDraggable.prototype.cssAnimationStart = function(target, name) {
          var self = this;
          var animationEnd = self.getAnimationEnd();

          target.classList.remove(name);          
          target.offsetWidth;
          target.classList.add(name);

          var handler = function(e) {
               self.cssAnimationEnd(target, name, handler);
          };
          
          target._animationHandler = handler;
          target.addEventListener(animationEnd, handler);
     };

     fnDraggable.prototype.cssAnimationEnd = function(target, name, handler) {
          var self = this;
          var animationEnd = self.getAnimationEnd();

          target.classList.remove(name);

          if (handler) {
               target.removeEventListener(animationEnd, handler);
          }  

          // self.setEventListener(target);
          self.isAnimated = null;
     }; 


     //*********************************************************************** */
     /**
	 * setEventListener
	 * @param {*} data 
	 */
	fnDraggable.prototype.setEventListener = function(data) {						
          var self = this;          
          
		if (!data) return;
          var wrapper = data;          
		
		if (!self._onAnimationComplete) {
			self._onAnimationComplete = function (e) { };
		}		
		wrapper.removeEventListener("revertComplete", self._onAnimationComplete, false);

		var event;		
		if (typeof window.CustomEvent === "function") {
			try {
				event = new CustomEvent("revertComplete", {
					bubbles: true,
					cancelable: true,
					detail: data
				});
			} catch (e) {					
				event = document.createEvent("CustomEvent");
				event.initCustomEvent("revertComplete", true, true, data);
			}
		} else {			
			event = document.createEvent("CustomEvent");
			event.initCustomEvent("revertComplete", true, true, data);
		}

		wrapper.dispatchEvent(event);
	};


	//*********************************************************************** */
	/**
	 * addEvent callback
	 * @param {*} target 
	 * @param {*} eventName 
	 * @param {*} callback 
	 */
	fnDraggable.prototype.addEvent = function (target, eventName, callback) {
          var inst = target;		          
		if (!inst) return;
  
		var wrapper = inst;  		
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
     
     
     //*********************************************************************** */
     fnDraggable.prototype._initState = function(target) {
          if (!target._dragState) {
              target._dragState = {
                  x: 0,
                  y: 0
              };
          }
     };

     
     //*********************************************************************** */
     /**
      * event callback
      * @param {*} drag 
      */
     fnDraggable.prototype.revertComplete = function(target) {};      
     fnDraggable.prototype.start = function(target) {};     
     fnDraggable.prototype.move = function(target) {};         
     fnDraggable.prototype.end = function(drag, drop, exception) {};   


     //*********************************************************************** */			
     /**
	 * get position
	 * @param {*} e type
	 * @returns movePosition
	 */
	fnDraggable.prototype.getPosition = function(target, e) {	
          var self = this;	
          var x, y;		          
          var inTarget = target;
          // var inRect = self.container.getBoundingClientRect(); 		          

          if (e.touches) {
               let inTouch = e.touches[0] || e.changedTouches[0];
               x = inTouch.clientX;
               y = inTouch.clientY;			
          } else {
               x = e.clientX;
               y = e.clientY;			
          }		
          return {x: x, y: y};
     };         


     //*********************************************************************** */
	/**
	 * resize init
	 */
	fnDraggable.resizeInstances = [];
	fnDraggable.resizeTimer = null;
	fnDraggable.resizeBinded = false;	

	fnDraggable.prototype.scaleInit = function(root) {	
          var self = this;		
          var inRoot = root;          
          
		fnDraggable.resizeInstances.push(self);

		function _updateScale(instance) {			
			fnDraggable.resizeFactor = instance.getScale(inRoot);
			console.log('@ fnDraggable responsive scale:', fnDraggable.resizeFactor);	
		}		
		_updateScale(self);

		if (typeof fnResponsive === 'undefined' || fnResponsive.container === null) {			
			if (!fnDraggable.resizeBinded) {
				fnDraggable.resizeBinded = true;

				window.addEventListener('resize', function () {
					clearTimeout(fnDraggable.resizeTimer);
					fnDraggable.resizeTimer = setTimeout(function () {						
						_updateScale(self);						
					}, 200);
				});
			}
		} 
		else {						
			fnDraggable.resizeFactor = fnResponsive.scaleRatio;			
			fnResponsive.release = function(ratio) {				
				fnDraggable.resizeFactor = ratio;	
				clearTimeout(fnDraggable.resizeTimer);
				fnDraggable.resizeTimer = setTimeout(function () {						
					_updateScale(self);						
				}, 200);								
			};			
		}		
	};

	
	/**
	 * scale data
	 * @param {*} el 
	 */
	fnDraggable.prototype.getScale = function(el) {		
          // var style = window.getComputedStyle ? window.getComputedStyle(el, null) : el.currentStyle;
          if (el && el.nodeType === 1) {
               var style = window.getComputedStyle
                   ? window.getComputedStyle(el, null)
                   : el.currentStyle;                          
          } else {
               console.warn("Invalid resize scale element:", el);
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
     

     //*********************************************************************** */
     /**
      * navigator check
      */
     fnDraggable.prototype.navigatorType = function() {
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
