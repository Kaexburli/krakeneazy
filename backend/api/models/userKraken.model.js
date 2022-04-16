// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import mongoose from 'mongoose'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const userKrakenSchema = mongoose.Schema(
  {
    apiKeyPrivate: {
      type: String,
      trim: true,
      unique: true,
      default: false
    },
    apiKeyPublic: {
      type: String,
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
)

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
const UserKraken = mongoose.model('user_kraken', userKrakenSchema)
export default UserKraken
