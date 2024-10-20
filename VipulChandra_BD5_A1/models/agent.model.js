// agent.model.js

let { DataTypes, sequelize } = require('../lib/index');
let agent = sequelize.define('agent', {
  agentId: { 
    type: DataTypes.INTEGER, 
   },
  name: { 
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: { 
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = { agent };