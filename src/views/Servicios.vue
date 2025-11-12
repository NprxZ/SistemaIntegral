<template>
  <div class="servicios-container">
    <div class="container py-5">
      <!-- Header -->
      <div class="page-header mb-5">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="header-text">
            <h1 class="page-title">Servicios/Tools</h1>
            <p class="page-subtitle">
              <i class="fas fa-info-circle me-2"></i>
              Herramientas y servicios útiles para estudiantes
            </p>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Clima del Día -->
        <div class="col-lg-6">
          <div class="service-card weather-card">
            <div class="card-header-service">
              <i class="fas fa-cloud-sun me-2"></i>
              <span>Clima en Celaya</span>
              <button @click="fetchWeather" class="btn-refresh" :disabled="loadingWeather">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingWeather }"></i>
              </button>
            </div>
            <div class="card-body-service">
              <div v-if="loadingWeather" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando clima...</p>
              </div>
              <div v-else-if="weatherError" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ weatherError }}</p>
              </div>
              <div v-else-if="weather" class="weather-content">
                <div class="weather-main">
                  <div class="weather-icon">
                    <i :class="getWeatherIcon(weather.weather[0].main)"></i>
                  </div>
                  <div class="weather-temp">
                    <span class="temp-value">{{ Math.round(weather.main.temp) }}°</span>
                    <span class="temp-unit">C</span>
                  </div>
                </div>
                <div class="weather-description">
                  {{ weather.weather[0].description }}
                </div>
                <div class="weather-details">
                  <div class="weather-detail-item">
                    <i class="fas fa-tint"></i>
                    <span>Humedad: {{ weather.main.humidity }}%</span>
                  </div>
                  <div class="weather-detail-item">
                    <i class="fas fa-wind"></i>
                    <span>Viento: {{ weather.wind.speed }} km/h</span>
                  </div>
                  <div class="weather-detail-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>Sensación: {{ Math.round(weather.main.feels_like) }}°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tipo de Cambio -->
        <div class="col-lg-6">
          <div class="service-card exchange-card">
            <div class="card-header-service">
              <i class="fas fa-dollar-sign me-2"></i>
              <span>Tipo de Cambio</span>
              <button @click="fetchExchange" class="btn-refresh" :disabled="loadingExchange">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingExchange }"></i>
              </button>
            </div>
            <div class="card-body-service">
              <div v-if="loadingExchange" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando tipo de cambio...</p>
              </div>
              <div v-else-if="exchangeError" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ exchangeError }}</p>
              </div>
              <div v-else-if="exchange" class="exchange-content">
                <div class="exchange-main">
                  <div class="exchange-flag">🇺🇸</div>
                  <div class="exchange-rate">
                    <span class="rate-value">{{ exchange.rates.MXN.toFixed(2) }}</span>
                    <span class="rate-currency">MXN</span>
                  </div>
                  <div class="exchange-flag">🇲🇽</div>
                </div>
                <div class="exchange-description">
                  1 USD = {{ exchange.rates.MXN.toFixed(2) }} MXN
                </div>
                <div class="exchange-converter">
                  <div class="converter-input">
                    <label>USD</label>
                    <input 
                      type="number" 
                      v-model.number="usdAmount" 
                      @input="convertCurrency"
                      placeholder="0.00"
                      class="form-control-custom"
                    />
                  </div>
                  <div class="converter-arrow">
                    <i class="fas fa-exchange-alt"></i>
                  </div>
                  <div class="converter-input">
                    <label>MXN</label>
                    <input 
                      type="number" 
                      v-model.number="mxnAmount" 
                      readonly
                      class="form-control-custom"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Calculadora de Promedio -->
        <div class="col-lg-6">
          <div class="service-card calculator-card">
            <div class="card-header-service">
              <i class="fas fa-calculator me-2"></i>
              <span>Calculadora de Promedio</span>
            </div>
            <div class="card-body-service">
              <div class="calculator-content">
                <div class="grades-input">
                  <label class="calculator-label">Agrega tus calificaciones:</label>
                  <div class="grade-input-group">
                    <input 
                      type="number" 
                      v-model.number="newGrade"
                      @keyup.enter="addGrade"
                      placeholder="Calificación (0-100)"
                      min="0"
                      max="100"
                      class="form-control-custom"
                    />
                    <button @click="addGrade" class="btn-add-grade" :disabled="!newGrade">
                      <i class="fas fa-plus"></i>
                      Agregar
                    </button>
                  </div>
                </div>

                <div v-if="grades.length > 0" class="grades-list">
                  <div v-for="(grade, index) in grades" :key="index" class="grade-item">
                    <span class="grade-number">{{ grade }}</span>
                    <button @click="removeGrade(index)" class="btn-remove-grade">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div v-if="grades.length > 0" class="calculator-result">
                  <div class="result-icon">
                    <i class="fas fa-award"></i>
                  </div>
                  <div class="result-content">
                    <span class="result-label">Tu Promedio:</span>
                    <span class="result-value">{{ calculateAverage() }}</span>
                  </div>
                  <button @click="clearGrades" class="btn-clear">
                    <i class="fas fa-trash-alt"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Noticias de Tecnología -->
        <div class="col-lg-6">
          <div class="service-card news-card">
            <div class="card-header-service">
              <i class="fas fa-newspaper me-2"></i>
              <span>Noticias de Tecnología</span>
              <button @click="fetchNews" class="btn-refresh" :disabled="loadingNews">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingNews }"></i>
              </button>
            </div>
            <div class="card-body-service">
              <div v-if="loadingNews" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando noticias...</p>
              </div>
              <div v-else-if="newsError" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ newsError }}</p>
              </div>
              <div v-else-if="news && news.length > 0" class="news-content">
                <div v-for="(article, index) in news.slice(0, 5)" :key="index" class="news-item">
                  <div class="news-badge">
                    <i class="fas fa-bolt"></i>
                  </div>
                  <div class="news-text">
                    <h4 class="news-title">{{ article.title }}</h4>
                    <p class="news-description">{{ article.description || 'Sin descripción disponible' }}</p>
                    <a :href="article.url" target="_blank" class="news-link">
                      Leer más <i class="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Frases Motivacionales -->
        <div class="col-12">
          <div class="service-card quote-card">
            <div class="card-header-service">
              <i class="fas fa-quote-left me-2"></i>
              <span>Frase del Día</span>
              <button @click="fetchQuote" class="btn-refresh" :disabled="loadingQuote">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingQuote }"></i>
              </button>
            </div>
            <div class="card-body-service">
              <div v-if="loadingQuote" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando frase...</p>
              </div>
              <div v-else-if="quote" class="quote-content">
                <div class="quote-icon">
                  <i class="fas fa-quote-right"></i>
                </div>
                <blockquote class="quote-text">
                  "{{ quote.content }}"
                </blockquote>
                <div class="quote-author">
                  - {{ quote.author }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'Servicios',
  setup() {
    // Weather
    const weather = ref(null);
    const loadingWeather = ref(false);
    const weatherError = ref('');

    // Exchange
    const exchange = ref(null);
    const loadingExchange = ref(false);
    const exchangeError = ref('');
    const usdAmount = ref(1);
    const mxnAmount = ref(0);

    // Calculator
    const grades = ref([]);
    const newGrade = ref(null);

    // News
    const news = ref([]);
    const loadingNews = ref(false);
    const newsError = ref('');

    // Quote
    const quote = ref(null);
    const loadingQuote = ref(false);

    const fetchWeather = async () => {
      loadingWeather.value = true;
      weatherError.value = '';
      try {
        // Usar Open-Meteo API (gratuita, sin necesidad de API key)
        // Primero obtenemos las coordenadas de Celaya
        const lat = 20.5289;
        const lon = -100.8157;
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=America/Mexico_City`
        );
        
        if (!response.ok) throw new Error('Error al obtener el clima');
        const data = await response.json();
        
        // Adaptar la respuesta al formato que espera el template
        weather.value = {
          main: {
            temp: data.current.temperature_2m,
            feels_like: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m
          },
          wind: {
            speed: data.current.wind_speed_10m
          },
          weather: [{
            main: getWeatherCondition(data.current.weather_code),
            description: getWeatherDescription(data.current.weather_code)
          }]
        };
      } catch (err) {
        weatherError.value = 'No se pudo cargar el clima. Intenta más tarde.';
        console.error('Error clima:', err);
      } finally {
        loadingWeather.value = false;
      }
    };

    // Función auxiliar para convertir códigos WMO a condiciones
    const getWeatherCondition = (code) => {
      if (code === 0) return 'Clear';
      if (code <= 3) return 'Clouds';
      if (code <= 67) return 'Rain';
      if (code <= 77) return 'Snow';
      if (code <= 82) return 'Rain';
      if (code <= 86) return 'Snow';
      if (code <= 99) return 'Thunderstorm';
      return 'Clouds';
    };

    // Función auxiliar para obtener descripciones en español
    const getWeatherDescription = (code) => {
      const descriptions = {
        0: 'Despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna densa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia intensa',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve intensa',
        80: 'Chubascos ligeros',
        81: 'Chubascos moderados',
        82: 'Chubascos violentos',
        95: 'Tormenta eléctrica',
        96: 'Tormenta con granizo ligero',
        99: 'Tormenta con granizo fuerte'
      };
      return descriptions[code] || 'Condiciones variables';
    };

    const fetchExchange = async () => {
      loadingExchange.value = true;
      exchangeError.value = '';
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Error al obtener tipo de cambio');
        exchange.value = await response.json();
        convertCurrency();
      } catch (err) {
        exchangeError.value = 'No se pudo cargar el tipo de cambio.';
        console.error(err);
      } finally {
        loadingExchange.value = false;
      }
    };

    const fetchNews = async () => {
      loadingNews.value = true;
      newsError.value = '';
      try {
        // Usando una API pública alternativa sin requerir API key
        const response = await fetch(
          'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'
        );
        if (!response.ok) throw new Error('Error al obtener noticias');
        const storyIds = await response.json();
        
        // Obtener los primeros 5 artículos
        const articles = await Promise.all(
          storyIds.slice(0, 5).map(async (id) => {
            const itemResponse = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`
            );
            return itemResponse.json();
          })
        );
        
        news.value = articles.map(article => ({
          title: article.title,
          url: article.url || `https://news.ycombinator.com/item?id=${article.id}`,
          description: `Por ${article.by} - ${article.score} puntos`
        }));
      } catch (err) {
        newsError.value = 'No se pudieron cargar las noticias.';
        console.error(err);
      } finally {
        loadingNews.value = false;
      }
    };

    const fetchQuote = async () => {
      loadingQuote.value = true;
      try {
        const response = await fetch('https://api.quotable.io/random?tags=technology,success');
        if (!response.ok) throw new Error('Error al obtener frase');
        quote.value = await response.json();
      } catch (err) {
        quote.value = {
          content: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
          author: 'Robert Collier'
        };
      } finally {
        loadingQuote.value = false;
      }
    };

    const getWeatherIcon = (condition) => {
      const icons = {
        Clear: 'fas fa-sun',
        Clouds: 'fas fa-cloud',
        Rain: 'fas fa-cloud-rain',
        Drizzle: 'fas fa-cloud-rain',
        Thunderstorm: 'fas fa-bolt',
        Snow: 'fas fa-snowflake',
        Mist: 'fas fa-smog',
        Fog: 'fas fa-smog'
      };
      return icons[condition] || 'fas fa-cloud-sun';
    };

    const convertCurrency = () => {
      if (exchange.value && usdAmount.value) {
        mxnAmount.value = (usdAmount.value * exchange.value.rates.MXN).toFixed(2);
      }
    };

    const addGrade = () => {
      if (newGrade.value && newGrade.value >= 0 && newGrade.value <= 100) {
        grades.value.push(newGrade.value);
        newGrade.value = null;
      }
    };

    const removeGrade = (index) => {
      grades.value.splice(index, 1);
    };

    const clearGrades = () => {
      grades.value = [];
    };

    const calculateAverage = () => {
      if (grades.value.length === 0) return '0.00';
      const sum = grades.value.reduce((acc, grade) => acc + grade, 0);
      return (sum / grades.value.length).toFixed(2);
    };

    onMounted(() => {
      fetchWeather();
      fetchExchange();
      fetchNews();
      fetchQuote();
    });

    return {
      weather,
      loadingWeather,
      weatherError,
      fetchWeather,
      getWeatherIcon,
      getWeatherCondition,
      getWeatherDescription,
      exchange,
      loadingExchange,
      exchangeError,
      fetchExchange,
      usdAmount,
      mxnAmount,
      convertCurrency,
      grades,
      newGrade,
      addGrade,
      removeGrade,
      clearGrades,
      calculateAverage,
      news,
      loadingNews,
      newsError,
      fetchNews,
      quote,
      loadingQuote,
      fetchQuote
    };
  }
};
</script>

