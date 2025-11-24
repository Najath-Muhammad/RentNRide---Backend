import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0].value;

      const user = { email, name: profile.displayName };

      const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "7d" });

      return done(null, { ...user, token });
    }
  )
);

export default passport;
