const Task = require('../../models/mongo/Task');
const redis = require('../../config/redis');

const CACHE_TTL = 300; // cache task lists for 5 minutes

// ─── CACHE HELPERS ───────────────────────────────────────────────────────────

const getCacheKey = (tenantId) => `tenant:${tenantId}:tasks`;

const invalidateCache = async (tenantId) => {
  await redis.del(getCacheKey(tenantId));
};

// ─── CREATE TASK ─────────────────────────────────────────────────────────────

const createTask = async ({ tenantId, userId, body }) => {
  const task = await Task.create({
    tenantId,                    // always from JWT — never from user input
    createdBy: userId,
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    assignedTo: body.assignedTo,
    deadline: body.deadline,
    tags: body.tags,
    metadata: body.metadata,
  });

  await invalidateCache(tenantId); // clear cache so next GET fetches fresh data
  return task;
};

// ─── GET ALL TASKS ────────────────────────────────────────────────────────────

const getTasks = async ({ tenantId, query }) => {
  const cacheKey = getCacheKey(tenantId);

  // 1. Try Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return { tasks: JSON.parse(cached), fromCache: true };
  }

  // 2. Cache miss — build MongoDB filter
  const filter = { tenantId }; // always scope to this tenant

  if (query.status)   filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;

  const tasks = await Task.find(filter).sort({ createdAt: -1 }); // newest first

  // 3. Store in Redis with TTL
  await redis.set(cacheKey, JSON.stringify(tasks), 'EX', CACHE_TTL);

  return { tasks, fromCache: false };
};

// ─── GET SINGLE TASK ──────────────────────────────────────────────────────────

const getTaskById = async ({ tenantId, taskId }) => {
  // tenantId filter ensures tenant A can't fetch tenant B's task by guessing an ID
  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task) throw new Error('Task not found');
  return task;
};

// ─── UPDATE TASK ──────────────────────────────────────────────────────────────

const updateTask = async ({ tenantId, taskId, userId, role, body }) => {
  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task) throw new Error('Task not found');

  // members can only edit their own tasks; admins can edit any task
  if (role === 'member' && task.createdBy !== userId) {
    throw new Error('You can only edit your own tasks');
  }

  const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignedTo', 'deadline', 'tags', 'metadata'];
  allowedUpdates.forEach((field) => {
    if (body[field] !== undefined) task[field] = body[field];
  });

  await task.save();
  await invalidateCache(tenantId);
  return task;
};

// ─── DELETE TASK ──────────────────────────────────────────────────────────────

const deleteTask = async ({ tenantId, taskId }) => {
  const task = await Task.findOneAndDelete({ _id: taskId, tenantId });
  if (!task) throw new Error('Task not found');
  await invalidateCache(tenantId);
  return { message: 'Task deleted successfully' };
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };