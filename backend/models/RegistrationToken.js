const mongoose = require('mongoose');

const registrationTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

// Optional TTL index for automatic cleanup after expiration
registrationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RegistrationToken', registrationTokenSchema);
