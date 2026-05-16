const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,   // EVERY task must belong to a tenant — core isolation rule
      index: true,      // indexed so queries filtering by tenant are fast
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'in_review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTo: {
      type: String,   // userId from PostgreSQL users table
      default: null,
    },
    createdBy: {
      type: String,   // userId of whoever created this task
      required: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String], // e.g. ["frontend", "bug", "urgent"]
      default: [],
    },
    // flexible field — tenants can store anything extra here
    // e.g. { storyPoints: 5, sprint: "Sprint 3", epicLabel: "Auth" }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
    collection: 'tasks',
  }
);

// Compound indexes — queries we know will run frequently
taskSchema.index({ tenantId: 1, status: 1 });       // "get all todo tasks for tenant X"
taskSchema.index({ tenantId: 1, assignedTo: 1 });   // "get all tasks assigned to user Y in tenant X"
taskSchema.index({ tenantId: 1, createdAt: -1 });   // "get latest tasks for tenant X"

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;