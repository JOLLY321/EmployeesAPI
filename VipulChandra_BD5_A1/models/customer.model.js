// customer.model.js

let { DataTypes, sequelize } = require('../lib/index');
let customer = sequelize.define('customer', {
  customerId: { 
    type: DataTypes.INTEGER, 
  },
  name: { 
    type: DataTypes.TEXT ,
    allowNull: false,
  },
  email: { 
    type: DataTypes.TEXT ,
    allowNull: false,
  }
});

module.exports = { customer };