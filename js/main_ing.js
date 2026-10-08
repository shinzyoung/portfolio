"use strict";

// ** 배너 영역 **
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.bannerTop .slider');
    const bannerTop = document.querySelector('.bannerTop');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let currentIndex = 0;
    const totalSliders = sliders.length;
    let slideInterval;

    
    function showSlide(newIndex, direction) {
        const currentSlider = sliders[currentIndex]; 
        const nextSlider = sliders[newIndex];

        // 1. 모든 슬라이드의 애니메이션 관련 클래스 초기화
        sliders.forEach((slider) => {
            slider.classList.remove('active', 'slide-left', 'slide-right');
        });

        // 2. 방향에 따른 클래스 부여
        if (direction === 'next') {
            bannerTop.setAttribute('data-dir', 'next');
            currentSlider.classList.add('slide-left');
            nextSlider.classList.add('active');
        } else if (direction === 'prev') {
            bannerTop.setAttribute('data-dir', 'prev');
            currentSlider.classList.add('slide-right');
            nextSlider.classList.add('active');
        } else {
            bannerTop.setAttribute('data-dir', 'next');
            nextSlider.classList.add('active');
        }

        // 3. data-idx 업데이트 (CSS 스타일링용)
        bannerTop.setAttribute('data-idx', newIndex);

        // 4. 현재 인덱스 갱신
        currentIndex = newIndex;
    }

    // 다음 슬라이드
    function nextSlide() {
        const nextIndex = (currentIndex + 1) % totalSliders;
        showSlide(nextIndex, 'next');
    }

    // 이전 슬라이드 (첫 장에서 누르면 마지막 장으로 완벽 순환)
    function prevSlide() {
        const prevIndex = (currentIndex - 1 + totalSliders) % totalSliders;
        showSlide(prevIndex, 'prev');
    }

    // 자동 재생 함수
    function startAutoSlide() {
        stopAutoSlide();
        slideInterval = setInterval(nextSlide, 3000);
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    // 다음 버튼 클릭
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoSlide();
    });

    // 이전 버튼 클릭
    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoSlide();
    });

    // 마우스 호버 시 일시정지 / 재개
    bannerTop.addEventListener('mouseenter', stopAutoSlide);
    bannerTop.addEventListener('mouseleave', startAutoSlide);

    // 초기 실행 (방향 없이 첫 장 띄우기)
    sliders[0].classList.add('active');
    bannerTop.setAttribute('data-idx', 0);
    startAutoSlide();
});