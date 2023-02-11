const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
    incomea:{
        type: Array
    },
    expensea:{
        type: Array
    },
    transfera:{
        type: Array
    },
    useri:{
        type: String
      },
    dt:{
        type: String
    }
});

const Calculation = mongoose.model('calculation', calculationSchema);

module.exports = Calculation;