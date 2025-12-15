import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: 'localhost', 
  user: 'root', 
  password: '',
  database: 'gimnasio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool };