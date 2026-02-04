// =================================================================
// PASSPORT CONFIGURATION - Google OAuth
// =================================================================
// Registers GoogleStrategy for OAuth sign-in.
// Credentials read from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars.
// Callback URL defaults to Fly.io production URL; override with GOOGLE_CALLBACK_URL.

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const User = require('../models/User');

// Derive callback URL: env override > production default > local dev
const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://afrimercato-backend.fly.dev/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      if (!user) {
        // New user — generate a random password (required by schema, hashed by pre-save hook)
        user = new User({
          email,
          password: crypto.randomBytes(32).toString('hex'),
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          roles: ['customer'],
          emailVerified: true
        });
        await user.save();
      } else if (!user.avatar && profile.photos && profile.photos[0]) {
        // Existing user — fill in avatar if missing
        user.avatar = profile.photos[0].value;
        await user.save({ validateModifiedOnly: true });
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  console.log('✓ Google OAuth strategy registered');
} else {
  console.log('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)');
}

module.exports = passport;
