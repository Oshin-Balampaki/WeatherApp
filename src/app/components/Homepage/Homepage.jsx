"use client";
import React from "react";
import {
  Search,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Loader2,
  X,
  Heart,
  Star,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudMoon,
  Moon,
  CloudSun,
  CloudMoonRain,
  CloudSunRain,
  Tornado,
  Wind as WindIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Homepage = () => {
  const [CityName, setCityName] = useState("");
  const [weather, setWeather] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const weatherCardRef = useRef(null);
  const searchInputRef = useRef(null);

  const popularCities = [
    "New York",
    "London",
    "Tokyo",
    "Sydney",
    "Paris",
    "Dubai",
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    const savedFavorites = localStorage.getItem("favorites");
    const savedUnit = localStorage.getItem("unit");

    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedUnit) setUnit(savedUnit);
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  useEffect(() => {
    if (weather && weatherCardRef.current) {
      weatherCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [weather]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/geocode?city=${query}`);
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
      setShowSuggestions(true);
    } catch (err) {
      console.log("Error fetching suggestions:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (CityName.length > 2) {
        fetchSuggestions(CityName);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [CityName]);

  const fetchWeather = async (cityName = CityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/weather?city=${cityName}`);
      const data = await res.json();

      if (data.cod === "404") {
        setError("City not found. Please check the name and try again.");
        setWeather(null);
        setLoading(false);
        return;
      }

      setWeather(data);

      const timestamp = new Date().toLocaleString();
      const newSearch = {
        city: cityName,
        country: data.sys?.country || "Unknown",
        temperature: data.main?.temp ? Math.round(data.main.temp) : null,
        tempUnit: "C",
        timestamp: timestamp,
        id: Date.now(),
      };

      const filteredHistory = searchHistory.filter(
        (item) => item.city.toLowerCase() !== cityName.toLowerCase(),
      );
      setSearchHistory([newSearch, ...filteredHistory].slice(0, 10));
      setCityName("");
      setShowSuggestions(false);
    } catch (err) {
      console.log("Something Went Wrong:", err.message);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCity = (city) => {
    setCityName(city);
    fetchWeather(city);
  };

  const removeFromHistory = (id) => {
    setSearchHistory(searchHistory.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const toggleFavorite = (city) => {
    const isFavorite = favorites.some(
      (fav) => fav.city.toLowerCase() === city.toLowerCase(),
    );

    if (isFavorite) {
      setFavorites(
        favorites.filter(
          (fav) => fav.city.toLowerCase() !== city.toLowerCase(),
        ),
      );
    } else {
      const newFavorite = {
        city: city,
        country: weather?.sys?.country || "Unknown",
        id: Date.now(),
      };
      setFavorites([...favorites, newFavorite]);
    }
  };

  const convertTemp = (tempC) => {
    if (unit === "F") {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectSuggestion = (city) => {
    setCityName(city);
    setShowSuggestions(false);
    fetchWeather(city);
  };

  const getWeatherIcon = (weatherCondition, iconCode) => {
    const condition = weatherCondition?.toLowerCase() || "";
    const isDay = iconCode?.includes("d");

    if (condition.includes("clear") || condition.includes("sunny")) {
      return isDay ? (
        <Sun className="md:w-24 w-15 h-15 md:h-24 text-yellow-300" />
      ) : (
        <Moon className="md:w-24 w-15 h-15 md:h-24 text-gray-200" />
      );
    } else if (
      condition.includes("few clouds") ||
      condition.includes("scattered clouds")
    ) {
      return isDay ? (
        <CloudSun className="md:w-24 w-15 h-15 md:h-24 text-yellow-300" />
      ) : (
        <CloudMoon className="md:w-24 w-15 h-15 md:h-24 text-gray-200" />
      );
    } else if (condition.includes("clouds") || condition.includes("overcast")) {
      return <Cloud className="md:w-24 w-15 h-15 md:h-24 text-gray-200" />;
    } else if (condition.includes("rain") && condition.includes("light")) {
      return isDay ? (
        <CloudSunRain className="md:w-24 w-15 h-15 md:h-24 text-blue-200" />
      ) : (
        <CloudMoonRain className="md:w-24 w-15 h-15 md:h-24 text-blue-200" />
      );
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return <CloudRain className="md:w-24 w-15 h-15 md:h-24 text-blue-200" />;
    } else if (
      condition.includes("heavy rain") ||
      condition.includes("shower")
    ) {
      return <CloudHail className="md:w-24 w-15 h-15 md:h-24 text-blue-200" />;
    } else if (
      condition.includes("thunderstorm") ||
      condition.includes("thunder")
    ) {
      return (
        <CloudLightning className="md:w-24 w-15 h-15 md:h-24 text-yellow-200" />
      );
    } else if (condition.includes("snow") || condition.includes("blizzard")) {
      return <CloudSnow className="md:w-24 w-15 h-15 md:h-24 text-white" />;
    } else if (
      condition.includes("mist") ||
      condition.includes("fog") ||
      condition.includes("haze")
    ) {
      return <CloudFog className="md:w-24 w-15 h-15 md:h-24 text-gray-300" />;
    } else if (
      condition.includes("tornado") ||
      condition.includes("hurricane")
    ) {
      return <Tornado className="md:w-24 w-15 h-15 md:h-24 text-gray-300" />;
    } else if (condition.includes("windy") || condition.includes("breezy")) {
      return <WindIcon className="md:w-24 w-15 h-15 md:h-24 text-gray-200" />;
    }

    return isDay ? (
      <Sun className="md:w-24 w-15 h-15 md:h-24 text-yellow-300" />
    ) : (
      <Moon className="md:w-24 w-15 h-15 md:h-24 text-gray-200" />
    );
  };

  const getWeatherGradient = (weatherCondition, iconCode) => {
    const condition = weatherCondition?.toLowerCase() || "";
    const isDay = iconCode?.includes("d");

    if (!isDay) {
      return "from-gray-800 via-indigo-900 to-purple-900";
    }

    if (condition.includes("clear") || condition.includes("sunny")) {
      return "from-blue-400 via-blue-300 to-yellow-300";
    } else if (condition.includes("clouds")) {
      return "from-gray-400 via-gray-500 to-gray-600";
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return "from-gray-600 via-blue-700 to-gray-800";
    } else if (condition.includes("thunderstorm")) {
      return "from-gray-700 via-purple-800 to-gray-900";
    } else if (condition.includes("snow")) {
      return "from-blue-100 via-gray-100 to-white";
    }

    return "from-blue-600 via-indigo-600 to-purple-600";
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans py-20 px-5">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          WeatherApp
        </h1>
        <p className="text-gray-300 text-sm">
          Real-time weather at your fingertips
        </p>
      </div>

      {/* Search Bar with Suggestions */}
      <div className="w-full max-w-md mb-4 relative">
        <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          <div className="flex bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a city..."
              className="flex-1 p-3 px-4 bg-transparent text-white placeholder-gray-300 outline-none"
              value={CityName}
              onChange={(e) => setCityName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
              onFocus={() => CityName.length > 2 && setShowSuggestions(true)}
            />
            <button
              onClick={() => fetchWeather()}
              disabled={loading}
              className="px-6 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="text-white w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="text-white w-5 h-5" />
                  <span className="text-white text-sm hidden sm:inline">
                    Search
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-purple-100 transition-colors flex items-center gap-2"
                onClick={() => handleSelectSuggestion(suggestion.name)}
              >
                <MapPin size={16} className="text-purple-600" />
                <span className="font-medium">{suggestion.name}</span>
                <span className="text-sm text-gray-600">
                  {suggestion.country}
                </span>
                {suggestion.state && (
                  <span className="text-xs text-gray-400">
                    {suggestion.state}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Cities Quick Access */}
      <div className="w-full max-w-md mb-6 flex flex-wrap gap-2 justify-center">
        {popularCities.map((city) => (
          <button
            key={city}
            onClick={() => handleViewCity(city)}
            className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/20 transition-colors"
          >
            {city}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md mb-6 flex justify-end">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex">
          <button
            onClick={() => setUnit("C")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              unit === "C"
                ? "bg-purple-600 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("F")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              unit === "F"
                ? "bg-purple-600 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-md mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
          <X size={16} />
          {error}
        </div>
      )}

      {/* Weather Card */}
      {weather && (
        <div
          ref={weatherCardRef}
          className={`w-full max-w-md p-6 rounded-3xl bg-gradient-to-br ${getWeatherGradient(
            weather.weather[0].description,
            weather.weather[0].icon,
          )}/90 backdrop-blur-sm shadow-2xl text-white mb-8 border border-white/20 transition-all duration-500`}
        >
          {/* Location and Favorite */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {weather?.name || "–"}, {weather?.sys?.country || ""}
                </h2>
                <button
                  onClick={() => toggleFavorite(weather?.name)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Heart
                    size={20}
                    className={
                      favorites.some(
                        (fav) =>
                          fav.city.toLowerCase() ===
                          weather?.name?.toLowerCase(),
                      )
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }
                  />
                </button>
              </div>
              <p className="text-sm opacity-90 flex items-center gap-1">
                <Calendar size={14} />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Custom Weather Icon */}
            <div className="transform hover:scale-110 transition-transform duration-300">
              {getWeatherIcon(
                weather.weather[0].description,
                weather.weather[0].icon,
              )}
            </div>
          </div>

          {/* Temperature Display */}
          <div className="mb-6">
            <div className="text-6xl font-bold mb-2">
              {convertTemp(weather.main.temp)}°{unit}
            </div>
            <p className="text-xl capitalize flex items-center gap-2">
              {weather.weather[0].description}
              {weather.weather[0].icon.includes("d") ? "☀️" : "🌙"}
            </p>
            <p className="text-sm opacity-90">
              Feels like {convertTemp(weather.main.feels_like)}°{unit}
            </p>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer size={16} />
                <span className="text-xs opacity-80">Min / Max</span>
              </div>
              <p className="font-semibold">
                {convertTemp(weather.main.temp_min)}°{unit} /{" "}
                {convertTemp(weather.main.temp_max)}°{unit}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={16} />
                <span className="text-xs opacity-80">Humidity</span>
              </div>
              <p className="font-semibold">{weather.main.humidity}%</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wind size={16} />
                <span className="text-xs opacity-80">Wind Speed</span>
              </div>
              <p className="font-semibold">{weather.wind.speed} km/h</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="text-xs opacity-80">Pressure</span>
              </div>
              <p className="font-semibold">{weather.main.pressure} hPa</p>
            </div>
          </div>

          {/* Sunrise/Sunset */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sunrise size={16} />
                <span className="text-xs opacity-80">Sunrise</span>
              </div>
              <p className="font-semibold">{formatTime(weather.sys.sunrise)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sunset size={16} />
                <span className="text-xs opacity-80">Sunset</span>
              </div>
              <p className="font-semibold">{formatTime(weather.sys.sunset)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
            <p className="text-white">Fetching weather data...</p>
          </div>
        </div>
      )}

      {/* Search History Section */}
      {searchHistory.length > 0 && (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Recent Searches</h2>
            <button
              onClick={clearHistory}
              className="text-sm text-red-300 hover:text-red-200 transition-colors flex items-center gap-1"
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>

          <div className="space-y-2">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {item.city}
                    </span>
                    <span className="text-sm text-gray-300">
                      {item.country}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-500/30 text-white rounded-full">
                      {item.temperature}°C
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleViewCity(item.city)}
                    className="p-2 text-blue-300 hover:bg-white/10 rounded-full transition-colors"
                    title="View this city's weather"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="p-2 text-red-300 hover:bg-white/10 rounded-full transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            {searchHistory.length}{" "}
            {searchHistory.length === 1 ? "city" : "cities"} in history
          </p>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="fill-red-500 text-red-500" size={20} />
            Favorite Cities
          </h2>

          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => handleViewCity(fav.city)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
              >
                <Star size={14} className="text-yellow-400" />
                {fav.city}
                {fav.country && (
                  <span className="text-gray-400">({fav.country})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!weather &&
        !loading &&
        !error &&
        searchHistory.length === 0 &&
        favorites.length === 0 && (
          <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
            <div className="text-6xl mb-4">🌤️</div>
            <h3 className="text-white text-xl font-bold mb-2">
              Welcome to WeatherApp
            </h3>
            <p className="text-gray-300 mb-4">
              Search for a city to get started with weather updates
            </p>
            <div className="text-sm text-gray-400">
              Try searching: New York, London, Tokyo
            </div>
          </div>
        )}
    </div>
  );
};

export default Homepage;
