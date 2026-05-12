// Weather Service - Uses Open-Meteo API (free, no API key required)
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  time: string;
}

export interface ForecastData {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  description: string;
  precipitationChance: number;
}

// WMO Weather Codes
const weatherCodeMap: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Slight Rain Showers",
  81: "Moderate Rain Showers",
  82: "Violent Rain Showers",
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Slight Hail",
  99: "Thunderstorm with Heavy Hail",
};

export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,weather_code&timezone=auto`
    );

    if (!response.ok) throw new Error("Failed to fetch weather data");

    const data = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      weatherCode: current.weather_code,
      weatherDescription: weatherCodeMap[current.weather_code] || "Unknown",
      pressure: current.pressure_msl,
      visibility: 10, // Default value (not provided by Open-Meteo free tier)
      uvIndex: 0, // Default value
      location: "Current Location",
      latitude,
      longitude,
      timezone: data.timezone,
      time: current.time,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    throw new Error("Unable to fetch weather data");
  }
}

export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
  try {
    // First, geocode the city name to get coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityName
      )}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) throw new Error("Failed to geocode city");

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const result = geoData.results[0];
    const weather = await getCurrentWeather(result.latitude, result.longitude);
    weather.location = `${result.name}, ${result.country}`;
    return weather;
  } catch (error) {
    console.error("City weather fetch error:", error);
    throw error;
  }
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  days: number = 7
): Promise<ForecastData[]> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`
    );

    if (!response.ok) throw new Error("Failed to fetch forecast");

    const data = await response.json();
    const daily = data.daily;

    return daily.time.slice(0, days).map((date: string, index: number) => ({
      date,
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      minTemp: Math.round(daily.temperature_2m_min[index]),
      weatherCode: daily.weather_code[index],
      description: weatherCodeMap[daily.weather_code[index]] || "Unknown",
      precipitationChance: daily.precipitation_probability_max[index] || 0,
    }));
  } catch (error) {
    console.error("Forecast fetch error:", error);
    throw error;
  }
}

export function getWeatherIcon(weatherCode: number): string {
  // Returns emoji representing weather condition
  if (weatherCode === 0) return "☀️";
  if (weatherCode === 1 || weatherCode === 2) return "🌤️";
  if (weatherCode === 3) return "☁️";
  if (weatherCode === 45 || weatherCode === 48) return "🌫️";
  if (weatherCode >= 51 && weatherCode <= 67) return "🌧️";
  if (weatherCode >= 71 && weatherCode <= 86) return "❄️";
  if (weatherCode >= 80 && weatherCode <= 82) return "⛈️";
  if (weatherCode >= 95 && weatherCode <= 99) return "⚡";
  return "🌡️";
}

export function getWeatherColor(
  weatherCode: number
): "blue" | "gray" | "yellow" | "purple" | "red" {
  if (weatherCode === 0) return "blue"; // Clear
  if (weatherCode >= 1 && weatherCode <= 3) return "gray"; // Cloudy
  if (weatherCode >= 45 && weatherCode <= 48) return "gray"; // Fog
  if (weatherCode >= 51 && weatherCode <= 67) return "blue"; // Rain
  if (weatherCode >= 71 && weatherCode <= 86) return "purple"; // Snow
  if (weatherCode >= 80 && weatherCode <= 82) return "yellow"; // Showers
  if (weatherCode >= 95 && weatherCode <= 99) return "red"; // Thunderstorm
  return "gray";
}
