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
exports.createOrder = exports.getSellerCatalog = exports.getSellersList = void 0;
const database_1 = __importDefault(require("../configs/database"));
const pg_format_1 = __importDefault(require("pg-format"));
const getSellersList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield database_1.default.query('SELECT name,email_id FROM users WHERE type=$1', ["seller"]);
        const listOfEmailIds = data.rows.map((eachData) => eachData.email_id);
        return res.status(200).json({ message: "success", data: listOfEmailIds });
    }
    catch (err) {
        return res.status(400).json({ error: err });
    }
});
exports.getSellersList = getSellersList;
const getSellerCatalog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sellerId } = req.params;
        const data = yield database_1.default.query(`SELECT catalogue.name FROM user_catalogue_mapper
        JOIN catalogue ON user_catalogue_mapper.catalogue_id = catalogue.id
        JOIN user1 ON user_catalogue_mapper.user_id = user1.id AND user1.id = $1`, [sellerId]);
        const catalogueList = data.rows.map((eachData) => eachData.name);
        return res.status(200).json({ message: "success", data: catalogueList });
    }
    catch (err) {
        return res.status(400).json({ error: err });
    }
});
exports.getSellerCatalog = getSellerCatalog;
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productData, buyerId } = req.body;
        const { sellerId } = req.params;
        const productIds = productData.map((eachData) => eachData.productId);
        const res = yield database_1.default.query('SELECT product_name,product_price,id FROM product WHERE id = ANY($1::int[])', [productIds, sellerId]);
        const productDetails = res.rows;
        //const productIdsMappedToSeller = productDetails.map(eachData => eachData.product_id)
        // let difference = productIds.filter(x => !arr2.includes(x));
        let totalPrice = 0, totalQuantity = 0;
        for (let i = 0; i < productDetails.length; i++) {
            const eachProduct = productDetails[i];
            const { product_price: price, id } = eachProduct;
            totalPrice += price;
            const { quantity } = productData.find(({ productId }) => productId === Number(id));
            totalQuantity += quantity;
        }
        yield database_1.default.query('BEGIN');
        const insertOrderText = 'INSERT INTO order_v1 (buyer_id, seller_id, quantity, price, created_at) VALUES ($1,$2,$3, current_timestamp) RETURNING *';
        const insertOrderValue = [buyerId, sellerId, totalQuantity, totalPrice];
        const insertOrderResponse = yield database_1.default.query(insertOrderText, insertOrderValue);
        const orderId = insertOrderResponse.rows[0].id;
        const orderItems = [];
        productDetails.forEach(((eachProduct) => {
            const { id, product_price } = eachProduct;
            const { quantity } = productData.find(({ productId }) => productId === Number(id));
            orderItems.push([orderId, id, quantity, product_price, new Date()]);
        }));
        yield database_1.default.query((0, pg_format_1.default)('INSERT INTO order_item (order_id, product_id, quantity, unit_price, created_at) VALUES %L', orderItems));
        yield database_1.default.query('COMMIT');
        return res.status(200).json({ status: "success" });
    }
    catch (err) {
        yield database_1.default.query('ROLLBACK');
        return res.status(400).json({ error: err });
    }
});
exports.createOrder = createOrder;
