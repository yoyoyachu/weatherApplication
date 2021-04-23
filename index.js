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
    next();
})



const getCoordinates = async (query)=>{
    const queryCapitalized = query.charAt(0).toUpperCase() + query.slice(1)
    const coordinatesFromDB = await LocationData.findOne({locationName: queryCapitalized});
    if(!coordinatesFromDB){
        //adding new coordinates to DB
        console.log('coordinates not found in database');
        const coordinates = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=geocodejson`);
        const locationName = await coordinates.data.features[0].properties.geocoding.name;
        const [longitude, latitude] = await coordinates.data.features[0].geometry.coordinates;
        const addCoordinatesToDB = new LocationData({longitude, latitude, locationName});
        await addCoordinatesToDB.save();
        console.log('added new coordinates in database')       
        return addCoordinatesToDB;
    }else{
        console.log('coordinates found in database');
        return coordinatesFromDB;
    }  
}
// console.log(getCoordinates('chicago'))

const getForecast = async (query) =>{
    const coordinates = await getCoordinates(query);
    const [longitude,latitude] = [coordinates.longitude,coordinates.latitude];
    const forecastFromDB = await Weather.findOne({longitude: longitude, latitude: latitude});
    if(!forecastFromDB){
        const weatherGovResponse = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`);
        console.log('requesting data from weather.gov api');

        //forecast of 10 days (morning, afternoon,night)
        const currentForecast = await axios.get(await weatherGovResponse.data.properties.forecast);
        const currentInfo = JSON.stringify(await currentForecast.data.properties.periods[0]);

        //hourly forecast of 10 days
        const hourlyForecast = await axios.get(await weatherGovResponse.data.properties.forecastHourly);
        const hourlyInfo = JSON.stringify(await hourlyForecast.data.properties.periods);

        const [city,state] =await  [weatherGovResponse.data.properties.relativeLocation.properties.city, weatherGovResponse.data.properties.relativeLocation.properties.state];
        const [gridId,gridX,gridY] =await  [weatherGovResponse.data.properties.gridId,weatherGovResponse.data.properties.gridX,weatherGovResponse.data.properties.gridY];

        const startTime = currentForecast.data.properties.periods[0].startTime
        const addForcastToDB =await new Weather({longitude,latitude,gridId,gridX,gridY,city,state,startTime,hourlyInfo,currentInfo})
        await addForcastToDB.save();
        console.log('adding new forecast');
        return  addForcastToDB;
    }else{
        console.log(`reading database for ${longitude}, ${latitude}`);
        const timeDiff = Math.abs(new Date() - new Date(forecastFromDB.startTime)); 
        if(timeDiff < 3600000){
            console.log('timeDiff is less than an hour');
            return forecastFromDB;
        }else{
            console.log('timeDiff is more than an hour');
            const _delete = await Weather.findOneAndDelete({longitude:longitude,latitude:latitude});
            const newForecast =await getForecast(query)
            return newForecast;
        }
    }     
}

const newsFeed = async()=>{
    const urlFornewFeed = await axios.get(`https://api.nytimes.com/svc/topstories/v2/us.json?api-key=${nyt_api_key}`);
    const news = await urlFornewFeed.data.results;
    return news;
}

// INDEX
app.get('/', async (req, res)=>{
    res.render('weather/index')
})

//submit form
app.get('/index', async (req, res)=>{
    res.render('weather/new')
})

app.get('/newsFeed', async(req, res)=>{
        const news =await newsFeed();
        res.render('weather/newsFeed',{news})
})

// POST route
app.post('/index', async (req, res)=>{
    try{
        let {query} = req.body;
        const forecast = await getForecast(query);
        res.redirect(`/details/${forecast._id}`)
    }catch(e){
        console.log(e)
        res.redirect('/index')
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







