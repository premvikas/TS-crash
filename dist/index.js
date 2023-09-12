"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors = require('cors');
const database_1 = __importDefault(require("../src/configs/database"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors());
database_1.default.connect((err) => {
    if (err) {
        console.log("err->", err);
    }
    else {
        console.log("Data logging initiated!");
    }
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
const authRouter = require("./routes/authRouter");
const sellerRouter = require("./routes/sellerRouter");
const buyerRouter = require("./routes/buyerRouter");
app.use("/user", authRouter);
app.use("/seller", sellerRouter);
app.use("/buyer", buyerRouter);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/healthCheck', (req, res) => {
    res.send("Hey! I am healthy!");
});
