// ticket.model.js

let { DataTypes, sequelize } = require("../lib/index");

let ticket = sequelize.define("ticket", {
  ticketId: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = { ticket };
