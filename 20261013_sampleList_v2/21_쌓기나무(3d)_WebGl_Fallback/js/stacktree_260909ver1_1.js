
// 전역 변수 설정
let scene, camera, renderer, controls;
let raycaster;
let mouse = new THREE.Vector2();
let grid; // 3D 배열: grid[x][y][z] = mesh object or null (Group 객체)
let currentMode = 'ADD'; // 'ADD' 또는 'DELETE'
const GRID_SIZE = 5; // 격자 크기 (5x5x5)
const CUBE_SIZE = 1;

// 호버 블록 상태 관리
let hoverBlock = null; 
let addHoverPreview = null; 

// 색상 정의
const COLORS = {
    CUBE: 0xF9C58F, // 주황계열(블록 색상)
    PLANE: 0xAAAAAA, // 회색
    DELETE_HOVER: 0xFF6347, // 주황색 (삭제될 블록)
    ADD_HOVER: 0x2196F3 // 파란색 (추가될 위치 미리보기)
};

// ===== 정답 데이터 =====
// x: 좌우 위치 (오른쪽으로 갈수록 커짐)
// y: 높이 / 층수 (위로 쌓을수록 커짐, 0이 바닥)
// z: 앞뒤 위치 (앞뒤 깊이, 카메라 쪽이나 안쪽 방향)
// const ANSWER_BLOCKS = [
//     {x:2, y:0, z:2},
//     {x:2, y:1, z:2},
//     {x:1, y:0, z:2},
//     {x:3, y:0, z:2},
// ];        
const ANSWER_BLOCKS = [
    {x: 4, y: 0, z: 1},
    {x: 3, y: 0, z: 1},
    {x: 2, y: 0, z: 1},
    {x: 1, y: 0, z: 1},
    {x: 3, y: 1, z: 1},
    {x: 2, y: 1, z: 1},
    {x: 2, y: 2, z: 1},    
];        
let answerOverlayBlocks = []; // 정답 오버레이용 고스트 블록 저장

