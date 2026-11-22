const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 3000;

async function start(retries = 10) {
  try {
    await db.init();
  } catch (err) {
    if (retries === 0) throw err;
    console.log('Database not ready, retrying...');
    await new Promise((r) => setTimeout(r, 2000));
    return start(retries - 1);
  }
  app.listen(PORT, () => console.log(`VaultBoard API listening on ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
