const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('./taskService');

const createTaskController = async (req, res) => {
  try {
    const task = await createTask({
      tenantId: req.user.tenantId,  // from JWT via authenticate middleware
      userId: req.user.userId,
      body: req.body,
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getTasksController = async (req, res) => {
  try {
    const result = await getTasks({
      tenantId: req.user.tenantId,
      query: req.query,            // optional filters: ?status=todo&priority=high
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTaskByIdController = async (req, res) => {
  try {
    const task = await getTaskById({
      tenantId: req.user.tenantId,
      taskId: req.params.id,
    });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const updateTaskController = async (req, res) => {
  try {
    const task = await updateTask({
      tenantId: req.user.tenantId,
      taskId: req.params.id,
      userId: req.user.userId,
      role: req.user.role,
      body: req.body,
    });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteTaskController = async (req, res) => {
  try {
    const result = await deleteTask({
      tenantId: req.user.tenantId,
      taskId: req.params.id,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
};