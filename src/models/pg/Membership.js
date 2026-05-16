const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgres');
const Tenant = require('./Tenant');
const User = require('./User');

const Membership = sequelize.define('Membership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tenants', key: 'id' }, // foreign key → tenants table
    onDelete: 'CASCADE',                           // if tenant deleted, remove memberships too
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },    // foreign key → users table
    onDelete: 'CASCADE',
  },
  role: {
    type: DataTypes.ENUM('admin', 'member', 'viewer'),
    defaultValue: 'member',
    // admin  → full access: create/edit/delete tasks, manage members
    // member → can create and edit own tasks
    // viewer → read-only access
  },
}, {
  tableName: 'memberships',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'userId'], // a user can only have ONE role per tenant
    },
  ],
});

// Associations — Sequelize uses these to build JOIN queries
Tenant.hasMany(Membership, { foreignKey: 'tenantId' });
Membership.belongsTo(Tenant, { foreignKey: 'tenantId' });

User.hasMany(Membership, { foreignKey: 'userId' });
Membership.belongsTo(User, { foreignKey: 'userId' });

module.exports = Membership;