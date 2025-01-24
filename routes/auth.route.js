const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const connectEnsure = require('connect-ensure-login');


router.get(
    '/login',
    connectEnsure.ensureLoggedOut({redirectTo: '/'}), 
    async (req, res, next) => {
      res.render('login');
});

router.post(
    '/login',
    connectEnsure.ensureLoggedOut({redirectTo: '/'}), 
    passport.authenticate('local', {
      successRedirect: '/user/profile',
      failureRedirect: '/auth/login',
      failureFlash: true,
    })
  );



router.get(
    '/register',
    connectEnsure.ensureLoggedOut({redirectTo: '/'}), 
    async (req, res, next) => {
    res.render('register');
});

router.post(
    '/register', 
    connectEnsure.ensureLoggedOut({redirectTo: '/'}), 
    async (req, res, next) => {
  try {
    const { email, password, password2 } = req.body;

    if (password !== password2) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/register');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      req.flash('warning', 'Username/email already exists');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const branch = await prisma.branch.findUnique({ where: { id: 1 } });

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'WAITER',
        Branch: { connect: { id: 1 } },
      },
    });

    req.flash('success', 'Registration successful. You can now login.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get(
    '/logout', 
    connectEnsure.ensureLoggedIn({redirectTo: '/'}),
    (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });
  

module.exports = router;

