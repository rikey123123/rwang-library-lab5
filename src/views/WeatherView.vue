<template>
  <div class="container mt-4">
    <h1>Get Weather</h1>

    <div class="input-group mb-3" style="max-width: 420px">
      <input v-model="city" type="text" class="form-control" placeholder="e.g. Clayton, AU" />
      <button class="btn btn-primary" @click="searchByCity">Search</button>
    </div>

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

const apikey = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE = 'https://api.openweathermap.org/data/2.5/weather'

export default {
  name: 'WeatherView',
  data() {
    return { city: '', weatherData: null, statusMessage: 'Detecting your location...' }
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
    // Task 10.1 - weather for the current location (geolocation)
    fetchCurrentLocationWeather() {
      if (!navigator.geolocation) {
        this.statusMessage = 'Geolocation is not supported by this browser.'
        return
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          await this.fetchWeatherData(`${BASE}?lat=${latitude}&lon=${longitude}&appid=${apikey}`)
        },
        () => {
          this.statusMessage = 'Location permission denied. Please allow location access.'
        }
      )
    },

    // Task 10.2 - search weather by city name
    async searchByCity() {
      if (!this.city) return
      await this.fetchWeatherData(`${BASE}?q=${this.city}&appid=${apikey}`)
    },

    async fetchWeatherData(url) {
      try {
        const response = await axios.get(url)
        this.weatherData = response.data
        this.statusMessage = ''
      } catch (error) {
        this.weatherData = null
        this.statusMessage = `Error fetching weather data: ${error.message}`
        console.error('Error fetching weather data:', error)
      }
    }
  }
}
</script>
