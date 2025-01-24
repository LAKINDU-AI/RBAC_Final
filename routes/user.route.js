const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/profile', async (req, res, next) => {
  const person = req.user;
  res.render('profile', { person });
});

module.exports = router;