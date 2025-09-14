const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/database');

// 라우트 가져오기
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 2000;

// 데이터베이스 연결
connectDB();

// 미들웨어
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (프론트엔드)
app.use(express.static(path.join(__dirname, '../frontend')));

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API 상태 확인
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ITDA API 서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// 404 에러 핸들링
app.use('*', (req, res) => {
  res.status(404).json({ message: '요청한 페이지를 찾을 수 없습니다.' });
});

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  res.status(500).json({ 
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`ITDA 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}에서 확인하세요.`);
});
