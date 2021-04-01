const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WeatherSchema = new Schema({
    latitude: Number,
    longitude: Number,
    gridId: String,
    gridX: Number,
    gridY: Number,
    city:String,
    state:String,
    startTime:{
        type: Date,
    },
    hourlyInfo: String,
    currentInfo: String
})

module.exports = mongoose.model('Weather',WeatherSchema);