// ===== 효과음 (Web Audio API) =====
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// 초기화 함수
function init() {
    console.log("쌓기나무 시작");
    
    const container = document.getElementById('three-container');
    if (!container) {
        console.error("three-container 엘리먼트를 찾을 수 없습니다.");
        return;
    }

    // 씬 (Scene) 설정
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);  // canvas 흰색 배경색상

    // 컨테이너 크기 계산 (태블릿 미완료 로딩으로 인한 0px 방지 fallback)
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 카메라 (Camera) 설정 :: 쌓기나무 영역 사이즈를 크게 키우더라도 카메라를 좀더 가깝게 조절하면 확대되어 보임(추가수정 부분)
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);            
    // camera.position.set(GRID_SIZE * 1.5, GRID_SIZE * 2, GRID_SIZE * 1.5);
    camera.position.set(GRID_SIZE * 1.1, GRID_SIZE * 1.4, GRID_SIZE * 1.1);

    // 렌더러 (Renderer) 설정
    // renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // 260923 :: 수정 webGl 1.0 으로 컨텍스트를 빌려와 동작 구현할수 있도록 수정 하기위해 주석처리함
    // renderer = new THREE.WebGLRenderer({ 
    //     antialias: true,
    //     powerPreference: "high-performance", // 하이엔드 GPU 사용 강제
    //     preserveDrawingBuffer: true          // 태블릿 프레임버퍼 보존
    // });
    
    
    // *****************************************************************
    // *****************************************************************
    // *****************************************************************
    // 렌더러 (Renderer) 설정 (WebGL 2 미지원 구형 태블릿 Fallback 처리)
    let context;
    const tempCanvas = document.createElement('canvas'); // 임시 캔버스로 컨텍스트 확보

    // try {
    //     // 1. WebGL 2 시도
    //     context = tempCanvas.getContext('webgl2', { 
    //         antialias: true,
    //         powerPreference: "high-performance",
    //         preserveDrawingBuffer: true 
    //     });
        
    //     // 2. WebGL 2를 지원하지 않으면 WebGL 1로 낙하
    //     if (!context) {
    //         console.warn('WebGL 2 지원 안 함 -> WebGL 1 Fallback 적용');
    //         context = tempCanvas.getContext('webgl', { 
    //             antialias: true,
    //             preserveDrawingBuffer: true 
    //         }) || tempCanvas.getContext('experimental-webgl', { 
    //             antialias: true,
    //             preserveDrawingBuffer: true 
    //         });
    //     }

    //     if (!context) {
    //         throw new Error('WebGL을 지원하지 않는 환경입니다.');
    //     }

    //     // 3. 확보한 컨텍스트로 Three.js 렌더러 생성
    //     renderer = new THREE.WebGLRenderer({ 
    //         antialias: true,
    //         powerPreference: "high-performance",
    //         preserveDrawingBuffer: true,
    //         context: context // 핵심: 추출한 컨텍스트 주입
    //     });

    // } catch (e) {
    //     console.error('WebGL 초기화 실패:', e);
    //     // 혹시 모를 에러 발생 시 기본 생성자로 최후 방어
    //     renderer = new THREE.WebGLRenderer({ antialias: true });
    // }

    // 렌더러 (Renderer) 설정 (WebGL 2 미지원 구형 태블릿 및 PC 통합 안전 대응)
    try {
        // 1단계: 최신 환경(WebGL 2) 기반 렌더러 생성 시도
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true 
        });
        
        // 실제로 WebGL 컨텍스트가 정상적으로 만들어졌는지블 검증
        if (!renderer.getContext()) {
            throw new Error("WebGL Context Creation Failed");
        }
        
    } catch (e) {
        console.warn('WebGL 2 초기화 실패 -> WebGL 1 Fallback(WebGL1Renderer) 시도', e);
        
        try {
            // 2단계: 갤럭시 탭 A6 등 구형 기기를 위한 WebGL 1 렌더러 강제 생성
            renderer = new THREE.WebGL1Renderer({ 
                antialias: true,
                preserveDrawingBuffer: true 
            });
        } catch (err) {
            console.error('최후의 수단: 기본 렌더러 생성 시도', err);
            renderer = new THREE.WebGLRenderer({ antialias: true });
        }
    }
    



    // *****************************************************************
    // *****************************************************************
    // *****************************************************************
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 고해상도 태블릿 대응

    // 기존에 생성된 canvas가 있다면 제거 후 추가 (중복 생성 방지)
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 궤도 컨트롤 (OrbitControls): 화면 회전 및 확대/축소 기능
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2; // 바닥 아래로 회전 방지

    // 빛 (Lighting) 설정
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // 레이캐스터 (Raycaster) 설정
    raycaster = new THREE.Raycaster();
    
    // 이벤트 리스너 등록
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onMouseClick, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);

    // 태블릿 DOM/CSS 변경 및 Section 전환 감지를 위한 ResizeObserver 등록
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            onWindowResize();
        });
        resizeObserver.observe(container);
    }

    // 바닥 격자 및 초기 그리드 생성
    createBasePlane();
    initializeGrid();

    // 애니메이션 루프 시작
    animate();

    // 태블릿 레이아웃 완료 시점 강제 재조정 (100ms 지연)
    setTimeout(() => {
        onWindowResize();
    }, 100);
}

// 3D 그리드 배열 초기화
function initializeGrid() {
    grid = new Array(GRID_SIZE).fill(0).map(() => 
        new Array(GRID_SIZE).fill(0).map(() => 
            new Array(GRID_SIZE).fill(null)
        )
    );
}

// 바닥 평면 생성 (쌓기나무의 시작점)
let basePlane;