<style scoped>
.servicios-container {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 2rem;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(10, 95, 56, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.header-icon i {
  font-size: 2.5rem;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
}

/* Service Cards */
.service-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.card-header-service {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  padding: 1.5rem;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-body-service {
  padding: 2rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #6c757d;
}

.loading-state i,
.error-state i {
  font-size: 3rem;
}

.error-state {
  color: #dc3545;
}

/* Weather Card */
.weather-content {
  text-align: center;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.weather-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-icon i {
  font-size: 3rem;
  color: white;
}

.weather-temp {
  display: flex;
  align-items: flex-start;
}

.temp-value {
  font-size: 4rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.temp-unit {
  font-size: 2rem;
  color: #6c757d;
  margin-left: 0.5rem;
}

.weather-description {
  font-size: 1.3rem;
  color: #495057;
  text-transform: capitalize;
  margin-bottom: 2rem;
  font-weight: 500;
}

.weather-details {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}

.weather-detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
}

.weather-detail-item i {
  color: #0a5f38;
  font-size: 1.2rem;
}

/* Exchange Card */
.exchange-content {
  text-align: center;
}

.exchange-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.exchange-flag {
  font-size: 4rem;
}

.exchange-rate {
  display: flex;
  align-items: flex-start;
}

.rate-value {
  font-size: 3.5rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.rate-currency {
  font-size: 1.5rem;
  color: #6c757d;
  margin-left: 0.5rem;
}

.exchange-description {
  font-size: 1.2rem;
  color: #495057;
  margin-bottom: 2rem;
  font-weight: 500;
}

.exchange-converter {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.converter-input {
  flex: 1;
}

.converter-input label {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.converter-arrow {
  width: 40px;
  height: 40px;
  background: #0a5f38;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
}

.converter-arrow i {
  color: white;
  font-size: 1.2rem;
}

/* Calculator Card */
.calculator-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calculator-label {
  display: block;
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
  margin-bottom: 1rem;
}

.grade-input-group {
  display: flex;
  gap: 1rem;
}

.btn-add-grade {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add-grade:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(10, 95, 56, 0.3);
}

.btn-add-grade:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.grades-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.grade-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  border: 2px solid #0a5f38;
}

.grade-number {
  font-weight: 600;
  color: #212529;
}

.btn-remove-grade {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove-grade:hover {
  background: #c82333;
}

.calculator-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 1rem;
  border-left: 4px solid #0a5f38;
}

.result-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon i {
  font-size: 2rem;
  color: white;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.result-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
}

.btn-clear {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #c82333;
}

/* News Card */
.news-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.news-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 1rem;
  border-left: 4px solid #0a5f38;
  transition: all 0.3s ease;
}

.news-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.news-badge {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.news-badge i {
  color: white;
  font-size: 1.5rem;
}

.news-text {
  flex: 1;
}

.news-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.news-description {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.news-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0a5f38;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.news-link:hover {
  color: #0d7d4d;
  gap: 0.75rem;
}

/* Quote Card */
.quote-content {
  text-align: center;
  padding: 2rem;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: 0;
  right: 2rem;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.1;
}

.quote-icon i {
  font-size: 3rem;
  color: white;
}

.quote-text {
  font-size: 1.8rem;
  font-weight: 500;
  color: #212529;
  font-style: italic;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.quote-author {
  font-size: 1.2rem;
  color: #0a5f38;
  font-weight: 600;
}

/* Form Control Custom */
.form-control-custom {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  color: #212529;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control-custom:focus {
  outline: none;
  background: white;
  border-color: #0a5f38;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
}

.form-control-custom::placeholder {
  color: #adb5bd;
}

/* Scrollbar personalizado para news */
.news-content::-webkit-scrollbar {
  width: 8px;
}

.news-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.news-content::-webkit-scrollbar-thumb {
  background: #0a5f38;
  border-radius: 10px;
}

.news-content::-webkit-scrollbar-thumb:hover {
  background: #0d7d4d;
}

/* Responsive */
@media (max-width: 992px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 2rem;
  }

  .exchange-converter {
    flex-direction: column;
  }

  .converter-arrow {
    transform: rotate(90deg);
    margin: 0;
  }
}

@media (max-width: 768px) {
  .servicios-container {
    padding-top: 1rem;
  }

  .page-header {
    padding: 2rem 1.5rem;
  }

  .header-icon {
    width: 70px;
    height: 70px;
  }

  .header-icon i {
    font-size: 2rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .card-body-service {
    padding: 1.5rem;
    min-height: 250px;
  }

  .weather-main {
    flex-direction: column;
    gap: 1rem;
  }

  .weather-icon {
    width: 80px;
    height: 80px;
  }

  .weather-icon i {
    font-size: 2.5rem;
  }

  .temp-value {
    font-size: 3rem;
  }

  .exchange-main {
    flex-direction: column;
    gap: 1rem;
  }

  .exchange-flag {
    font-size: 3rem;
  }

  .rate-value {
    font-size: 2.5rem;
  }

  .grade-input-group {
    flex-direction: column;
  }

  .calculator-result {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .quote-text {
    font-size: 1.3rem;
  }

  .quote-author {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.5rem;
  }

  .card-header-service {
    font-size: 1rem;
    padding: 1.25rem;
  }

  .weather-details {
    flex-direction: column;
  }

  .news-item {
    flex-direction: column;
  }

  .quote-icon {
    right: 1rem;
    width: 60px;
    height: 60px;
  }

  .quote-icon i {
    font-size: 2rem;
  }
}
</style>