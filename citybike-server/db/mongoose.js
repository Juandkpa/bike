const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/bikes', options);
    } catch(err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;