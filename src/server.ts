import { createApp } from './app';
import { PORT } from './config';
import './db';

const app = createApp();

app.listen(PORT, () => {
  console.log(`taskboard-api listening on http://localhost:${PORT}`);
});
