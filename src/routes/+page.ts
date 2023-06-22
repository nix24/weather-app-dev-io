import type { LoadInput } from "$lib/types";
import { getCoordinates, fetchWeatherData } from "$lib/weather";



export async function load({ fetch }: LoadInput) {
	let location: string = "London";
	const { lat, lng } = await getCoordinates(location, fetch);
	const weatherCards = await fetchWeatherData(lat, lng, fetch);
	return {
		//export
		props: {
			weatherCards,
		},
	};
}
