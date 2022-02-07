import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    trim: true,
    required: true,
  },
  lastname: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    minlength: 6,
    unique: true,
    trim: true,
    required: true,
  },
  username: {
    type: String,
    minlength: 3,
    unique: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  },
  provider: {
    type: String,
    default: "email"
  },
  resetPasswordToken: {
    type: String,
  },
  confirmationToken: {
    type: String,
    default: uuidv4()
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'user',
  },
  token: {
    type: String,
    default: false
  },
  refresh_token: {
    type: String,
    default: false
  }
});

// encrypt password using bcrypt conditionally. Only if the user is newly created.
// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateToken = async function (remember) {
  let user = this;

  const token = jwt.sign(
    {
      id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email
    },
    process.env.JWT_STANDARD_SECRET,
    {
      expiresIn: remember ? '1h' : '5m'
    }
  );

  user.token = token;
  await user.save();
  return token;
};

// create a custom model method to find user by token for authenticationn
userSchema.statics.findByToken = async function (token) {
  let User = this;
  let decoded;
  try {
    if (!token) {
      return new Error('Missing token header');
    }
    decoded = jwt.verify(token, process.env.JWT_STANDARD_SECRET);
  } catch (error) {
    return error;
  }
  return await User.findOne({
    _id: decoded.id,
    token
  });
};

/**
 * findByCredentials
 * @description create a new mongoose method for user login authentication
 * @param { String } username
 * @param { String } password
 * @returns { Object } HTTP response
 */
userSchema.statics.findByCredentials = async (username, password) => {

  // Check user
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Unable to login. Wrong credentials!');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login. Wrong credentials!');
  }

  // Check is confirmed email
  const isConfirmed = user.confirmed;
  if (!isConfirmed) {
    throw new Error('Your email is not confirmed!');
  }

  return user;
};

// create a custom model method to find user by confirm token for registration
userSchema.statics.findByConfirmToken = async function (confirmationToken) {
  let User = this;
  try {
    if (!confirmationToken) {
      return false;
    }
  } catch (error) {
    return error;
  }

  try {

    const user = await User.findOne({ confirmationToken });

    if (user === null) {
      return false
    }

    user.confirmed = true;
    user.confirmationToken = false;
    await user.save();
    return user.confirmed

  } catch (error) {
    return error;
  }
};

const User = mongoose.model('user', userSchema);
export default User;