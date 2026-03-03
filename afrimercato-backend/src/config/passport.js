// =================================================================
// PASSPORT CONFIGURATION - Google OAuth
// =================================================================
// Registers GoogleStrategy for OAuth sign-in.
// Credentials read from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars.
// Callback URL defaults to Fly.io production URL; override with GOOGLE_CALLBACK_URL.

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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
      } else {
        // Existing user — trust Google's email verification + fill in avatar if missing
        let needsSave = false;
        if (!user.emailVerified) {
          user.emailVerified = true; // Google has verified this email — accept it
          needsSave = true;
        }
        if (!user.avatar && profile.photos && profile.photos[0]) {
          user.avatar = profile.photos[0].value;
          needsSave = true;
        }
        if (needsSave) await user.save({ validateModifiedOnly: true });
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

// =================================================================
// FACEBOOK OAUTH STRATEGY
// =================================================================
const fbCallbackURL = process.env.FACEBOOK_CALLBACK_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://afrimercato-backend.fly.dev/api/auth/facebook/callback'
    : 'http://localhost:5000/api/auth/facebook/callback');

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: fbCallbackURL,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

      if (!email) {
        return done(new Error('Facebook account has no email address. Please use a different login method.'));
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          password: crypto.randomBytes(32).toString('hex'),
          firstName: profile.name.givenName || profile.displayName || 'User',
          lastName: profile.name.familyName || '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          roles: ['customer'],
          emailVerified: true // Facebook has verified this email
        });
        await user.save();
      } else {
        // Existing user — trust Facebook's email verification
        let needsSave = false;
        if (!user.emailVerified) {
          user.emailVerified = true;
          needsSave = true;
        }
        if (!user.avatar && profile.photos && profile.photos[0]) {
          user.avatar = profile.photos[0].value;
          needsSave = true;
        }
        if (needsSave) await user.save({ validateModifiedOnly: true });
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  console.log('✓ Facebook OAuth strategy registered');
} else {
  console.log('⚠️  Facebook OAuth not configured (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET missing)');
}

module.exports = passport;
