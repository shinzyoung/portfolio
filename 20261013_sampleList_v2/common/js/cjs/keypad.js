/*
 *	keypad
 */
window.keypad = (function () {
    let node;
    // let keyId = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "back", "enter"];
    let keyId = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "back",];
    let instance = {
        init: function (spec) {
            node = document.createElement("div");
            node.classList.add("keypad");
            document.querySelector(spec.container).appendChild(node);
            // node = document.querySelector('.keypad');
            this.makePad();
        },
        makePad: function () {
            // 251119 수정
            // for (let i = 0; i < 13; i++) -->원래
            for (let i = 0; i < 12; i++) {
                let btn = document.createElement("div");
                btn.classList.add("btn");
                btn.classList.add("btn-" + i);
                btn.setAttribute("data-id", keyId[i]);
                btn.addEventListener("click", this.hnClick.bind(this));
                node.appendChild(btn);
            }
        },
        hnClick: function (e) {
            let btn = e.currentTarget;
            let id = btn.getAttribute("data-id");
            let customEvent = new CustomEvent(this.KEYPAD_INPUT, {
                detail: { id: id, btn: btn },
            });
            window.dispatchEvent(customEvent);
        },
        show: function () {
            node.classList.add("show");
        },
        hide: function () {
            node.classList.remove("show");
        },
        remove: function () {
            node.classList.add("remove");
        },
    };

    instance.KEYPAD_INPUT = "keypadinput";
    return instance;
})();
