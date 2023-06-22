<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { WeatherCard } from "$lib/types.js";
	import { getCoordinates, fetchWeatherData } from "$lib/weather";
	import type { EventHandler } from "svelte/elements";
	import { fade } from "svelte/transition";
	export let data;

	let location: string = "";
	let latitude: number = 0;
	let longitude: number = 0;
	// unit would be F or C
	// let tempUnit = "F";
	$: tempUnit = "F";
	let weatherCards: WeatherCard[] = data.props.weatherCards;

	const getCurrentLocation = () => {
		navigator.geolocation.getCurrentPosition(async (position) => {
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			//grab the city name
			weatherCards = [...(await fetchWeatherData(latitude, longitude, fetch))];
			location = "current location";
		});
	};

	const grabDate = () => {
		const date = new Date();
		return date.toLocaleDateString();
	};

	//function to convert temp units, will only fire if tempUnit changes
	const convertTemp = (temp: number, unit: string) => {
		if (unit === "F") {
			return temp;
		} else {
			tempUnit = "C";
			//convert F to C
			return ((temp - 32) * 5) / 9;
		}
	};
	const openModal = () => {
		const modal = document.getElementById("search_modal") as HTMLDialogElement;
		if (modal && modal.showModal) {
			modal.showModal();
		}
	};

	const onSearchSubmit: EventHandler<
		Event & { submitter: HTMLFormElement | null },
		HTMLFormElement
	> = async (event) => {
		event.preventDefault();
		const form = event.target as HTMLFormElement | null;
		if (!form) {
			return;
		}
		const formData = new FormData(form);
		location = formData.get("location") as string;
		const { lat, lng } = await getCoordinates(location, fetch);
		latitude = lat;
		longitude = lng;
		weatherCards = [...(await fetchWeatherData(latitude, longitude, fetch))];
		const modal = document.getElementById("search_modal") as HTMLDialogElement;
		modal.close();
	};

	const getWeatherIcon = (temp: number) => {
		//converts to F if temp is not already in F
		//if statement that changes icon based on temperature
		const ICONS = {
			veryCold: "game-icons:ice-bolt",
			cold: "mdi:cold-alert",
			normal: "fluent-mdl2:cloud-weather",
			hot: "mdi:weather-sunny",
			veryHot: "bxs:hot",
		};
		//making sure temp is in F
		temp = tempUnit === "F" ? temp : (temp * 9) / 5 + 32;

		if (temp <= 32) {
			return ICONS.veryCold;
		} else if (temp > 32 && temp <= 50) {
			return ICONS.cold;
		} else if (temp > 50 && temp <= 65) {
			return ICONS.normal;
		} else if (temp > 65 && temp <= 89) {
			return ICONS.hot;
		} else {
			return ICONS.veryHot;
		}
	};
</script>

