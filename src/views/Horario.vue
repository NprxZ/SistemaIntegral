<template>
  <div class="horario-container">
    <div class="container py-5">
      <!-- Header Moderno -->
      <div class="header-section mb-5">
        <div class="header-wrapper">
          <div class="header-icon">
            <i class="fas fa-calendar-week"></i>
          </div>
          <div class="header-content">
            <h1 class="page-title">Mi Horario de Clases</h1>
            <p class="page-subtitle">
              <i class="fas fa-graduation-cap me-2"></i>
              {{ periodoActual || 'Periodo Académico Actual' }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner-wrapper">
          <div class="spinner-custom"></div>
        </div>
        <p class="loading-text">Cargando tu horario...</p>
      </div>

      <div v-else-if="error" class="error-alert">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <div v-else>
        <!-- Resumen Estadístico -->
        <div class="stats-grid mb-4">
          <div class="stat-card-schedule subjects">
            <div class="stat-icon-wrapper">
              <i class="fas fa-books"></i>
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ totalClasses }}</div>
              <div class="stat-label">Materias</div>
            </div>
          </div>

          <div class="stat-card-schedule hours">
            <div class="stat-icon-wrapper">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ totalHours }}h</div>
              <div class="stat-label">Horas Semanales</div>
            </div>
          </div>

          <div class="stat-card-schedule days">
            <div class="stat-icon-wrapper">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ daysWithClasses }}</div>
              <div class="stat-label">Días con Clase</div>
            </div>
          </div>

          <div class="stat-card-schedule classrooms">
            <div class="stat-icon-wrapper">
              <i class="fas fa-door-open"></i>
            </div>
            <div class="stat-details">
              <div class="stat-number">{{ uniqueClassrooms }}</div>
              <div class="stat-label">Salones Diferentes</div>
            </div>
          </div>
        </div>

        <!-- Vista de Calendario Semanal (Desktop) -->
        <div class="schedule-calendar-wrapper d-none d-lg-block mb-4">
          <div class="calendar-container">
            <div class="calendar-grid">
              <!-- Header -->
              <div class="calendar-header">
                <div class="time-header">
                  <i class="fas fa-clock"></i>
                  <span>Hora</span>
                </div>
                <div v-for="day in daysOfWeek" :key="day.key" class="day-header">
                  <div class="day-icon">
                    <i class="fas fa-calendar-day"></i>
                  </div>
                  <div class="day-name">{{ day.name }}</div>
                </div>
              </div>

              <!-- Body -->
              <div class="calendar-body">
                <div v-for="hour in timeSlots" :key="hour" class="time-row">
                  <div class="time-cell">
                    <span class="time-label">{{ hour }}</span>
                  </div>
                  <div v-for="day in daysOfWeek" :key="day.key" class="schedule-cell">
                    <div
                      v-for="(clase, idx) in getClassesForSlot(day.key, hour)"
                      :key="idx"
                      class="class-block"
                      :class="getColorForSubject(clase.nombre_materia)"
                      :style="getClassStyle(clase, day.key)"
                    >
                      <div class="class-block-header">
                        <i class="fas fa-book-open"></i>
                        <span class="class-title">{{ clase.nombre_materia }}</span>
                      </div>
                      <div class="class-block-body">
                        <div class="class-info-item">
                          <i class="fas fa-clock"></i>
                          <span>{{ getTimeForDay(clase, day.key) }}</span>
                        </div>
                        <div class="class-info-item">
                          <i class="fas fa-door-open"></i>
                          <span>{{ getClassroomForDay(clase, day.key) }}</span>
                        </div>
                        <div class="class-info-item">
                          <i class="fas fa-users"></i>
                          <span>Grupo {{ clase.letra_grupo }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Clases por Día (Mobile/Tablet) -->
        <div class="daily-schedule-list d-lg-none mb-4">
          <div v-for="day in daysOfWeek" :key="day.key" class="day-card">
            <div class="day-card-header">
              <div class="day-header-icon">
                <i class="fas fa-calendar-day"></i>
              </div>
              <h3 class="day-header-title">{{ day.name }}</h3>
              <span class="day-count-badge">
                {{ getClassesForDay(day.key).length }} clases
              </span>
            </div>
            
            <div class="day-card-body">
              <div
                v-for="(clase, idx) in getClassesForDay(day.key)"
                :key="idx"
                class="mobile-class-card"
                :class="getColorForSubject(clase.nombre_materia)"
              >
                <div class="mobile-class-header">
                  <div class="mobile-class-title">
                    <i class="fas fa-book"></i>
                    <h5>{{ clase.nombre_materia }}</h5>
                  </div>
                  <div class="mobile-time-badge">
                    <i class="fas fa-clock"></i>
                    {{ getTimeForDay(clase, day.key) }}
                  </div>
                </div>
                <div class="mobile-class-body">
                  <div class="mobile-info-row">
                    <div class="mobile-info-item">
                      <i class="fas fa-hashtag"></i>
                      <span>{{ clase.clave_materia }}</span>
                    </div>
                    <div class="mobile-info-item">
                      <i class="fas fa-door-open"></i>
                      <span>Aula {{ getClassroomForDay(clase, day.key) }}</span>
                    </div>
                    <div class="mobile-info-item">
                      <i class="fas fa-users"></i>
                      <span>Grupo {{ clase.letra_grupo }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="getClassesForDay(day.key).length === 0" class="no-classes-message">
                <div class="no-classes-icon">
                  <i class="fas fa-mug-hot"></i>
                </div>
                <p>Sin clases programadas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Leyenda de Materias -->
        <div class="legend-container">
          <div class="legend-header">
            <h3>
              <i class="fas fa-palette me-2"></i>
              Materias del Semestre
            </h3>
            <span class="legend-count">{{ uniqueSubjectsList.length }} materias</span>
          </div>
          <div class="legend-grid">
            <div v-for="(materia, idx) in uniqueSubjectsList" :key="idx" class="legend-card">
              <div class="legend-indicator" :class="getColorForSubject(materia.nombre)"></div>
              <div class="legend-info">
                <div class="legend-subject-name">{{ materia.nombre }}</div>
                <div class="legend-subject-code">
                  <i class="fas fa-hashtag"></i>
                  {{ materia.clave }}
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentAPI } from '@/services/api';

export default {
  name: 'Horario',
  setup() {
    const router = useRouter();
    const horarioData = ref([]);
    const periodoActual = ref('');
    const loading = ref(true);
    const error = ref('');

    const daysOfWeek = [
      { key: 'lunes', name: 'Lunes' },
      { key: 'martes', name: 'Martes' },
      { key: 'miercoles', name: 'Miércoles' },
      { key: 'jueves', name: 'Jueves' },
      { key: 'viernes', name: 'Viernes' },
      { key: 'sabado', name: 'Sábado' }
    ];

    const timeSlots = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    const colorClasses = [
      'color-1', 'color-2', 'color-3', 'color-4', 'color-5', 
      'color-6', 'color-7', 'color-8'
    ];
    const subjectColorMap = new Map();

    const fetchHorario = async () => {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        console.log('📅 Obteniendo horario...');
        const response = await studentAPI.getHorarios();
        
        console.log('📦 Respuesta horario:', response);
        
        const data = response.data?.data || response.data;
        
        if (Array.isArray(data) && data.length > 0) {
          const periodoData = data[0];
          
          if (periodoData.periodo) {
            const periodo = periodoData.periodo;
            periodoActual.value = `${periodo.descripcion_periodo} (${periodo.clave_periodo})`;
          }
          
          horarioData.value = periodoData.horario || [];
        } else {
          horarioData.value = [];
        }

        console.log(`✅ Total de materias: ${horarioData.value.length}`);
        console.log('📊 Horario procesado:', horarioData.value);
      } catch (err) {
        console.error('❌ Error al obtener horario:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('student_data');
          router.push('/login');
        } else {
          error.value = 'Error al cargar el horario';
        }
      } finally {
        loading.value = false;
      }
    };

    const totalClasses = computed(() => horarioData.value.length);

    const totalHours = computed(() => {
      let total = 0;
      horarioData.value.forEach(clase => {
        daysOfWeek.forEach(day => {
          const timeRange = clase[day.key];
          if (timeRange) {
            const [start, end] = timeRange.split('-');
            const startHour = parseInt(start.split(':')[0]);
            const endHour = parseInt(end.split(':')[0]);
            total += (endHour - startHour);
          }
        });
      });
      return total;
    });

    const daysWithClasses = computed(() => {
      const daysSet = new Set();
      horarioData.value.forEach(clase => {
        daysOfWeek.forEach(day => {
          if (clase[day.key]) {
            daysSet.add(day.key);
          }
        });
      });
      return daysSet.size;
    });

    const uniqueClassrooms = computed(() => {
      const classrooms = new Set();
      horarioData.value.forEach(clase => {
        daysOfWeek.forEach(day => {
          const classroom = clase[`${day.key}_clave_salon`];
          if (classroom) {
            classrooms.add(classroom);
          }
        });
      });
      return classrooms.size;
    });

    const uniqueSubjectsList = computed(() => {
      return horarioData.value.map(clase => ({
        nombre: clase.nombre_materia,
        clave: clase.clave_materia
      }));
    });

    const getColorForSubject = (subjectName) => {
      if (!subjectColorMap.has(subjectName)) {
        const colorIndex = subjectColorMap.size % colorClasses.length;
        subjectColorMap.set(subjectName, colorClasses[colorIndex]);
      }
      return subjectColorMap.get(subjectName);
    };

    const getTimeForDay = (clase, day) => {
      return clase[day] || '';
    };

    const getClassroomForDay = (clase, day) => {
      return clase[`${day}_clave_salon`] || 'N/A';
    };

    const getClassesForDay = (day) => {
      return horarioData.value
        .filter(clase => clase[day])
        .sort((a, b) => {
          const timeA = a[day].split('-')[0];
          const timeB = b[day].split('-')[0];
          return timeA.localeCompare(timeB);
        });
    };

    const getClassesForSlot = (day, timeSlot) => {
      return horarioData.value.filter(clase => {
        const timeRange = clase[day];
        if (!timeRange) return false;
        
        const [start] = timeRange.split('-');
        return start === timeSlot;
      });
    };

    const getClassStyle = (clase, day) => {
      const timeRange = clase[day];
      if (!timeRange) return {};
      
      const [start, end] = timeRange.split('-');
      const startHour = parseInt(start.split(':')[0]);
      const startMin = parseInt(start.split(':')[1]);
      const endHour = parseInt(end.split(':')[0]);
      const endMin = parseInt(end.split(':')[1]);
      
      const durationHours = endHour - startHour;
      const durationMins = endMin - startMin;
      const totalDuration = durationHours + (durationMins / 60);
      
      const height = totalDuration * 70;
      
      return {
        minHeight: `${height}px`
      };
    };

    onMounted(fetchHorario);

    return {
      horarioData,
      periodoActual,
      loading,
      error,
      daysOfWeek,
      timeSlots,
      totalClasses,
      totalHours,
      daysWithClasses,
      uniqueClassrooms,
      uniqueSubjectsList,
      getColorForSubject,
      getTimeForDay,
      getClassroomForDay,
      getClassesForDay,
      getClassesForSlot,
      getClassStyle
    };
  }
};
</script>

