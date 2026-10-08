// 카테고리 탭 필터링 기능
const filterButtons = document.querySelectorAll('.category-list button');
const cards = document.querySelectorAll('.card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // 활성 버튼 스타일 변경
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filterValue = button.getAttribute('data-filter');

    cards.forEach(card => {
      if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// 프로젝트 카드 클릭 시 하단 뷰어에 iframe 로드
const viewerSection = document.getElementById('viewerSection');
const projectIframe = document.getElementById('projectIframe');
const viewerTitle = document.getElementById('viewerTitle');

function openViewer(url, title) {
  projectIframe.src = url;
  viewerTitle.innerText = title + " 미리보기";
  viewerSection.style.display = 'block';
  
  // 부드럽게 뷰어 위치로 스크롤 이동
  viewerSection.scrollIntoView({ behavior: 'smooth' });
}

function closeViewer() {
  viewerSection.style.display = 'none';
  projectIframe.src = ''; // 리소스 차단 및 초기화
}

function refreshViewer() {
  const currentSrc = projectIframe.src;
  projectIframe.src = '';
  setTimeout(() => {
    projectIframe.src = currentSrc;
  }, 100);
}