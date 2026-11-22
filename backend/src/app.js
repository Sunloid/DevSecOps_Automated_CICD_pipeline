const express = require('express');
const _ = require('lodash');
const db = require('./db');

const app = express();
app.use(express.json());

const STATUSES = ['todo', 'doing', 'done'];

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// List tasks, optional ?search=
app.get('/api/tasks', async (req, res) => {
  const search = req.query.search || '';
  // INTENTIONAL WEAKNESS #1: SQL built from raw user input (SQL injection)
  const sql =
    "SELECT * FROM tasks WHERE title ILIKE '%" + search + "%' ORDER BY id DESC";
  try {
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    // INTENTIONAL WEAKNESS #2: leaks internal error details
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const data = _.pick(req.body, ['title', 'description']);
  if (!data.title || !data.title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [data.title.trim(), data.description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'could not create task' });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  try {
    const result = await db.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'could not update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'could not delete task' });
  }
});

// INTENTIONAL WEAKNESS #3: no helmet / security headers anywhere

module.exports = app;
