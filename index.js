require('dotenv').config();
const nyt_api_key = process.env.NYT_API_KEY

const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate');
const app = express();
const axios = require('axios')
const mongoose = require('mongoose');
const moment = require('moment');

const Weather = require('./models/weatherSchema');
const LocationData = require('./models/locationSchema');
const { findOne } = require('./models/weatherSchema');

//setting up database
mongoose.connect('mongodb://localhost:27017/w1', {useNewUrlParser: true,useCreateIndex:true, useUnifiedTopology: true,useFindAndModify: false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>{
    console.log('Database connected');
});


app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')))

//declaring some variables in locals to use them in different routes 
app.use((req,res,next)=>{
    res.locals.moment = moment;
    next();
})



const getCoordinates = async (query)=>{
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=geocodejson`);
    const locationName = await res.data.features[0].properties.geocoding.name;
    const [longitude, latitude] = await res.data.features[0].geometry.coordinates;

    const addCoordinatesToDB = new LocationData({longitude, latitude, locationName});
    await addCoordinatesToDB.save();
    console.log('added new coordinates in database')

    return {longitude, latitude, locationName};
}
// console.log(getCoordinates('glendale'))

const getForecast = async (longitude,latitude) =>{
    const res = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`)
    const [city,state] =  [res.data.properties.relativeLocation.properties.city, res.data.properties.relativeLocation.properties.state];


    const [gridId,gridX,gridY] =  [res.data.properties.gridId,res.data.properties.gridX,res.data.properties.gridY]

    //forecast of 10 days (morning, afternoon,night)
    const currentForecast = await axios.get(await res.data.properties.forecast);
    const currentInfo = JSON.stringify(await currentForecast.data.properties.periods[0]);

    //hourly forecast of 10 days
    const hourlyForecast = await axios.get(await res.data.properties.forecastHourly);
    const hourlyInfo = JSON.stringify(await hourlyForecast.data.properties.periods);

    const startTime = await currentForecast.data.properties.periods[0].startTime
    
    const addForcastToDB = new Weather({longitude,latitude,gridId,gridX,gridY,city,state,startTime,hourlyInfo,currentInfo})
    await addForcastToDB.save();
    return  {longitude,latitude,gridId,gridX,gridY,city,state,startTime,hourlyInfo,currentInfo};   
}
// getForecast(-118.2478,34.1469)

// const startTime = moment("2021-04-01T13:00:00-06:00").startOf('hour').fromNow();
// console.log(startTime)

const getForecastFromDB = async (longitude, latitude) => {
    const forecastFromDB = await Weather.findOne({longitude: longitude, latitude: latitude})
    console.log(`reading database for ${longitude}, ${latitude}`)
    return forecastFromDB
}

// INDEX
app.get('/index', async (req, res)=>{
    res.render('weather/new')
})

// POST route
app.post('/index', async (req, res)=>{
    try{
        let {query} = req.body;
        const queryCapitalized = query.charAt(0).toUpperCase() + query.slice(1)
        const coordinatesFromDB = await LocationData.findOne({locationName: queryCapitalized})

        if(!coordinatesFromDB){
            //adding new coordinates to DB
            console.log('coordinates not found in database');
            const coordinates = await getCoordinates(queryCapitalized);
            const forecast = await getForecast(coordinates.longitude,coordinates.latitude);
            console.log('weather from new coordinates');
            res.send(forecast);
        }else{
            console.log('coordinates found in database')
            const forecastFromDB = await getForecastFromDB(coordinatesFromDB.longitude,coordinatesFromDB.latitude)
            console.log(forecastFromDB.startTime)
            // const forecastFromDB = await getForecast(coordinatesFromDB.longitude,coordinatesFromDB.latitude);
            res.send(forecastFromDB)  
        }
        
        // res.redirect(`/details/${weather._id}`)
    }catch(e){
        console.log(e)
    }
})

// show route
app.get('/details/:id', async (req, res)=>{
    const {id} = req.params;
    const weather =await Weather.findById(id);
    if (!weather) {
        console.log('not found')
        return res.redirect('/index');
    }
    // console.log(weather)
    var current =await JSON.parse(weather.currentInfo);
    var hourly =await JSON.parse(weather.hourlyInfo);
    res.render('weather/details',{weather,current,hourly})
})


app.listen(3003, ()=>{ 
    console.log('app is listening on 3003')
})