function createBasePlane() {
    const geometry = new THREE.PlaneGeometry(GRID_SIZE * CUBE_SIZE, GRID_SIZE * CUBE_SIZE);
    const material = new THREE.MeshBasicMaterial({ color: COLORS.PLANE, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    basePlane = new THREE.Mesh(geometry, material);
    basePlane.rotation.x = Math.PI / 2;
    
    basePlane.position.y = 0; 
    basePlane.userData.isFloor = true; // 바닥임을 식별
    scene.add(basePlane);

    // 바닥에 격자선 추가
    const gridHelper = new THREE.GridHelper(GRID_SIZE * CUBE_SIZE, GRID_SIZE, 0x000000, 0x000000);
    gridHelper.position.y = 0.01; 
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

// 윈도우 및 컨테이너 크기 변경 시 캔버스 크기 조정 (높이 0 예외 처리 보완)
function onWindowResize() {
    const container = document.getElementById('three-container');
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 높이나 너비가 0인 상태(예: hidden 처리 중)일 때는 리사이즈를 건너뜀
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update(); // 궤도 컨트롤 업데이트
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// 클릭된 메쉬의 최상위 BlockGroup (isBlock: true)을 찾습니다.
function findBlockGroup(object) {
    let current = object;
    // object가 Group이 아니면 parent를 따라 올라갑니다.
    while (current.parent && !current.userData.isBlock) {
        current = current.parent;
    }
    return current.userData.isBlock ? current : null;
}

// ADD 모드 미리보기 블록 생성
function createAddHoverPreview(x, y, z) {
    clearAddHoverPreview();
    
    // 격자 경계 및 중복 확인
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || z < 0 || z >= GRID_SIZE || grid[x][y][z] !== null) {
        return; //여기에 쌓을 수 없음
    }

    // 아래 블록이 없는데 공중에 쌓으려는 경우 방지 (y>0 일 때)
    if (y > 0 && grid[x][y - 1][z] === null) {
        return; 
    }

    // 고스트 블록 메쉬 생성 (Wireframe 사용)
    const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    const material = new THREE.MeshBasicMaterial({ 
        color: COLORS.ADD_HOVER, 
        transparent: true, 
        opacity: 0.5,
        wireframe: true 
    });
    
    addHoverPreview = new THREE.Mesh(geometry, material);
    
    // 위치 설정 (격자 중앙 맞춤)
    const centerX = (x - GRID_SIZE / 2 + 0.5) * CUBE_SIZE;
    const centerY = (y + 0.5) * CUBE_SIZE; 
    const centerZ = (z - GRID_SIZE / 2 + 0.5) * CUBE_SIZE;

    addHoverPreview.position.set(centerX, centerY, centerZ);
    addHoverPreview.userData.isHoverPreview = true;
    
    scene.add(addHoverPreview);
}

// ADD 모드 미리보기 블록 제거
function clearAddHoverPreview() {
    if (addHoverPreview) {
        scene.remove(addHoverPreview);
        addHoverPreview.geometry.dispose();
        addHoverPreview.material.dispose();
        addHoverPreview = null;
    }
}

// 마우스 및 터치 클릭 이벤트 핸들러
function onMouseClick(event) {
    const container = document.getElementById('three-container');
    if (!container) return;

    mouse.x = (event.offsetX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children.filter(obj => !obj.userData.isHoverPreview), true).filter(i => {
        return i.object.userData.isFloor || (findBlockGroup(i.object) && i.face);
    });

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;
        
        // ADD 모드
        if (currentMode === 'ADD') {
            let x, y, z;
            const blockGroup = findBlockGroup(object);

            if (blockGroup) {
                // **1. 기존 블록을 클릭한 경우 (다층 쌓기)**
                const { x: oldX, y: oldY, z: oldZ } = blockGroup.userData;
                // NOTE: 필터를 통해 i.face가 보장되지만, 혹시 모를 상황에 대비한 최종 안전 장치
                if (!intersect.face) return; 
                
                // 법선 벡터를 사용하여 새 블록의 격자 위치 계산
                const normal = intersect.face.normal;
                x = oldX + Math.round(normal.x);
                y = oldY + Math.round(normal.y);
                z = oldZ + Math.round(normal.z);
                
                let targetY = y;
                if (targetY >= 0 && targetY < GRID_SIZE) {
                    addBlock(x, targetY, z);                    
                }
                
            } else if (object.userData.isFloor) {
                // **2. 바닥 평면을 클릭한 경우 (빈 공간 클릭 포함)**
                const point = intersect.point;
                x = Math.floor(point.x / CUBE_SIZE + GRID_SIZE / 2);
                z = Math.floor(point.z / CUBE_SIZE + GRID_SIZE / 2);

                // 격자 좌표를 0에서 GRID_SIZE-1 범위로 클램프
                x = Math.max(0, Math.min(GRID_SIZE - 1, x));
                z = Math.max(0, Math.min(GRID_SIZE - 1, z));

                // 해당 XZ 열에서 가장 높은 블록의 바로 위를 찾음
                let currentMaxY = -1;
                for(let i = 0; i < GRID_SIZE; i++) {
                    if (grid[x][i][z] !== null) {
                        currentMaxY = i;
                    }
                }
                let targetY = currentMaxY + 1;
                // 최종 위치에 블록 추가 시도
                if (targetY >= 0 && targetY < GRID_SIZE) {
                    addBlock(x, targetY, z);

                    // 이 자리 위치가 정답 위치값으로 사용가능
                    console.log("계속 추가");
                }
            }
        } 
        
        // DELETE 모드
        else if (currentMode === 'DELETE') {
            const blockGroup = findBlockGroup(object);
            if (blockGroup) {
                deleteBlock(blockGroup);
            }
        }
    }
}

// 마우스 이동 이벤트 핸들러 (호버 효과)
function onMouseMove(event) {
    const container = document.getElementById('three-container');
    if (!container) return;

    mouse.x = (event.offsetX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 1. 기존 호버 블록 색상 복원 (DELETE mode)
    if (hoverBlock && hoverBlock.userData.cubeMesh) {
        hoverBlock.userData.cubeMesh.material.color.set(COLORS.CUBE);
    }
    // 2. ADD 모드 미리보기 제거
    clearAddHoverPreview(); 
    // 미리보기 블록을 제외하고 교차하는 객체 찾기
    // NOTE: LineSegments(테두리)가 아닌 Mesh(면)만 유효한 교차로 인식하도록 필터링 강화 (i.face 체크)
    const intersects = raycaster.intersectObjects(scene.children.filter(obj => !obj.userData.isHoverPreview), true).filter(i => {
        return i.object.userData.isFloor || (findBlockGroup(i.object) && i.face);
    });
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;
        const blockGroup = findBlockGroup(object);

        // --- DELETE Mode Hover ---
        if (currentMode === 'DELETE') {
            if (blockGroup) {
                hoverBlock = blockGroup;
                blockGroup.userData.cubeMesh.material.color.set(COLORS.DELETE_HOVER);
            } else {
                hoverBlock = null;
            }
        } 
        // --- ADD Mode Hover (Preview Placement) ---
        else if (currentMode === 'ADD') {
            let x, y, z;

            if (blockGroup) {
                const { x: oldX, y: oldY, z: oldZ } = blockGroup.userData;
                // NOTE: 필터링으로 i.face가 보장되지만, 혹시 모를 상황에 대비한 최종 안전 장치
                if (!intersect.face) {
                    hoverBlock = null; 
                    return; 
                }
                // 법선 벡터를 사용하여 새 블록의 격자 위치 계산 (가장 정확한 방법)
                const normal = intersect.face.normal;
                x = oldX + Math.round(normal.x);
                y = oldY + Math.round(normal.y);
                z = oldZ + Math.round(normal.z);
                
                // y는 normal.y에 따라 자동으로 (oldY + 1)이 되거나 (윗면), (oldY)가 됨 (옆면)
                createAddHoverPreview(x, y, z);
                
            } else if (object.userData.isFloor) {
                // 2. 바닥 평면을 호버한 경우
                const point = intersect.point;
                x = Math.floor(point.x / CUBE_SIZE + GRID_SIZE / 2);
                z = Math.floor(point.z / CUBE_SIZE + GRID_SIZE / 2);

                // 격자 좌표를 0에서 GRID_SIZE-1 범위로 클램프
                x = Math.max(0, Math.min(GRID_SIZE - 1, x));
                z = Math.max(0, Math.min(GRID_SIZE - 1, z));

                // 해당 XZ 열에서 가장 높은 블록의 바로 위를 찾음 (빈 공간도 처리)
                let targetY = 0;
                for(let i = 0; i < GRID_SIZE; i++) {
                    if (grid[x][i][z] !== null) {
                        targetY = i + 1;
                    }
                }
                
                if (targetY < GRID_SIZE) {
                    createAddHoverPreview(x, targetY, z);
                }
            }
            hoverBlock = blockGroup;
        }

    } else {
        hoverBlock = null; 
    }
}

// 쌓기나무 추가
function addBlock(x, y, z) {

    // ★ 이 코드를 addBlock 함수 내부에 추가하세요!
    console.log(`{x: ${x}, y: ${y}, z: ${z}},`);

    
    // 이 자리 위치가 정답 위치값으로 사용가능
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return;
    if (grid[x][y][z] !== null) return;
    if (y > 0 && grid[x][y - 1][z] === null) return;

    // 블록 메쉬 생성
    const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    const material = new THREE.MeshLambertMaterial({ color: COLORS.CUBE });
    const cube = new THREE.Mesh(geometry, material);

    // 경계선 추가
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const line = new THREE.LineSegments(edges, lineMaterial);
    
    // 라인과 큐브를 그룹으로 묶어 하나의 블록으로 처리
    const blockGroup = new THREE.Group();
    blockGroup.add(cube);
    blockGroup.add(line);

    const centerX = (x - GRID_SIZE / 2 + 0.5) * CUBE_SIZE;
    const centerY = (y + 0.5) * CUBE_SIZE;
    const centerZ = (z - GRID_SIZE / 2 + 0.5) * CUBE_SIZE;

    blockGroup.position.set(centerX, centerY, centerZ);
    blockGroup.userData = { x, y, z, isBlock: true, cubeMesh: cube }; 

    scene.add(blockGroup);
    grid[x][y][z] = blockGroup;
    
    // 블록이 추가되면 미리보기 제거
    clearAddHoverPreview();
    // 정오답 관련 추가 260824
    clearAnswerOverlay();
    
    const resMsg = document.getElementById('result-message');
    if (resMsg) resMsg.style.display = 'none';
}

// 쌓기나무 삭제
function deleteBlock(blockGroup) {
    const { x, y, z } = blockGroup.userData;
    if (y < GRID_SIZE - 1 && grid[x][y + 1][z] !== null) return;
    
    scene.remove(blockGroup);
    grid[x][y][z] = null;
    
    clearAnswerOverlay();
    const resMsg = document.getElementById('result-message');
    if (resMsg) resMsg.style.display = 'none';
}

// 모드 변경 함수
function setMode(mode) {
    currentMode = mode;
    const addBtn = document.getElementById('add-mode-btn');
    const deleteBtn = document.getElementById('delete-mode-btn');
    
    if (addBtn) addBtn.classList.toggle('mode-active', mode === 'ADD');
    if (deleteBtn) deleteBtn.classList.toggle('mode-active', mode === 'DELETE');
    
    if (hoverBlock && hoverBlock.userData.cubeMesh) {
        hoverBlock.userData.cubeMesh.material.color.set(COLORS.CUBE);
        hoverBlock = null;
    }
    clearAddHoverPreview(); 
}

// 씬 초기화 및 모든 블록 제거
// :: 260909 알럿 팝업 제거 원하는 경우 조건만 취소해주기
function resetScene() {
    // NOTE: confirm() 대신 커스텀 모달을 사용해야 하지만, 간단한 디버깅을 위해 여기에 둡니다.
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let z = 0; z < GRID_SIZE; z++) {
                    const blockGroup = grid[x][y][z];
                    if (blockGroup) {
                        scene.remove(blockGroup);
                        grid[x][y][z] = null;
                    }
                }
            }
        }
        // 정오답 관련 추가 260909
        clearAnswerOverlay();
        const resMsg = document.getElementById('result-message');
        if (resMsg) resMsg.style.display = 'none';
}

