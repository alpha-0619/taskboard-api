import path from 'node:path';

export const PORT = Number(process.env.PORT) || 3000;
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'taskboard.sqlite');
