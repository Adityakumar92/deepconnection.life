const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./Auth/Auth.routes');
const backendUserRoutes = require('./BackendUserManagement/BackendUser.routes');
const rolePermissionRoutes = require('./BackendUserManagement/RoleAndPermission.routes');
const blogRoutes = require('./BlogManagement/Blog.routes');
const serviceRoutes = require('./BookingManagement/Service.routes');
const programRoutes = require('./BookingManagement/Program.routes');
const bookingRoutes = require('./BookingManagement/Booking.routes');
const contactUsRoutes = require('./ContactManagement/ContactUs.routes');
const childIssueRoutes = require('./ContactManagement/ChildIssue.routes');
const suggestionRoutes = require('./SuggestionManagement/Suggestion.routes');

const auth = require('../middleware/authMiddleware');



// Register routes
router.use('/auth', authRoutes);


//middleware
router.use(auth);


router.use('/backend-user', backendUserRoutes);
router.use('/role-permission', rolePermissionRoutes);
router.use('/blog', blogRoutes);
router.use('/service', serviceRoutes);
router.use('/program', programRoutes);
router.use('/booking', bookingRoutes);
router.use('/contact-us', contactUsRoutes);
router.use('/child-issue', childIssueRoutes);
router.use('/suggestion', suggestionRoutes);

module.exports = router;