<div class="bg-base-100 flex md:flex-row flex-col">
	<!--div 1, mobile: place btns on opposite ends-->
	<div class="bg-base-200 md:w-1/2 p-4">
		<!--btns justify space-between-->
		<div class="navbar">
			<div class="flex-1">
				<button
					class="btn rounded-md bg-neutral text-neutral-content mb-4"
					on:click="{openModal}">Search for places</button
				>
				<dialog id="search_modal" class="modal modal-bottom sm:modal-middle">
					<form method="dialog" class="modal-box" on:submit="{onSearchSubmit}">
						<h3 class="font-bold text-lg">Enter a location!</h3>
						<div class="py-4">
							<input
								type="text"
								name="location"
								class="input input-bordered w-full"
								placeholder="Location"
							/>
						</div>
						<div class="modal-action">
							<button class="btn">Search</button>
						</div>
					</form>
				</dialog>
			</div>
			<div class="flex-none">
				<button class="btn" on:click="{getCurrentLocation}">
					<Icon
						class="btn btn-sm p-1 btn-circle bg-neutral text-neutral-content"
						icon="mdi:crosshairs-gps"
					/>
				</button>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center">
			<div class="">
				<!-- Weather icon based on temp/weather -->
				<Icon
					class="text-[12rem] mb-[-1rem] pt-4"
					icon="{getWeatherIcon(weatherCards[0].maxTemp)}"
				/>
			</div>
			<div class="pt-32">
				<!--by default, its F, should be converted to C after conversion-->
				<p class="temperature text-base-content">
					<span class="text-9xl font-bold">
						{Math.round(convertTemp(weatherCards[0].maxTemp, tempUnit))}
					</span>
					<span class="text-2xl font-bold relative bottom-10">°{tempUnit}</span>
				</p>
			</div>
			<div class="p-20">
				<p class="date text-base-content">Today ● {grabDate()}</p>

				<div class="flex items-center justify-center">
					<Icon class="text-neutral-content" icon="mdi:map-marker" />
					<span class="location-name text-neutral-content">{location}</span>
				</div>
			</div>
		</div>
	</div>
	<!--div 1 end-->

	<div class="bg-base-300 flex flex-col items-center w-full md:w-1/2 p-4">
		<!--div 2-->
		<div class="">
			<div class="flex justify-center items-center mb-4">
				<!--buttons to change temp-->
				<button
					class="btn btn-sm btn-circle bg-neutral text-neutral-content font-semibold mr-2"
					on:click="{() => (tempUnit = 'C')}">C°</button
				>
				<button
					class="btn btn-sm btn-circle bg-neutral text-neutral-content font-semibold"
					on:click="{() => (tempUnit = 'F')}">F°</button
				>
			</div>
			<!--show grid of 2 in a row then newline-->
			<div class="grid grid-cols-2 p-5 rounded-box justify-center items-center">
				<!-- grid row of 5 cards -->
				{#each weatherCards as card}
					<div
						transition:fade
						class="card bg-base-100 w-48 mb-3 rounded justify-center items-center mr-2 shadow-lg"
					>
						<div class="card-body">
							<h2 class="font-semibold">{card.date}</h2>
							<figure>
								<Icon class="text-4xl" icon="{getWeatherIcon(card.maxTemp)}" />
							</figure>
							<div
								class="font-light flex flex-row items-center justify-between"
							>
								<p class="text-base-content font-normal"
									>{Math.round(
										convertTemp(card.maxTemp, tempUnit)
									)}°{tempUnit}</p
								>
								<p class="text-base-content"
									>{Math.round(
										convertTemp(card.minTemp, tempUnit)
									)}°{tempUnit}</p
								>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="">
				<p class="text-base-content text-2xl font-medium mb-3"
					>Today's Highlights</p
				>
				<!-- mobile: col, desktop: row of 2 per row-->
				<div
					class="flex flex-col items-center justify-center mt-2 md:grid md:grid-cols-2"
				>
					<!-- grid cards col -->
					<div class="card bg-base-100 w-52 mb-2 text-center">
						<div class="card-body">
							<Icon
								class="bg-transparent btn-circle p-2 text-neutral-content"
								icon="solar:wind-bold-duotone"
							/>
							<p class="mx-auto card-title text-neutral-content">Wind Status</p>
							<p class="text-2xl font-semibold"
								><span class="text-7xl font-bold"
									>{Math.round(weatherCards[0].windSpeed)}</span
								>mph</p
							>
							<div class="flex flex-row items center justify-center mx-auto">
								<Icon
									class="bg-transparent btn-circle p-2 text-neutral-content"
									icon="wi:wind-deg"
									style="transform: rotate({Number(weatherCards[0].windDirection)}deg)"
								/>
								<span class="pt-[0.7rem]">{weatherCards[0].windDirection}</span>
							</div>
						</div>
					</div>
					<!-- Repeat other cards as needed -->
					<div class="card bg-base-100 w-52 mb-2 text-center">
						<div class="card-body">
							<Icon
								class="bg-transparent btn-circle p-2 text-neutral-content"
								icon="carbon:uv-index-alt"
							/>
							<p class="mx-auto card-title text-neutral-content">UV Index</p>
							<p class="text-2xl font-semibold"
								><span class="text-7xl font-bold"
									>{Math.round(weatherCards[0].uvIndex)}</span
								></p
							>
						</div>
					</div>
					<div class="card bg-base-100 w-52 mb-2 text-center">
						<div class="card-body">
							<Icon
								class="bg-transparent btn-circle p-2 text-neutral-content"
								icon="solar:sunrise-broken"
							/>
							<p class="mx-auto card-title text-neutral-content">Sunrise</p>
							<p class="text-2xl font-semibold">{weatherCards[0].sunrise}</p>
						</div>
					</div>
					<div class="card bg-base-100 w-52 mb-2 text-center">
						<div class="card-body">
							<Icon
								class="bg-transparent btn-circle p-2 text-neutral-content"
								icon="solar:sunset-broken"
							/>
							<p class="mx-auto card-title text-neutral-content">Sunset</p>
							<p class="text-2xl flex flex-row items-center font-semibold"
								>{weatherCards[0].sunset}</p
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!--div 2 end-->
</div>

