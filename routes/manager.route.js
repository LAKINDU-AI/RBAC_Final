const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ensureRole, ensureAdmin } = require('../middleware/authMiddleware');


router.get('/dashboard', ensureRole('BRANCH_MANAGER'), async (req, res, next) => {
  const branchId = req.user.branchId;
  const { from, to } = req.query;

  const orders = await prisma.order.findMany({
    where: {
      branchId,
      orderDate: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      }
    },
    include: { user: true, branch: true, menuItem: true },
  });

  res.render('branch-report', { orders });
});

router.get('/hqm-report', ensureRole('HQM'), async (req, res, next) => {
  const { from, to, branchId } = req.query;

  const orders = await prisma.order.findMany({
    where: {
      orderDate: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      branchId: branchId ? Number(branchId) : undefined,
    },
    include: { user: true, branch: true, menuItem: true },
  });

  const branches = await prisma.branch.findMany();

  res.render('hqm-report', { orders, branches, selectedBranchId: branchId });
});

module.exports = router;


