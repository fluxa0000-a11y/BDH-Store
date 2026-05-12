import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Search,
  MapPin,
  Loader,
  AlertCircle,
  Calendar,
  Compass,
} from 'lucide-react';
import {
  getCurrentWeather,
  getWeatherByCity,
  getWeatherForecast,
  getWeatherIcon,
  getWeatherColor,
  WeatherData,
  ForecastData,
} from './services/weatherService';

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch weather on mount using geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLoading(true);
            setError(null);
            const { latitude, longitude } = position.coords;
            const weatherData = await getCurrentWeather(latitude, longitude);
            setWeather(weatherData);

            const forecastData = await getWeatherForecast(latitude, longitude);
            setForecast(forecastData);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch weather');
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Fallback to default location (New York)
          handleCitySearch('New York');
        }
      );
    } else {
      handleCitySearch('New York');
    }
  }, []);

  const handleCitySearch = async (city: string) => {
    if (!city.trim()) return;

    try {
      setSearchLoading(true);
      setError(null);
      const weatherData = await getWeatherByCity(city);
      setWeather(weatherData);

      const forecastData = await getWeatherForecast(
        weatherData.latitude,
        weatherData.longitude
      );
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'City not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleCitySearch(searchInput);
    setSearchInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-white"
        >
          <Loader className="w-16 h-16" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            Weather Dashboard
          </h1>
          <p className="text-blue-100 text-lg">
            Real-time weather information for any location
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city..."
              className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/90 backdrop-blur text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-300"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
            >
              {searchLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Loader className="w-5 h-5" />
                </motion.div>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/90 backdrop-blur text-white rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {weather && (
          <>
            {/* Current Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/30 shadow-2xl"
            >
              {/* Location Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">{weather.location}</h2>
                    <p className="text-blue-100 text-sm">
                      {new Date(weather.time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-7xl">{getWeatherIcon(weather.weatherCode)}</div>
              </div>

              {/* Main Temperature */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-blue-100 text-sm font-semibold mb-2">Temperature</div>
                  <div className="text-5xl font-bold text-white">{weather.temperature}°C</div>
                  <div className="text-blue-200 text-sm mt-1">
                    Feels like {weather.feelsLike}°C
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-blue-100 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Humidity
                  </div>
                  <div className="text-5xl font-bold text-white">{weather.humidity}%</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-blue-100 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Wind Speed
                  </div>
                  <div className="text-5xl font-bold text-white">{weather.windSpeed}</div>
                  <div className="text-blue-200 text-sm mt-1">km/h</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-blue-100 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Pressure
                  </div>
                  <div className="text-5xl font-bold text-white">{weather.pressure}</div>
                  <div className="text-blue-200 text-sm mt-1">hPa</div>
                </motion.div>
              </div>

              {/* Condition Badge */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center">
                <p className="text-blue-100 text-sm font-semibold">Weather Condition</p>
                <p className="text-2xl font-bold text-white">{weather.weatherDescription}</p>
              </div>
            </motion.div>

            {/* 7-Day Forecast */}
            {forecast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  7-Day Forecast
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {forecast.slice(0, 7).map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/15 backdrop-blur-lg rounded-2xl p-5 border border-white/30 hover:bg-white/20 transition-all"
                    >
                      <p className="text-white font-semibold mb-3">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>

                      <div className="text-4xl mb-3 text-center">
                        {getWeatherIcon(day.weatherCode)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-100">Max</span>
                          <span className="text-white font-bold">{day.maxTemp}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">Min</span>
                          <span className="text-white font-bold">{day.minTemp}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">Rain</span>
                          <span className="text-white font-bold">{day.precipitationChance}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-blue-200 mt-3 text-center">
                        {day.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Coordinates & Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center text-blue-100 text-sm"
            >
              <p>
                📍 {weather.latitude.toFixed(4)}°N, {weather.longitude.toFixed(4)}°E
              </p>
              <p className="mt-2">🕐 Timezone: {weather.timezone}</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
