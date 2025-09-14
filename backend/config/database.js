const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/itda';
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB 연결됨: ${conn.connection.host}`);
    console.log(`📊 데이터베이스: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    console.log('💡 MongoDB가 실행 중인지 확인해주세요.');
    console.log('   Windows: net start MongoDB');
    console.log('   또는 MongoDB Compass를 실행해주세요.');
    process.exit(1);
  }
};

module.exports = connectDB;
