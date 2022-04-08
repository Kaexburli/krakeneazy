import mongoose from 'mongoose';

const userPriceAlertsSchema = mongoose.Schema(
  {
    alerts: {
      type: Object,
      default: {}
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

const UserPriceAlerts = mongoose.model('user_price_alerts', userPriceAlertsSchema);
export default UserPriceAlerts;