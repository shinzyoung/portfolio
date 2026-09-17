"use strict";

/* =====================================================
 * 1. 반응형 스케일링 1920*1080 뷰포트에 맞춰 scale 적용
 *  --> 창 크기 줄어도 내부 비율 그대로 유지
========================================================*/
function initStageScale(stageEl) {
    const STAGE_W = 1920;
    const STAGE_H = 1080;
    
    function resize() {
        const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
        stageEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
        stageEl.classList.add('is-ready');
    }

    resize();  // 처음 로드될 때 1회 실행
    window.addEventListener("resize", resize); // 창 크기 바뀔때마다 재실행
    window.addEventListener("orientationchange", resize); // 모바일 화면 회전시 재실행
    return resize;
}
/* =====================================================
 * 2. 휠 스크롤 슬라이드 전환
========================================================*/
function initSlideNav(rootEl) {
    const slides = Array.from(rootEl.querySelectorAll('.slide'));
    const dotsWrap = document.querySelector('.progress');
    const pageCountEl = document.querySelector('.page-count .current');
    const total = slides.length;

    let current = 0;
    let locked = false;
    const LOCK_MS = 800;
    const WHEEL_THRESHOLD = 30;

    // 도트 인디케이터 생성(도트만 만들기 한번만 실행, 초기화 단계)
    // 현재 코드에서는 4번 반복, 클로저 개념(태어난 함수의 변수를 기억)
    // b.addEventListener("click", () => goTo(0));   // ← i자리에 0이 "박제"됨
    // b.addEventListener("click", () => goTo(1);   // ← i자리에 1이 "박제"됨
    // b.addEventListener("click", () => goTo(2));   // ← i자리에 2이 "박제"됨
    // b.addEventListener("click", () => goTo(3));   // ← i자리에 3이 "박제"됨
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `${i + 1}번 슬라이드로 이동`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }

    function render() {
        slides.forEach((s, i) => {
            s.classList.remove("active", "visible", "move_in");
            if (i === current) {
                s.classList.add("active", "visible", "move_in");
            }
        });
        if (dotsWrap) {
            Array.from(dotsWrap.children).forEach((b, i) => {
                b.classList.toggle("active", i === current); //클릭시 activ toggle
            });
        }
        if (pageCountEl) pageCountEl.textContent = current + 1;
        rootEl.dispatchEvent(
            new CustomEvent("slidechange", { detail: { index: current } })
        );
    }

    function goTo(index) {
        if (locked) return;
        const next = Math.max(0, Math.min(total - 1, index));
        if (next === current) return;
        current = next;
        locked = true;  //전환중 잠금, 입력방지
        render();
        setTimeout(() => (locked = false), LOCK_MS);  // 0.8초뒤 잠금해제
    }

    function next() {goTo(current + 1);}
    function prev() {goTo(current - 1);}

    // 휠
    // window.addEventListener(
    //     "wheel",
    //     (e) => {
    //       e.preventDefault();
    //       if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
    //       e.deltaY > 0 ? next() : prev();
    //     },
    //     { passive: false }
    // );


    // 휠
    // [260917 수정] 팝업창 추가 :: 팝업창이 열려있는 경우 슬라이드 전환 적용불가하게 조건문 걸어둠.
    window.addEventListener("wheel",
        (e)=>{
            const popArea = document.querySelector('.popArea');
            if(popArea && !popArea.classList.contains('hidden')) {
                return; //팝업창이 열려있으면 마우스휠 움직여도 페이지이동 막음
            }

            e.preventDefault();
            if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
            e.deltaY > 0 ? next() : prev();
        },
        {passive:false}
    );





    // 키보드
    window.addEventListener("keydown", (e) => {
        if (["ArrowDown", "PageDown"].includes(e.key)) next();
        if (["ArrowUp", "PageUp"].includes(e.key)) prev();
    });

    // 터치 (모바일 스와이프)
    let touchStartY = 0;
    window.addEventListener(
        "touchstart",
        (e) => (touchStartY = e.touches[0].clientY),
        { passive: true }
    );
    window.addEventListener(
        "touchend",
        (e) => {
          const diff = touchStartY - e.changedTouches[0].clientY;
          if (Math.abs(diff) < 50) return;
          diff > 0 ? next() : prev();
        },
        { passive: true }
    );

    render();
    return {goTo, next, prev, get current() { return current; }};
}

/* =====================================================
 * 3. 주요 프로젝트(WORK) 팝업 제어
========================================================*/
function initWorkPopup() {
    const workCards = document.querySelectorAll('.work-card');
    const popArea = document.querySelector('.popArea');
    const popLists = document.querySelectorAll('.popList');
    const closeBtn = document.querySelector('.closeBtn');
    const slideBtns = document.querySelectorAll('.popArea button');
    const dotsWrap = document.querySelector('.progress');
    
    let currentIdx = 0;
    let activeList = null;


    if (!popArea || workCards.length === 0) return;

    // 1. work-card 클릭 이벤트
    workCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            
            dotsWrap.classList.add('hidden'); //progress 영역 숨김
            // popArea의 hidden 제거 (팝업 열기)
            popArea.classList.remove('hidden');
            currentIdx = 0; // 팝업열릴때 첫번째 li로 초기화

            // 모든 popList에 hidden을 추가해서 숨기고, 클릭한 순서의 리스트만 hidden 제거
            popLists.forEach((list, listIndex) => {
                if (listIndex === index) {
                    list.classList.remove('hidden');
                    activeList = list;
                } else {
                    list.classList.add('hidden');
                }
            });
            updateSlide();
        });
    });

    
    // 2. 닫기(closeBtn) 버튼 클릭 이벤트
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popArea.classList.add('hidden');
            dotsWrap.classList.remove('hidden'); //progress 영역 노출
        });
    }

    // 3. li 슬라이드 상태 업데이트 함수(on클래스 제어)
    function updateSlide () {
        if(!activeList) return;
        const items = activeList.querySelectorAll('li');
        
        items.forEach((item, idx) =>{
            if(idx === currentIdx) {
                item.classList.add('on');
            } else {
                item.classList.remove('on');
            }
        });

        const slideWidth = 830;
        // CSS에서 기준점을 -415px로 잡았으므로, 
        // 이동할 때는 -415px에서 시작하여 index에 따라 -slideWidth 만큼씩 더 이동시킵니다.
        activeList.style.transform = `translateX(${-415 - (currentIdx * slideWidth)}px)`;
    };

    // 4. 버튼 순서 이벤트 연결
    slideBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            // i가 0이면 prve, i가 1이면 next버튼으로 설정
            if(i == 0) {
                slideFn('prev');
            } else if(i == 1) {
                slideFn('next');
            }
        });
    });

    // 5. 팝업창 슬라이드 이동 함수(switch문 활동)
    const slideFn = (actionType) => {
        if(!activeList) return;
        const items = activeList.querySelectorAll('li');
        const totalItems = items.length;

        switch (actionType) {
            case "prev":
                currentIdx = (currentIdx > 0) ? currentIdx - 1 : 0;
                console.log("이전 슬라이드:", currentIdx);
                break;
            case "next":
                currentIdx = (currentIdx < totalItems - 1 ) ? currentIdx + 1 : 0;
                console.log("다음 슬라이드: ", currentIdx);
                break;
            default:
                break;
        }
        updateSlide();
    
    }
    
}


document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const content = document.querySelector('main.content');
  if (stage) initStageScale(stage);
  if (content) window.slideNav = initSlideNav(content);
  initWorkPopup(); // 팝업 기능 실행
});

