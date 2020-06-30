const mongoose = require('mongoose');


const stationSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    history: [{
        _id: false,
        timestamp: {
            type: Date,
            required: true
        },
        free_bikes: {
            type: Number,
            required: true
        },
        empty_slots: {
            type: Number,

        }
    }]
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
