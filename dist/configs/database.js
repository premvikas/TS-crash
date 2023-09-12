"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool, Client } = require('pg');
const client = new Client({
    user: 'test',
    host: 'localhost',
    database: 'hybr1d',
    password: "test",
    port: 5432,
});
exports.default = client;
