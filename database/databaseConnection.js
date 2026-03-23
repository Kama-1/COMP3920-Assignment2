const mysql = require('mysql2/promise');

console.log("Checking DB Config...");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER)

const database = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // waitForConnections: true,
    // multipleStatements: false,
    // namedPlaceholders: true

});

module.exports = database;