import mongoose from 'mongoose';

const userKrakenSchema = mongoose.Schema(
  {
    apiKeyPrivate: {
      type: String,
      minlength: 80,
      trim: true,
      unique: true,
      default: false
    },
    apiKeyPublic: {
      type: String,
      minlength: 50,
      trim: true,
      unique: true,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const UserKraken = mongoose.model('user_kraken', userKrakenSchema);
export default UserKraken;