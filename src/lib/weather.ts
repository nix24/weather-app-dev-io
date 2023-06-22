import type { LoadInput } from "./types";
import { env } from "$env/dynamic/public";
/**
 * Fetches the latitude and longitude coordinates for a given location using the Google Maps Geocoding API.
 * @param loc - The location to search for.
 * @param fetch - The fetch function to use for making the API request.
 * @returns An object containing the latitude and longitude coordinates of the location.
 */
export const getCoordinates = async (
	loc: string,
	fetch: LoadInput["fetch"]
): Promise<{
	lat: number;
	lng: number;
}> => {
	const res = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			loc
		)}&key=${env.PUBLIC_MAP_API_KEY}`
	);
	const data = await res.json();
	if (data.results[0] && data.results[0].geometry) {
		return {
			lat: data.results[0].geometry.location.lat,
			lng: data.results[0].geometry.location.lng,
		};
	} else {
		return { lat: 0, lng: 0 };
	}
};

/**
 * Fetches weather data for a given latitude and longitude using the Open Meteo API.
 * @param lat - The latitude of the location to fetch weather data for.
 * @param long - The longitude of the location to fetch weather data for.
 * @param fetch - The fetch function to use for making the API request.
 * @returns An array of objects containing weather data for each day.
 */
export const fetchWeatherData = async (
	lat: number,
	long: number,
	fetch: LoadInput["fetch"]
) => {
	const res = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant&temperature_unit=fahrenheit&timezone=America%2FNew_York`
	);
	const data = await res.json();

	return data.daily.time.map((time: string, index: number) => {
		return {
			date: time,
			maxTemp: data.daily.temperature_2m_max[index],
			minTemp: data.daily.temperature_2m_min[index],
			windSpeed: data.daily.windspeed_10m_max[index],
			windDirection: data.daily.winddirection_10m_dominant[index],
			sunrise: data.daily.sunrise[index],
			sunset: data.daily.sunset[index],
			uvIndex: data.daily.uv_index_max[index],
			precipitation: data.daily.precipitation_sum[index],
		};
	});
};
