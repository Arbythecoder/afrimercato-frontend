// =================================================================
// PASSPORT CONFIGURATION - OAuth (Google & Facebook)
// =================================================================
// Social authentication for Afrimercato
// Supports: Google OAuth 2.0, Facebook Login

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const Customer = require('../models/Customer');

// =================================================================
// GOOGLE OAUTH STRATEGY
// =================================================================
/**
 * Google OAuth 2.0 Configuration
 *
 * Setup Instructions:
 * 1. Go to: https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Google+ API
 * 4. Go to Credentials → Create OAuth 2.0 Client ID
 * 5. Add authorized redirect URIs:
 *    - http://localhost:5000/api/auth/google/callback (development)
 *    - https://afrimercato-backend.fly.dev/api/auth/google/callback (production)
 * 6. Copy Client ID and Client Secret to .env
 */

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔵 Google OAuth callback:', profile.id);

          // Extract user info from Google profile
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user.googleId = googleId;
              user.avatar = user.avatar || avatar;
              await user.save();
            }

            console.log(`✅ Existing user logged in via Google: ${email}`);
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name,
            email,
            googleId,
            avatar,
            roles: ['customer'],
            primaryRole: 'customer',
            isEmailVerified: true, // Google emails are verified
            authProvider: 'google'
          });

          // Auto-create customer profile (like UberEats/Chowdeck)
          try {
            await Customer.create({
              user: user._id,
              preferences: {
                notifications: {
                  email: true,
                  sms: false,
                  push: true
                }
              }
            });
            console.log(`✅ Customer profile auto-created for Google user: ${email}`);
          } catch (customerError) {
            console.error('Failed to create customer profile:', customerError);
          }

          console.log(`✅ New user registered via Google: ${email}`);
          return done(null, user);

        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️ Google OAuth not configured (missing credentials)');
}

// =================================================================
// FACEBOOK OAUTH STRATEGY
// =================================================================
/**
 * Facebook OAuth Configuration
 *
 * Setup Instructions:
 * 1. Go to: https://developers.facebook.com/
 * 2. Create a new app or select existing
 * 3. Add Facebook Login product
 * 4. Go to Settings → Basic
 * 5. Copy App ID and App Secret to .env
 * 6. Add redirect URIs in Facebook Login Settings:
 *    - http://localhost:5000/api/auth/facebook/callback (development)
 *    - https://afrimercato-backend.fly.dev/api/auth/facebook/callback (production)
 */

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔵 Facebook OAuth callback:', profile.id);

          // Extract user info from Facebook profile
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const name = profile.displayName;
          const facebookId = profile.id;
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          if (!email) {
            return done(new Error('Email not provided by Facebook'), null);
          }

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // Update Facebook ID if not set
            if (!user.facebookId) {
              user.facebookId = facebookId;
              user.avatar = user.avatar || avatar;
              await user.save();
            }

            console.log(`✅ Existing user logged in via Facebook: ${email}`);
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name,
            email,
            facebookId,
            avatar,
            roles: ['customer'],
            primaryRole: 'customer',
            isEmailVerified: true, // Facebook emails are verified
            authProvider: 'facebook'
          });

          // Auto-create customer profile (like UberEats/Chowdeck)
          try {
            await Customer.create({
              user: user._id,
              preferences: {
                notifications: {
                  email: true,
                  sms: false,
                  push: true
                }
              }
            });
            console.log(`✅ Customer profile auto-created for Facebook user: ${email}`);
          } catch (customerError) {
            console.error('Failed to create customer profile:', customerError);
          }

          console.log(`✅ New user registered via Facebook: ${email}`);
          return done(null, user);

        } catch (error) {
          console.error('Facebook OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️ Facebook OAuth not configured (missing credentials)');
}

// =================================================================
// PASSPORT SERIALIZATION
// =================================================================

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
