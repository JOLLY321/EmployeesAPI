// ticketCustomer.model.js
let { DataTypes, sequelize } = require("../lib/index");
let { ticket } = require("./ticket.model");
let { customer } = require("./customer.model");

let ticketCustomer = sequelize.define("ticketCustomer", {
  ticketId: {
    type: DataTypes.INTEGER,
    references: {
      model: ticket,
      key: "ticketId",
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: customer,
      key: "customerId",
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

ticket.belongsToMany(customer, { through: ticketCustomer });
customer.belongsToMany(ticket, { through: ticketCustomer });

module.exports = { ticketCustomer };