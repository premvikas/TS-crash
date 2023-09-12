"use strict";
const express = require('express');
const router = express.Router();
const authController_1 = require("../controller/authController");
const buyerController_1 = require("../controller/buyerController");
router.get('/getSellersList', authController_1.authoriseUser, buyerController_1.getSellersList);
router.get('/getSellerCatalog/:sellerId', authController_1.authoriseUser, buyerController_1.getSellerCatalog);
router.post('/createOrder/:sellerId', authController_1.authoriseUser, buyerController_1.createOrder);
module.exports = router;
