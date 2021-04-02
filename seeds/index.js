const mongoose = require('mongoose');
const Weather = require('../models/weatherSchema');

mongoose.connect('mongodb://localhost:27017/w1', {useNewUrlParser: true,useCreateIndex:true, useUnifiedTopology: true, useFindAndModify:false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>{
    console.log('Database connected');
});

const seedDB = async()=>{
    await Weather.deleteMany({});
    for(let i=0; i<1; i++){
        const weather = new Weather({
            "latitude": 40.856,
            "longitude": -74.128,
            "gridId":"OKX",
            "gridX":27,
            "gridY":40,
            "city":"Passaic",
            "state":"NJ",
            "startTime": "2021-04-01T20:00:00-04:00",
            "currentInfo":"",
            "hourlyInfo": ""
        });
        await weather.save();
    }
    
}
seedDB().then(()=>{
    mongoose.connection.close();
});


