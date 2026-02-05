const mongoose = require('mongoose');

/**
 * Geocoding cache to avoid hitting external APIs repeatedly
 * TTL: 30 days
 */
const geoCacheSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-delete expired entries
geoCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Check if entry is expired
geoCacheSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

module.exports = mongoose.model('GeoCache', geoCacheSchema);
