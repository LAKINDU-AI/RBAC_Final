const bcryptjs = require('bcryptjs'); // Corrected import to bcryptjs
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to compare passwords using bcryptjs
async function isValidPassword(password, hashedPassword) {
  try {
    const isMatch = await bcryptjs.compare(password, hashedPassword); // Using bcryptjs
    console.log(`Comparing passwords: plain=${password}, hashed=${hashedPassword}, isMatch=${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Error comparing passwords');
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        console.log(`Trying to authenticate user: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log(`User not found: ${email}`);
          return done(null, false, {
            message: 'Username/email not registered',
          });
        }

        const isValid = await isValidPassword(password, user.password);
        if (!isValid) {
          console.log(`Invalid password for user: ${email}`);
        }

        return isValid
          ? done(null, user)
          : done(null, false, { message: 'Incorrect password' });
      } catch (error) {
        console.error(`Error during authentication for user: ${email}`, error);
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
