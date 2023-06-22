interface LoadInput {
	page: {
		host: string;
		path: string;
		params: Record<string, string | string[]>;
		query: URLSearchParams;
	};
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
	session: any;
	context: Record<string, any>;
}

interface WeatherCard {
	date: string;
	maxTemp: number;
	minTemp: number;
	windSpeed: number;
	windDirection: string;
	sunrise: string;
	sunset: string;
	uvIndex: number;
	precipitation: number;
}

export type { LoadInput, WeatherCard };
