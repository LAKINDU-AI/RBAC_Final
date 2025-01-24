const ensureRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            return next();
        } else {
            return res.status(403).send('Forbidden');
        }
    };
};

function ensureAdmin(req, res, next) {
    if (req.user.role === role.admin) {
      next();
    } else {
      req.flash('warning', 'you are not authorized to see this route');
      res.redirect('/');
    }
} 

module.exports = { ensureAdmin, ensureRole };
