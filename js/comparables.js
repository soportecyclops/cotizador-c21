/**
 * Gestor de Comparables para Cotizador Inmobiliario Century 21
 * Versión: 2.1
 * Descripción: Módulo para gestionar los comparables de mercado
 */

// Objeto global para el gestor de comparables
window.ComparablesManager = {
    // Estado del gestor
    currentEditingId: null,
    
    // Inicialización del gestor
    init: function() {
        console.log('Inicializando ComparablesManager...');
        this.setupEventListeners();
        console.log('ComparablesManager inicializado correctamente');
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botón de agregar comparable
        const addBtn = document.getElementById('btn-agregar-comparable');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }
        
        // Botón de guardar comparable
        const saveBtn = document.getElementById('btn-guardar-comparable');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveComparable());
        }
        
        // Botón de cancelar
        const cancelBtn = document.getElementById('btn-cancelar-comparable');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Cerrar modal con la X
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Cerrar modal haciendo clic fuera
        const modal = document.getElementById('modal-comparable');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Listener para cambios en el descuento de negociación
        const descuentoInput = document.getElementById('descuento-negociacion');
        if (descuentoInput) {
            descuentoInput.addEventListener('change', () => {
                if (window.CotizadorApp) {
                    window.CotizadorApp.calculateReferenceValue();
                }
            });
        }
    },
    
    // Abrir modal para agregar/editar comparable
    openModal: function(comparableId = null) {
        const modal = document.getElementById('modal-comparable');
        const modalTitle = document.getElementById('modal-title');
        
        if (!modal || !modalTitle) {
            console.error('Modal o título del modal no encontrado');
            return;
        }
        
        // Resetear formulario
        this.resetForm();
        
        if (comparableId) {
            // Modo edición
            modalTitle.textContent = 'Editar Comparable';
            this.currentEditingId = comparableId;
            this.loadComparableData(comparableId);
        } else {
            // Modo agregación
            modalTitle.textContent = 'Agregar Comparable';
            this.currentEditingId = null;
        }
        
        // Mostrar modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        
        // Enfocar primer campo
        setTimeout(() => {
            const firstField = document.getElementById('comp-tipo-propiedad');
            if (firstField) {
                firstField.focus();
            }
        }, 100);
    },
    
    // Cerrar modal
    closeModal: function() {
        const modal = document.getElementById('modal-comparable');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        
        this.currentEditingId = null;
        this.resetForm();
    },
    
    // Resetear formulario
    resetForm: function() {
        const form = document.getElementById('form-comparable');
        if (form) {
            form.reset();
        }
        
        // Limpiar errores
        document.querySelectorAll('#form-comparable .error').forEach(field => {
            field.classList.remove('error');
        });
    },
    
    // Cargar datos de un comparable en el formulario
    loadComparableData: function(comparableId) {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        const comparable = window.CotizadorApp.comparables.find(c => c.id === comparableId);
        if (!comparable) {
            console.error(`Comparable con ID ${comparableId} no encontrado`);
            return;
        }
        
        // Cargar datos en el formulario
        document.getElementById('comparable-id').value = comparable.id;
        document.getElementById('comp-tipo-propiedad').value = comparable.tipoPropiedad;
        document.getElementById('comp-precio').value = comparable.precio;
        document.getElementById('comp-direccion').value = comparable.direccion;
        document.getElementById('comp-numero').value = comparable.numero || '';
        document.getElementById('comp-piso').value = comparable.piso || '';
        document.getElementById('comp-depto').value = comparable.depto || '';
        document.getElementById('comp-localidad').value = comparable.localidad;
        document.getElementById('comp-barrio').value = comparable.barrio;
        document.getElementById('comp-antiguedad').value = comparable.antiguedad;
        document.getElementById('comp-calidad').value = comparable.calidad;
        document.getElementById('comp-sup-cubierta').value = comparable.supCubierta;
        document.getElementById('comp-sup-terreno').value = comparable.supTerreno || '';
        document.getElementById('comp-sup-semicubierta').value = comparable.supSemicubierta || '';
        document.getElementById('comp-sup-descubierta').value = comparable.supDescubierta || '';
        document.getElementById('comp-sup-balcon').value = comparable.supBalcon || '';
        document.getElementById('comp-cochera').value = comparable.cochera || 'no';
        document.getElementById('comp-observaciones').value = comparable.observaciones || '';
    },
    
    // Guardar comparable
    saveComparable: function() {
        if (!this.validateForm()) {
            return;
        }
        
        // Obtener datos del formulario
        const comparableData = this.getFormData();
        
        if (this.currentEditingId) {
            // Modo edición
            this.updateComparable(this.currentEditingId, comparableData);
        } else {
            // Modo agregación
            this.addComparable(comparableData);
        }
        
        this.closeModal();
    },
    
    // Validar formulario
    validateForm: function() {
        let isValid = true;
        const requiredFields = [
            'comp-tipo-propiedad', 'comp-precio', 'comp-direccion', 
            'comp-localidad', 'comp-barrio', 'comp-antiguedad', 
            'comp-calidad', 'comp-sup-cubierta'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field) {
                console.error(`Campo requerido no encontrado: #${fieldId}`);
                isValid = false;
                continue;
            }
            
            // Verificar si el campo tiene valor y si es un string, hacer trim
            let fieldValue = field.value;
            if (typeof fieldValue === 'string') {
                fieldValue = fieldValue.trim();
            }
            
            if (!fieldValue) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }
        
        if (!isValid) {
            if (window.CotizadorApp && window.CotizadorApp.showNotification) {
                window.CotizadorApp.showNotification('Por favor, complete todos los campos requeridos', 'error');
            } else {
                alert('Por favor, complete todos los campos requeridos');
            }
            return false;
        }
        
        // Validar que el precio sea mayor a cero
        const precioField = document.getElementById('comp-precio');
        const precio = parseFloat(precioField.value);
        if (isNaN(precio) || precio <= 0) {
            if (window.CotizadorApp && window.CotizadorApp.showNotification) {
                window.CotizadorApp.showNotification('El precio debe ser mayor a cero', 'error');
            } else {
                alert('El precio debe ser mayor a cero');
            }
            precioField.classList.add('error');
            return false;
        }
        
        // Validar que la superficie cubierta sea mayor a cero
        const supCubiertaField = document.getElementById('comp-sup-cubierta');
        const supCubierta = parseFloat(supCubiertaField.value);
        if (isNaN(supCubierta) || supCubierta <= 0) {
            if (window.CotizadorApp && window.CotizadorApp.showNotification) {
                window.CotizadorApp.showNotification('La superficie cubierta debe ser mayor a cero', 'error');
            } else {
                alert('La superficie cubierta debe ser mayor a cero');
            }
            supCubiertaField.classList.add('error');
            return false;
        }
        
        return true;
    },
    
    // Obtener datos del formulario
    getFormData: function() {
        return {
            id: this.currentEditingId || this.getNextId(),
            tipoPropiedad: document.getElementById('comp-tipo-propiedad').value,
            precio: parseFloat(document.getElementById('comp-precio').value),
            direccion: document.getElementById('comp-direccion').value,
            numero: document.getElementById('comp-numero').value,
            piso: document.getElementById('comp-piso').value,
            depto: document.getElementById('comp-depto').value,
            localidad: document.getElementById('comp-localidad').value,
            barrio: document.getElementById('comp-barrio').value,
            antiguedad: parseInt(document.getElementById('comp-antiguedad').value),
            calidad: document.getElementById('comp-calidad').value,
            supCubierta: parseFloat(document.getElementById('comp-sup-cubierta').value),
            supTerreno: parseFloat(document.getElementById('comp-sup-terreno').value) || 0,
            supSemicubierta: parseFloat(document.getElementById('comp-sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('comp-sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('comp-sup-balcon').value) || 0,
            cochera: document.getElementById('comp-cochera').value,
            observaciones: document.getElementById('comp-observaciones').value
        };
    },
    
    // Generar próximo ID para un comparable
    getNextId: function() {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            return 'comp-' + Date.now();
        }
        
        const maxId = window.CotizadorApp.comparables.reduce((max, comp) => {
            const idNum = parseInt(comp.id.replace('comp-', ''));
            return idNum > max ? idNum : max;
        }, 0);
        
        return 'comp-' + (maxId + 1);
    },
    
    // Agregar un nuevo comparable
    addComparable: function(comparableData) {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        window.CotizadorApp.comparables.push(comparableData);
        this.renderComparables();
        
        if (window.CotizadorApp.showNotification) {
            window.CotizadorApp.showNotification('Comparable agregado correctamente', 'success');
        }
        
        // Actualizar estado del botón siguiente
        this.updateNextButton();
    },
    
    // Actualizar un comparable existente
    updateComparable: function(id, comparableData) {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        const index = window.CotizadorApp.comparables.findIndex(c => c.id === id);
        if (index !== -1) {
            window.CotizadorApp.comparables[index] = comparableData;
            this.renderComparables();
            
            if (window.CotizadorApp.showNotification) {
                window.CotizadorApp.showNotification('Comparable actualizado correctamente', 'success');
            }
        }
    },
    
    // Eliminar un comparable
    deleteComparable: function(id) {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        if (confirm('¿Está seguro de que desea eliminar este comparable?')) {
            window.CotizadorApp.comparables = window.CotizadorApp.comparables.filter(c => c.id !== id);
            this.renderComparables();
            
            if (window.CotizadorApp.showNotification) {
                window.CotizadorApp.showNotification('Comparable eliminado correctamente', 'success');
            }
            
            // Actualizar estado del botón siguiente
            this.updateNextButton();
        }
    },
    
    // Renderizar la lista de comparables
    renderComparables: function() {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        const container = document.getElementById('comparables-container');
        const emptyState = document.getElementById('no-comparables');
        
        if (!container) {
            console.error('Contenedor de comparables no encontrado');
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        if (window.CotizadorApp.comparables.length === 0) {
            // Mostrar estado vacío
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            // Ocultar estado vacío
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Renderizar cada comparable
            window.CotizadorApp.comparables.forEach((comparable, index) => {
                const comparableElement = this.createComparableElement(comparable, index);
                container.appendChild(comparableElement);
            });
        }
        
        // Actualizar estado del botón siguiente
        this.updateNextButton();
    },
    
    // Crear elemento HTML para un comparable
    createComparableElement: function(comparable, index) {
        const div = document.createElement('div');
        div.className = 'comparable-item';
        div.setAttribute('data-id', comparable.id);
        
        // Calcular valor por m2
        const supTotal = comparable.supCubierta + 
                       (comparable.supSemicubierta || 0) * 0.5 + 
                       (comparable.supDescubierta || 0) * 0.2 + 
                       (comparable.supBalcon || 0) * 0.33;
        
        const valorM2 = comparable.precio / supTotal;
        
        div.innerHTML = `
            <div class="comparable-header">
                <h4>Comparable ${index + 1}</h4>
                <div class="comparable-actions">
                    <button class="btn-edit" onclick="ComparablesManager.openModal('${comparable.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="ComparablesManager.deleteComparable('${comparable.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="comparable-details">
                <div class="detail-row">
                    <span class="label">Tipo:</span>
                    <span class="value">${this.capitalizeFirst(comparable.tipoPropiedad)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Dirección:</span>
                    <span class="value">${comparable.direccion} ${comparable.numero || ''}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Barrio:</span>
                    <span class="value">${comparable.barrio}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Superficie:</span>
                    <span class="value">${comparable.supCubierta}m² cubiertos</span>
                </div>
                <div class="detail-row">
                    <span class="label">Precio:</span>
                    <span class="value">USD ${comparable.precio.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Valor m²:</span>
                    <span class="value">USD ${valorM2.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        `;
        
        return div;
    },
    
    // Actualizar estado del botón siguiente
    updateNextButton: function() {
        const nextButton = document.getElementById('btn-siguiente-2');
        if (!nextButton) return;
        
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            nextButton.disabled = true;
            return;
        }
        
        // Habilitar botón si hay al menos 4 comparables
        nextButton.disabled = window.CotizadorApp.comparables.length < 4;
    },
    
    // Capitalizar primera letra
    capitalizeFirst: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se inicialice CotizadorApp
    setTimeout(() => {
        if (window.ComparablesManager) {
            window.ComparablesManager.init();
        }
    }, 500);
});
