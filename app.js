'use strict';

// Open Weather Map url string fragments
const baseUrl = 'https://api.openweathermap.org/data/2.5/';
const conditions = 'weather';
const forecast = 'forecast';
const zip = '?zip=';
const units = '&units=imperial';
const key = '&APPID=';
let apiKey ="";
let $search = "";

// Show only search page initially
$(".weatherPage").hide();
$('.search').focus();

// Get the API key
$.getJSON("api.json", function (data) {
    $.each(data,function (index, value) {
		apiKey = value;
	});
});

// Form submission
$('#form').submit( event => {
	event.preventDefault();

	// Grab search value
    let searchField = $('.search');
    $search = searchField.val();
	searchField.val("");

	// Build separate urls for current conditions and forecast
	let conditionsUrl = baseUrl + conditions + zip + $search + units + key + apiKey;
	let forecastUrl = baseUrl + forecast + zip + $search + units + key + apiKey;

	// Get current conditions
	$.ajax({
		url: conditionsUrl,
		datatype: 'json',
		success: function(data) {
			showWeatherPage();
			$(".searchMessage").html('');

			// Gets city, current temp, weather status and humidity
			let city = data.name;
			$(".city").html(city);
			let temperature = Math.round(data.main.temp);
			$(".temperature").html(temperature + '&deg');
			let status = data.weather[0].main;
			$(".status").html(status);
			let humidity = data.main.humidity + '% Humidity';
			$(".humidity").html(humidity);
		},
		error: function(xhr) {
			$(".searchMessage").html(`'${$search}' was not found`);
			$('.search').focus();
		}
	});

	// Get current forecast
	$.ajax({
		url: forecastUrl,
		datatype: 'json',
		success: function(data) {
			showWeatherPage();
			$(".searchMessage").html('');
			
			// Counter for each day
			let day = 0;
			// Storage placeholder arrays for capturing icons, min and max temps for each day
			let days = [], min = [], max = [], icons = [];

			// Iterate through each forecast interval
			for(let index = 0; index < data.list.length; index++) {
				// Capture the date, icon, high and low values for each forecast
				let date = getDate(data.list[index].dt_txt);
				let low = Math.round(data.list[index].main.temp_min);
				let high = Math.round(data.list[index].main.temp_max);
				let icon = data.list[index].weather[0].icon;

				// Initialize the first values if zero
				if(index === 0) {
					days.push(date);
					min.push(low);
					max.push(high);
					icons.push('');
				}

				// If a new date, then increment the day and initialize new date values
				if(days[day] !== date) {
					day++;
					days.push(date);
					min.push(low);
					max.push(high);
					icons.push('');
				}

				// If a new low is found then update the value
				if(low < min[day]) {
					min[day] = low;
				}

				// If a new high is found then update the value
				if(high > max[day]) {
					max[day] = high;
				}

				// Update icon for first daytime value
				if(icon.endsWith('d') && icons[day] === '') {
					icons[day] = icon;
				}
			} //end of for loop

			// If no daytime icon, then drop the first day's values from these arrays
			if (icons[0] === '') {
				days.shift();
				min.shift();
				max.shift();
				icons.shift();
			}

			// Update page for 5 days of dates, icons, max and min temperatures
			const dayNumber = ['.oneDay', '.twoDay', '.threeDay', '.fourDay', '.fiveDay'];
			for(let index = 0; index < 5; index++) {
				$(`${dayNumber[index]} .date`).html(days[index]);
				$(`${dayNumber[index]} .image`).html(`<img src="http://openweathermap.org/img/w/${icons[index]}.png">`);
				$(`${dayNumber[index]} .high`).html(max[index]);
				$(`${dayNumber[index]} .low`).html(min[index]);
			}
		},
		error: function(xhr) {
			$(".searchMessage").html(`'${$search}' was not found`);
			$('.search').focus();
		} 
	});
});

// Format required month and day values
function getDate(date) {
	let index = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let month = parseInt(date.substr(5,2)) - 1;
	let day = parseInt(date.substr(8,2));
	return index[month] + ' ' + day;
}

// Show the weather page
function showWeatherPage() {
	$(".searchPage").hide();
	$(".weatherPage").show();
}

// Show the search page
function showSearchPage() {
	$(".searchPage").show();
	$(".weatherPage").hide();
	$('.search').focus();
}

// Go back to search page if Search or X icons are clicked
$(".fas").click( () => {
	showSearchPage();
});
