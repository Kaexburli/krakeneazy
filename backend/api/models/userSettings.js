import mongoose from 'mongoose';

const userSettingsSchema = mongoose.Schema(
  {
    sound: {
      type: String,
      default: "up",
    },
    exports: {
      type: Object,
      default: { ledgers: false, trades: false }
    },
    interval: {
      type: Number,
      default: 60
    },
    maxratecount: {
      type: Number,
      default: 120
    },
    devise: {
      type: String,
      default: "ZUSD"
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

const UserSettings = mongoose.model('user_settings', userSettingsSchema);
export default UserSettings;