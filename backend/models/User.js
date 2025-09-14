const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['일반사용자', '중개사'],
    default: '일반사용자'
  },
  brokerInfo: {
    licenseNumber: String,
    companyName: String,
    address: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  profileImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 비밀번호 해싱
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
