const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const menuItems = await prisma.menu.findMany();
    res.render('index', { menuItems });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

