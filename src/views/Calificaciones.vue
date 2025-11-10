<template>
  <div class="calificaciones-container">
    <div class="container py-5">
      <div class="header-section mb-5">
        <h1 class="page-title">
          <i class="fas fa-graduation-cap me-3"></i>
          Mis Calificaciones
        </h1>
        <p class="page-subtitle">Consulta tus calificaciones por periodo</p>
      </div>

      <!-- Buscador y Filtros -->
      <div class="search-section mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                placeholder="Buscar por nombre de materia..."
              />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="filterPeriodo" class="form-select">
              <option value="">Todos los periodos</option>
              <option v-for="periodo in periodos" :key="periodo" :value="periodo">
                {{ periodo }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <button @click="clearFilters" class="btn btn-clear w-100">
              <i class="fas fa-times me-2"></i>Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <div v-else>
        <!-- Resumen -->
        <div class="summary-card mb-4">
          <div class="row text-center">
            <div class="col-md-3">
              <div class="summary-item">
                <i class="fas fa-book"></i>
                <h3>{{ filteredCalificaciones.length }}</h3>
                <p>Materias</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="summary-item">
                <i class="fas fa-chart-line"></i>
                <h3>{{ calculateAverage() }}</h3>
                <p>Promedio General</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="summary-item">
                <i class="fas fa-check-circle"></i>
                <h3>{{ countApproved() }}</h3>
                <p>Aprobadas</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="summary-item">
                <i class="fas fa-times-circle"></i>
                <h3>{{ countFailed() }}</h3>
                <p>Reprobadas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Calificaciones -->
        <div class="calificaciones-table">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Periodo</th>
                  <th class="text-center">Parcial 1</th>
                  <th class="text-center">Parcial 2</th>
                  <th class="text-center">Parcial 3</th>
                  <th class="text-center">Parcial 4</th>
                  <th class="text-center">Promedio</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cal, index) in filteredCalificaciones" :key="index">
                  <td>
                    <div class="materia-info">
                      <i class="fas fa-book-open me-2"></i>
                      <div>
                        <div class="materia-nombre">{{ cal.materia }}</div>
                        <div class="materia-detalles">
                          <span class="clave-materia">{{ cal.clave }}</span>
                          <span class="grupo-badge">Grupo {{ cal.grupo }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge-periodo">{{ cal.periodo }}</span>
                  </td>
                  <td class="text-center" v-for="i in 4" :key="i">
                    <span v-if="cal.parciales[i-1]" 
                          class="calificacion-mini" 
                          :class="getCalificacionClass(cal.parciales[i-1])">
                      {{ cal.parciales[i-1] }}
                    </span>
                    <span v-else class="calificacion-mini pending">
                      -
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="calificacion-badge" :class="getCalificacionClass(cal.promedio)">
                      {{ cal.promedio > 0 ? cal.promedio : 'N/A' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span v-if="cal.promedio > 0" class="status-badge" :class="cal.promedio >= 70 ? 'approved' : 'failed'">
                      <i :class="cal.promedio >= 70 ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ cal.promedio >= 70 ? 'Aprobada' : 'Reprobada' }}
                    </span>
                    <span v-else class="status-badge pending">
                      <i class="fas fa-clock"></i>
                      Pendiente
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredCalificaciones.length === 0" class="text-center py-5">
            <i class="fas fa-search fa-3x mb-3" style="color: rgba(255,255,255,0.3)"></i>
            <p class="text-muted">No se encontraron resultados</p>
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

        // Extraer los datos del API
        let data = response.data?.data || response.data;

        console.log('✅ Datos extraídos:', data);

        // Transformar la estructura anidada a un formato plano
        const calificacionesPlanas = [];
        
        if (Array.isArray(data)) {
          data.forEach(periodoObj => {
            const periodo = periodoObj.periodo;
            const periodoTexto = `${periodo.descripcion_periodo} (${periodo.clave_periodo})`;
            
            if (Array.isArray(periodoObj.materias)) {
              periodoObj.materias.forEach(materiaObj => {
                const materia = materiaObj.materia;
                const calificacionesArray = materiaObj.calificaiones || [];
                
                // Extraer las 4 calificaciones parciales
                const parciales = [null, null, null, null];
                calificacionesArray.forEach(cal => {
                  const numParcial = cal.numero_calificacion - 1; // 0-indexed
                  if (numParcial >= 0 && numParcial < 4 && cal.calificacion) {
                    parciales[numParcial] = parseFloat(cal.calificacion);
                  }
                });
                
                // Calcular promedio de las calificaciones que existen
                const calificacionesValidas = parciales.filter(c => c !== null && !isNaN(c));
                const promedio = calificacionesValidas.length > 0
                  ? Math.round(calificacionesValidas.reduce((a, b) => a + b, 0) / calificacionesValidas.length)
                  : 0;
                
                // Agregar registro con formato esperado
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
      if (!cal || cal === 0) return 'pending';
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
  padding-top: 2rem;
}

.header-section {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
}

.search-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
}

.search-box .form-control {
  padding-left: 3rem;
}

.form-control, .form-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: #fff;
  padding: 0.75rem 1rem;
}

.form-control:focus, .form-select:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: #611232;
  box-shadow: 0 0 0 3px rgba(97, 18, 50, 0.2);
  color: #fff;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-select option {
  background: #1a1a2e;
  color: #fff;
}

.btn-clear {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: rgba(220, 53, 69, 0.3);
  transform: translateY(-2px);
}

.summary-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item {
  padding: 1rem;
}

.summary-item i {
  font-size: 2.5rem;
  color: #611232;
  margin-bottom: 1rem;
}

.summary-item h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.summary-item p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.calificaciones-table {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.table {
  margin: 0;
  color: #fff;
  white-space: nowrap;
}

.table thead {
  background: linear-gradient(135deg, #611232, #8B1538);
}

.table thead th {
  border: none;
  padding: 1rem 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border: none;
}

.materia-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.materia-nombre {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.materia-detalles {
  display: flex;
  gap: 0.5rem;
  font-size: 0.7rem;
}

.clave-materia {
  color: rgba(255, 255, 255, 0.6);
}

.grupo-badge {
  background: rgba(97, 18, 50, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  color: rgba(255, 255, 255, 0.8);
}

.badge-periodo {
  background: rgba(97, 18, 50, 0.3);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  white-space: normal;
  max-width: 150px;
  text-align: center;
}

.calificacion-mini {
  display: inline-block;
  width: 45px;
  height: 45px;
  line-height: 45px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
}

.calificacion-mini.excellent {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
}

.calificacion-mini.good {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: #fff;
}

.calificacion-mini.regular {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #fff;
}

.calificacion-mini.failed {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: #fff;
}

.calificacion-mini.pending {
  background: rgba(108, 117, 125, 0.2);
  color: rgba(255, 255, 255, 0.3);
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.calificacion-badge {
  display: inline-block;
  width: 55px;
  height: 55px;
  line-height: 55px;
  border-radius: 50%;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.calificacion-badge.excellent {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
}

.calificacion-badge.good {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: #fff;
}

.calificacion-badge.regular {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #fff;
}

.calificacion-badge.failed {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: #fff;
}

.calificacion-badge.pending {
  background: rgba(108, 117, 125, 0.2);
  color: rgba(255, 255, 255, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.approved {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-badge.failed {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.status-badge.pending {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }

  .summary-item h3 {
    font-size: 1.5rem;
  }

  .table {
    font-size: 0.75rem;
  }

  .calificacion-mini {
    width: 40px;
    height: 40px;
    line-height: 40px;
    font-size: 0.9rem;
  }

  .calificacion-badge {
    width: 45px;
    height: 45px;
    line-height: 45px;
    font-size: 1rem;
  }
}
</style>