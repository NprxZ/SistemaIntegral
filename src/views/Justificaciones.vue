<template>
  <div class="asistencias-container">
    <div class="container py-5">
      <!-- Header Moderno -->
      <div class="header-section mb-5">
        <div class="header-wrapper">
          <div class="header-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="header-content">
            <h1 class="page-title">Control de Asistencias</h1>
            <p class="page-subtitle">
              <i class="fas fa-calendar-check me-2"></i>
              Semestre Agosto - Diciembre 2024
            </p>
          </div>
        </div>
      </div>

      <!-- Estadísticas Generales -->
      <div class="stats-grid mb-4">
        <div class="stat-card-attendance present">
          <div class="stat-icon-wrapper">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ totalAsistencias }}</div>
            <div class="stat-label">Asistencias</div>
            <div class="stat-percentage">{{ porcentajeAsistencia }}%</div>
          </div>
        </div>

        <div class="stat-card-attendance absent">
          <div class="stat-icon-wrapper">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ totalFaltas }}</div>
            <div class="stat-label">Faltas</div>
            <div class="stat-percentage">{{ porcentajeFaltas }}%</div>
          </div>
        </div>

        <div class="stat-card-attendance justified">
          <div class="stat-icon-wrapper">
            <i class="fas fa-file-medical"></i>
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ faltasJustificadas }}</div>
            <div class="stat-label">Justificadas</div>
            <div class="stat-badge" :class="getJustificationStatus()">
              {{ getJustificationText() }}
            </div>
          </div>
        </div>

        <div class="stat-card-attendance tardy">
          <div class="stat-icon-wrapper">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ totalRetardos }}</div>
            <div class="stat-label">Retardos</div>
            <div class="stat-note">3 retardos = 1 falta</div>
          </div>
        </div>
      </div>

      <!-- Alertas de Riesgo -->
      <div v-if="hasRiskAlerts()" class="alert-section mb-4">
        <div class="risk-alert" v-for="alert in getRiskAlerts()" :key="alert.materia">
          <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="alert-content">
            <h4>{{ alert.titulo }}</h4>
            <p>{{ alert.mensaje }}</p>
          </div>
          <div class="alert-action">
            <button @click="openJustificationModal(alert.materia)" class="btn-justify-quick">
              <i class="fas fa-file-upload me-2"></i>
              Justificar
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filters-section mb-4">
        <div class="filters-header">
          <h3><i class="fas fa-sliders-h me-2"></i>Filtros</h3>
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
                  placeholder="Buscar materia..."
                />
              </div>
            </div>
            <div class="col-lg-3 col-md-6">
              <select v-model="filterStatus" class="filter-select">
                <option value="">📊 Todos los estados</option>
                <option value="critico">⚠️ Estado Crítico</option>
                <option value="advertencia">⚡ Advertencia</option>
                <option value="normal">✅ Normal</option>
              </select>
            </div>
            <div class="col-lg-3 col-md-6">
              <select v-model="filterMonth" class="filter-select">
                <option value="">📅 Todos los meses</option>
                <option value="Agosto">Agosto</option>
                <option value="Septiembre">Septiembre</option>
                <option value="Octubre">Octubre</option>
                <option value="Noviembre">Noviembre</option>
              </select>
            </div>
            <div class="col-lg-2 col-md-6">
              <button @click="clearFilters" class="btn-clear">
                <i class="fas fa-eraser me-2"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Materias con Asistencias -->
      <div class="materias-list">
        <div v-for="materia in filteredMaterias" :key="materia.id" class="materia-card">
          <div class="materia-header" @click="toggleMateria(materia.id)">
            <div class="materia-info">
              <div class="materia-title-wrapper">
                <div class="materia-icon" :class="getStatusClass(materia)">
                  <i class="fas fa-book"></i>
                </div>
                <div class="materia-text">
                  <h3>{{ materia.nombre }}</h3>
                  <p>{{ materia.profesor }} • Grupo {{ materia.grupo }}</p>
                </div>
              </div>
              <div class="materia-stats">
                <div class="mini-stat success">
                  <i class="fas fa-check"></i>
                  <span>{{ materia.asistencias }}</span>
                </div>
                <div class="mini-stat danger">
                  <i class="fas fa-times"></i>
                  <span>{{ materia.faltas }}</span>
                </div>
                <div class="mini-stat warning">
                  <i class="fas fa-clock"></i>
                  <span>{{ materia.retardos }}</span>
                </div>
                <div class="progress-mini">
                  <div class="progress-bar-mini" :style="{ width: materia.porcentaje + '%' }"></div>
                </div>
                <span class="percentage-text" :class="getPercentageClass(materia.porcentaje)">
                  {{ materia.porcentaje }}%
                </span>
              </div>
            </div>
            <div class="toggle-icon" :class="{ active: openMaterias.includes(materia.id) }">
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <transition name="expand">
            <div v-show="openMaterias.includes(materia.id)" class="materia-content">
              <!-- Calendario de Asistencias -->
              <div class="attendance-calendar mb-4">
                <h4 class="calendar-title">
                  <i class="fas fa-calendar-alt me-2"></i>
                  Registro de Asistencias
                </h4>
                <div class="calendar-grid">
                  <div 
                    v-for="(registro, idx) in materia.registros" 
                    :key="idx"
                    class="calendar-item"
                    :class="registro.tipo"
                    @click="showAttendanceDetail(registro)"
                  >
                    <div class="calendar-date">
                      <span class="day">{{ registro.dia }}</span>
                      <span class="month">{{ registro.mes }}</span>
                    </div>
                    <div class="calendar-icon">
                      <i :class="getAttendanceIcon(registro.tipo)"></i>
                    </div>
                    <div class="calendar-label">{{ registro.etiqueta }}</div>
                  </div>
                </div>
              </div>

              <!-- Tabla Detallada -->
              <div class="table-section">
                <h4 class="table-title">
                  <i class="fas fa-list me-2"></i>
                  Detalle de Registros
                </h4>
                <div class="table-wrapper">
                  <table class="table-attendance">
                    <thead>
                      <tr>
                        <th><i class="fas fa-calendar me-2"></i>Fecha</th>
                        <th><i class="fas fa-clock me-2"></i>Hora</th>
                        <th><i class="fas fa-info-circle me-2"></i>Estado</th>
                        <th><i class="fas fa-comment me-2"></i>Observaciones</th>
                        <th><i class="fas fa-cog me-2"></i>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(registro, idx) in materia.registros" :key="idx">
                        <td>
                          <div class="date-cell">
                            <i class="fas fa-calendar-day"></i>
                            <span>{{ registro.fecha }}</span>
                          </div>
                        </td>
                        <td>
                          <div class="time-cell">
                            <i class="fas fa-clock"></i>
                            <span>{{ registro.hora }}</span>
                          </div>
                        </td>
                        <td>
                          <div class="status-badge" :class="registro.tipo">
                            <i :class="getAttendanceIcon(registro.tipo)"></i>
                            <span>{{ registro.etiqueta }}</span>
                          </div>
                        </td>
                        <td>
                          <div class="observation-cell">
                            {{ registro.observaciones }}
                            <span v-if="registro.justificacion" class="justified-tag">
                              <i class="fas fa-check-circle"></i>
                              Justificada
                            </span>
                          </div>
                        </td>
                        <td>
                          <div class="actions-cell">
                            <button 
                              v-if="registro.tipo === 'falta' && !registro.justificacion"
                              @click="openJustificationModal(materia.nombre, registro)"
                              class="btn-action justify"
                              title="Justificar falta"
                            >
                              <i class="fas fa-file-medical"></i>
                            </button>
                            <button 
                              v-if="registro.justificacion"
                              @click="viewJustification(registro.justificacion)"
                              class="btn-action view"
                              title="Ver justificación"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            <button 
                              @click="downloadAttendanceRecord(registro)"
                              class="btn-action download"
                              title="Descargar comprobante"
                            >
                              <i class="fas fa-download"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Botón para justificar faltas múltiples -->
              <div class="bulk-actions" v-if="materia.faltas > 0">
                <button @click="openJustificationModal(materia.nombre)" class="btn-bulk-justify">
                  <i class="fas fa-file-upload me-2"></i>
                  Justificar Faltas de esta Materia
                  <span class="badge-count">{{ materia.faltas - (materia.faltasJustificadas || 0) }}</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Modal de Justificación -->
      <div v-if="showJustificationModal" class="modal-overlay" @click.self="closeJustificationModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>
              <i class="fas fa-file-medical me-2"></i>
              Justificar Falta
            </h3>
            <button @click="closeJustificationModal" class="btn-close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>
                <i class="fas fa-book me-2"></i>
                Materia
              </label>
              <input type="text" :value="currentMateria" readonly class="form-input disabled">
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-list me-2"></i>
                Motivo de la Falta *
              </label>
              <select v-model="justificationForm.motivo" class="form-select" required>
                <option value="">Selecciona un motivo</option>
                <option value="medico">Consulta Médica</option>
                <option value="enfermedad">Enfermedad</option>
                <option value="emergencia">Emergencia Familiar</option>
                <option value="tramite">Trámite Oficial</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-align-left me-2"></i>
                Descripción *
              </label>
              <textarea 
                v-model="justificationForm.descripcion" 
                class="form-textarea"
                rows="4"
                placeholder="Describe brevemente el motivo de tu ausencia..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-paperclip me-2"></i>
                Evidencia (PDF, Imagen) *
              </label>
              <div class="file-upload-area" @click="triggerFileInput">
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileUpload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display: none;"
                >
                <div v-if="!justificationForm.archivo" class="file-upload-empty">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Haz clic para subir archivo</p>
                  <span>PDF, JPG, PNG (Max 5MB)</span>
                </div>
                <div v-else class="file-upload-preview">
                  <i :class="getFileIcon(justificationForm.archivo.name)"></i>
                  <div class="file-info">
                    <p>{{ justificationForm.archivo.name }}</p>
                    <span>{{ formatFileSize(justificationForm.archivo.size) }}</span>
                  </div>
                  <button @click.stop="removeFile" class="btn-remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="info-box">
              <i class="fas fa-info-circle"></i>
              <div>
                <strong>Importante:</strong>
                <p>Tu justificación será revisada por el docente o coordinación. Recibirás una notificación cuando sea aprobada o rechazada.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeJustificationModal" class="btn-secondary">
              <i class="fas fa-times me-2"></i>
              Cancelar
            </button>
            <button @click="submitJustification" class="btn-primary" :disabled="!isFormValid()">
              <i class="fas fa-paper-plane me-2"></i>
              Enviar Justificación
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Detalle de Justificación -->
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-container detail-modal">
          <div class="modal-header">
            <h3>
              <i class="fas fa-file-alt me-2"></i>
              Detalle de Justificación
            </h3>
            <button @click="closeDetailModal" class="btn-close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="justification-detail">
              <div class="detail-row">
                <div class="detail-label">
                  <i class="fas fa-calendar me-2"></i>
                  Fecha de Falta
                </div>
                <div class="detail-value">{{ currentJustification.fecha }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <i class="fas fa-list me-2"></i>
                  Motivo
                </div>
                <div class="detail-value">{{ currentJustification.motivo }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <i class="fas fa-align-left me-2"></i>
                  Descripción
                </div>
                <div class="detail-value">{{ currentJustification.descripcion }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <i class="fas fa-paperclip me-2"></i>
                  Evidencia
                </div>
                <div class="detail-value">
                  <a :href="currentJustification.archivo" class="file-link" target="_blank">
                    <i class="fas fa-file-pdf me-2"></i>
                    Ver documento adjunto
                  </a>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <i class="fas fa-clock me-2"></i>
                  Fecha de Envío
                </div>
                <div class="detail-value">{{ currentJustification.fechaEnvio }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <i class="fas fa-info-circle me-2"></i>
                  Estado
                </div>
                <div class="detail-value">
                  <span class="status-tag" :class="currentJustification.estado">
                    <i :class="getStatusIconJustification(currentJustification.estado)"></i>
                    {{ getStatusTextJustification(currentJustification.estado) }}
                  </span>
                </div>
              </div>
              <div v-if="currentJustification.comentarioDocente" class="detail-row full">
                <div class="detail-label">
                  <i class="fas fa-comment me-2"></i>
                  Comentario del Docente
                </div>
                <div class="detail-value comment">
                  {{ currentJustification.comentarioDocente }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDetailModal" class="btn-secondary">
              <i class="fas fa-times me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Mis Justificaciones -->
      <div class="justifications-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-folder-open me-2"></i>
            Mis Justificaciones
          </h3>
          <span class="count-badge">{{ justificaciones.length }}</span>
        </div>
        <div class="justifications-grid">
          <div v-for="just in justificaciones" :key="just.id" class="justification-card" :class="just.estado">
            <div class="justification-header">
              <div class="justification-icon" :class="just.estado">
                <i :class="getStatusIconJustification(just.estado)"></i>
              </div>
              <div class="justification-info">
                <h4>{{ just.materia }}</h4>
                <p>{{ just.fecha }}</p>
              </div>
              <span class="status-pill" :class="just.estado">
                {{ getStatusTextJustification(just.estado) }}
              </span>
            </div>
            <div class="justification-body">
              <div class="info-row">
                <i class="fas fa-list"></i>
                <span>{{ just.motivo }}</span>
              </div>
              <div class="info-row">
                <i class="fas fa-calendar"></i>
                <span>Enviado: {{ just.fechaEnvio }}</span>
              </div>
            </div>
            <div class="justification-footer">
              <button @click="viewJustification(just)" class="btn-view">
                <i class="fas fa-eye me-2"></i>
                Ver Detalle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'Asistencias',
  setup() {
    // Estados reactivos
    const searchQuery = ref('');
    const filterStatus = ref('');
    const filterMonth = ref('');
    const openMaterias = ref([1]); // Primer materia abierta por defecto
    const showJustificationModal = ref(false);
    const showDetailModal = ref(false);
    const currentMateria = ref('');
    const currentRegistro = ref(null);
    const currentJustification = ref(null);
    const fileInput = ref(null);

    const justificationForm = ref({
      motivo: '',
      descripcion: '',
      archivo: null
    });

    // Datos simulados de materias con asistencias
    const materias = ref([
      {
        id: 1,
        nombre: 'Desarrollo de Aplicaciones Web',
        profesor: 'Dr. Juan Carlos Méndez',
        grupo: 'A',
        asistencias: 28,
        faltas: 5,
        retardos: 3,
        porcentaje: 84,
        faltasJustificadas: 2,
        registros: [
          { fecha: '15/11/2024', hora: '07:00', tipo: 'asistencia', etiqueta: 'Asistencia', dia: '15', mes: 'Nov', observaciones: 'Asistencia puntual' },
          { fecha: '14/11/2024', hora: '07:00', tipo: 'asistencia', etiqueta: 'Asistencia', dia: '14', mes: 'Nov', observaciones: 'Asistencia puntual' },
          { fecha: '13/11/2024', hora: '07:15', tipo: 'retardo', etiqueta: 'Retardo', dia: '13', mes: 'Nov', observaciones: 'Llegada 15 minutos tarde' },
          { fecha: '12/11/2024', hora: '-', tipo: 'falta', etiqueta: 'Falta', dia: '12', mes: 'Nov', observaciones: 'Sin justificación', justificacion: null }
        ]
      },
      {
        id: 5,
        nombre: 'Programación Orientada a Objetos',
        profesor: 'M.C. Luis Fernando García',
        grupo: 'A',
        asistencias: 29,
        faltas: 4,
        retardos: 2,
        porcentaje: 88,
        faltasJustificadas: 1,
        registros: [
          { fecha: '15/11/2024', hora: '15:00', tipo: 'asistencia', etiqueta: 'Asistencia', dia: '15', mes: 'Nov', observaciones: 'Asistencia puntual' },
          { fecha: '14/11/2024', hora: '15:00', tipo: 'asistencia', etiqueta: 'Asistencia', dia: '14', mes: 'Nov', observaciones: 'Asistencia puntual' },
          { fecha: '13/11/2024', hora: '-', tipo: 'falta', etiqueta: 'Falta', dia: '13', mes: 'Nov', observaciones: 'Sin justificación', justificacion: null },
          { fecha: '12/11/2024', hora: '15:10', tipo: 'retardo', etiqueta: 'Retardo', dia: '12', mes: 'Nov', observaciones: 'Llegada 10 minutos tarde' },
          { fecha: '11/11/2024', hora: '15:00', tipo: 'asistencia', etiqueta: 'Asistencia', dia: '11', mes: 'Nov', observaciones: 'Excelente participación' }
        ]
      }
    ]);

    // Justificaciones enviadas
    const justificaciones = ref([
      {
        id: 1,
        materia: 'Desarrollo de Aplicaciones Web',
        fecha: '11/11/2024',
        motivo: 'Consulta Médica',
        descripcion: 'Cita médica programada',
        archivo: '#',
        fechaEnvio: '11/11/2024 14:30',
        estado: 'aprobada',
        comentarioDocente: 'Justificación aprobada. Favor de presentar trabajos pendientes.'
      },
      {
        id: 2,
        materia: 'Cálculo Diferencial',
        fecha: '12/11/2024',
        motivo: 'Trámite Oficial',
        descripcion: 'Trámite de titulación en servicios escolares',
        archivo: '#',
        fechaEnvio: '12/11/2024 10:15',
        estado: 'aprobada',
        comentarioDocente: 'Aprobado. Presenta el comprobante en la próxima clase.'
      },
      {
        id: 3,
        materia: 'Base de Datos',
        fecha: '11/11/2024',
        motivo: 'Enfermedad',
        descripcion: 'Problemas de salud - Gripe',
        archivo: '#',
        fechaEnvio: '12/11/2024 08:00',
        estado: 'pendiente',
        comentarioDocente: null
      },
      {
        id: 4,
        materia: 'Desarrollo de Aplicaciones Web',
        fecha: '05/11/2024',
        motivo: 'Emergencia Familiar',
        descripcion: 'Situación familiar urgente que requirió atención',
        archivo: '#',
        fechaEnvio: '06/11/2024 09:30',
        estado: 'rechazada',
        comentarioDocente: 'La evidencia presentada no es válida. Por favor, presenta un documento oficial.'
      }
    ]);

    // Computed properties
    const totalAsistencias = computed(() => {
      return materias.value.reduce((sum, m) => sum + m.asistencias, 0);
    });

    const totalFaltas = computed(() => {
      return materias.value.reduce((sum, m) => sum + m.faltas, 0);
    });

    const totalRetardos = computed(() => {
      return materias.value.reduce((sum, m) => sum + m.retardos, 0);
    });

    const faltasJustificadas = computed(() => {
      return materias.value.reduce((sum, m) => sum + (m.faltasJustificadas || 0), 0);
    });

    const porcentajeAsistencia = computed(() => {
      const total = totalAsistencias.value + totalFaltas.value;
      return total > 0 ? Math.round((totalAsistencias.value / total) * 100) : 0;
    });

    const porcentajeFaltas = computed(() => {
      const total = totalAsistencias.value + totalFaltas.value;
      return total > 0 ? Math.round((totalFaltas.value / total) * 100) : 0;
    });

    const filteredMaterias = computed(() => {
      return materias.value.filter(materia => {
        const matchesSearch = !searchQuery.value || 
          materia.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          materia.profesor.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        let matchesStatus = true;
        if (filterStatus.value === 'critico') {
          matchesStatus = materia.porcentaje < 70;
        } else if (filterStatus.value === 'advertencia') {
          matchesStatus = materia.porcentaje >= 70 && materia.porcentaje < 85;
        } else if (filterStatus.value === 'normal') {
          matchesStatus = materia.porcentaje >= 85;
        }
        
        return matchesSearch && matchesStatus;
      });
    });

    // Methods
    const toggleMateria = (id) => {
      const index = openMaterias.value.indexOf(id);
      if (index > -1) {
        openMaterias.value.splice(index, 1);
      } else {
        openMaterias.value.push(id);
      }
    };

    const clearFilters = () => {
      searchQuery.value = '';
      filterStatus.value = '';
      filterMonth.value = '';
    };

    const getStatusClass = (materia) => {
      if (materia.porcentaje >= 85) return 'status-good';
      if (materia.porcentaje >= 70) return 'status-warning';
      return 'status-danger';
    };

    const getPercentageClass = (percentage) => {
      if (percentage >= 85) return 'good';
      if (percentage >= 70) return 'warning';
      return 'danger';
    };

    const getAttendanceIcon = (tipo) => {
      const icons = {
        asistencia: 'fas fa-check-circle',
        falta: 'fas fa-times-circle',
        retardo: 'fas fa-clock',
        justificada: 'fas fa-file-medical'
      };
      return icons[tipo] || 'fas fa-question-circle';
    };

    const hasRiskAlerts = () => {
      return materias.value.some(m => m.porcentaje < 80);
    };

    const getRiskAlerts = () => {
      return materias.value
        .filter(m => m.porcentaje < 80)
        .map(m => ({
          materia: m.nombre,
          titulo: m.porcentaje < 70 ? '⚠️ Riesgo de Reprobar' : '⚡ Advertencia de Asistencia',
          mensaje: m.porcentaje < 70 
            ? `Tu asistencia es del ${m.porcentaje}%. Necesitas al menos 80% para aprobar. Tienes ${m.faltas - (m.faltasJustificadas || 0)} faltas sin justificar.`
            : `Tu asistencia es del ${m.porcentaje}%. Te recomendamos justificar tus faltas para mantener un buen registro.`
        }));
    };

    const getJustificationStatus = () => {
      const porcentaje = (faltasJustificadas.value / totalFaltas.value) * 100;
      if (porcentaje >= 70) return 'good';
      if (porcentaje >= 40) return 'warning';
      return 'danger';
    };

    const getJustificationText = () => {
      const porcentaje = (faltasJustificadas.value / totalFaltas.value) * 100;
      if (porcentaje >= 70) return 'Buen registro';
      if (porcentaje >= 40) return 'Mejorable';
      return 'Acción requerida';
    };

    const openJustificationModal = (materia, registro = null) => {
      currentMateria.value = materia;
      currentRegistro.value = registro;
      showJustificationModal.value = true;
      justificationForm.value = {
        motivo: '',
        descripcion: '',
        archivo: null
      };
    };

    const closeJustificationModal = () => {
      showJustificationModal.value = false;
      currentMateria.value = '';
      currentRegistro.value = null;
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('El archivo es demasiado grande. Máximo 5MB.');
          return;
        }
        justificationForm.value.archivo = file;
      }
    };

    const removeFile = () => {
      justificationForm.value.archivo = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const getFileIcon = (filename) => {
      const ext = filename.split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'fas fa-file-pdf';
      if (['jpg', 'jpeg', 'png'].includes(ext)) return 'fas fa-file-image';
      return 'fas fa-file';
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const isFormValid = () => {
      return justificationForm.value.motivo && 
             justificationForm.value.descripcion && 
             justificationForm.value.archivo;
    };

    const submitJustification = () => {
      if (!isFormValid()) {
        alert('Por favor completa todos los campos requeridos.');
        return;
      }

      // Simular envío
      alert('✅ Justificación enviada correctamente. Recibirás una notificación cuando sea revisada.');
      
      // Agregar a la lista de justificaciones
      justificaciones.value.unshift({
        id: Date.now(),
        materia: currentMateria.value,
        fecha: currentRegistro.value?.fecha || new Date().toLocaleDateString('es-MX'),
        motivo: justificationForm.value.motivo,
        descripcion: justificationForm.value.descripcion,
        archivo: '#',
        fechaEnvio: new Date().toLocaleString('es-MX'),
        estado: 'pendiente',
        comentarioDocente: null
      });

      closeJustificationModal();
    };

    const viewJustification = (justification) => {
      currentJustification.value = justification;
      showDetailModal.value = true;
    };

    const closeDetailModal = () => {
      showDetailModal.value = false;
      currentJustification.value = null;
    };

    const getStatusIconJustification = (estado) => {
      const icons = {
        aprobada: 'fas fa-check-circle',
        pendiente: 'fas fa-clock',
        rechazada: 'fas fa-times-circle'
      };
      return icons[estado] || 'fas fa-question-circle';
    };

    const getStatusTextJustification = (estado) => {
      const texts = {
        aprobada: 'Aprobada',
        pendiente: 'En Revisión',
        rechazada: 'Rechazada'
      };
      return texts[estado] || 'Desconocido';
    };

    const showAttendanceDetail = (registro) => {
      if (registro.justificacion) {
        viewJustification(registro.justificacion);
      }
    };

    const downloadAttendanceRecord = (registro) => {
      alert('Descargando comprobante de asistencia del ' + registro.fecha);
    };

    return {
      searchQuery,
      filterStatus,
      filterMonth,
      openMaterias,
      showJustificationModal,
      showDetailModal,
      currentMateria,
      currentRegistro,
      currentJustification,
      fileInput,
      justificationForm,
      materias,
      justificaciones,
      totalAsistencias,
      totalFaltas,
      totalRetardos,
      faltasJustificadas,
      porcentajeAsistencia,
      porcentajeFaltas,
      filteredMaterias,
      toggleMateria,
      clearFilters,
      getStatusClass,
      getPercentageClass,
      getAttendanceIcon,
      hasRiskAlerts,
      getRiskAlerts,
      getJustificationStatus,
      getJustificationText,
      openJustificationModal,
      closeJustificationModal,
      triggerFileInput,
      handleFileUpload,
      removeFile,
      getFileIcon,
      formatFileSize,
      isFormValid,
      submitJustification,
      viewJustification,
      closeDetailModal,
      getStatusIconJustification,
      getStatusTextJustification,
      showAttendanceDetail,
      downloadAttendanceRecord
    };
  }
};
</script>

<style scoped>
/* Container principal */
.asistencias-container {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding-top: 2rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* Asegurar que el container tenga el ancho correcto */
.asistencias-container .container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
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
  position: relative;
  z-index: 1;
}

.header-icon i {
  font-size: 2.5rem;
  color: white;
}

.header-content {
  flex: 1;
  position: relative;
  z-index: 1;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card-attendance {
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

.stat-card-attendance:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.stat-card-attendance.present {
  border-left-color: #28a745;
}

.stat-card-attendance.absent {
  border-left-color: #dc3545;
}

.stat-card-attendance.justified {
  border-left-color: #17a2b8;
}

.stat-card-attendance.tardy {
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

.stat-card-attendance.present .stat-icon-wrapper {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card-attendance.absent .stat-icon-wrapper {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.stat-card-attendance.justified .stat-icon-wrapper {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-card-attendance.tardy .stat-icon-wrapper {
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
  margin-bottom: 0.5rem;
}

.stat-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0a5f38;
}

.stat-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 0.5rem;
}

.stat-badge.good {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.stat-badge.warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.stat-badge.danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.stat-note {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
  margin-top: 0.5rem;
}

/* Risk Alerts */
.alert-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.risk-alert {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  border-left: 5px solid #ffc107;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon i {
  font-size: 1.8rem;
  color: white;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.5rem 0;
}

.alert-content p {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.alert-action {
  flex-shrink: 0;
}

.btn-justify-quick {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-justify-quick:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(10, 95, 56, 0.3);
}

/* Filters Section */
.filters-section {
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

.btn-clear {
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

.btn-clear:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
}

/* Materias List */
.materias-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.materia-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.materia-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.materia-header {
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

.materia-header::before {
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

.materia-header:hover::before {
  transform: translateX(100%);
}

.materia-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.materia-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.materia-icon {
  width: 55px;
  height: 55px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.materia-icon.status-good {
  background: rgba(40, 167, 69, 0.2);
}

.materia-icon.status-warning {
  background: rgba(255, 193, 7, 0.2);
}

.materia-icon.status-danger {
  background: rgba(220, 53, 69, 0.2);
}

.materia-icon i {
  font-size: 1.5rem;
  color: white;
}

.materia-text h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.materia-text p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.materia-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.mini-stat {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 0.875rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mini-stat i {
  font-size: 0.9rem;
}

.mini-stat.success i {
  color: #20c997;
}

.mini-stat.danger i {
  color: #ff6b6b;
}

.mini-stat.warning i {
  color: #ffd43b;
}

.mini-stat span {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.progress-mini {
  flex: 1;
  min-width: 150px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-mini {
  height: 100%;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  border-radius: 10px;
  transition: width 0.6s ease;
}

.percentage-text {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 50px;
  text-align: right;
}

.percentage-text.good {
  color: #20c997;
}

.percentage-text.warning {
  color: #ffd43b;
}

.percentage-text.danger {
  color: #ff6b6b;
}

.toggle-icon {
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
  position: relative;
  z-index: 1;
}

.toggle-icon i {
  color: white;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.toggle-icon.active i {
  transform: rotate(180deg);
}

.toggle-icon:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Materia Content */
.materia-content {
  padding: 2rem;
  background: #f8f9fa;
}

/* Attendance Calendar */
.attendance-calendar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.calendar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.calendar-title i {
  color: #0a5f38;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.calendar-item {
  background: #f8f9fa;
  border-radius: 0.875rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.calendar-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.calendar-item.asistencia {
  border-color: #28a745;
}

.calendar-item.asistencia:hover {
  background: rgba(40, 167, 69, 0.1);
}

.calendar-item.falta {
  border-color: #dc3545;
}

.calendar-item.falta:hover {
  background: rgba(220, 53, 69, 0.1);
}

.calendar-item.retardo {
  border-color: #ffc107;
}

.calendar-item.retardo:hover {
  background: rgba(255, 193, 7, 0.1);
}

.calendar-date {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calendar-date .day {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.calendar-date .month {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.calendar-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-item.asistencia .calendar-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.calendar-item.falta .calendar-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.calendar-item.retardo .calendar-icon {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.calendar-icon i {
  color: white;
  font-size: 1.1rem;
}

.calendar-label {
  font-size: 0.8rem;
  color: #495057;
  font-weight: 600;
  text-align: center;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.table-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.table-title i {
  color: #0a5f38;
}

.table-wrapper {
  overflow-x: auto;
}

.table-attendance {
  width: 100%;
  border-collapse: collapse;
}

.table-attendance thead {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.table-attendance thead th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.table-attendance thead th i {
  color: #0a5f38;
  margin-right: 0.5rem;
}

.table-attendance tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f5;
}

.table-attendance tbody tr:hover {
  background: #f8f9fa;
}

.table-attendance tbody td {
  padding: 1rem;
  vertical-align: middle;
}

.date-cell, .time-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-weight: 500;
}

.date-cell i, .time-cell i {
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.status-badge.asistencia {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.status-badge.falta {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.status-badge.retardo {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: white;
}

.observation-cell {
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.4;
}

.justified-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 35px;
  height: 35px;
  border-radius: 0.5rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-action i {
  font-size: 0.9rem;
  color: white;
}

.btn-action.justify {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
}

.btn-action.justify:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 95, 56, 0.3);
}

.btn-action.view {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.btn-action.view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.btn-action.download {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

.btn-action.download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* Bulk Actions */
.bulk-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-bulk-justify {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  border: none;
  border-radius: 0.875rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 15px rgba(10, 95, 56, 0.3);
}

.btn-bulk-justify:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(10, 95, 56, 0.4);
}

.badge-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-weight: 700;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 1.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-container.detail-modal {
  max-width: 700px;
}

.modal-header {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 1.5rem 1.5rem 0 0;
}

.modal-header h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.modal-header h3 i {
  color: rgba(255, 255, 255, 0.9);
}

.btn-close-modal {
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.btn-close-modal i {
  color: white;
  font-size: 1.1rem;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.form-group label i {
  color: #0a5f38;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 0.875rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #212529;
  font-family: inherit;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #0a5f38;
  background: white;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
}

.form-input.disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.file-upload-area {
  border: 3px dashed #dee2e6;
  border-radius: 0.875rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.file-upload-area:hover {
  border-color: #0a5f38;
  background: rgba(10, 95, 56, 0.05);
}

.file-upload-empty i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

.file-upload-empty p {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 0.5rem 0;
}

.file-upload-empty span {
  font-size: 0.85rem;
  color: #6c757d;
}

.file-upload-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
}

.file-upload-preview i {
  font-size: 2.5rem;
  color: #0a5f38;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-info p {
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.25rem 0;
  word-break: break-all;
}

.file-info span {
  font-size: 0.85rem;
  color: #6c757d;
}

.btn-remove-file {
  width: 35px;
  height: 35px;
  background: #dc3545;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-remove-file:hover {
  background: #c82333;
  transform: scale(1.1);
}

.btn-remove-file i {
  color: white;
}

.info-box {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #2196f3;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 1rem;
}

.info-box i {
  font-size: 1.5rem;
  color: #1976d2;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.info-box strong {
  color: #0d47a1;
  display: block;
  margin-bottom: 0.5rem;
}

.info-box p {
  color: #1565c0;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-radius: 0 0 1.5rem 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 0.875rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(10, 95, 56, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
  transform: translateY(-2px);
}

/* Justification Detail */
.justification-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  align-items: start;
}

.detail-row.full {
  grid-template-columns: 1fr;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.detail-label i {
  color: #0a5f38;
}

.detail-value {
  color: #212529;
  font-size: 0.95rem;
}

.detail-value.comment {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #0a5f38;
  line-height: 1.6;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0a5f38;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 0.5rem;
}

.file-link:hover {
  color: #0d7d4d;
  transform: translateX(5px);
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-tag.aprobada {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.status-tag.pendiente {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.status-tag.rechazada {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

/* Justifications Section */
.justifications-section {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.section-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  display: flex;
  align-items: center;
}

.section-header h3 i {
  color: #0a5f38;
}

.count-badge {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.justifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.justification-card {
  background: #f8f9fa;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.justification-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.justification-card.aprobada {
  border-color: #28a745;
}

.justification-card.pendiente {
  border-color: #ffc107;
}

.justification-card.rechazada {
  border-color: #dc3545;
}

.justification-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
}

.justification-icon {
  width: 50px;
  height: 50px;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.justification-icon.aprobada {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.justification-icon.pendiente {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.justification-icon.rechazada {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.justification-icon i {
  color: white;
  font-size: 1.3rem;
}

.justification-info {
  flex: 1;
}

.justification-info h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.justification-info p {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0;
}

.status-pill {
  padding: 0.4rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.status-pill.aprobada {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.status-pill.pendiente {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.status-pill.rechazada {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.justification-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #495057;
  font-size: 0.9rem;
}

.info-row i {
  color: #0a5f38;
  font-size: 0.85rem;
  width: 16px;
}

.justification-footer {
  padding: 1rem 1.25rem;
  background: white;
  border-top: 1px solid #e9ecef;
}

.btn-view {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(10, 95, 56, 0.3);
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
  max-height: 3000px;
  opacity: 1;
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
  .asistencias-container {
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

  .stat-card-attendance {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .risk-alert {
    flex-direction: column;
    text-align: center;
  }

  .alert-action {
    width: 100%;
  }

  .btn-justify-quick {
    width: 100%;
    justify-content: center;
  }

  .materia-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .materia-stats {
    width: 100%;
    justify-content: center;
  }

  .toggle-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .calendar-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table-attendance {
    font-size: 0.85rem;
    min-width: 800px;
  }

  .justifications-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-width: 100%;
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .materia-text h3 {
    font-size: 1.1rem;
  }

  .calendar-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 0.75rem;
  }

  .calendar-item {
    padding: 0.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* Scrollbar personalizado */
.modal-container::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.modal-container::-webkit-scrollbar-track,
.table-wrapper::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.modal-container::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 10px;
}

.modal-container::-webkit-scrollbar-thumb:hover,
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0d7d4d 0%, #0a5f38 100%);
}

/* Animaciones adicionales */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.stat-card-attendance:hover .stat-icon-wrapper {
  animation: pulse 0.6s ease-in-out;
}

.justification-icon {
  animation: fadeIn 0.5s ease-out;
}

/* Estados de carga */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Efectos hover adicionales */
.calendar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.calendar-item:hover::before {
  transform: translateX(100%);
}

/* Tooltips personalizados */
[title] {
  position: relative;
}

/* Efecto de entrada para las tarjetas */
.materia-card {
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.materia-card:nth-child(1) { animation-delay: 0.1s; }
.materia-card:nth-child(2) { animation-delay: 0.2s; }
.materia-card:nth-child(3) { animation-delay: 0.3s; }
.materia-card:nth-child(4) { animation-delay: 0.4s; }

/* Mejoras visuales para estados */
.status-badge {
  position: relative;
  overflow: hidden;
}

.status-badge::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.status-badge:hover::after {
  width: 300px;
  height: 300px;
}

/* Estilos para impresión */
@media print {
  .header-section,
  .filters-section,
  .modal-overlay,
  .btn-action,
  .bulk-actions {
    display: none !important;
  }

  .materia-card {
    page-break-inside: avoid;
  }

  .table-attendance {
    font-size: 10pt;
  }
}
</style>



