/**
 * **************************************************************
 * Name: {공통} Animate CC
 * Data: 2025-04-25 
 * **************************************************************
 */


/**
 * Animate CC 로드
 * 
 * @param {*} canvasId 애니메이트CC가 그려지는 캔버스 ID
 * @param {*} compositionId 그려지는 애니메이트CC 컴포지션 ID
 * @param {*} instanceName 인스턴스명
 */
function loadAnim(canvasId, compositionId, instanceName) {
  const canvas = document.getElementById(canvasId);
  const comp = AdobeAn.getComposition(compositionId);
  let lib = comp.getLibrary();
  const loader = new createjs.LoadQueue(false);

  loader.addEventListener("fileload", (evt) => {
    handleFileLoad(evt, comp);
  });

  loader.addEventListener("complete", (evt) => {
    canvas.addEventListener("loaded", loadedHandler);
    handleComplete(evt, comp, canvas, instanceName);
  });

  lib = comp.getLibrary();
  createjs.MotionGuidePlugin.install();
  loader.loadManifest(lib.properties.manifest);
};

/**
 * loadAnim 이 호출되면 실행되는 내부 함수
 */
function handleFileLoad(evt, comp) {
  let images = comp.getImages();
  if (evt && evt.item.type == "image") {
    images[evt.item.id] = evt.result;
  }
};

// Canvas에서 로드가 완료 되는 시점의 이벤트 및 전달 파람
let temp_canvas;
let temp_linkage;
let temp_exportRoot;
const loadedHandler = () => loadAnimComplete(temp_canvas, temp_linkage, temp_exportRoot);

function handleComplete(evt, comp, canvas, linkage) {
  let lib = comp.getLibrary();
  let ss = comp.getSpriteSheet();
  let queue = evt.target;
  let ssMetadata = lib.ssMetadata;
  for (i = 0; i < ssMetadata.length; i++) {
    ss[ssMetadata[i].name] = new createjs.SpriteSheet({
      images: [queue.getResult(ssMetadata[i].name)],
      frames: ssMetadata[i].frames,
    });
  }
  exportRoot = new lib[linkage]();
  exportRoot.linkage = linkage;
  stage = new lib.Stage(canvas);

  window[linkage] = exportRoot;
  window[linkage].fps = lib.properties.fps;

  stage.addChild(exportRoot);

  createjs.Ticker.framerate = lib.properties.fps;

  createjs.Ticker.addEventListener("tick", stage);  

  AdobeAn.compositionLoaded(lib.properties.id);

  temp_canvas = canvas;
  temp_linkage = linkage;
  temp_exportRoot = exportRoot;  

  canvas.dispatchEvent(new Event("loaded"));
}

/**
 * handleComplete complete
 * @param {*} canvas
 * @param {*} linkage
 */
function loadAnimComplete(canvas, linkage, exportRoot) {  
  canvas.removeEventListener("loaded", loadedHandler);   
  canvas.style.position = "absolute";       							      
  // onLoadAnimComplete(canvas, linkage, exportRoot);    
  _animSleep(800).then(() => onLoadAnimComplete(canvas, linkage, exportRoot));
};


/**
 * loadAnimComplete call
 * @param {*} canvas 
 * @param {*} linkage 
 */
function onLoadAnimComplete(canvas, linkage, exportRoot) {};


/**
 * Promise delay
 * @param {*} ms 
 */
function _animSleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
