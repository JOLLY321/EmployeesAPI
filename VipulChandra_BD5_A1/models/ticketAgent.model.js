// ticketAgent.model.js
let { DataTypes, sequelize } = require('../lib/index');
let { ticket } = require("./ticket.model");
let { agent } = require("./agent.model");

let ticketAgent = sequelize.define('ticketAgent', {
  ticketId: {
    type: DataTypes.INTEGER,
    references: {
      model: ticket,
      key: "ticketId",
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  agentId: {
    type: DataTypes.INTEGER,
    references: {
      model: agent,
      key: "agentId",
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

ticket.belongsToMany(agent, { through: ticketAgent });
agent.belongsToMany(ticket, { through: ticketAgent });

module.exports = { ticketAgent };