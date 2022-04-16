// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import mongoose from 'mongoose'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
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
)

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
const UserPriceAlerts = mongoose.model(
  'user_price_alerts',
  userPriceAlertsSchema
)
export default UserPriceAlerts
