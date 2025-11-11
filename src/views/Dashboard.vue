<template>
  <div class="dashboard-container">
    <div class="container py-5">
      <!-- Header con degradado verde TEC -->
      <div class="welcome-section mb-5">
        <div class="welcome-header">
          <div class="welcome-icon">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="welcome-text">
            <h1 class="welcome-title">
              ¡Hola, {{ studentData?.persona || 'Estudiante' }}!
            </h1>
            <p class="welcome-subtitle">
              <i class="fas fa-graduation-cap me-2"></i>
              Panel de Control Académico
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success spinner-custom" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando información...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger alert-custom">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <div v-else class="row g-4">
        <!-- Información Personal CON FOTO -->
        <div class="col-lg-4">
          <div class="info-card profile-card">
            <div class="card-header-custom">
              <i class="fas fa-id-card-alt me-2"></i>
              <span>Perfil del Estudiante</span>
            </div>
            <div class="card-body-custom">
              <!-- Foto del estudiante -->
              <div class="student-photo-wrapper" v-if="studentData?.foto">
                <div class="photo-frame">
                  <img 
                    :src="getPhotoUrl()" 
                    alt="Foto del estudiante"
                    class="student-photo"
                    @error="handlePhotoError"
                  />
                  <div class="photo-badge">
                    <i class="fas fa-check-circle"></i>
                  </div>
                </div>
              </div>
              
              <div class="student-info">
                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="fas fa-hashtag"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Número de Control</span>
                    <span class="info-value">{{ studentData?.numero_control || 'N/A' }}</span>
                  </div>
                </div>
                
                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Nombre Completo</span>
                    <span class="info-value">{{ studentData?.persona || 'N/A' }}</span>
                  </div>
                </div>
                
                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Semestre Actual</span>
                    <span class="info-value">{{ studentData?.semestre || 'N/A' }}</span>
                  </div>
                </div>
                
                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Correo Institucional</span>
                    <span class="info-value email">{{ studentData?.email || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas Académicas -->
        <div class="col-lg-8">
          <div class="info-card stats-card">
            <div class="card-header-custom">
              <i class="fas fa-chart-line me-2"></i>
              <span>Rendimiento Académico</span>
            </div>
            <div class="card-body-custom">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="stat-card primary">
                    <div class="stat-icon-wrapper">
                      <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-details">
                      <span class="stat-label">Promedio Ponderado</span>
                      <span class="stat-value">{{ calculateAverage() }}</span>
                      <div class="stat-progress">
                        <div class="progress-bar" :style="{width: (calculateAverage() * 10) + '%'}"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="stat-card secondary">
                    <div class="stat-icon-wrapper">
                      <i class="fas fa-calculator"></i>
                    </div>
                    <div class="stat-details">
                      <span class="stat-label">Promedio Aritmético</span>
                      <span class="stat-value">{{ calculateArithmeticAverage() }}</span>
                      <div class="stat-progress">
                        <div class="progress-bar" :style="{width: (calculateArithmeticAverage() * 10) + '%'}"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="stat-mini success">
                    <i class="fas fa-book-reader"></i>
                    <div>
                      <div class="stat-mini-value">{{ studentData?.creditos_acumulados || 0 }}</div>
                      <div class="stat-mini-label">Créditos Acumulados</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="stat-mini info">
                    <i class="fas fa-star"></i>
                    <div>
                      <div class="stat-mini-value">{{ studentData?.creditos_complementarios || 0 }}</div>
                      <div class="stat-mini-label">Créditos Complementarios</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="stat-mini warning">
                    <i class="fas fa-chart-pie"></i>
                    <div>
                      <div class="stat-mini-value">{{ studentData?.porcentaje_avance || 0 }}%</div>
                      <div class="stat-mini-label">Avance de Carrera</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen Académico -->
        <div class="col-12">
          <div class="info-card summary-card">
            <div class="card-header-custom">
              <i class="fas fa-chart-bar me-2"></i>
              <span>Resumen de Materias</span>
            </div>
            <div class="card-body-custom">
              <div class="row g-4">
                <div class="col-lg-3 col-md-6">
                  <div class="summary-item approved">
                    <div class="summary-header">
                      <div class="summary-icon">
                        <i class="fas fa-check-double"></i>
                      </div>
                      <div class="summary-badge">Excelente</div>
                    </div>
                    <div class="summary-body">
                      <div class="summary-number">{{ studentData?.materias_aprobadas || 0 }}</div>
                      <div class="summary-label">Materias Aprobadas</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                  <div class="summary-item failed">
                    <div class="summary-header">
                      <div class="summary-icon">
                        <i class="fas fa-times-circle"></i>
                      </div>
                      <div class="summary-badge">Atención</div>
                    </div>
                    <div class="summary-body">
                      <div class="summary-number">{{ studentData?.materias_reprobadas || 0 }}</div>
                      <div class="summary-label">Materias Reprobadas</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                  <div class="summary-item current">
                    <div class="summary-header">
                      <div class="summary-icon">
                        <i class="fas fa-book-open"></i>
                      </div>
                      <div class="summary-badge">En curso</div>
                    </div>
                    <div class="summary-body">
                      <div class="summary-number">{{ studentData?.materias_cursadas || 0 }}</div>
                      <div class="summary-label">Materias Cursadas</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                  <div class="summary-item pending">
                    <div class="summary-header">
                      <div class="summary-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                      </div>
                      <div class="summary-badge">Pendiente</div>
                    </div>
                    <div class="summary-body">
                      <div class="summary-number">{{ studentData?.num_mat_rep_no_acreditadas || 0 }}</div>
                      <div class="summary-label">No Acreditadas</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Detalles adicionales -->
              <div class="additional-info">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="detail-badge">
                      <i class="fas fa-sync-alt me-2"></i>
                      <span class="detail-text">
                        <strong>{{ studentData?.num_materias_rep_primera || 0 }}</strong> en primera repetición
                      </span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="detail-badge">
                      <i class="fas fa-redo-alt me-2"></i>
                      <span class="detail-text">
                        <strong>{{ studentData?.num_materias_rep_segunda || 0 }}</strong> en segunda repetición
                      </span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="detail-badge">
                      <i class="fas fa-rocket me-2"></i>
                      <span class="detail-text">
                        <strong>{{ studentData?.percentaje_avance_cursando || 0 }}%</strong> avance cursando
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos -->
        <div class="col-12">
          <div class="quick-access-section">
            <h3 class="section-title">
              <i class="fas fa-bolt me-2"></i>
              Accesos Rápidos
            </h3>
            <div class="row g-4">
              <div class="col-lg-4 col-md-6">
                <router-link to="/calificaciones" class="access-card-modern">
                  <div class="access-bg"></div>
                  <div class="access-content">
                    <div class="access-icon-modern">
                      <i class="fas fa-clipboard-check"></i>
                    </div>
                    <h4 class="access-title">Calificaciones</h4>
                    <p class="access-description">Consulta tus calificaciones del semestre actual</p>
                    <div class="access-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </router-link>
              </div>
              
              <div class="col-lg-4 col-md-6">
                <router-link to="/kardex" class="access-card-modern">
                  <div class="access-bg"></div>
                  <div class="access-content">
                    <div class="access-icon-modern">
                      <i class="fas fa-file-alt"></i>
                    </div>
                    <h4 class="access-title">Kardex</h4>
                    <p class="access-description">Revisa tu historial académico completo</p>
                    <div class="access-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </router-link>
              </div>
              
              <div class="col-lg-4 col-md-6">
                <router-link to="/horario" class="access-card-modern">
                  <div class="access-bg"></div>
                  <div class="access-content">
                    <div class="access-icon-modern">
                      <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h4 class="access-title">Horario</h4>
                    <p class="access-description">Visualiza tu horario de clases semanal</p>
                    <div class="access-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </router-link>
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
import { useRouter } from 'vue-router';
import { studentAPI } from '@/services/api';

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter();
    const studentData = ref(null);
    const loading = ref(true);
    const error = ref('');

    const fetchStudentData = async () => {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        console.log('🔥 Obteniendo datos del estudiante...');
        const response = await studentAPI.getInfo();
        
        console.log('📦 Respuesta completa estudiante:', response);
        console.log('📄 Datos estudiante:', response.data);
        console.log('📄 Keys:', Object.keys(response.data || {}));

        let data = response.data?.data || 
                   response.data?.message?.estudiante ||
                   response.data?.message ||
                   response.data;

        console.log('✅ Datos procesados:', data);

        if (data && typeof data === 'object') {
          studentData.value = data;
          localStorage.setItem('student_data', JSON.stringify(data));
        } else {
          console.error('⚠️ Estructura de datos inesperada');
          error.value = 'Formato de datos del servidor inválido';
        }
      } catch (err) {
        console.error('❌ Error al obtener datos:', err);
        console.error('❌ Error response:', err.response);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('student_data');
          router.push('/login');
        } else {
          error.value = 'Error al cargar los datos del estudiante. Por favor, intenta de nuevo.';
        }
      } finally {
        loading.value = false;
      }
    };

    const calculateAverage = () => {
      if (!studentData.value?.promedio_ponderado) return '0.00';
      return parseFloat(studentData.value.promedio_ponderado).toFixed(2);
    };

    const calculateArithmeticAverage = () => {
      if (!studentData.value?.promedio_aritmetico) return '0.00';
      return parseFloat(studentData.value.promedio_aritmetico).toFixed(2);
    };

    const getPhotoUrl = () => {
      if (!studentData.value?.foto) return '';
      
      const base64Photo = studentData.value.foto;
      
      if (base64Photo.startsWith('data:image')) {
        return base64Photo;
      }
      
      return `data:image/jpeg;base64,${base64Photo}`;
    };

    const handlePhotoError = (event) => {
      console.error('❌ Error al cargar la foto');
      event.target.style.display = 'none';
    };

    onMounted(() => {
      const savedData = localStorage.getItem('student_data');
      if (savedData) {
        try {
          studentData.value = JSON.parse(savedData);
          console.log('📂 Datos cargados del localStorage:', studentData.value);
        } catch (e) {
          console.error('Error al parsear datos guardados:', e);
        }
      }
      
      fetchStudentData();
    });

    return {
      studentData,
      loading,
      error,
      calculateAverage,
      calculateArithmeticAverage,
      getPhotoUrl,
      handlePhotoError
    };
  }
};
</script>

