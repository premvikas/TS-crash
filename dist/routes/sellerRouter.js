"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../controller/authController");
const sellerController_1 = require("../controller/sellerController");
router.post('/createCatalogue', authController_1.authoriseUser, sellerController_1.createCatalog);
router.post('/createProduct', authController_1.authoriseUser, sellerController_1.createProduct);
router.get('/getOrders/:sellerId', authController_1.authoriseUser, sellerController_1.getOrders);
module.exports = router;
