// 전역 변수
let currentUser = null;
let authToken = null;

// DOM 요소들
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// 앱 초기화
function initializeApp() {
    // 로컬 스토리지에서 토큰 확인
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        loadUserInfo();
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모바일 네비게이션 토글
    navToggle.addEventListener('click', toggleMobileNav);
    
    // 네비게이션 링크 클릭
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            closeMobileNav();
        });
    });
    
    // 메인 검색창 Enter 키 이벤트
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.id === 'mainSearch') {
            searchFromMain();
        }
    });
    
}

// 모바일 네비게이션 토글
function toggleMobileNav() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// 모바일 네비게이션 닫기
function closeMobileNav() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
}

// 섹션 표시
function showSection(sectionId) {
    // 모든 섹션 숨기기
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 모든 네비게이션 링크 비활성화
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 선택된 섹션 표시
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 네비게이션 링크 활성화
    const targetLink = document.querySelector(`[href="#${sectionId}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    // 특정 섹션 로드
    if (sectionId === 'search') {
        loadProperties();
    } else if (sectionId === 'my-page') {
        loadMyPage();
    }
}

// API 호출 함수
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '요청이 실패했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// 로딩 스피너 표시/숨기기
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 로그인 함수
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoading();
        const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        
        showNotification('로그인 성공!', 'success');
        updateAuthUI();
        showSection('home');
        
    } catch (error) {
        showNotification('로그인에 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}

// 회원가입 함수
async function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const userType = document.getElementById('userType').value;
    
    const userData = {
        name,
        email,
        phone,
        password,
        userType
    };
    
    // 중개사인 경우 추가 정보 포함
    if (userType === '중개사') {
        userData.brokerInfo = {
            licenseNumber: document.getElementById('licenseNumber').value,
            companyName: document.getElementById('companyName').value,
            address: document.getElementById('companyAddress').value
        };
    }
    
    try {
        showLoading();
        const response = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        
        showNotification('회원가입이 완료되었습니다!', 'success');
        updateAuthUI();
        showSection('home');
        
    } catch (error) {
        showNotification('회원가입에 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}

// 로그아웃 함수
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    
    showNotification('로그아웃되었습니다.', 'info');
    updateAuthUI();
    showSection('home');
}

// 인증 상태 확인
async function checkAuthStatus() {
    if (authToken) {
        try {
            await loadUserInfo();
        } catch (error) {
            // 토큰이 유효하지 않은 경우
            authToken = null;
            currentUser = null;
            localStorage.removeItem('authToken');
        }
    }
    updateAuthUI();
}

// 사용자 정보 로드
async function loadUserInfo() {
    if (!authToken) return;
    
    try {
        const user = await apiCall('/api/auth/me');
        currentUser = user;
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
    }
}

// 인증 UI 업데이트
function updateAuthUI() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    const myPageLink = document.getElementById('myPageLink');
    
    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';
        myPageLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
        myPageLink.style.display = 'none';
    }
}

// 중개사 정보 토글
function toggleBrokerInfo() {
    const userType = document.getElementById('userType').value;
    const brokerInfo = document.getElementById('brokerInfo');
    
    if (userType === '중개사') {
        brokerInfo.style.display = 'block';
    } else {
        brokerInfo.style.display = 'none';
    }
}

// 메인 검색창에서 검색
function searchFromMain() {
    const searchTerm = document.getElementById('mainSearch').value.trim();
    if (searchTerm) {
        // 검색어를 매물 검색 페이지로 전달하고 이동
        showSection('search');
        // 검색어를 제목 필터로 사용
        setTimeout(() => {
            const searchInput = document.querySelector('#search input[type="text"]');
            if (searchInput) {
                searchInput.value = searchTerm;
            }
            searchProperties();
        }, 100);
    } else {
        showNotification('검색어를 입력해주세요.', 'info');
    }
}

// 매물 검색
async function searchProperties() {
    const propertyType = document.getElementById('propertyType').value;
    const dealType = document.getElementById('dealType').value;
    const city = document.getElementById('city').value;
    const district = document.getElementById('district').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    const params = new URLSearchParams();
    if (propertyType) params.append('propertyType', propertyType);
    if (dealType) params.append('dealType', dealType);
    if (city) params.append('city', city);
    if (district) params.append('district', district);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    try {
        showLoading();
        const response = await apiCall(`/api/properties?${params.toString()}`);
        displayProperties(response.properties);
    } catch (error) {
        showNotification('매물 검색에 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}

// 매물 목록 표시
function displayProperties(properties) {
    const grid = document.getElementById('propertiesGrid');
    
    if (properties.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">검색 결과가 없습니다.</p>';
        return;
    }
    
    grid.innerHTML = properties.map(property => `
        <div class="property-card" onclick="viewProperty('${property._id}')">
            <div class="property-image">
                <i class="fas fa-home"></i>
            </div>
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <div class="property-price">${formatPrice(property)}</div>
                <div class="property-details">
                    ${property.propertyType} • ${property.area}㎡ • ${property.rooms}룸
                </div>
                <div class="property-address">${property.address.full || '주소 정보 없음'}</div>
            </div>
        </div>
    `).join('');
}

// 가격 포맷팅
function formatPrice(property) {
    if (property.dealType === '매매') {
        return `${property.price.toLocaleString()}만원`;
    } else if (property.dealType === '전세') {
        return `전세 ${property.price.toLocaleString()}만원`;
    } else if (property.dealType === '월세') {
        return `월세 ${property.price.toLocaleString()}만원`;
    }
    return `${property.price.toLocaleString()}만원`;
}

// 매물 상세 보기
async function viewProperty(propertyId) {
    try {
        showLoading();
        const property = await apiCall(`/api/properties/${propertyId}`);
        
        // 매물 상세 정보를 모달이나 새 페이지로 표시
        showNotification(`${property.title} 매물 정보를 확인했습니다.`, 'info');
        
    } catch (error) {
        showNotification('매물 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}

// 매물 목록 로드
async function loadProperties() {
    try {
        showLoading();
        const response = await apiCall('/api/properties');
        displayProperties(response.properties);
    } catch (error) {
        showNotification('매물 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}

// 마이페이지 로드
async function loadMyPage() {
    if (!currentUser) {
        showSection('login');
        return;
    }
    
    // 사용자 정보 표시
    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `
        <h3>${currentUser.name}님 안녕하세요!</h3>
        <p>회원 유형: ${currentUser.userType}</p>
        <p>이메일: ${currentUser.email}</p>
        ${currentUser.brokerInfo ? `
            <p>회사명: ${currentUser.brokerInfo.companyName}</p>
            <p>인증 상태: ${currentUser.brokerInfo.isVerified ? '인증됨' : '인증 대기중'}</p>
        ` : ''}
    `;
    
    // 중개사인 경우 내 매물 로드
    if (currentUser.userType === '중개사') {
        await loadMyProperties();
    }
}

// 내 매물 로드
async function loadMyProperties() {
    try {
        const properties = await apiCall('/api/properties/my/listings');
        displayMyProperties(properties);
    } catch (error) {
        showNotification('내 매물을 불러오는데 실패했습니다.', 'error');
    }
}

// 내 매물 표시
function displayMyProperties(properties) {
    const list = document.getElementById('myPropertiesList');
    
    if (properties.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">등록된 매물이 없습니다.</p>';
        return;
    }
    
    list.innerHTML = properties.map(property => `
        <div class="property-item">
            <h4>${property.title}</h4>
            <p>${property.propertyType} • ${property.dealType} • ${formatPrice(property)}</p>
            <p>${property.address.full || '주소 정보 없음'}</p>
            <p>조회수: ${property.views} • 등록일: ${new Date(property.createdAt).toLocaleDateString()}</p>
            <div style="margin-top: 0.5rem;">
                <button class="btn btn-secondary" onclick="editProperty('${property._id}')" style="margin-right: 0.5rem;">수정</button>
                <button class="btn btn-secondary" onclick="deleteProperty('${property._id}')">삭제</button>
            </div>
        </div>
    `).join('');
}

// 탭 전환
function showTab(tabId) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 매물 등록
async function addProperty(event) {
    event.preventDefault();
    
    if (!currentUser || currentUser.userType !== '중개사') {
        showNotification('중개사만 매물을 등록할 수 있습니다.', 'error');
        return;
    }
    
    const propertyData = {
        title: document.getElementById('propTitle').value,
        description: document.getElementById('propDescription').value,
        propertyType: document.getElementById('propType').value,
        dealType: document.getElementById('propDealType').value,
        price: parseInt(document.getElementById('propPrice').value),
        area: parseInt(document.getElementById('propArea').value),
        rooms: parseInt(document.getElementById('propRooms').value),
        bathrooms: parseInt(document.getElementById('propBathrooms').value),
        address: {
            full: document.getElementById('propAddress').value
        }
    };
    
    try {
        showLoading();
        await apiCall('/api/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
        
        showNotification('매물이 성공적으로 등록되었습니다!', 'success');
        
        // 폼 초기화
        event.target.reset();
        
        // 내 매물 목록 새로고침
        await loadMyProperties();
        
    } catch (error) {
        showNotification('매물 등록에 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}

// 매물 수정
async function editProperty(propertyId) {
    showNotification('매물 수정 기능은 준비 중입니다.', 'info');
}

// 매물 삭제
async function deleteProperty(propertyId) {
    if (!confirm('정말로 이 매물을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        showLoading();
        await apiCall(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        });
        
        showNotification('매물이 삭제되었습니다.', 'success');
        await loadMyProperties();
        
    } catch (error) {
        showNotification('매물 삭제에 실패했습니다.', 'error');
    } finally {
        hideLoading();
    }
}
