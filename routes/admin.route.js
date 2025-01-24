const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { roles } = require('../utils/constants');
const { ensureRole, ensureAdmin } = require('../middleware/authMiddleware');


router.get('/users', ensureRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.render('manage-users', { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    if (req.user.id === parseInt(id)) {
      req.flash('error', 'Admins cannot remove themselves from Admin.');
      return res.redirect('back');
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
    });

    req.flash('info', `Updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

router.post('/update-branch', async (req, res, next) => {
  try {
    const { id, branch } = req.body;

    if (!id || !branch) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Get the valid branches (representing your physical locations)
    const validBranches = await prisma.branch.findMany({
      where: {
        id: { in: [1, 2, 3] }  // Assuming branch IDs are 1, 2, and 3
      }
    });

    const existingBranch = validBranches.find(b => b.id === parseInt(branch));

    if (!existingBranch) {
      req.flash('error', `Branch with ID ${branch} does not exist or is invalid.`);
      return res.redirect('back');
    }

    if (req.user.id === parseInt(id)) {
      req.flash('error', 'Admins cannot change their own branch');
      return res.redirect('back');
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { branchId: parseInt(branch) },
    });

    req.flash('info', `Updated branch for ${user.email} to branch ${branch}`);
    res.redirect('back');
  } catch (error) {
    console.error('Error updating branch:', error);
    next(error);
  }
});

module.exports = router;
