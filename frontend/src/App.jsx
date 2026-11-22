import { useEffect, useState } from 'react';

const COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'doing', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function load(q = search) {
    try {
      const res = await fetch('/api/tasks?search=' + q);
      if (!res.ok) throw new Error('Could not load tasks');
      setTasks(await res.json());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(''); }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    setTitle('');
    setDescription('');
    load();
  }

  async function move(id, status) {
    await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <main>
      <header>
        <h1>VaultBoard</h1>
        <input
          className="search"
          placeholder="Search tasks"
          value={search}
          onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
        />
      </header>

      <form onSubmit={addTask} className="add">
        <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Add task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="board">
        {COLUMNS.map((col, i) => (
          <div className="column" key={col.key}>
            <h2>{col.label}</h2>
            {tasks.filter((t) => t.status === col.key).map((t) => (
              <article className="task" key={t.id}>
                <h3>{t.title}</h3>
                {/* INTENTIONAL WEAKNESS #4: renders user input as raw HTML (XSS) */}
                <p dangerouslySetInnerHTML={{ __html: t.description }} />
                <div className="actions">
                  {i > 0 && <button onClick={() => move(t.id, COLUMNS[i - 1].key)}>Back</button>}
                  {i < COLUMNS.length - 1 && <button onClick={() => move(t.id, COLUMNS[i + 1].key)}>Advance</button>}
                  <button className="danger" onClick={() => remove(t.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
