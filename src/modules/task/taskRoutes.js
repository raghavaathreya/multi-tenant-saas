const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authenticate');
const { resolveTenant } = require('../../middleware/resolveTenant');
const { authorize } = require('../../middleware/authorize');
const { rateLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} = require('./taskController');

const router = express.Router();

// All task routes go through: rateLimiter → authenticate → resolveTenant
// This is the full middleware chain in action
router.use(rateLimiter);
router.use(authenticate);
router.use(resolveTenant);

// GET all tasks — any authenticated member can read
router.get('/', authorize('read'), getTasksController);

// GET single task
router.get('/:id', authorize('read'), getTaskByIdController);

// POST create — members and admins can create
router.post(
  '/',
  authorize('create'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
  validate,
  createTaskController
);

// PATCH update — members can update (service checks ownership), admins can update any
router.patch(
  '/:id',
  authorize('update'),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
  validate,
  updateTaskController
);

// DELETE — admin only
router.delete('/:id', authorize('delete'), deleteTaskController);

module.exports = router;