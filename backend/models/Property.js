const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['아파트', '빌라', '단독주택', '오피스텔', '상가', '사무실', '기타'],
    required: true
  },
  dealType: {
    type: String,
    enum: ['매매', '전세', '월세'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  deposit: Number, // 전세금 또는 보증금
  monthlyRent: Number, // 월세
  area: {
    type: Number,
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    default: 1
  },
  floor: Number,
  totalFloors: Number,
  address: {
    city: String,
    district: String,
    detail: String,
    full: String
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  images: [String],
  features: [String], // 편의시설
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['판매중', '계약완료', '판매완료'],
    default: '판매중'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 자동 갱신
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', propertySchema);