<style scoped>
.dashboard-container {
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

/* Cards Base */
.info-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.card-header-custom {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  padding: 1.5rem;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.card-body-custom {
  padding: 2rem;
}

/* Profile Card */
.profile-card .card-body-custom {
  padding: 2rem 1.5rem;
}

.student-photo-wrapper {
  text-align: center;
  margin-bottom: 2rem;
}

.photo-frame {
  position: relative;
  display: inline-block;
}

.student-photo {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 50%;
  border: 5px solid #0a5f38;
  box-shadow: 0 10px 30px rgba(10, 95, 56, 0.3);
  transition: transform 0.3s ease;
}

.student-photo:hover {
  transform: scale(1.05);
}

.photo-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.photo-badge i {
  color: white;
  font-size: 1.2rem;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item-modern {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.info-item-modern:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.info-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon i {
  color: white;
  font-size: 1.2rem;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.info-value.email {
  word-break: break-all;
  font-size: 0.9rem;
}

/* Stats Card */
.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border-left: 4px solid #0a5f38;
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stat-card.primary {
  border-left-color: #0a5f38;
}

.stat-card.secondary {
  border-left-color: #17a2b8;
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.stat-card.secondary .stat-icon-wrapper {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-icon-wrapper i {
  font-size: 1.8rem;
  color: white;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.stat-progress {
  height: 8px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 10px;
  transition: width 0.6s ease;
}

/* Mini Stats */
.stat-mini {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 1rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.stat-mini:hover {
  border-color: #0a5f38;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-mini i {
  font-size: 2rem;
  color: #0a5f38;
}

.stat-mini.success i {
  color: #28a745;
}

.stat-mini.info i {
  color: #17a2b8;
}

.stat-mini.warning i {
  color: #ffc107;
}

.stat-mini-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.stat-mini-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Summary Card */
.summary-item {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  height: 100%;
}

.summary-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.summary-item.approved {
  border-color: #28a745;
}

.summary-item.approved:hover {
  border-color: #20c997;
  box-shadow: 0 10px 30px rgba(40, 167, 69, 0.2);
}

.summary-item.failed {
  border-color: #dc3545;
}

.summary-item.failed:hover {
  border-color: #c82333;
  box-shadow: 0 10px 30px rgba(220, 53, 69, 0.2);
}

.summary-item.current {
  border-color: #17a2b8;
}

.summary-item.current:hover {
  border-color: #138496;
  box-shadow: 0 10px 30px rgba(23, 162, 184, 0.2);
}

.summary-item.pending {
  border-color: #ffc107;
}

.summary-item.pending:hover {
  border-color: #e0a800;
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.2);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-icon {
  width: 50px;
  height: 50px;
  background: #f8f9fa;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-item.approved .summary-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.summary-item.failed .summary-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.summary-item.current .summary-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.summary-item.pending .summary-icon {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.summary-icon i {
  font-size: 1.5rem;
  color: white;
}

.summary-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f8f9fa;
  color: #6c757d;
}

.summary-body {
  text-align: center;
}

.summary-number {
  font-size: 3rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 500;
}

/* Additional Info */
.additional-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.detail-badge {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 0.75rem;
  border-left: 4px solid #0a5f38;
  transition: all 0.3s ease;
}

.detail-badge:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.detail-badge i {
  color: #0a5f38;
  font-size: 1.2rem;
}

.detail-text {
  color: #495057;
  font-size: 0.95rem;
}

.detail-text strong {
  color: #212529;
  font-weight: 700;
}

/* Quick Access Section */
.quick-access-section {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.section-title i {
  color: #0a5f38;
}

.access-card-modern {
  display: block;
  position: relative;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 1.25rem;
  padding: 2rem;
  text-decoration: none;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 100%;
}

.access-card-modern:hover {
  border-color: #0a5f38;
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(10, 95, 56, 0.15);
}

.access-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(10, 95, 56, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(50%, -50%);
  transition: all 0.4s ease;
}

.access-card-modern:hover .access-bg {
  transform: translate(30%, -30%) scale(1.5);
  background: radial-gradient(circle, rgba(10, 95, 56, 0.1) 0%, transparent 70%);
}

.access-content {
  position: relative;
  z-index: 1;
}

.access-icon-modern {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.access-card-modern:hover .access-icon-modern {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 25px rgba(10, 95, 56, 0.3);
}

.access-icon-modern i {
  font-size: 2rem;
  color: white;
}

.access-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
}

.access-card-modern:hover .access-title {
  color: #0a5f38;
}

.access-description {
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.access-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.access-card-modern:hover .access-arrow {
  background: #0a5f38;
  transform: translateX(5px);
}

.access-arrow i {
  color: #6c757d;
  transition: color 0.3s ease;
}

.access-card-modern:hover .access-arrow i {
  color: white;
}

/* Loading Spinner */
.spinner-custom {
  width: 4rem;
  height: 4rem;
  border-width: 0.4rem;
}

/* Alert Custom */
.alert-custom {
  border-radius: 1rem;
  border: none;
  padding: 1.5rem;
  box-shadow: 0 5px 25px rgba(220, 53, 69, 0.2);
}

/* Responsive */
@media (max-width: 1200px) {
  .welcome-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
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
  
  .student-photo {
    width: 130px;
    height: 130px;
  }
  
  .card-body-custom {
    padding: 1.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .summary-number {
    font-size: 2.5rem;
  }
  
  .access-card-modern {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .card-header-custom {
    font-size: 1rem;
    padding: 1.25rem;
  }
  
  .stat-mini {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .detail-badge {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>