// 정답 확인
function checkAnswer() {
    const userSet = new Set();
    for (let x = 0; x < GRID_SIZE; x++)
        for (let y = 0; y < GRID_SIZE; y++)
            for (let z = 0; z < GRID_SIZE; z++)
                if (grid[x][y][z] !== null) userSet.add(`${x},${y},${z}`);

    const answerSet = new Set(ANSWER_BLOCKS.map(p => `${p.x},${p.y},${p.z}`));

    const isCorrect = userSet.size === answerSet.size &&
        [...userSet].every(key => answerSet.has(key));

    clearAnswerOverlay(); 

    if (isCorrect) {
        
        if (window.isAudio && fnContent.isSound) {
            console.log("정답");
            isAudio.play(fnContent.isSound.right, true);
        }
        showResultMessage(true);
    } else {
        if (window.isAudio && fnContent.isSound) {
            console.log("오답");
            isAudio.play(fnContent.isSound.wrong, true);
        }
        showResultMessage(false);
        showCorrectAnswer(userSet, answerSet);
    }
}

// ===== 오답 시 정답 시각화 =====
function showCorrectAnswer(userSet, answerSet) {
    // 1) 잘못 놓은 블록 -> 빨간색
    userSet.forEach(key => {
        if (!answerSet.has(key)) {
            const [x, y, z] = key.split(',').map(Number);
            if (grid[x][y][z]) {
                grid[x][y][z].userData.cubeMesh.material.color.set(0xFF3B30);
            }
        }
    });

    // 2) 빠뜨린 블록 -> 초록 반투명 고스트
    ANSWER_BLOCKS.forEach(({x, y, z}) => {
        const key = `${x},${y},${z}`;
        if (!userSet.has(key)) {
            const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
            const material = new THREE.MeshBasicMaterial({
                color: 0x4CAF50,
                transparent: true,
                opacity: 0.4
            });
            const ghost = new THREE.Mesh(geometry, material);
            ghost.position.set(
                (x - GRID_SIZE/2 + 0.5) * CUBE_SIZE,
                (y + 0.5) * CUBE_SIZE,
                (z - GRID_SIZE/2 + 0.5) * CUBE_SIZE
            );
            scene.add(ghost);
            answerOverlayBlocks.push(ghost);
        }
    });
}

