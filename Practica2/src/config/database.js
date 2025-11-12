import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',  
    database: 'practica_web3',
    port: 3306
};

const pool = mysql.createPool(dbConfig);

console.log('Configuración de BD lista');

export default pool;