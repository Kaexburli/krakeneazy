import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const userSchema = mongoose.Schema(
  {
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
      default: false
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
    cgvConfirmed: {
      type: Boolean,
      default: false,
    },
    isLogged: {
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
    tokenVersion: {
      type: Number,
      default: 0
    },
    settings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_settings"
      }
    ],
    apikeys: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_kraken"
      }
    ],
    alerts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_price_alerts"
      }
    ]
  },
  {
    timestamps: true
  }
);

const generatePassword = (length) => {
  const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789^°!"§$%&/()=?`*+~\'#,;.:-_';
  const password = Array.apply(null, Array(length || 10)).map(function () {
    return charSet.charAt(Math.random() * charSet.length);
  }).join('');

  return checkPassword(password)
}

const checkPassword = (password) => {
  let regex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
  if (!regex.test(password)) return 'L2ug^25WVW';
  else return password
}

// encrypt password using bcrypt conditionally. Only if the user is newly created.
// Hash the plain text password before saving
userSchema.pre('save', function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = bcrypt.hashSync(user.password, 10);
  }
  next();
});

userSchema.methods.generateToken = async function (remember, reset = false) {
  let user = this;

  const token = jwt.sign(
    {
      id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      remember
    },
    process.env.JWT_STANDARD_SECRET,
    {
      expiresIn: remember ? '2h' : '15m'
    }
  );

  user.token = token;
  user.tokenVersion = reset ? 1 : user.tokenVersion + 1;
  user.isLogged = true;
  await user.save();
  return token;
};

// create a custom model method to find user by token for authenticationn
userSchema.statics.findByToken = async function (token, req) {

  if (!token) {
    req.log.error('No token was found!')
    return false;
  }

  let User = this;

  try {
    let decoded = jwt.verify(token, process.env.JWT_STANDARD_SECRET);

    if (decoded.id) {
      return await User.findOne({
        _id: decoded.id,
        token
      }).populate(["settings", "apikeys", "alerts"]);
    }
    else {
      req.log.error('Decoded token error!');
      return false;
    }


  } catch (error) {
    req.log.error(error)
    return false;
  }
};

// create a custom model method to find user by token for authenticationn
userSchema.statics.findById = async function (id) {
  let User = this;

  if (!id) {
    req.log.error('Missing ID!');
    return false;
  }

  return await User.findOne({
    _id: id,
  }).populate(["settings", "apikeys", "alerts"]);

};

/**
 * findByCredentials
 * @description create a new mongoose method for user login authentication
 * @param { String } username
 * @param { String } password
 * @returns { Object } HTTP response
 */
userSchema.statics.findByCredentials = async (email, password) => {

  // Check user
  const user = await User.findOne({ email });

  if (!user) {
    return new Error('wrongCredentials');
  }

  // Check password
  const isMatch = bcrypt.compareSync(password.trim(), user.password);
  if (!isMatch) {
    return new Error('wrongCredentials');
  }

  // Check is confirmed email
  const isConfirmed = user.confirmed;
  if (!isConfirmed) {
    return new Error('notConfirmed');
  }

  // Check is already logged
  const isLogged = user.isLogged;
  if (isLogged) {
    return new Error('alreadyConnected');
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

// Search user by email
userSchema.statics.findByEmail = async function (email, reset = false) {
  let User = this;
  if (!email) {
    return new Error('missingEMail');
  }

  const user = await User.findOne({ email });

  if (!user) return false;

  if (reset) {
    user.resetPasswordToken = uuidv4();
    await user.save();
  }

  return user;
};

// create a custom model method to find user by reset Password Token
userSchema.statics.findByForgotToken = async function (resetPasswordToken) {
  let User = this;

  try {
    if (!resetPasswordToken) {
      return false;
    }
  } catch (error) {
    return error;
  }

  try {
    const user = await User.findOne({ resetPasswordToken });

    if (user === null) {
      return false
    }

    let newPassword = generatePassword(15).trim();
    user.password = newPassword;
    user.resetPasswordToken = false;
    await user.save();

    return { user, newPassword }

  } catch (error) {
    return error;
  }
};

const User = mongoose.model('user', userSchema);
export default User;