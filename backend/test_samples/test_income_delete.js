const http = require('http');
const express = require('express');
const incomeRoutes = require('../routes/incomeRoutes');
const goalRoutes = require('../routes/goalRoutes');
const enableInMemoryFallback = require('../config/enableInMemoryFallback');
const jwt = require('jsonwebtoken');

async function testDeletes() {
  await enableInMemoryFallback();
  const app = express();
  app.use(express.json());
  app.use('/api/income', incomeRoutes);
  app.use('/api/goals', goalRoutes);

  const server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;

  const token = jwt.sign(
    { id: 'demo_user_id', role: 'user' },
    process.env.JWT_SECRET || 'fallback_secret'
  );

  console.log('Testing GET /api/income...');
  const res1 = await fetch(`http://localhost:${port}/api/income`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('Income count:', res1.count, res1.data.map(i => ({ id: i._id, source: i.source })));

  const firstIncId = res1.data[0]._id;
  console.log('Deleting income id:', firstIncId);
  const delRes = await fetch(`http://localhost:${port}/api/income/${firstIncId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delJson = await delRes.json();
  console.log('Delete Income response status:', delRes.status, delJson);

  console.log('Testing GET /api/goals...');
  const res2 = await fetch(`http://localhost:${port}/api/goals`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('Goals count:', res2.count, res2.data.map(g => ({ id: g._id, title: g.title })));

  const firstGoalId = res2.data[0]._id;
  console.log('Deleting goal id:', firstGoalId);
  const delGoalRes = await fetch(`http://localhost:${port}/api/goals/${firstGoalId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delGoalJson = await delGoalRes.json();
  console.log('Delete Goal response status:', delGoalRes.status, delGoalJson);

  server.close();
}

testDeletes().catch(console.error);
