"use strict";

const vdo = document.querySelector('#vdo');

vdo.addEventListener('click', function() {
    if(vdo.paused) {
        vdo.play();
    } else {
        vdo.pause();
    }
});