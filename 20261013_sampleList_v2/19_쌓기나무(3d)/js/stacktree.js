 
 
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
            // CUBE: 0x4CAF50, // 녹색
            CUBE: 0xF9C58F, // 주황계열(블록 색상)
            PLANE: 0xAAAAAA, // 회색
            DELETE_HOVER: 0xFF6347, // 주황색 (삭제될 블록)
            ADD_HOVER: 0x2196F3 // 파란색 (추가될 위치 미리보기)
        };

        // 초기화 함수
        function init() {
            console.log("쌓기나무 시작");
            // 씬 (Scene) 설정
            scene = new THREE.Scene();
            // scene.background = new THREE.Color(0xf7f9fc);  // 연한 회색 배경색상
            scene.background = new THREE.Color(0xffffff);  //  canvas 흰색 배경색상

            // 카메라 (Camera) 설정
            const container = document.getElementById('three-container');
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);            
            // 20260821 추가수정
            // 쌓기나무 영역 사이즈를 크게 키우더라도 카메라를 좀더 가깝게 조절하면 확대되어 보임
            // camera.position.set(GRID_SIZE * 1.5, GRID_SIZE * 2, GRID_SIZE * 1.5);
            camera.position.set(GRID_SIZE * 1.1, GRID_SIZE * 1.4, GRID_SIZE * 1.1);

            // 렌더러 (Renderer) 설정
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
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

            // 바닥 격자 및 초기 그리드 생성
            createBasePlane();
            initializeGrid();

            // 애니메이션 루프 시작
            animate();
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
        
        // 윈도우 크기 변경 시 캔버스 크기 조정
        function onWindowResize() {
            const container = document.getElementById('three-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        // 애니메이션 루프
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // 궤도 컨트롤 업데이트
            renderer.render(scene, camera);
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
                return; // 여기에 쌓을 수 없음
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

        // 마우스 클릭 이벤트 핸들러
        function onMouseClick(event) {
            const container = document.getElementById('three-container');
            mouse.x = (event.offsetX / container.clientWidth) * 2 - 1;
            mouse.y = -(event.offsetY / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // 교차하는 객체 찾기 (블록 그룹 안의 메쉬 또는 바닥 평면)
            // NOTE: LineSegments(테두리)가 아닌 Mesh(면)만 유효한 교차로 인식하도록 필터링 강화 (i.face 체크)
            const intersects = raycaster.intersectObjects(scene.children.filter(obj => !obj.userData.isHoverPreview), true).filter(i => {
                // 바닥이거나 (i.object.userData.isFloor), 블록의 구성 요소이면서 면 정보가 있는 경우 (i.face)
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
                        if (!intersect.face) {
                            console.warn("면 정보가 없어 클릭이 무시되었습니다. (엣지 클릭)");
                            return; 
                        }
                        
                        const normal = intersect.face.normal;

                        // 법선 벡터를 사용하여 새 블록의 격자 위치 계산
                        x = oldX + Math.round(normal.x);
                        y = oldY + Math.round(normal.y);
                        z = oldZ + Math.round(normal.z);
                        
                        let targetY = y;
                        
                        // 최종 위치에 블록 추가 시도
                        if (targetY >= 0 && targetY < GRID_SIZE) {
                            addBlock(x, targetY, z);
                        } else {
                            console.warn("격자 최대 높이를 초과했습니다.");
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
                        } else {
                            console.warn("격자 최대 높이를 초과했습니다.");
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
                // 바닥이거나 (i.object.userData.isFloor), 블록의 구성 요소이면서 면 정보가 있는 경우 (i.face)
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
                        // 1. 기존 블록을 호버한 경우 (다층 쌓기 미리보기)
                        const { x: oldX, y: oldY, z: oldZ } = blockGroup.userData;
                        
                        // NOTE: 필터링으로 i.face가 보장되지만, 혹시 모를 상황에 대비한 최종 안전 장치
                        if (!intersect.face) {
                            hoverBlock = null; 
                            return; 
                        }
                        
                        const normal = intersect.face.normal;

                        // 법선 벡터를 사용하여 새 블록의 격자 위치 계산 (가장 정확한 방법)
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
                hoverBlock = null; // Reset hovered block
            }
            renderer.render(scene, camera);
        }

        // 쌓기나무 추가
        function addBlock(x, y, z) {
            // 격자 경계 확인
            if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || z < 0 || z >= GRID_SIZE) {
                console.warn("격자 경계를 벗어났습니다. (" + x + ", " + y + ", " + z + ")");
                return;
            }
            
            // 이미 블록이 있는 경우 (중복 방지)
            if (grid[x][y][z] !== null) {
                console.warn("이미 블록이 있습니다.");
                return;
            }

            // 아래에 블록이 없는데 공중에 쌓으려는 경우 방지 (y>0 일 때)
            if (y > 0 && grid[x][y - 1][z] === null) {
                console.warn("블록 위에만 쌓을 수 있습니다. (Gap detected at Y=" + y + ")");
                return;
            }

            // 블록 메쉬 생성
            const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
            const material = new THREE.MeshLambertMaterial({ color: COLORS.CUBE });
            const cube = new THREE.Mesh(geometry, material);

            // 경계선 추가
            const edges = new THREE.EdgesGeometry(geometry);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }); // 검은색 선
            const line = new THREE.LineSegments(edges, lineMaterial);
            
            // 라인과 큐브를 그룹으로 묶어 하나의 블록으로 처리
            const blockGroup = new THREE.Group();
            blockGroup.add(cube);
            blockGroup.add(line);

            // 위치 설정 (격자 중앙 맞춤)
            const centerX = (x - GRID_SIZE / 2 + 0.5) * CUBE_SIZE;
            const centerY = (y + 0.5) * CUBE_SIZE; // Y=0 블록의 중심은 0.5
            const centerZ = (z - GRID_SIZE / 2 + 0.5) * CUBE_SIZE;

            blockGroup.position.set(centerX, centerY, centerZ);

            // 사용자 데이터 저장 (격자 위치 및 블록 식별) - 그룹에 저장
            blockGroup.userData = { x, y, z, isBlock: true, cubeMesh: cube }; 

            // 씬과 그리드에 추가
            scene.add(blockGroup);
            grid[x][y][z] = blockGroup;
            
            // 블록이 추가되면 미리보기 제거
            clearAddHoverPreview();
        }

        // 쌓기나무 삭제
        function deleteBlock(blockGroup) {
            const { x, y, z } = blockGroup.userData;

            // 위에 블록이 있는데 아래 블록을 지우는 경우 방지 
            if (y < GRID_SIZE - 1 && grid[x][y + 1][z] !== null) {
                console.warn("위에 블록이 있어 삭제할 수 없습니다.");
                return;
            }
            
            // 씬과 그리드에서 그룹 전체 제거
            scene.remove(blockGroup);
            grid[x][y][z] = null;
        }
        

        // 모드 변경 함수
        function setMode(mode) {
            currentMode = mode;
            const addBtn = document.getElementById('add-mode-btn');
            const deleteBtn = document.getElementById('delete-mode-btn');
            
            // 버튼 스타일 업데이트
            addBtn.classList.toggle('mode-active', mode === 'ADD');
            deleteBtn.classList.toggle('mode-active', mode === 'DELETE');
            
            // 호버 상태 리셋
            if (hoverBlock && hoverBlock.userData.cubeMesh) {
                hoverBlock.userData.cubeMesh.material.color.set(COLORS.CUBE);
                hoverBlock = null;
            }
            // ADD 모드 미리보기 블록 제거
            clearAddHoverPreview(); 
        }

        // 씬 초기화 및 모든 블록 제거 --- 초기화 버튼()
        // :: 260324 알럿 팝업 제거 원하는 경우 조건만 취소해주기
        function resetScene() {
            // NOTE: confirm() 대신 커스텀 모달을 사용해야 하지만, 간단한 디버깅을 위해 여기에 둡니다.
            if (confirm("정말로 모든 쌓기나무를 초기화하시겠습니까?")) {
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
            }
        }

        // 이벤트 리스너 연결
        document.getElementById('add-mode-btn').addEventListener('click', () => setMode('ADD'));
        document.getElementById('delete-mode-btn').addEventListener('click', () => setMode('DELETE'));

        // 페이지 로드 시 3D 초기화
        // window.onload = init;

