<template>
  <div class="container mt-4">
    <h1>Get Weather</h1>
    <p class="text-muted">Current weather for your current location.</p>

    <p v-if="statusMessage">{{ statusMessage }}</p>

    <main>
      <div v-if="weatherData">
        <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>
        <div>
          <img :src="iconUrl" alt="Weather Icon" />
          <p>{{ temperature }} °C</p>
        </div>
        <span>{{ weatherData.weather[0].description }}</span>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'

const apikey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'PASTE_YOUR_API_KEY_HERE'

export default {
  name: 'WeatherView',
  data() {
    return {
      weatherData: null,
      statusMessage: 'Detecting your location...'
    }
  },
  computed: {
    temperature() {
      return this.weatherData ? Math.floor(this.weatherData.main.temp - 273) : null
    },
    iconUrl() {
      return this.weatherData
        ? `https://openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
        : null
    }
  },
  mounted() {
    this.fetchCurrentLocationWeather()
  },
  methods: {
    fetchCurrentLocationWeather() {
      if (!navigator.geolocation) {
        this.statusMessage = 'Geolocation is not supported by this browser.'
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`
          await this.fetchWeatherData(url)
        },
        () => {
          this.statusMessage = 'Location permission denied. Please allow location access.'
        }
      )
    },
    async fetchWeatherData(url) {
      try {
        const response = await axios.get(url)
        this.weatherData = response.data
        this.statusMessage = ''
      } catch (error) {
        this.statusMessage = `Error fetching weather data: ${error.message}`
        console.error('Error fetching weather data:', error)
      }
    }
  }
}
</script>
