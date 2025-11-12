<template>
  <div class="calificaciones-container">
    <div class="container py-5">
      <!-- Header Moderno -->
      <div class="header-section mb-5">
        <div class="header-wrapper">
          <div class="header-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="header-content">
            <h1 class="page-title">Mis Calificaciones</h1>
            <p class="page-subtitle">
              <i class="fas fa-chart-line me-2"></i>
              Consulta tu desempeño académico por periodo
            </p>
          </div>
        </div>
      </div>

      <!-- Buscador y Filtros Mejorados -->
      <div class="filters-section mb-4">
        <div class="row g-3">
          <div class="col-lg-5">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                v-model="searchQuery"
                class="search-input"
                placeholder="Buscar por nombre de materia..."
              />
              <span v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </span>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="filter-select-wrapper">
              <i class="fas fa-calendar-alt filter-icon"></i>
              <select v-model="filterPeriodo" class="filter-select">
                <option value="">Todos los periodos</option>
                <option v-for="periodo in periodos" :key="periodo" :value="periodo">
                  {{ periodo }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-lg-3">
            <button @click="clearFilters" class="btn-clear-filters">
              <i class="fas fa-redo me-2"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner-wrapper">
          <div class="spinner-custom"></div>
        </div>
        <p class="loading-text">Cargando calificaciones...</p>
      </div>

      <div v-else-if="error" class="error-alert">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <div v-else>
        <!-- Resumen Estadístico Moderno -->
        <div class="stats-grid mb-4">
          <div class="stat-card-modern total">
            <div class="stat-icon-bg">
              <i class="fas fa-books"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ filteredCalificaciones.length }}</div>
              <div class="stat-label">Materias Totales</div>
              <div class="stat-bar">
                <div class="stat-bar-fill" style="width: 100%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card-modern average">
            <div class="stat-icon-bg">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ calculateAverage() }}</div>
              <div class="stat-label">Promedio General</div>
              <div class="stat-bar">
                <div class="stat-bar-fill" :style="{width: calculateAverage() + '%'}"></div>
              </div>
            </div>
          </div>

          <div class="stat-card-modern approved">
            <div class="stat-icon-bg">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ countApproved() }}</div>
              <div class="stat-label">Materias Aprobadas</div>
              <div class="stat-bar">
                <div class="stat-bar-fill" style="width: 100%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card-modern failed">
            <div class="stat-icon-bg">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ countFailed() }}</div>
              <div class="stat-label">Materias Reprobadas</div>
              <div class="stat-bar">
                <div class="stat-bar-fill" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Calificaciones Moderna -->
        <div class="grades-table-container">
          <div class="table-header-custom">
            <h3>
              <i class="fas fa-table me-2"></i>
              Detalle de Calificaciones
            </h3>
            <div class="results-count">
              <i class="fas fa-list me-2"></i>
              {{ filteredCalificaciones.length }} resultados
            </div>
          </div>
          
          <div class="table-responsive-custom">
            <table class="grades-table">
              <thead>
                <tr>
                  <th class="col-materia">
                    <i class="fas fa-book me-2"></i>Materia
                  </th>
                  <th class="col-periodo">
                    <i class="fas fa-calendar me-2"></i>Periodo
                  </th>
                  <th class="col-parcial">P1</th>
                  <th class="col-parcial">P2</th>
                  <th class="col-parcial">P3</th>
                  <th class="col-parcial">P4</th>
                  <th class="col-promedio">
                    <i class="fas fa-calculator me-2"></i>Promedio
                  </th>
                  <th class="col-estado">
                    <i class="fas fa-check-double me-2"></i>Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cal, index) in filteredCalificaciones" :key="index" class="grade-row">
                  <td class="materia-cell">
                    <div class="materia-wrapper">
                      <div class="materia-icon">
                        <i class="fas fa-book-reader"></i>
                      </div>
                      <div class="materia-details">
                        <div class="materia-name">{{ cal.materia }}</div>
                        <div class="materia-meta">
                          <span class="meta-item">
                            <i class="fas fa-hashtag"></i>{{ cal.clave }}
                          </span>
                          <span class="meta-item grupo">
                            <i class="fas fa-users"></i>Grupo {{ cal.grupo }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="periodo-cell">
                    <span class="periodo-badge">
                      <i class="fas fa-calendar-day me-1"></i>
                      {{ cal.periodo }}
                    </span>
                  </td>
                  <td class="parcial-cell" v-for="i in 4" :key="i">
                    <div v-if="cal.parciales[i-1]" 
                         class="grade-chip" 
                         :class="getCalificacionClass(cal.parciales[i-1])">
                      <span class="grade-value">{{ cal.parciales[i-1] }}</span>
                    </div>
                    <div v-else class="grade-chip empty">
                      <i class="fas fa-minus"></i>
                    </div>
                  </td>
                  <td class="promedio-cell">
                    <div class="promedio-wrapper">
                      <div v-if="cal.promedio > 0" 
                           class="promedio-circle" 
                           :class="getCalificacionClass(cal.promedio)">
                        {{ cal.promedio }}
                      </div>
                      <div v-else class="promedio-circle empty">
                        N/A
                      </div>
                    </div>
                  </td>
                  <td class="estado-cell">
                    <div class="estado-wrapper">
                      <span v-if="cal.promedio > 0" 
                            class="estado-badge" 
                            :class="cal.promedio >= 70 ? 'approved' : 'failed'">
                        <i :class="cal.promedio >= 70 ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                        <span class="estado-text">{{ cal.promedio >= 70 ? 'Aprobada' : 'Reprobada' }}</span>
                      </span>
                      <span v-else class="estado-badge pending">
                        <i class="fas fa-clock"></i>
                        <span class="estado-text">Pendiente</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredCalificaciones.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentAPI } from '@/services/api';

