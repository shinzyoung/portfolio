/**
 * ==================================================================
 * fnResponsive js
 * 26-04-08 v1 
 * ================================================================== 
 */
function fnResponsive() {
    this.container = null;

    this.baseWidth = 0;
    this.baseHeight = 0;

    this.scaleRatio = 1;
    this.elementPos = { x: 0, y: 0 };

    this._resizeTimer = null;
    this._boundHandler = null;
}


/**
 * =========================
 * util
 * =========================
 */
fnResponsive.prototype._getViewport = function () {
    return {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    };
};


/**
 * =========================
 * init
 * =========================
 */
fnResponsive.prototype.init = function (el) {
    if (!el || !el.tagName) {
        console.error("@ fnResponsive: invalid element");
        return;
    }

    this.container = el;

    // 기준 사이즈 (절대 변하지 않음)
    this.baseWidth = el.offsetWidth;
    this.baseHeight = el.offsetHeight;

    // 기본 스타일 보정
    this._setupStyle();

    this.update();
    this._bindEvents();

    console.log("@ fnResponsive init");
};


/**
 * =========================
 * style init
 * =========================
 */
fnResponsive.prototype._setupStyle = function () {
    var el = this.container;

    // 반드시 필요
    if (!el.style.position) {
        el.style.position = "absolute";
    }

    el.style.left = "0px";
    el.style.top = "0px";

    // transform origin 고정
    el.style.transformOrigin = "0 0";
    el.style.webkitTransformOrigin = "0 0";
    el.style.msTransformOrigin = "0 0";
};


/**
 * =========================
 * event binding
 * =========================
 */
fnResponsive.prototype._bindEvents = function () {
    var self = this;

    this._boundHandler = function () {
        if (self._resizeTimer) return;

        self._resizeTimer = setTimeout(function () {
            self._resizeTimer = null;
            self.update();
        }, 100);
    };

    // resize
    if (window.addEventListener) {
        window.addEventListener("resize", this._boundHandler, false);
        window.addEventListener("orientationchange", this._boundHandler, false);
    } else {
        window.attachEvent("onresize", this._boundHandler); // IE8
    }
};


/**
 * =========================
 * update
 * =========================
 */
fnResponsive.prototype.update = function () {
    if (!this.container) return;

    var vp = this._getViewport();

    this.containerWidth = vp.width;
    this.containerHeight = vp.height;

    this._applyScale();
};


/**
 * =========================
 * core scale logic
 * =========================
 */
fnResponsive.prototype._applyScale = function () {
    var el = this.container;

    var baseW = this.baseWidth;
    var baseH = this.baseHeight;

    if (!baseW || !baseH) return;

    var scaleX = this.containerWidth / baseW;
    var scaleY = this.containerHeight / baseH;

    // contain 방식 (비율 유지)
    var scale = Math.min(scaleX, scaleY);

    this.scaleRatio = scale;

    var scaledW = baseW * scale;
    var scaledH = baseH * scale;

    var left = (this.containerWidth - scaledW) / 2;
    var top = (this.containerHeight - scaledH) / 2;

    this.elementPos.x = left;
    this.elementPos.y = top;

    this._setTransform(el, scale);
    this._setPosition(el, left, top);

    this.release(scale, left, top);
};


/**
 * =========================
 * transform (핵심)
 * =========================
 */
fnResponsive.prototype._setTransform = function (el, scale) {
    var value = "scale(" + scale + ")";

    // 최신 브라우저
    el.style.transform = value;
    el.style.webkitTransform = value;
    el.style.msTransform = value;

    // 🔥 구형 웹뷰 fallback (아주 중요)
    if (!("transform" in el.style)) {
        el.style.zoom = scale;
    }
};


/**
 * =========================
 * position
 * =========================
 */
fnResponsive.prototype._setPosition = function (el, left, top) {
    el.style.left = left + "px";
    el.style.top = top + "px";
};


/**
 * =========================
 * destroy (메모리 누수 방지)
 * =========================
 */
fnResponsive.prototype.destroy = function () {
    if (!this._boundHandler) return;

    if (window.removeEventListener) {
        window.removeEventListener("resize", this._boundHandler);
        window.removeEventListener("orientationchange", this._boundHandler);
    }
};


/**
 * =========================
 * callback hook
 * =========================
 */
fnResponsive.prototype.release = function (scale, x, y) {    
    // console.log(scale, x, y);
};


/**
 * =========================
 * new object
 * =========================
 */
var fnResponsive = new fnResponsive();