let express = require('express');
let { agent } = require('./models/agent.model');
let { sequelize } = require('./lib/index');
let { customer } = require('./models/customer.model');
let { ticket } = require('./models/ticket.model');
let { ticketCustomer } = require('./models/ticketCustomer.model');
let { ticketAgent } = require('./models/ticketAgent.model');
let { Op } = require('@sequelize/core');
let app = express();
let PORT = 3000;

app.use(express.json());

app.get('/seed_db', async (req, res) => {
  await sequelize.sync({ force: true });

  let tickets = await ticket.bulkCreate([
    {
      ticketId: 1,
      title: 'Login Issue',
      description: 'Cannot login to account',
      status: 'open',
      priority: 1,
      customerId: 1,
      agentId: 1,
    },
    {
      ticketId: 2,
      title: 'Payment Failure',
      description: 'Payment not processed',
      status: 'closed',
      priority: 2,
      customerId: 2,
      agentId: 2,
    },
    {
      ticketId: 3,
      title: 'Bug Report',
      description: 'Found a bug in the system',
      status: 'open',
      priority: 3,
      customerId: 1,
      agentId: 1,
    },
  ]);

  let customers = await customer.bulkCreate([
    { customerId: 1, name: 'Alice', email: 'alice@example.com' },
    { customerId: 2, name: 'Bob', email: 'bob@example.com' },
  ]);

  let agents = await agent.bulkCreate([
    { agentId: 1, name: 'Charlie', email: 'charlie@example.com' },
    { agentId: 2, name: 'Dave', email: 'dave@example.com' },
  ]);

  await ticketCustomer.bulkCreate([
    { ticketId: tickets[0].id, customerId: customers[0].id },
    { ticketId: tickets[2].id, customerId: customers[0].id },
    { ticketId: tickets[1].id, customerId: customers[1].id },
  ]);

  await ticketAgent.bulkCreate([
    { ticketId: tickets[0].id, agentId: agents[0].id },
    { ticketId: tickets[2].id, agentId: agents[0].id },
    { ticketId: tickets[1].id, agentId: agents[1].id },
  ]);

  return res.json({ message: 'Database seeded successfully' });
});


// Helper function to get ticket's associated customers
async function getTicketCustomers(ticketId) {
  const ticketCustomers = await ticketCustomer.findAll({
    where: { ticketId },
  });

  let customerData;
  for (let cus of ticketCustomers) {
    customerData = await customer.findOne({where :{customerId: cus.customerId}});
  }

  return customerData;
}


async function getTicketAgents(ticketId) {
  const ticketAgents = await ticketAgent.findAll({ where: { ticketId } });
  let agentData = [];
  for (let agt of ticketAgents) {
    const agents = await agent.findOne({ where: { agentId: agt.agentId } });
    agentData.push(agents);
  }
  return agentData;
}

// Helper function to get ticket details with associated customers and agents
async function getTicketDetails(ticketData) {
  const customer = await getTicketCustomers(ticketData.id);
  const agent = await getTicketAgents(ticketData.id);

  return {
    ...ticketData.dataValues,
    customer,
    agent,
  };
}

app.get('/tickets', async (req, res) => {
  const tickets = await ticket.findAll();
  let detailedTickets = [];
  for (let ticket of tickets) {
    let detailedTicket = await getTicketDetails(ticket);
    detailedTickets.push(detailedTicket);
  }
  return res.json({ tickets: detailedTickets });
});


app.get('/tickets/details/:id', async (req, res) => {
  try {
    const tickets = await ticket.findOne({ where: { id: req.params.id } });  
    if (!tickets) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const detailedTicket = await getTicketDetails(tickets);  
    return res.json({ ticket: detailedTicket });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching ticket details', error: error.message });
  }
});

app.get('/tickets/status/:status', async (req, res) => {
  const tickets = await ticket.findAll({
    where: { status: req.params.status },
  });
  let detailedTickets = [];
  for (let ticket of tickets) {
    let detailedTicket = await getTicketDetails(ticket);
    detailedTickets.push(detailedTicket);
  }
  return res.json({ tickets: detailedTickets });
});

app.get('/tickets/sort-by-priority', async (req, res) => {
  const tickets = await ticket.findAll({ order: [['priority', 'ASC']] });
  let detailedTickets = [];
  for (let ticket of tickets) {
    let detailedTicket = await getTicketDetails(ticket);
    detailedTickets.push(detailedTicket);
  }
  return res.json({ tickets: detailedTickets });
});

app.post('/tickets/new', async (req, res) => {
  const { title, description, status, priority, customerId, agentId } =
    req.body;
  const newTicket = await ticket.create({
    title,
    description,
    status,
    priority,
  });
  await ticketCustomer.create({ ticketId: newTicket.ticketId, customerId });
  await ticketAgent.create({ ticketId: newTicket.ticketId, agentId });
  const detailedTicket = await getTicketDetails(newTicket);
  return res.json({ ticket: detailedTicket });
});

async function addNewTrack(trackData) {
  let newTrack = await track.create(trackData);

  return { newTrack };
}

app.post('/tickets/update/:id', async (req, res) => {
  const { title, description, status, priority, customerId, agentId } =
    req.body;
  const tickets = await ticket.findOne({ where: { ticketId: req.params.id } });
  if (!tickets) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  if (title) tickets.title = title;
  if (description) tickets.description = description;
  if (status) tickets.status = status;
  if (priority) tickets.priority = priority;

  await tickets.save();

  if (customerId) {
    await ticketAgenticketCustomer.destroy({ where: { ticketId: tickets.ticketId } });
    await ticketCustomer.create({ ticketId: ticket.ticketId, customerId });
  }

  if (agentId) {
    await ticketAgent.destroy({ where: { ticketId: tickets.ticketId } });
    await ticketAgent.create({ ticketId: tickets.ticketId, agentId });
  }

  const updatedTicket = await getTicketDetails(tickets);
  return res.json({ ticket: updatedTicket });
});

app.post('/tickets/delete', async (req, res) => {
  const { id } = req.body;
  await ticketCustomer.destroy({ where: { ticketId: id } });
  await ticketAgent.destroy({ where: { ticketId: id } });
  await ticket.destroy({ where: { ticketId: id } });
  return res.json({ message: `Ticket with ID ${id} deleted successfully.` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