<style scoped>
.horario-container {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 2rem;
}

/* Header */
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

/* Loading State */
.loading-state {
  text-align: center;
  padding: 5rem 0;
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
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
  border-radius: 1.25rem;
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

.stat-card-schedule {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border-left: 5px solid;
}

.stat-card-schedule:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.stat-card-schedule.subjects {
  border-left-color: #0a5f38;
}

.stat-card-schedule.hours {
  border-left-color: #17a2b8;
}

.stat-card-schedule.days {
  border-left-color: #28a745;
}

.stat-card-schedule.classrooms {
  border-left-color: #ffc107;
}

.stat-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-schedule.subjects .stat-icon-wrapper {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
}

.stat-card-schedule.hours .stat-icon-wrapper {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-card-schedule.days .stat-icon-wrapper {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card-schedule.classrooms .stat-icon-wrapper {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.stat-icon-wrapper i {
  font-size: 2rem;
  color: white;
}

.stat-details {
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
}

/* Calendar Wrapper */
.schedule-calendar-wrapper {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.calendar-container {
  overflow-x: auto;
}

.calendar-grid {
  min-width: 1000px;
}

/* Calendar Header */
.calendar-header {
  display: grid;
  grid-template-columns: 100px repeat(6, 1fr);
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
}

.time-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  border-right: 2px solid rgba(255, 255, 255, 0.2);
}

.day-header {
  padding: 1.25rem;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.day-header:last-child {
  border-right: none;
}

.day-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-icon i {
  font-size: 1.1rem;
}

.day-name {
  font-weight: 600;
  font-size: 0.95rem;
}

/* Calendar Body */
.calendar-body {
  max-height: 700px;
  overflow-y: auto;
}

.time-row {
  display: grid;
  grid-template-columns: 100px repeat(6, 1fr);
  border-bottom: 1px solid #e9ecef;
  min-height: 70px;
}

.time-cell {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #6c757d;
  background: #f8f9fa;
  border-right: 2px solid #e9ecef;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.time-label {
  font-size: 0.85rem;
  background: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.schedule-cell {
  padding: 0.5rem;
  border-right: 1px solid #e9ecef;
  position: relative;
  background: white;
}

.schedule-cell:last-child {
  border-right: none;
}

/* Class Block */
.class-block {
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.class-block:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.class-block.color-1 { 
  border-left-color: #0a5f38; 
  background: linear-gradient(135deg, rgba(10, 95, 56, 0.15) 0%, rgba(10, 95, 56, 0.05) 100%); 
}
.class-block.color-2 { 
  border-left-color: #17a2b8; 
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.15) 0%, rgba(23, 162, 184, 0.05) 100%); 
}
.class-block.color-3 { 
  border-left-color: #28a745; 
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(40, 167, 69, 0.05) 100%); 
}
.class-block.color-4 { 
  border-left-color: #ffc107; 
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.05) 100%); 
}
.class-block.color-5 { 
  border-left-color: #6f42c1; 
  background: linear-gradient(135deg, rgba(111, 66, 193, 0.15) 0%, rgba(111, 66, 193, 0.05) 100%); 
}
.class-block.color-6 { 
  border-left-color: #fd7e14; 
  background: linear-gradient(135deg, rgba(253, 126, 20, 0.15) 0%, rgba(253, 126, 20, 0.05) 100%); 
}
.class-block.color-7 { 
  border-left-color: #20c997; 
  background: linear-gradient(135deg, rgba(32, 201, 151, 0.15) 0%, rgba(32, 201, 151, 0.05) 100%); 
}
.class-block.color-8 { 
  border-left-color: #e83e8c; 
  background: linear-gradient(135deg, rgba(232, 62, 140, 0.15) 0%, rgba(232, 62, 140, 0.05) 100%); 
}

.class-block-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.class-block-header i {
  color: #0a5f38;
  font-size: 0.9rem;
}

.class-title {
  font-weight: 700;
  color: #212529;
  font-size: 0.9rem;
  line-height: 1.3;
}

.class-block-body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.class-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.8rem;
}

.class-info-item i {
  font-size: 0.75rem;
  width: 14px;
}

/* Daily Schedule List (Mobile) */
.daily-schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.day-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.day-card-header {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.day-header-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.day-header-icon i {
  font-size: 1.3rem;
}

.day-header-title {
  flex: 1;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.day-count-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.day-card-body {
  padding: 1.5rem;
}

.mobile-class-card {
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border-left: 5px solid;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.mobile-class-card:last-child {
  margin-bottom: 0;
}

.mobile-class-card:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.mobile-class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.mobile-class-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.mobile-class-title i {
  font-size: 1.2rem;
  color: #0a5f38;
}

.mobile-class-title h5 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  line-height: 1.3;
}

.mobile-time-badge {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(10, 95, 56, 0.3);
}

.mobile-class-body {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.75rem;
}

.mobile-info-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
}

.mobile-info-item i {
  width: 20px;
  color: #0a5f38;
  font-size: 0.9rem;
}

.no-classes-message {
  text-align: center;
  padding: 3rem 1.5rem;
  background: #f8f9fa;
  border-radius: 1rem;
  border: 2px dashed #dee2e6;
}

.no-classes-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-classes-icon i {
  font-size: 2.5rem;
  color: #adb5bd;
}

.no-classes-message p {
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

/* Legend Container */
.legend-container {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.legend-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  display: flex;
  align-items: center;
}

.legend-header h3 i {
  color: #0a5f38;
}

.legend-count {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.legend-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.legend-card:hover {
  background: white;
  border-color: #0a5f38;
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(10, 95, 56, 0.15);
}

.legend-indicator {
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  border-left: 5px solid;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.legend-card:hover .legend-indicator {
  transform: scale(1.1);
}

.legend-indicator.color-1 { 
  border-left-color: #0a5f38; 
  background: linear-gradient(135deg, rgba(10, 95, 56, 0.2) 0%, rgba(10, 95, 56, 0.05) 100%); 
}
.legend-indicator.color-2 { 
  border-left-color: #17a2b8; 
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.2) 0%, rgba(23, 162, 184, 0.05) 100%); 
}
.legend-indicator.color-3 { 
  border-left-color: #28a745; 
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0.05) 100%); 
}
.legend-indicator.color-4 { 
  border-left-color: #ffc107; 
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.05) 100%); 
}
.legend-indicator.color-5 { 
  border-left-color: #6f42c1; 
  background: linear-gradient(135deg, rgba(111, 66, 193, 0.2) 0%, rgba(111, 66, 193, 0.05) 100%); 
}
.legend-indicator.color-6 { 
  border-left-color: #fd7e14; 
  background: linear-gradient(135deg, rgba(253, 126, 20, 0.2) 0%, rgba(253, 126, 20, 0.05) 100%); 
}
.legend-indicator.color-7 { 
  border-left-color: #20c997; 
  background: linear-gradient(135deg, rgba(32, 201, 151, 0.2) 0%, rgba(32, 201, 151, 0.05) 100%); 
}
.legend-indicator.color-8 { 
  border-left-color: #e83e8c; 
  background: linear-gradient(135deg, rgba(232, 62, 140, 0.2) 0%, rgba(232, 62, 140, 0.05) 100%); 
}