export default {
  name: 'Calificaciones',
  setup() {
    const router = useRouter();
    const calificaciones = ref([]);
    const loading = ref(true);
    const error = ref('');
    const searchQuery = ref('');
    const filterPeriodo = ref('');

    const fetchCalificaciones = async () => {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        console.log('📚 Obteniendo calificaciones...');
        const response = await studentAPI.getCalificaciones();
        
        console.log('📦 Respuesta calificaciones:', response);
        console.log('📄 Datos:', response.data);

        let data = response.data?.data || response.data;

        console.log('✅ Datos extraídos:', data);

        const calificacionesPlanas = [];
        
        if (Array.isArray(data)) {
          data.forEach(periodoObj => {
            const periodo = periodoObj.periodo;
            const periodoTexto = `${periodo.descripcion_periodo} (${periodo.clave_periodo})`;
            
            if (Array.isArray(periodoObj.materias)) {
              periodoObj.materias.forEach(materiaObj => {
                const materia = materiaObj.materia;
                const calificacionesArray = materiaObj.calificaiones || [];
                
                const parciales = [null, null, null, null];
                calificacionesArray.forEach(cal => {
                  const numParcial = cal.numero_calificacion - 1;
                  if (numParcial >= 0 && numParcial < 4 && cal.calificacion) {
                    parciales[numParcial] = parseFloat(cal.calificacion);
                  }
                });
                
                const calificacionesValidas = parciales.filter(c => c !== null && !isNaN(c));
                const promedio = calificacionesValidas.length > 0
                  ? Math.round(calificacionesValidas.reduce((a, b) => a + b, 0) / calificacionesValidas.length)
                  : 0;
                
                calificacionesPlanas.push({
                  materia: materia.nombre_materia,
                  clave: materia.clave_materia,
                  grupo: materia.letra_grupo,
                  periodo: periodoTexto,
                  parciales: parciales,
                  promedio: promedio,
                  calificacionesCompletas: calificacionesArray
                });
              });
            }
          });
        }

        calificaciones.value = calificacionesPlanas;
        console.log(`✅ Total de materias procesadas: ${calificaciones.value.length}`);
        console.log('📊 Calificaciones transformadas:', calificaciones.value);
      } catch (err) {
        console.error('❌ Error al obtener calificaciones:', err);
        console.error('❌ Response:', err.response);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('student_data');
          router.push('/login');
        } else {
          error.value = 'Error al cargar las calificaciones';
        }
      } finally {
        loading.value = false;
      }
    };

    const periodos = computed(() => {
      const uniquePeriodos = [...new Set(calificaciones.value.map(c => c.periodo))];
      return uniquePeriodos.sort().reverse();
    });

    const filteredCalificaciones = computed(() => {
      return calificaciones.value.filter(cal => {
        const matchesSearch = !searchQuery.value || 
          (cal.materia || '').toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesPeriodo = !filterPeriodo.value || cal.periodo === filterPeriodo.value;
        return matchesSearch && matchesPeriodo;
      });
    });

    const calculateAverage = () => {
      const calificacionesValidas = filteredCalificaciones.value.filter(cal => cal.promedio > 0);
      if (calificacionesValidas.length === 0) return '0.00';
      const sum = calificacionesValidas.reduce((acc, cal) => acc + cal.promedio, 0);
      return (sum / calificacionesValidas.length).toFixed(2);
    };

    const countApproved = () => {
      return filteredCalificaciones.value.filter(cal => cal.promedio >= 70).length;
    };

    const countFailed = () => {
      return filteredCalificaciones.value.filter(cal => cal.promedio > 0 && cal.promedio < 70).length;
    };

    const getCalificacionClass = (cal) => {
      if (!cal || cal === 0) return 'empty';
      if (cal >= 90) return 'excellent';
      if (cal >= 80) return 'good';
      if (cal >= 70) return 'regular';
      return 'failed';
    };

    const clearFilters = () => {
      searchQuery.value = '';
      filterPeriodo.value = '';
    };

    onMounted(fetchCalificaciones);

    return {
      calificaciones,
      loading,
      error,
      searchQuery,
      filterPeriodo,
      periodos,
      filteredCalificaciones,
      calculateAverage,
      countApproved,
      countFailed,
      getCalificacionClass,
      clearFilters
    };
  }
};
</script>

