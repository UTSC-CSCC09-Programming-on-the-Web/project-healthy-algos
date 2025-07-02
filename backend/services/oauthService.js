import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        const existingUser = await pool.query(
          'SELECT * FROM users WHERE google_id = $1',
          [googleId]
        );

        let user;

        if (existingUser.rows.length > 0) {
          user = existingUser.rows[0];
        } else {
          const insertResult = await pool.query(
            `INSERT INTO users (google_id, name, email, picture)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [googleId, name, email, picture]
          );
          user = insertResult.rows[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // use your DB id
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});
