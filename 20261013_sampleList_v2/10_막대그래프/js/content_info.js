/**************************************************************************************/
/**
 * lottie load Animation 
 * renderer: svg | canvas
 */



const fun_lottie_select_ga = function() {	
	lottie_select_ga = lottie.loadAnimation({
		container: document.getElementById("lottie_select_ga"),
		renderer: "canvas",
		loop: false,
		autoplay: false,
		animationData: animationData_lottie_select_ga,		
	});
	lottie_select_ga.addEventListener("DOMLoaded", function() {		
		let obj = lottie_select_ga;
		let frame = null;
		// let frame = null;												
	
		fnLottieAnimation.setData(obj, frame);
		obj.addEventListener("loaded_images", function() {fnLottieAnimation.loaded(obj,  obj.wrapper);});						
	});
};


const fun_lottie_select_na = function() {	
	lottie_select_na = lottie.loadAnimation({
		container: document.getElementById("lottie_select_na"),
		renderer: "canvas",
		loop: false,
		autoplay: false,
		animationData: animationData_lottie_select_na,		
	});
	lottie_select_na.addEventListener("DOMLoaded", function() {		
		let obj = lottie_select_na;
		let frame = null;
		// let frame = null;												
	
		fnLottieAnimation.setData(obj, frame);
		obj.addEventListener("loaded_images", function() {fnLottieAnimation.loaded(obj,  obj.wrapper);});						
	});
};


const fun_lottie_select_da = function() {	
	lottie_select_da = lottie.loadAnimation({
		container: document.getElementById("lottie_select_da"),
		renderer: "canvas",
		loop: false,
		autoplay: false,
		animationData: animationData_lottie_select_da,		
	});
	lottie_select_da.addEventListener("DOMLoaded", function() {		
		let obj = lottie_select_da;
		let frame = null;
		// let frame = null;												
	
		fnLottieAnimation.setData(obj, frame);
		obj.addEventListener("loaded_images", function() {fnLottieAnimation.loaded(obj,  obj.wrapper);});						
	});
};

const fun_lottie_select_ra = function() {	
	lottie_select_ra = lottie.loadAnimation({
		container: document.getElementById("lottie_select_ra"),
		renderer: "canvas",
		loop: false,
		autoplay: false,
		animationData: animationData_lottie_select_ra,		
	});
	lottie_select_ra.addEventListener("DOMLoaded", function() {		
		let obj = lottie_select_ra;
		let frame = null;
		// let frame = null;												
	
		fnLottieAnimation.setData(obj, frame);
		obj.addEventListener("loaded_images", function() {fnLottieAnimation.loaded(obj,  obj.wrapper);});						
	});
};