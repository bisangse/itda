const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// 회원가입
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone, userType, brokerInfo } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const user = new User({
      email,
      password,
      name,
      phone,
      userType: userType || '일반사용자',
      brokerInfo: userType === '중개사' ? brokerInfo : undefined
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        brokerInfo: user.brokerInfo
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 중개사 인증
router.put('/verify-broker', auth, [
  body('licenseNumber').notEmpty(),
  body('companyName').notEmpty(),
  body('address').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { licenseNumber, companyName, address } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    user.userType = '중개사';
    user.brokerInfo = {
      licenseNumber,
      companyName,
      address,
      isVerified: false // 관리자 승인 필요
    };

    await user.save();

    res.json({
      message: '중개사 인증 신청이 완료되었습니다. 관리자 승인을 기다려주세요.',
      user: {
        id: user._id,
        userType: user.userType,
        brokerInfo: user.brokerInfo
      }
    });
  } catch (error) {
    console.error('중개사 인증 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
