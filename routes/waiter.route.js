const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ensureRole, ensureAdmin } = require('../middleware/authMiddleware');



router.get('/order', ensureRole('WAITER'), async (req, res, next) => {
    try {
        const menuItems = await prisma.menu.findMany(); 
        res.render('create-order', { menuItems });
    } catch (error) {
        next(error); 
    }
});


router.post('/create-order', ensureRole('WAITER'), async (req, res, next) => {
    try {
        const { menuItemId } = req.body;

        // Show the selected menu item
        const menuItem = await prisma.menu.findUnique({
            where: {
                id: parseInt(menuItemId),
            },
        });

        if (!menuItem) {
            req.flash('error', 'Invalid menu item selected');
            return res.redirect('back');
        }

        // Create the order
        const order = await prisma.order.create({
            data: {
                orderDate: new Date(),
                menuItemId: parseInt(menuItemId),
                userId: req.user.id, 
                branchId: req.user.branchId, 
            },
        });

        req.flash('info', `Order added for user ID ${req.user.id} in branch ${req.user.branchId}`);
        res.redirect('/waiter/order');
    } catch (error) {
        next(error); 
    }
});

module.exports = router;
  


