<template>
  <div class="kardex-container">
    <div class="container py-5">
      <!-- Header Moderno -->
      <div class="welcome-section mb-5">
        <div class="welcome-header">
          <div class="welcome-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="welcome-text">
            <h1 class="welcome-title">Mi Kardex Académico</h1>
            <p class="welcome-subtitle">
              <i class="fas fa-history me-2"></i>
              Historial Completo de Calificaciones
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success spinner-custom" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando kardex...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger alert-custom">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <div v-else>
        <!-- Resumen General -->
        <div class="row g-4 mb-4">
          <div class="col-lg-3 col-md-6">
            <div class="stat-card-modern primary">
              <div class="stat-icon-modern">
                <i class="fas fa-trophy"></i>
              </div>
              <div class="stat-content-modern">
                <h3>{{ calculateGlobalAverage() }}</h3>
                <p>Promedio General</p>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: (calculateGlobalAverage() * 10) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="stat-card-modern success">
              <div class="stat-icon-modern">
                <i class="fas fa-book-reader"></i>
              </div>
              <div class="stat-content-modern">
                <h3>{{ totalCredits }}</h3>
                <p>Créditos Acumulados</p>
                <div class="stat-bar">
                  <div class="stat-fill" style="width: 75%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="stat-card-modern info">
              <div class="stat-icon-modern">
                <i class="fas fa-check-double"></i>
              </div>
              <div class="stat-content-modern">
                <h3>{{ approvedSubjects }}</h3>
                <p>Materias Aprobadas</p>
                <div class="stat-bar">
                  <div class="stat-fill" style="width: 85%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="stat-card-modern warning">
              <div class="stat-icon-modern">
                <i class="fas fa-chart-pie"></i>
              </div>
              <div class="stat-content-modern">
                <h3>{{ porcentajeAvance }}%</h3>
                <p>Avance de Carrera</p>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: porcentajeAvance + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas Adicionales -->
        <div class="stats-grid mb-4">
          <div class="mini-stat-modern">
            <div class="mini-stat-icon all">
              <i class="fas fa-books"></i>
            </div>
            <div class="mini-stat-content">
              <span class="mini-stat-value">{{ totalSubjects }}</span>
              <span class="mini-stat-label">Total Materias</span>
            </div>
          </div>

          <div class="mini-stat-modern">
            <div class="mini-stat-icon repeat">
              <i class="fas fa-redo"></i>
            </div>
            <div class="mini-stat-content">
              <span class="mini-stat-value">{{ repeatedSubjects }}</span>
              <span class="mini-stat-label">Repetidas</span>
            </div>
          </div>

          <div class="mini-stat-modern">
            <div class="mini-stat-icon fail">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="mini-stat-content">
              <span class="mini-stat-value">{{ failedSubjects }}</span>
              <span class="mini-stat-label">Reprobadas</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-card mb-4">
          <h3 class="progress-title">
            <i class="fas fa-rocket me-2"></i>
            Progreso de Carrera
          </h3>
          <div class="progress-wrapper">
            <div class="progress-track">
              <div class="progress-bar-fill" :style="{ width: porcentajeAvance + '%' }">
                <span class="progress-percentage">{{ porcentajeAvance }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-card mb-4">
          <div class="filters-header">
            <h3><i class="fas fa-filter me-2"></i>Filtros de Búsqueda</h3>
          </div>
          <div class="filters-body">
            <div class="row g-3">
              <div class="col-lg-4 col-md-6">
                <div class="search-wrapper">
                  <i class="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    v-model="searchQuery"
                    class="search-input"
                    placeholder="Buscar materia o clave..."
                  />
                </div>
              </div>

              <div class="col-lg-3 col-md-6">
                <select v-model="filterSemester" class="filter-select">
                  <option value="">📚 Todos los semestres</option>
                  <option v-for="sem in availableSemesters" :key="sem" :value="sem">
                    Semestre {{ sem }}
                  </option>
                </select>
              </div>

              <div class="col-lg-3 col-md-6">
                <select v-model="filterStatus" class="filter-select">
                  <option value="">📊 Todos los estados</option>
                  <option value="aprobada">✅ Aprobadas</option>
                  <option value="reprobada">❌ Reprobadas</option>
                  <option value="repeticion">🔄 Repeticiones</option>
                </select>
              </div>

              <div class="col-lg-2 col-md-6">
                <button @click="clearFilters" class="btn-clear-modern">
                  <i class="fas fa-eraser me-2"></i>
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Kardex por Semestre -->
        <div v-for="(semestre, index) in filteredKardexBySemester" :key="index" class="semester-card-modern mb-4">
          <div class="semester-header-modern" @click="toggleSemester(index)">
            <div class="semester-info-modern">
              <div class="semester-title-wrapper">
                <div class="semester-badge">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <h3>{{ semestre.nombre }}</h3>
              </div>
              <div class="semester-stats-modern">
                <div class="stat-chip">
                  <i class="fas fa-book"></i>
                  <span>{{ semestre.materias.length }} materias</span>
                </div>
                <div class="stat-chip">
                  <i class="fas fa-award"></i>
                  <span>{{ getSemesterCredits(semestre.materias) }} créditos</span>
                </div>
                <div class="stat-chip">
                  <i class="fas fa-chart-line"></i>
                  <span>Promedio: {{ calculateSemesterAverage(semestre.materias) }}</span>
                </div>
              </div>
            </div>
            <div class="toggle-btn" :class="{ 'active': openSemesters.includes(index) }">
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <transition name="expand">
            <div v-show="openSemesters.includes(index)" class="semester-content-modern">
              <div class="table-wrapper">
                <table class="table-modern">
                  <thead>
                    <tr>
                      <th><i class="fas fa-hashtag me-2"></i>Clave</th>
                      <th><i class="fas fa-book me-2"></i>Materia</th>
                      <th class="text-center"><i class="fas fa-calendar me-2"></i>Periodo</th>
                      <th class="text-center"><i class="fas fa-coins me-2"></i>Créditos</th>
                      <th class="text-center"><i class="fas fa-star me-2"></i>Calificación</th>
                      <th class="text-center"><i class="fas fa-tag me-2"></i>Tipo</th>
                      <th class="text-center"><i class="fas fa-check-circle me-2"></i>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(materia, idx) in semestre.materias" :key="idx" 
                        :class="{ 'repeticion-row': materia.descripcion.includes('REPETICIÓN') }">
                      <td>
                        <code class="code-badge">{{ materia.clave_materia }}</code>
                      </td>
                      <td>
                        <div class="materia-cell">
                          <span class="materia-name">{{ materia.nombre_materia }}</span>
                          <span v-if="materia.descripcion.includes('REPETICIÓN')" class="repeticion-chip">
                            <i class="fas fa-sync-alt"></i> Repetición
                          </span>
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="periodo-chip">{{ materia.periodo }}</span>
                      </td>
                      <td class="text-center">
                        <span class="credits-chip">{{ materia.creditos }}</span>
                      </td>
                      <td class="text-center">
                        <div class="grade-display" :class="getGradeClass(materia.calificacion)">
                          {{ materia.calificacion }}
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="type-chip">{{ getTypeDescription(materia.descripcion) }}</span>
                      </td>
                      <td class="text-center">
                        <span class="status-chip-modern" :class="getStatusClass(materia.calificacion)">
                          <i :class="getStatusIcon(materia.calificacion)"></i>
                          {{ getStatusText(materia.calificacion) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </transition>
        </div>

        <!-- No Results -->
        <div v-if="filteredKardexBySemester.length === 0" class="no-results-modern">
          <div class="no-results-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>No se encontraron resultados</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
          <button @click="clearFilters" class="btn-reset">
            <i class="fas fa-redo me-2"></i>Restablecer filtros
          </button>
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
  name: 'Kardex',
  setup() {
    const router = useRouter();
    const kardexData = ref([]);
    const porcentajeAvance = ref(0);
    const loading = ref(true);
    const error = ref('');
    const openSemesters = ref([0]);
    const searchQuery = ref('');
    const filterSemester = ref('');
    const filterStatus = ref('');

    const fetchKardex = async () => {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        console.log('📚 Obteniendo kardex...');
        const response = await studentAPI.getKardex();
        
        console.log('📦 Respuesta kardex:', response);
        
        const data = response.data?.data || response.data;
        
        if (data.kardex && Array.isArray(data.kardex)) {
          kardexData.value = data.kardex;
          porcentajeAvance.value = parseFloat(data.porcentaje_avance || 0).toFixed(2);
        } else {
          kardexData.value = [];
          porcentajeAvance.value = 0;
        }

        console.log(`✅ Total de materias en kardex: ${kardexData.value.length}`);
        console.log(`📊 Avance: ${porcentajeAvance.value}%`);
      } catch (err) {
        console.error('❌ Error al obtener kardex:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('student_data');
          router.push('/login');
        } else {
          error.value = 'Error al cargar el kardex';
        }
      } finally {
        loading.value = false;
      }
    };

    const availableSemesters = computed(() => {
      const semesters = [...new Set(kardexData.value.map(m => m.semestre))];
      return semesters.sort((a, b) => a - b);
    });

    const filteredKardex = computed(() => {
      return kardexData.value.filter(materia => {
        const matchesSearch = !searchQuery.value || 
          materia.nombre_materia.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          materia.clave_materia.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesSemester = !filterSemester.value || 
          materia.semestre === parseInt(filterSemester.value);
        
        let matchesStatus = true;
        if (filterStatus.value === 'aprobada') {
          matchesStatus = parseFloat(materia.calificacion) >= 70;
        } else if (filterStatus.value === 'reprobada') {
          matchesStatus = parseFloat(materia.calificacion) > 0 && parseFloat(materia.calificacion) < 70;
        } else if (filterStatus.value === 'repeticion') {
          matchesStatus = materia.descripcion.includes('REPETICIÓN');
        }
        
        return matchesSearch && matchesSemester && matchesStatus;
      });
    });

    const filteredKardexBySemester = computed(() => {
      const semesters = {};
      
      filteredKardex.value.forEach(materia => {
        const semestre = materia.semestre || 0;
        if (!semesters[semestre]) {
          semesters[semestre] = {
            nombre: `Semestre ${semestre}`,
            materias: []
          };
        }
        semesters[semestre].materias.push(materia);
      });

      return Object.values(semesters).sort((a, b) => {
        const numA = parseInt(a.nombre.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.nombre.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });
    });

    const totalSubjects = computed(() => kardexData.value.length);

    const totalCredits = computed(() => {
      return kardexData.value.reduce((sum, materia) => {
        const cal = parseFloat(materia.calificacion);
        const creditos = parseInt(materia.creditos) || 0;
        return (cal >= 70 || materia.calificacion === 'AC') ? sum + creditos : sum;
      }, 0);
    });

    const approvedSubjects = computed(() => {
      return kardexData.value.filter(m => {
        const cal = parseFloat(m.calificacion);
        return cal >= 70 || m.calificacion === 'AC';
      }).length;
    });

    const failedSubjects = computed(() => {
      return kardexData.value.filter(m => {
        const cal = parseFloat(m.calificacion);
        return cal > 0 && cal < 70;
      }).length;
    });

    const repeatedSubjects = computed(() => {
      return kardexData.value.filter(m => m.descripcion.includes('REPETICIÓN')).length;
    });

    const calculateGlobalAverage = () => {
      const validGrades = kardexData.value.filter(m => {
        const cal = parseFloat(m.calificacion);
        return !isNaN(cal) && cal > 0;
      });
      
      if (validGrades.length === 0) return '0.00';
      
      const sum = validGrades.reduce((acc, m) => acc + parseFloat(m.calificacion), 0);
      return (sum / validGrades.length).toFixed(2);
    };

    const calculateSemesterAverage = (materias) => {
      const validGrades = materias.filter(m => {
        const cal = parseFloat(m.calificacion);
        return !isNaN(cal) && cal > 0;
      });
      
      if (validGrades.length === 0) return '0.00';
      
      const sum = validGrades.reduce((acc, m) => acc + parseFloat(m.calificacion), 0);
      return (sum / validGrades.length).toFixed(2);
    };

    const getSemesterCredits = (materias) => {
      return materias.reduce((sum, m) => {
        const cal = parseFloat(m.calificacion);
        const creditos = parseInt(m.creditos) || 0;
        return (cal >= 70 || m.calificacion === 'AC') ? sum + creditos : sum;
      }, 0);
    };

    const getGradeClass = (grade) => {
      if (grade === 'AC') return 'acreditada';
      const cal = parseFloat(grade);
      if (isNaN(cal) || cal === 0) return 'pending';
      if (cal >= 90) return 'excellent';
      if (cal >= 80) return 'good';
      if (cal >= 70) return 'regular';
      return 'failed';
    };

    const getStatusClass = (grade) => {
      if (grade === 'AC') return 'acreditada';
      const cal = parseFloat(grade);
      if (isNaN(cal) || cal === 0) return 'pending';
      return cal >= 70 ? 'approved' : 'failed';
    };

    const getStatusIcon = (grade) => {
      if (grade === 'AC') return 'fas fa-check-double';
      const cal = parseFloat(grade);
      if (isNaN(cal) || cal === 0) return 'fas fa-clock';
      return cal >= 70 ? 'fas fa-check-circle' : 'fas fa-times-circle';
    };

    const getStatusText = (grade) => {
      if (grade === 'AC') return 'Acreditada';
      const cal = parseFloat(grade);
      if (isNaN(cal) || cal === 0) return 'Pendiente';
      return cal >= 70 ? 'Aprobada' : 'Reprobada';
    };

    const getTypeDescription = (descripcion) => {
      if (descripcion.includes('REPETICIÓN')) return 'Repetición';
      if (descripcion.includes('ORDINARIO')) return 'Ordinario';
      if (descripcion.includes('EXTRAORDINARIO')) return 'Extraordinario';
      return 'Normal';
    };

    const toggleSemester = (index) => {
      const pos = openSemesters.value.indexOf(index);
      if (pos > -1) {
        openSemesters.value.splice(pos, 1);
      } else {
        openSemesters.value.push(index);
      }
    };

    const clearFilters = () => {
      searchQuery.value = '';
      filterSemester.value = '';
      filterStatus.value = '';
    };

    onMounted(fetchKardex);

    return {
      kardexData,
      porcentajeAvance,
      loading,
      error,
      openSemesters,
      searchQuery,
      filterSemester,
      filterStatus,
      availableSemesters,
      filteredKardexBySemester,
      totalSubjects,
      totalCredits,
      approvedSubjects,
      failedSubjects,
      repeatedSubjects,
      calculateGlobalAverage,
      calculateSemesterAverage,
      getSemesterCredits,
      getGradeClass,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      getTypeDescription,
      toggleSemester,
      clearFilters
    };
  }
};
</script>

<style scoped>
.kardex-container {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 2rem;
}

/* Header Moderno */
.welcome-section {
  margin-bottom: 2.5rem;
}

.welcome-header {
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

.welcome-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.welcome-icon i {
  font-size: 2.5rem;
  color: white;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.welcome-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

/* Stat Cards Modernas */
.stat-card-modern {
  background: white;
  border-radius: 1.25rem;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  height: 100%;
}

.stat-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

.stat-card-modern.primary {
  border-left-color: #0a5f38;
}

.stat-card-modern.success {
  border-left-color: #28a745;
}

.stat-card-modern.info {
  border-left-color: #17a2b8;
}

.stat-card-modern.warning {
  border-left-color: #ffc107;
}

.stat-icon-modern {
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-modern.success .stat-icon-modern {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card-modern.info .stat-icon-modern {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-card-modern.warning .stat-icon-modern {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.stat-icon-modern i {
  font-size: 2rem;
  color: white;
}

.stat-content-modern {
  flex: 1;
}

.stat-content-modern h3 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.stat-content-modern p {
  color: #6c757d;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.stat-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 10px;
  transition: width 0.6s ease;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.mini-stat-modern {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 3px 15px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.mini-stat-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.12);
}

.mini-stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-stat-icon.all {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.mini-stat-icon.repeat {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.mini-stat-icon.fail {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.mini-stat-icon i {
  font-size: 1.5rem;
  color: white;
}

.mini-stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mini-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.mini-stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

/* Progress Card */
.progress-card {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.progress-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.progress-title i {
  color: #0a5f38;
}

.progress-wrapper {
  position: relative;
}

.progress-track {
  height: 50px;
  background: #f8f9fa;
  border-radius: 2rem;
  overflow: hidden;
  position: relative;
  border: 2px solid #e9ecef;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 50%, #28a745 100%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1.5rem;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 0 20px rgba(10, 95, 56, 0.3);
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-percentage {
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
}

/* Filters Card */
.filters-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.filters-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.25rem 1.75rem;
  border-bottom: 2px solid #dee2e6;
}

.filters-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
}

.filters-header i {
  color: #0a5f38;
}

.filters-body {
  padding: 1.75rem;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1.25rem 0.875rem 3.25rem;
  border: 2px solid #e9ecef;
  border-radius: 0.875rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #212529;
}

.search-input:focus {
  outline: none;
  border-color: #0a5f38;
  background: white;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
}

.search-input::placeholder {
  color: #adb5bd;
}

.filter-select {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 0.875rem;
  font-size: 0.95rem;
  background: #f8f9fa;
  color: #212529;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #0a5f38;
  background: white;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
}

.filter-select option {
  padding: 0.5rem;
}

.btn-clear-modern {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  border-radius: 0.875rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-clear-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
}

/* Semester Card Modern */
.semester-card-modern {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.semester-card-modern:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.semester-header-modern {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.semester-header-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.semester-header-modern:hover::before {
  transform: translateX(100%);
}

.semester-info-modern {
  flex: 1;
}

.semester-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.semester-badge {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.25);
}

.semester-badge i {
  font-size: 1.5rem;
  color: white;
}

.semester-title-wrapper h3 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.semester-stats-modern {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-chip {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-chip i {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.stat-chip span {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.toggle-btn {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.toggle-btn i {
  color: white;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.toggle-btn.active i {
  transform: rotate(180deg);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Semester Content */
.semester-content-modern {
  padding: 2rem;
  background: #f8f9fa;
}

.table-wrapper {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.table-modern {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
}

.table-modern thead {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.table-modern thead th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.table-modern thead th i {
  color: #0a5f38;
  font-size: 0.9rem;
}

.table-modern tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f5;
}

.table-modern tbody tr:hover {
  background: #f8f9fa;
}

.table-modern tbody tr.repeticion-row {
  background: rgba(255, 193, 7, 0.05);
}

.table-modern tbody tr.repeticion-row:hover {
  background: rgba(255, 193, 7, 0.1);
}

.table-modern tbody td {
  padding: 1.25rem 1rem;
  vertical-align: middle;
  color: #212529;
}

.code-badge {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(10, 95, 56, 0.2);
}

.materia-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.materia-name {
  font-weight: 500;
  color: #212529;
  line-height: 1.4;
}

.repeticion-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
  box-shadow: 0 2px 5px rgba(255, 193, 7, 0.3);
}

.periodo-chip {
  background: #f8f9fa;
  color: #495057;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  border: 2px solid #e9ecef;
}

.credits-chip {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  padding: 0.5rem 0.9rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(23, 162, 184, 0.3);
}

.grade-display {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.grade-display.excellent {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.grade-display.good {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.grade-display.regular {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.grade-display.failed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.grade-display.acreditada {
  background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
  font-size: 0.9rem;
}

.grade-display.pending {
  background: #e9ecef;
  color: #adb5bd;
  border: 2px dashed #dee2e6;
  box-shadow: none;
}

.type-chip {
  background: #f8f9fa;
  color: #6c757d;
  padding: 0.4rem 0.9rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  border: 2px solid #e9ecef;
}

.status-chip-modern {
  padding: 0.5rem 1.1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.status-chip-modern.approved {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.status-chip-modern.failed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.status-chip-modern.acreditada {
  background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
  color: white;
}

.status-chip-modern.pending {
  background: #e9ecef;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

/* No Results */
.no-results-modern {
  background: white;
  border-radius: 1.25rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.no-results-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.no-results-icon i {
  font-size: 3rem;
  color: #adb5bd;
}

.no-results-modern h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
}

.no-results-modern p {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.btn-reset {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  border: none;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-reset:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(10, 95, 56, 0.3);
}

/* Transitions */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to, .expand-leave-from {
  max-height: 2000px;
  opacity: 1;
}

/* Loading & Alert */
.spinner-custom {
  width: 4rem;
  height: 4rem;
  border-width: 0.4rem;
}

.alert-custom {
  border-radius: 1rem;
  border: none;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(220, 53, 69, 0.2);
  background: white;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

/* Responsive */
@media (max-width: 1200px) {
  .welcome-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .kardex-container {
    padding-top: 1rem;
  }

  .welcome-header {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .welcome-icon {
    width: 70px;
    height: 70px;
  }

  .welcome-icon i {
    font-size: 2rem;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .stat-card-modern {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon-modern {
    width: 60px;
    height: 60px;
  }

  .stat-content-modern h3 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .semester-header-modern {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }

  .semester-title-wrapper {
    width: 100%;
    justify-content: center;
  }

  .semester-stats-modern {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }

  .stat-chip {
    justify-content: center;
    width: 100%;
  }

  .toggle-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .semester-content-modern {
    padding: 1rem;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table-modern {
    font-size: 0.85rem;
    min-width: 800px;
  }

  .table-modern thead th,
  .table-modern tbody td {
    padding: 0.875rem 0.5rem;
  }

  .grade-display {
    width: 50px;
    height: 50px;
    font-size: 1.1rem;
  }

  .code-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }

  .filters-body {
    padding: 1.25rem;
  }
}

@media (max-width: 576px) {
  .welcome-title {
    font-size: 1.5rem;
  }

  .stat-content-modern h3 {
    font-size: 1.75rem;
  }

  .progress-title {
    font-size: 1.1rem;
  }

  .progress-track {
    height: 40px;
  }

  .progress-percentage {
    font-size: 1rem;
  }

  .filters-header h3 {
    font-size: 1rem;
  }

  .no-results-modern {
    padding: 3rem 1rem;
  }

  .no-results-icon {
    width: 80px;
    height: 80px;
  }

  .no-results-icon i {
    font-size: 2.5rem;
  }
}
</style>