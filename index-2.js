async function getWeatherID(query){
    try{
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=geocodejson`);
        const data = await res.json();
        // console.log(data['features']);
        console.log(data['features'][0]['geometry']['coordinates']);
        let [longitude, latitude] = await data['features'][0]['geometry']['coordinates'];
        return [longitude, latitude];
    }catch(err){
        console.log(err)
    }
}

async function getWeatherAW(search_string){
    const [longitude, latitude] = await getWeatherID(search_string)
    const result = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
    const data = await result.json();
    console.log(data)
    const forcast_URL = await data['properties']['forecast']
    console.log(forcast_URL)
    const weather_data = await fetch(forcast_URL)

    console.log(weather_data.json()) 
}

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
// const clearInput = () => {
//     document.querySelector('#search_field').value = '';
// };
// const clearSvg = () => {
//     document.querySelector('.state_icon_svg').innerHTML = '';
// };

async function Wrapper() {
    let stringForSearch = document.getElementById('search_field').value;
    let [longitude, latitude] = await getWeatherID(stringForSearch);
    await getWeatherAW(longitude, latitude);
}


// // default page
// getWeatherAW(2459115);
// clearInput();

// document.getElementById('search_btn').addEventListener('click', e => {
//     e.preventDefault();
//     Wrapper();
//     clearInput();
//     clearSvg();
// });

getWeatherAW("passaic,nj");
    

