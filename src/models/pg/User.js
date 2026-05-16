const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgres');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,              // one account per email globally
    validate: {
      isEmail: true,           // Sequelize validates format before saving
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,          // stored as bcrypt hash, never plain text
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;