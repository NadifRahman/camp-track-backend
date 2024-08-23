const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

const options = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), //Bearer token style
  secretOrKey: process.env.JWT_SECRET, //jwt key
};

passport.use(
  new JwtStrategy(options, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.sub);

      if (!user) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