function clearAnswerOverlay() {
    answerOverlayBlocks.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    answerOverlayBlocks = [];

    // 사용자 블록 색상 원복 (빨간색으로 바뀐 것들 되돌리기)
    for (let x = 0; x < GRID_SIZE; x++)
        for (let y = 0; y < GRID_SIZE; y++)
            for (let z = 0; z < GRID_SIZE; z++)
                if (grid[x][y][z]) grid[x][y][z].userData.cubeMesh.material.color.set(COLORS.CUBE);
}

// 결과 메시지 표시
function showResultMessage(isCorrect) {
    const msgBox = document.getElementById('result-message');
    if (!msgBox) return;
    msgBox.textContent = isCorrect ? '🎉 정답입니다!' : '❌ 오답입니다. 빨간 블록은 잘못 놓은 부분, 초록 반투명 블록은 빠진 부분이에요.';
    msgBox.className = 'result-message ' + (isCorrect ? 'correct' : 'incorrect');
    msgBox.style.display = 'block';
}

// 이벤트 리스너 연결
document.getElementById('add-mode-btn')?.addEventListener('click', () => setMode('ADD'));
document.getElementById('delete-mode-btn')?.addEventListener('click', () => setMode('DELETE'));
document.getElementById('check-answer-btn')?.addEventListener('click', checkAnswer);

function bindEvents() {
    const addBtn = document.getElementById('add-mode-btn');
    const deleteBtn = document.getElementById('delete-mode-btn');
    const checkBtn = document.getElementById('check-answer-btn');

    if (addBtn) addBtn.onclick = function() { setMode('ADD'); };
    if (deleteBtn) deleteBtn.onclick = function() { setMode('DELETE'); };
    if (checkBtn) checkBtn.onclick = function() { checkAnswer(); };
}

// DOM 로드 완료 후 안전하게 이벤트 연결
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
} else {
    bindEvents();
}

