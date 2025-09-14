# 잇다 (ITDA) - 부동산중개플랫폼

부동산 중개사와 일반 사용자를 연결하는 모바일웹 플랫폼입니다.

## 주요 기능

### 일반 사용자
- 회원가입/로그인
- 매물 검색 및 조회
- 다양한 조건으로 매물 필터링

### 중개사
- 중개사 회원가입 및 인증
- 매물 등록/수정/삭제
- 내 매물 관리
- 마이페이지

## 기술 스택

### 백엔드
- Node.js
- Express.js
- MongoDB
- JWT 인증
- bcryptjs (비밀번호 암호화)

### 프론트엔드
- HTML5
- CSS3
- Vanilla JavaScript
- 모바일 반응형 디자인

## 설치 및 실행

### 1. MongoDB 설치
MongoDB를 로컬에 설치하거나 MongoDB Atlas를 사용하세요.

### 2. 백엔드 설정
```bash
cd backend
npm install
```

환경 변수 설정 (선택사항):
```bash
# .env 파일 생성
PORT=3000
MONGODB_URI=mongodb://localhost:27017/itda
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

### 4. 프론트엔드 접속
브라우저에서 `http://localhost:3000`으로 접속하세요.

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 사용자 정보 조회
- `PUT /api/auth/verify-broker` - 중개사 인증

### 매물
- `GET /api/properties` - 매물 목록 조회 (검색 가능)
- `GET /api/properties/:id` - 특정 매물 조회
- `POST /api/properties` - 매물 등록 (중개사만)
- `PUT /api/properties/:id` - 매물 수정
- `DELETE /api/properties/:id` - 매물 삭제
- `GET /api/properties/my/listings` - 내 매물 목록

## 프로젝트 구조

```
itda/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Property.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── properties.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── README.md
```

## 사용 방법

### 일반 사용자
1. 회원가입 후 로그인
2. 매물 검색 페이지에서 원하는 조건으로 검색
3. 매물 카드를 클릭하여 상세 정보 확인

### 중개사
1. 회원가입 시 "중개사" 선택
2. 중개사 등록번호, 회사명, 주소 입력
3. 로그인 후 마이페이지에서 매물 등록/관리

## 배포 가이드

### 호스팅 서버로 이동
1. 백엔드 코드를 서버에 업로드
2. MongoDB 연결 정보 업데이트
3. 환경 변수 설정
4. PM2 또는 다른 프로세스 매니저로 서버 실행
5. 프론트엔드 파일을 정적 파일로 서빙

### 권장 호스팅 서비스
- Heroku
- AWS EC2
- Google Cloud Platform
- DigitalOcean

## 라이선스

MIT License

## 개발자

ITDA Team
