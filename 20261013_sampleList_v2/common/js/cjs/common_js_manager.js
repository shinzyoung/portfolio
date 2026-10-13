onload = loadCommonLibrary;
var m_arrLibrary = ['cjsManager', 'createjs-2015.11.26.min', 'externalManager', 'pageBase', 'stepBase', 'util'];

function loadCommonLibrary() {
    document.getElementsByTagName("body")[0].style.margin = 0;
    
    var can 	= document.createElement( 'canvas' );
    can.id     	= "loadingbg";
    can.width  	= 1280;
    can.height 	= 800;
    can.style 	= "position: absolute; display: table; background-color:rgba(255, 255, 255, 0)";

    var ctx = can.getContext('2d');
    can.getContext('2d').miterLimit = 2;
    document.body.appendChild( can );

    var image = new Image();
    image.src = "../images/loading.png";
    image.onload = function () {
        ctx.drawImage(image, 0, 0);
    }

    var nLibrary = 0;
    var path = window.HybridApp == undefined ? '../../../../003_common/' : '../common/';
    loadScript(path, m_arrLibrary[nLibrary], onLoadComplete);

    function onLoadComplete() {
        nLibrary++;

        if (nLibrary == m_arrLibrary.length)
            initContent();
        else
            loadScript(path, m_arrLibrary[nLibrary], onLoadComplete);
    }

}

function loadScript(strPath, strJS, funcload) {

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = strPath + strJS + '.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    script.onload = funcload;

}


function initContent() {

    initStyle();
    
    var fileName = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length).split('.')[0];
    document.title = fileName;
    
    loadScript('scripts/', fileName, function() {
        initPage();
    });

}

function initStyle() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '*{-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}';
    document.getElementsByTagName('head')[0].appendChild(style);

}