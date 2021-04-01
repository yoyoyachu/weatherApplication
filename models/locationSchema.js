const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    longitude: Number,
    latitude: Number,
    locationName:String,
})

module.exports = mongoose.model('LocationData',locationSchema);