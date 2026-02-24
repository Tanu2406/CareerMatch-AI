import mongoose from 'mongoose';
import User from './server/models/User.js';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
  const u = new User({ name:'Test', email:'test@example.com', password:'password123' });
  await u.save();
  const token = u.getResetPasswordToken();
  console.log('raw token:', token);
  console.log('hashed:', u.resetPasswordToken);
  console.log('expire:', u.resetPasswordExpire);
  await u.save({ validateBeforeSave:false });
  await User.deleteOne({ _id:u._id });
  await mongoose.disconnect();
})();