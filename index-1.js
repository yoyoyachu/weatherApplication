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

const cityName = (city,state) => {
    const markup = `
        <div class="city_name">${city},${state}</div>
    `;
    document.querySelector('.flex_outer').insertAdjacentHTML('beforeend',markup);
}

const weatherBlock = (weather_periods) => {

    weather_periods.forEach(element => {
        const markup = `
            
            <div class="container" id="container_size${element.number}">
                <div class="card_header">
                    <div class="name">
                        <div class="name_value">${element.name}</div>
                    </div>
                    <div class="date">${getDate(element.endTime)}</div>
                </div>
                <div class="card_content">
                    <div class="forecast_container">   
                        <div class="weather_icon">
                            <img src="${element.icon}" alt="Test">
                        </div>                                           
                        <div class="temperature">${element.temperature}&#186;</div>
                    </div>
                    <div class="detailed_weather">
                        <div class="weather_state">
                            <p>${(element.detailedForecast).substring(0,50)}<span id="dots${element.number}">...</span><span id="more${element.number}">${(element.detailedForecast).substring(50,)}</span></p>
                            <a class="upDownBtn" onclick="readBtn(${element.number})" id="myBtn${element.number}"><i class="material-icons">expand_more</i></a>                           
                        </div>
                    </div>
                </div>
            </div>
        
        `;
        document.querySelector('.flex_outer').insertAdjacentHTML('beforeend',markup);

        
    });
}


function readBtn(i){ 
    
    var dots = document.getElementById(`dots${i}`);
    var moreText = document.getElementById(`more${i}`);
    var btnText = document.getElementById(`myBtn${i}`);
    const container_size = document.getElementById(`container_size${i}`);
    const myBtn = document.getElementById('myBtn');

    if (dots.style.display === "none") {
        dots.style.display = "inline";
        btnText.innerHTML = "<i class=\"material-icons\">expand_more</i>"; 
        moreText.style.display = "none";
        // container_size.style.height = '100%';
    } else {
        dots.style.display = "none";
        btnText.innerHTML = "<i class=\"material-icons\">expand_less</i>"; 
        moreText.style.display = "inline";
        // container_size.style.height = '200%';
    }

        

}



// function myFunc(i) {
//     var dots = document.getElementById(`dots${i}`);
//     var moreText = document.getElementById(`more${i}`);
//     var btnText = document.getElementById(`myBtn${i}`);
//     // var container_size = document.getElementById(`container_size${i}`);

//     if (dots.style.display === "none") {
//         dots.style.display = "inline";
//         btnText.innerHTML = "more"; 
//         moreText.style.display = "none";
//         // container_size.style.height = '300px';
//     } else {
//         dots.style.display = "none";
//         btnText.innerHTML = "less"; 
//         moreText.style.display = "inline";
//         // container_size.style.height = '150px';
//     } 
// }




async function locationForecast(search_string){
    let [longitude, latitude] = await getCoordinates(search_string);
    const result = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
    const data = await result.json();
    console.log(data);

    // getting values of city and state
    const [city, state, date] =await [data['properties']['relativeLocation']['properties']['city'], data['properties']['relativeLocation']['properties']['state'], data];
    console.log(city,state);
    

    // getting forecast data
    const forecast_Url = await data['properties']['forecast'];
    console.log(forecast_Url);

    // getting weather data from forecast URL
    const weather_data_json = await fetch(forecast_Url);
    const weather_data = await weather_data_json.json();
    console.log(weather_data);

    const weather_periods = weather_data['properties']['periods'];
    console.log(weather_periods);
    cityName(city, state);
    weatherBlock(weather_periods);
}

const getDate = e => e.substring(5,10);

const refreshPage = () => {
    document.querySelector('#search_field').value = '';
    document.querySelector('.flex_outer').innerHTML = '';
};



async function Wrapper() {
    let stringForSearch =await document.getElementById('search_field').value;
    let result = await locationForecast(stringForSearch);
    console.log(result);
}

locationForecast('colorado');
document.getElementById('search_btn').addEventListener('click', e => {
    e.preventDefault();
    Wrapper();
    refreshPage();
});