.legend-info {
  flex: 1;
}

.legend-subject-name {
  font-weight: 700;
  color: #212529;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.legend-subject-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.legend-subject-code i {
  font-size: 0.75rem;
}

/* Scrollbar personalizado */
.calendar-body::-webkit-scrollbar,
.calendar-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.calendar-body::-webkit-scrollbar-track,
.calendar-container::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.calendar-body::-webkit-scrollbar-thumb,
.calendar-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 10px;
}

.calendar-body::-webkit-scrollbar-thumb:hover,
.calendar-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0d7d4d 0%, #0a5f38 100%);
}

/* Responsive */
@media (max-width: 1200px) {
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .legend-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .horario-container {
    padding-top: 1rem;
  }
  
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card-schedule {
    padding: 1.5rem;
  }
  
  .stat-icon-wrapper {
    width: 60px;
    height: 60px;
  }
  
  .stat-icon-wrapper i {
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .day-card-header {
    padding: 1.25rem;
  }
  
  .day-header-icon {
    width: 45px;
    height: 45px;
  }
  
  .day-header-icon i {
    font-size: 1.1rem;
  }
  
  .day-header-title {
    font-size: 1.2rem;
  }
  
  .day-count-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.875rem;
  }
  
  .day-card-body {
    padding: 1.25rem;
  }
  
  .mobile-class-card {
    padding: 1rem;
  }
  
  .mobile-class-title h5 {
    font-size: 0.95rem;
  }
  
  .mobile-time-badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.875rem;
  }
  
  .legend-container {
    padding: 1.5rem;
  }
  
  .legend-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .legend-header h3 {
    font-size: 1.2rem;
  }
  
  .legend-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .header-wrapper {
    padding: 1.5rem 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .stat-icon-wrapper {
    width: 55px;
    height: 55px;
  }
  
  .stat-icon-wrapper i {
    font-size: 1.3rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
  
  .day-card-header {
    flex-wrap: wrap;
  }
  
  .day-header-title {
    font-size: 1.1rem;
  }
  
  .mobile-class-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .mobile-class-title {
    width: 100%;
  }
  
  .mobile-time-badge {
    width: 100%;
    justify-content: center;
  }
  
  .legend-card {
    padding: 1rem;
  }
  
  .legend-indicator {
    width: 45px;
    height: 45px;
  }
  
  .legend-subject-name {
    font-size: 0.9rem;
  }
  
  .legend-subject-code {
    font-size: 0.8rem;
  }
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

.mobile-class-card {
  animation: fadeInUp 0.3s ease-out;
}

.mobile-class-card:nth-child(1) { animation-delay: 0.05s; }
.mobile-class-card:nth-child(2) { animation-delay: 0.1s; }
.mobile-class-card:nth-child(3) { animation-delay: 0.15s; }
.mobile-class-card:nth-child(4) { animation-delay: 0.2s; }
.mobile-class-card:nth-child(5) { animation-delay: 0.25s; }

.legend-card {
  animation: fadeInUp 0.3s ease-out;
}

.legend-card:nth-child(1) { animation-delay: 0.05s; }
.legend-card:nth-child(2) { animation-delay: 0.1s; }
.legend-card:nth-child(3) { animation-delay: 0.15s; }
.legend-card:nth-child(4) { animation-delay: 0.2s; }
.legend-card:nth-child(5) { animation-delay: 0.25s; }
.legend-card:nth-child(6) { animation-delay: 0.3s; }
.legend-card:nth-child(7) { animation-delay: 0.35s; }
.legend-card:nth-child(8) { animation-delay: 0.4s; }

/* Efecto de pulso en las tarjetas de stats */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.stat-card-schedule:hover .stat-icon-wrapper {
  animation: pulse 0.6s ease-in-out;
}
</style>

