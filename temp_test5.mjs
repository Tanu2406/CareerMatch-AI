import User from './server/models/User.js';

const u = new User({ name:'Foo', email:'foo@bar.com', password:'pass123' });
const token = u.getResetPasswordToken();
console.log('token', token);
console.log('hashed', u.resetPasswordToken);
console.log('expire', u.resetPasswordExpire);
