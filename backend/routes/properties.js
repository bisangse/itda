const express = require('express');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 매물 조회 (검색 기능 포함)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      propertyType,
      dealType,
      city,
      district,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      rooms
    } = req.query;

    const filter = { status: '판매중' };

    if (propertyType) filter.propertyType = propertyType;
    if (dealType) filter.dealType = dealType;
    if (city) filter['address.city'] = city;
    if (district) filter['address.district'] = district;
    if (rooms) filter.rooms = parseInt(rooms);

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) filter.area.$gte = parseInt(minArea);
      if (maxArea) filter.area.$lte = parseInt(maxArea);
    }

    const properties = await Property.find(filter)
      .populate('broker', 'name phone brokerInfo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('매물 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 특정 매물 조회
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('broker', 'name phone brokerInfo');

    if (!property) {
      return res.status(404).json({ message: '매물을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error('매물 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 매물 등록 (중개사만)
router.post('/', auth, [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('propertyType').isIn(['아파트', '빌라', '단독주택', '오피스텔', '상가', '사무실', '기타']),
  body('dealType').isIn(['매매', '전세', '월세']),
  body('price').isNumeric(),
  body('area').isNumeric(),
  body('rooms').isNumeric(),
  body('address').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.userId);
    if (!user || user.userType !== '중개사') {
      return res.status(403).json({ message: '중개사만 매물을 등록할 수 있습니다.' });
    }

    const propertyData = {
      ...req.body,
      broker: req.userId
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json({
      message: '매물이 성공적으로 등록되었습니다.',
      property
    });
  } catch (error) {
    console.error('매물 등록 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 매물 수정 (등록자만)
router.put('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: '매물을 찾을 수 없습니다.' });
    }

    if (property.broker.toString() !== req.userId) {
      return res.status(403).json({ message: '매물을 수정할 권한이 없습니다.' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      message: '매물이 성공적으로 수정되었습니다.',
      property: updatedProperty
    });
  } catch (error) {
    console.error('매물 수정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 매물 삭제 (등록자만)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: '매물을 찾을 수 없습니다.' });
    }

    if (property.broker.toString() !== req.userId) {
      return res.status(403).json({ message: '매물을 삭제할 권한이 없습니다.' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: '매물이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('매물 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내가 등록한 매물 조회
router.get('/my/listings', auth, async (req, res) => {
  try {
    const properties = await Property.find({ broker: req.userId })
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error('내 매물 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