<style scoped>
.calificaciones-container {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 2rem;
}

/* Header Moderno */
.header-section {
  margin-bottom: 2.5rem;
}

.header-wrapper {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 1.5rem;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 10px 40px rgba(10, 95, 56, 0.3);
  position: relative;
  overflow: hidden;
}

.header-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.header-icon i {
  font-size: 2.5rem;
  color: white;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  color: #0a5f38;
  font-size: 1.1rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3.5rem;
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.search-input:focus {
  outline: none;
  border-color: #0a5f38;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
  background: white;
}

.clear-search {
  position: absolute;
  right: 1rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.clear-search:hover {
  background: #dc3545;
  color: white;
}

.filter-select-wrapper {
  position: relative;
}

.filter-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #0a5f38;
  font-size: 1.1rem;
  z-index: 1;
}

.filter-select {
  width: 100%;
  padding: 0.875rem 1.25rem 0.875rem 3.5rem;
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230a5f38' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
}

.filter-select:focus {
  outline: none;
  border-color: #0a5f38;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
  background-color: white;
}

.btn-clear-filters {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-clear-filters:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 5rem 0;
}

.spinner-wrapper {
  margin-bottom: 1.5rem;
}

.spinner-custom {
  width: 60px;
  height: 60px;
  border: 5px solid #e9ecef;
  border-top-color: #0a5f38;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #6c757d;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Error Alert */
.error-alert {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 5px 25px rgba(220, 53, 69, 0.3);
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card-modern {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border-left: 5px solid;
  position: relative;
  overflow: hidden;
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.stat-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.stat-card-modern.total {
  border-left-color: #17a2b8;
}

.stat-card-modern.average {
  border-left-color: #0a5f38;
}

.stat-card-modern.approved {
  border-left-color: #28a745;
}

.stat-card-modern.failed {
  border-left-color: #dc3545;
}

.stat-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-modern.total .stat-icon-bg {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-card-modern.average .stat-icon-bg {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
}

.stat-card-modern.approved .stat-icon-bg {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card-modern.failed .stat-icon-bg {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.stat-icon-bg i {
  font-size: 2rem;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.stat-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease;
}

.stat-card-modern.total .stat-bar-fill {
  background: linear-gradient(90deg, #17a2b8 0%, #138496 100%);
}

.stat-card-modern.average .stat-bar-fill {
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 100%);
}

.stat-card-modern.approved .stat-bar-fill {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
}

.stat-card-modern.failed .stat-bar-fill {
  background: linear-gradient(90deg, #dc3545 0%, #c82333 100%);
}

/* Grades Table Container */
.grades-table-container {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.table-header-custom {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.table-header-custom h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.results-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.table-responsive-custom {
  overflow-x: auto;
}

.grades-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.grades-table thead {
  background: #f8f9fa;
}

.grades-table thead th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.grades-table thead th.col-parcial,
.grades-table thead th.col-promedio,
.grades-table thead th.col-estado {
  text-align: center;
}

.grade-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #e9ecef;
}

.grade-row:hover {
  background: #f8f9fa;
  transform: scale(1.01);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.grades-table tbody td {
  padding: 1.5rem 1rem;
  vertical-align: middle;
}

/* Materia Cell */
.materia-cell {
  min-width: 300px;
}

.materia-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.materia-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.materia-icon i {
  color: white;
  font-size: 1.3rem;
}

.materia-details {
  flex: 1;
}

.materia-name {
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  line-height: 1.3;
}

.materia-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
}

.meta-item i {
  font-size: 0.7rem;
}

.meta-item.grupo {
  background: linear-gradient(135deg, rgba(10, 95, 56, 0.1) 0%, rgba(13, 125, 77, 0.1) 100%);
  color: #0a5f38;
  font-weight: 600;
}

/* Periodo Cell */
.periodo-cell {
  min-width: 180px;
}

.periodo-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  border: 2px solid #e9ecef;
  white-space: nowrap;
}

/* Parcial Cell */
.parcial-cell {
  text-align: center;
  padding: 1rem 0.5rem !important;
}

.grade-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.grade-chip:hover {
  transform: scale(1.1);
}

.grade-chip.excellent {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.grade-chip.good {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.grade-chip.regular {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.grade-chip.failed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.grade-chip.empty {
  background: #f8f9fa;
  color: #adb5bd;
  border: 2px dashed #dee2e6;
  box-shadow: none;
}

.grade-value {
  font-size: 1.1rem;
}

/* Promedio Cell */
.promedio-cell {
  text-align: center;
}

.promedio-wrapper {
  display: flex;
  justify-content: center;
}

.promedio-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 4px solid;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.promedio-circle:hover {
  transform: scale(1.1) rotate(5deg);
}

.promedio-circle.excellent {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-color: rgba(40, 167, 69, 0.3);
  color: white;
}

.promedio-circle.good {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  border-color: rgba(23, 162, 184, 0.3);
  color: white;
}

.promedio-circle.regular {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  border-color: rgba(255, 193, 7, 0.3);
  color: white;
}

.promedio-circle.failed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border-color: rgba(220, 53, 69, 0.3);
  color: white;
}

.promedio-circle.empty {
  background: #f8f9fa;
  border-color: #dee2e6;
  border-style: dashed;
  color: #adb5bd;
  box-shadow: none;
  font-size: 1rem;
}

/* Estado Cell */
.estado-cell {
  text-align: center;
  min-width: 150px;
}

.estado-wrapper {
  display: flex;
  justify-content: center;
}

.estado-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid;
}

.estado-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.estado-badge.approved {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%);
  border-color: #28a745;
  color: #28a745;
}

.estado-badge.failed {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%);
  border-color: #dc3545;
  color: #dc3545;
}

.estado-badge.pending {
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.1) 0%, rgba(173, 181, 189, 0.1) 100%);
  border-color: #6c757d;
  color: #6c757d;
}

.estado-badge i {
  font-size: 1.1rem;
}

.estado-text {
  white-space: nowrap;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon i {
  font-size: 3rem;
  color: #adb5bd;
}

.empty-state h3 {
  color: #495057;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-wrapper {
    flex-direction: column;
    text-align: center;
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
  
  .filters-section {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card-modern {
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .table-header-custom {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem 1rem;
  }
  
  .table-header-custom h3 {
    font-size: 1.1rem;
  }
  
  .results-count {
    font-size: 0.85rem;
  }
  
  .materia-cell {
    min-width: 250px;
  }
  
  .materia-icon {
    width: 45px;
    height: 45px;
  }
  
  .materia-icon i {
    font-size: 1.1rem;
  }
  
  .materia-name {
    font-size: 0.9rem;
  }
  
  .grade-chip {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }
  
  .promedio-circle {
    width: 60px;
    height: 60px;
    font-size: 1.3rem;
    border-width: 3px;
  }
  
  .estado-badge {
    padding: 0.625rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .calificaciones-container {
    padding-top: 1rem;
  }
  
  .header-wrapper {
    padding: 1.5rem 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .search-input,
  .filter-select,
  .btn-clear-filters {
    font-size: 0.9rem;
    padding: 0.75rem 1rem 0.75rem 3rem;
  }
  
  .stat-icon-bg {
    width: 60px;
    height: 60px;
  }
  
  .stat-icon-bg i {
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
  
  .grades-table thead th {
    padding: 1rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .grades-table tbody td {
    padding: 1rem 0.75rem;
  }
  
  .materia-wrapper {
    gap: 0.75rem;
  }
  
  .materia-icon {
    width: 40px;
    height: 40px;
  }
  
  .materia-icon i {
    font-size: 1rem;
  }
  
  .materia-name {
    font-size: 0.85rem;
  }
  
  .meta-item {
    font-size: 0.7rem;
  }
  
  .periodo-badge {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .grade-chip {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .promedio-circle {
    width: 55px;
    height: 55px;
    font-size: 1.2rem;
  }
  
  .estado-badge {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }
  
  .empty-icon {
    width: 80px;
    height: 80px;
  }
  
  .empty-icon i {
    font-size: 2.5rem;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
  }
  
  .empty-state p {
    font-size: 0.9rem;
  }
}

/* Scroll personalizado para la tabla */
.table-responsive-custom::-webkit-scrollbar {
  height: 8px;
}

.table-responsive-custom::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.table-responsive-custom::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 10px;
}

.table-responsive-custom::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #0d7d4d 0%, #0a5f38 100%);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grade-row {
  animation: fadeInUp 0.3s ease-out;
}

.grade-row:nth-child(1) { animation-delay: 0.05s; }
.grade-row:nth-child(2) { animation-delay: 0.1s; }
.grade-row:nth-child(3) { animation-delay: 0.15s; }
.grade-row:nth-child(4) { animation-delay: 0.2s; }
.grade-row:nth-child(5) { animation-delay: 0.25s; }

</style>

