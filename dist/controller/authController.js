"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authoriseUser = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const database_1 = __importDefault(require("../configs/database"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, emailId, phoneNumber, password, type } = req.body;
        if (!emailId || !name || !phoneNumber || !password) {
            return res.status(400).json({ error: "Mandatory fields are not sent" });
        }
        const data = yield database_1.default.query('SELECT users.email_id FROM users WHERE users.email_id = $1', [emailId]);
        if (data.rows.length != 0) {
            return res.status(400).json({ error: "Email already there, No need to register again." });
        }
        const hash = yield bcrypt_1.default.hash(password, 10);
        const user = {
            name,
            emailId,
            phoneNumber,
            password: hash,
            type
        };
        const response = yield database_1.default.query(`INSERT INTO users (name, email_id, phone_number, password, type) VALUES ($1,$2,$3,$4,$5);`, [user.name, user.emailId, user.phoneNumber, user.password, user.type]);
        //const  token  = jwt.sign({emailId: user.emailId},process.env.SECRET_KEY);
        res.status(200).send({ message: `${type} - ${emailId} Registered Successfully` });
    }
    catch (err) {
        res.status(500).json({
            error: err,
        });
    }
    ;
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !emailId) {
            return res.status(400).json({ error: "Mandatory fields are not present" });
        }
        const data = yield database_1.default.query(`SELECT users.password FROM users WHERE users.email_id = $1`, [emailId]);
        const user = data.rows;
        if (user.length === 0) {
            res.status(400).json({
                error: "User is not registered, Sign Up first",
            });
        }
        const result = yield bcrypt_1.default.compare(password, user[0].password);
        if (result != true) {
            return res.status(400).json({ error: "Enter correct password!" });
        }
        const token = jsonwebtoken_1.default.sign({ emailId: emailId }, process.env.SECRET_KEY);
        res.status(200).json({ message: `User - ${emailId} signed in!`, token: token });
    }
    catch (err) {
        res.status(500).json({
            error: err
        });
    }
    ;
});
exports.loginUser = loginUser;
const authoriseUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.headers;
        yield jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        next();
    }
    catch (err) {
        return res.status(400).json({ error: "Authorisation failed" });
    }
});
exports.authoriseUser = authoriseUser;
