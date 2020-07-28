const sliceDay = d => d.substring(0,3);
async function getCoordinates(query){
    try{
        const result = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=geocodejson`);
        const data =await result.json();
        const [longitude, latitude] = data['features'][0]['geometry']['coordinates'];
        console.log([longitude.toFixed(4),latitude.toFixed(4)]);
        return [longitude.toFixed(2),latitude.toFixed(2)];
        
    }catch(err){
        console.log('error finding coordinates')
    }
}


async function locationForecast(search_string){
    let [longitude, latitude] = await getCoordinates(search_string);
    const result = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
    const data = await result.json();

    // getting values of city and state
    const [city, state] =await [data['properties']['relativeLocation']['properties']['city'], data['properties']['relativeLocation']['properties']['state']];
    // console.log(city,state);
    console.log(data);

    // getting forecast data
    const forecast_Url = await data['properties']['forecast'];
    // console.log(forecast_Url);

    // getting weather data from forecast URL
    const weather_data_json = await fetch(forecast_Url);
    const weather_data =await weather_data_json.json();
    
    
    console.log(weather_data);
    const today = weather_data['properties']['periods'][0];
    console.log(today)

    const name = document.querySelector('.name_value');
    name.innerHTML = today.name;
    console.log("set name")

  

    const temperature = document.querySelector('.temperature');
    temperature.innerHTML =today.temperature;
    console.log("set temp")



    const icon = document.querySelector('.state_icon_svg');
    icon.innerHTML = today.icon;
    console.log("set min temp")

    const city_state = document.querySelector('.city');
    city_state.innerHTML = `${city},${state}`;
    console.log("set city name")

    const weather_state = document.querySelector('.weather_state');
    weather_state.innerHTML = today.shortForecast;
    console.log("set state")

    // console.log(today)

    // five days forecast
    // const day_one = weather_data['properties']['periods'][1];
    // const day_two= weather_data['properties']['periods'][2];
    // const day_three = weather_data['properties']['periods'][3];
    // const day_four = weather_data['properties']['periods'][4];
    // const day_five = weather_data['properties']['periods'][5];

    // const first_name = document.querySelector('.first_name');
    // first_name.innerHTML = sliceDay(day_one.name);
    // const first_icon = document.querySelector('.first_icon');
    // // first_icon.innerHTML = day_one.icon;
    // const first_temp = document.querySelector('.first_temp');
    // first_temp.innerHTML =day_one.temperature;

    // const second_name = document.querySelector('.second_name');
    // second_name.innerHTML = sliceDay(day_two.name);
    // const second_icon = document.querySelector('.second_icon');
    // // second_icon.innerHTML = day_two.icon;
    // const second_temp = document.querySelector('.second_temp');
    // second_temp.innerHTML =day_two.temperature;

    // const third_name = document.querySelector('.third_name');
    // third_name.innerHTML = sliceDay(day_three.name);
    // const third_icon = document.querySelector('.third_icon');
    // // third_icon.innerHTML = day_three.icon;
    // const third_temp = document.querySelector('.third_temp');
    // third_temp.innerHTML =day_three.temperature;

    // const fourth_name = document.querySelector('.fourth_name');
    // fourth_name.innerHTML = sliceDay(day_four.name);
    // const fourth_icon = document.querySelector('.fourth_icon');
    // // fourth_icon.innerHTML = day_four.icon;
    // const fourth_temp = document.querySelector('.fourth_temp');
    // fourth_temp.innerHTML =day_four.temperature;

    // const fifth_name = document.querySelector('.fifth_name');
    // fifth_name.innerHTML = sliceDay(day_five.name);
    // const fifth_icon = document.querySelector('.fifth_icon');
    // // fifth_icon.innerHTML = day_five.icon;
    // const fifth_temp = document.querySelector('.fifth_temp');
    // fifth_temp.innerHTML =day_five.temperature;
}



async function Wrapper() {
    let stringForSearch =await document.getElementById('search_field').value;
    let result = await locationForecast(stringForSearch);
    console.log(result);
}

locationForecast('passaic,nj');
document.getElementById('search_btn').addEventListener('click', e => {
    e.preventDefault();
    Wrapper();
    
});








// async function getWeatherID(query){
//     try{
//         const res = await fetch(`https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?query=${query}`);
//         const data = await res.json();
//         // const data = '[{"title":"New York","location_type":"City","woeid":2459115,"latt_long":"40.71455,-74.007118"}]';
//         console.log(data);
//         console.log(data[0].woeid);
//         let getId = await data[0].woeid;
//         return getId;
//     }catch(err){
//         console.log(err)
//     }
// }


// const weatherStateSVGChanger = (state) => {
//     const weatherStateIcon = document.querySelector('.state_icon_svg');
//     markup = `<img class="weather_state_icon_svg" src="vendors/img/weather_states/${state}.svg">`;
//     weatherStateIcon.insertAdjacentHTML("afterbegin",markup);
// }

// async function getWeatherAW(woeid){
//     try{
//         const result = await fetch(`https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/${woeid}`);
//         const data = await result.json();
//         const today = data.consolidated_weather[0];
//         console.log(today)

//         const predictability = document.querySelector('.predictability_value');
//         predictability.innerHTML = `${today.predictability}%`;
//         console.log("set predictability")

//         const wind = document.querySelector('.wind_value');
//         wind.innerHTML = `${bound(today.wind_speed)}mph`;
//         console.log("set wind")

//         const humidity = document.querySelector('.humidity_value');
//         humidity.innerHTML = `${bound(today.humidity)}%`;
//         console.log("set humidity")

//         const temperature = document.querySelector('.temperature');
//         temperature.innerHTML =bound(today.max_temp);
//         console.log("set temp")

//         const max= document.querySelector('.max_temp');
//         max.innerHTML = `${bound(today.max_temp)}`;
//         console.log("set max temp")

//         const min = document.querySelector('.min_temp');
//         min.innerHTML = bound(today.min_temp);
//         console.log("set min temp")

//         const city = document.querySelector('.city');
//         city.innerHTML = data.title;
//         console.log("set city name")

//         const state = document.querySelector('.state');
//         state.innerHTML = today.weather_state_name;
//         console.log("set state")

//         const weather_state_abbr = today.weather_state_abbr;
//         weatherStateSVGChanger(weather_state_abbr);

//         // return data;
//     } catch(error){
//         alert(error);
//     }
// }
    
// const bound = t => parseInt(t);
// const sliceDate = d => d.slice(6);
const clearInput = () => {
    document.querySelector('#search_field').value = '';
};
// const clearSvg = () => {
//     document.querySelector('.state_icon_svg').innerHTML = '';
// };

// async function Wrapper() {
//     let stringForSearch = document.getElementById('search_field').value;
//     let woeid = await getWeatherID(stringForSearch);
//     await getWeatherAW(woeid);
// }


// // default page
// getWeatherAW(2459115);
// clearInput();

// document.getElementById('search_btn').addEventListener('click', e => {
//     e.preventDefault();
//     Wrapper();
//     clearInput();
//     clearSvg();
// });

    

