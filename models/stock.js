'use strict';

const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
	symbol: String
});

mongoose.model('Stock', StockSchema);