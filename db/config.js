const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://user:user@ds239137.mlab.com:39137/userz");

module.exports = {mongoose};