const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgres');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // auto-generates a unique ID like "550e8400-e29b-41d4..."
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,          // every tenant must have a name
    unique: true,              // two orgs can't have the same name
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,              // used in URLs e.g. "acme-corp"
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,        // soft disable a tenant without deleting
  },
}, {
  tableName: 'tenants',
  timestamps: true,            // auto adds createdAt and updatedAt columns
});

module.exports = Tenant;