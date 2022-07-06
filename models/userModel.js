/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    trim: true,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Paswords do not match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if(!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();

})

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(changedTime, JWTtimestamp);

    return JWTtimestamp < changedTime;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken , this.passwordResetExpires);

  return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
