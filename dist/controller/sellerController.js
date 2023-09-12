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
exports.getOrders = exports.createProduct = exports.createCatalog = void 0;
const database_1 = __importDefault(require("../configs/database"));
const createCatalog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sellerId, productName, productPrice } = req.body;
        if (!sellerId) {
            return res.status(400).json({ error: "sellerId doesnt exists" });
        }
        if (!productName || !productPrice) {
            return res.status(400).json({ error: "mandatory field doesnt exists" });
        }
        const userResponse = yield database_1.default.query(`SELECT email_id from user1 WHERE id = $1`, [sellerId]);
        if (userResponse.rows.length === 0) {
            return res.status(400).json({ error: "seller is not registered" });
        }
        yield database_1.default.query('BEGIN');
        const insertCatalogueText = 'INSERT INTO catalogue (name, user_id, created_at) VALUES ($1, $2,current_timestamp) RETURNING *';
        const insertCatalogueValues = [productName, sellerId];
        const insertCatalogueResponse = yield database_1.default.query(insertCatalogueText, insertCatalogueValues);
        const insertProductText = 'INSERT INTO product (product_name, product_price, catalogue_id, created_at) VALUES ($1,$2,$3, current_timestamp)';
        const insertProductValue = [productName, productPrice, insertCatalogueResponse.rows[0].id];
        yield database_1.default.query(insertProductText, insertProductValue);
        yield database_1.default.query('COMMIT');
        return res.status(200).json({ status: "success" });
    }
    catch (err) {
        yield database_1.default.query('ROLLBACK');
        return res.status(400).json({ error: err });
    }
});
exports.createCatalog = createCatalog;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { catalogueId, productName, productPrice } = req.body;
        if (!catalogueId || !productName || !productPrice) {
            return res.status(400).json({ error: "mandatory fields are not present" });
        }
        const insertProductText = 'INSERT INTO product (product_name, product_price, catalogue_id, created_at) VALUES ($1,$2,$3, current_timestamp) RETURNING *';
        const insertProductValue = [productName, productPrice, catalogueId];
        const response = yield database_1.default.query(insertProductText, insertProductValue);
        return res.status(200).json({ status: "success", body: response });
    }
    catch (err) {
        return res.status(400).json({ error: err });
    }
});
exports.createProduct = createProduct;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sellerDetails } = req.params;
        const { sellerId } = Number(sellerDetails);
        const response = yield database_1.default.query('SELECT * FROM order_v1 where seller_id = $1', [sellerId]);
        const orders = response.rows;
        return res.status(200).json({ status: "success", orders: orders });
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
});
exports.getOrders = getOrders;
