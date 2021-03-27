require('dotenv').config();

const nyt_api_key = process.env.NYT_API_KEY

const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate');
const app = express();
const axios = require('axios')



app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')))



const getCoordinates = async (query)=>{
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=geocodejson`);
    console.log(res.data.features[0].geometry.coordinates)
    const [longitude, latitude] = res.data.features[0].geometry.coordinates;
    return [longitude, latitude];
}
// console.log(getCoordinates('texas'))

const getForecast = async (query) =>{
    [longitude, latitude] = await getCoordinates(query);
    const res = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`)
    const [city, state] = await [res.data.properties.relativeLocation.properties.city, res.data.properties.relativeLocation.properties.state];

    //forecast of 10 days (morning, afternoon,night)
    const forecastUrl = await res.data.properties.forecast;
    const dataFromForecastUrl = await axios.get(forecastUrl);
    const weatherData = dataFromForecastUrl.data.properties.periods[0];

    //hourly forecast of 10 days
    const hourlyForecastUrl = await res.data.properties.forecastHourly;
    const dataFromHourlyForecastUrl = await axios.get(hourlyForecastUrl);
    const hourlyWeatherData = dataFromHourlyForecastUrl.data.properties.periods;
    console.log(weatherData)
    return [weatherData,hourlyWeatherData, city, state] ;   
}
// getForecast('passaic')

const newsFeed = async()=>{
    const urlFornewFeed = await axios.get(`https://api.nytimes.com/svc/topstories/v2/us.json?api-key=${nyt_api_key}`);
    const res = await urlFornewFeed.data.results;
    return res;
}



app.get('/newsFeed', async(req, res)=>{
    const news =await newsFeed();
    res.render('weather/newsFeed',{news})
})
// index route
// app.get('/index', async (req, res)=>{
//     res.render('new')
// })
//show route
// app.get('/details/:city', async (req, res)=>{
//     const {city} = req.params;
//     const p =await getForecast(city);
//     console.log(p)
//     res.render('details',{p, city})
// })
//post route
// app.post('/index', async (req, res)=>{
//     let {query} = req.body;
//     let p = await getForecast(query);
//     res.render('details',{p, getDate})
// })


app.listen(3002, ()=>{ 
    console.log('app is listening on 3002')
})

// const getDate = (d)=>{
//     return d.slice(5, 10)
// }


















// console.log(await finalData.isDayTime)  ....for background chnage..value is boolean so we can put condition on that


//data from weatherData
// {
//     number: 1,
//     name: 'Tonight',
//     startTime: '2021-03-25T19:00:00-04:00',
//     endTime: '2021-03-26T06:00:00-04:00',
//     isDaytime: false,
//     temperature: 56,
//     temperatureUnit: 'F',
//     temperatureTrend: 'rising',
//     windSpeed: '8 mph',
//     windDirection: 'S',
//     icon: 'https://api.weather.gov/icons/land/night/rain_showers,30/rain_showers,60?size=medium',
//     shortForecast: 'Rain Showers Likely',
//     detailedForecast: 'Rain showers likely after 10pm. Mostly cloudy. Low around 56, with temperatures rising to around 60 overnight. South wind around 8 mph. Chance of precipitation is 60%. New rainfall amounts less than a tenth of an inch possible.'
//   }



// data from hourlyWeatherData
// {
//     number: 1,
//     name: '',
//     startTime: '2021-03-25T19:00:00-04:00',
//     endTime: '2021-03-25T20:00:00-04:00',
//     isDaytime: false,
//     temperature: 63,
//     temperatureUnit: 'F',
//     temperatureTrend: null,
//     windSpeed: '7 mph',
//     windDirection: 'S',
//     icon: 'https://api.weather.gov/icons/land/night/sct?size=small',
//     shortForecast: 'Partly Cloudy',
//     detailedForecast: ''
// }
//   



