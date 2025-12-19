// Gestión de comparables
class ComparablesManager {
    constructor() {
        this.nextId = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateComparablesUI();
    }

    setupEventListeners() {
        document.getElementById('btn-agregar-comparable').addEventListener('click', () => {
            this.openComparableModal();
        });
        
        // Eventos del modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeComparableModal();
        });
        
        document.getElementById('btn-cancelar-comparable').addEventListener('click', () => {
            this.closeComparableModal();
        });
        
        document.getElementById('btn-guardar-comparable').addEventListener('click', () => {
            this.saveComparable();
        });
    }

    openComparableModal(comparableId = null) {
        const modal = document.getElementById('modal-comparable');
        const form = document.getElementById('form-comparable');
        form.reset();

        if (comparableId) {
            // Modo edición
            const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
            if (comparable) {
                document.getElementById('modal-title').textContent = 'Editar Comparable';
                document.getElementById('comparable-id').value = comparable.id;
                
                // Cargar datos del comparable en el formulario
                document.getElementById('comp-tipo-propiedad').value = comparable.tipoPropiedad;
                document.getElementById('comp-precio').value = comparable.precio;
                document.getElementById('comp-direccion').value = comparable.direccion;
                document.getElementById('comp-localidad').value = comparable.localidad;
                document.getElementById('comp-barrio').value = comparable.barrio;
                document.getElementById('comp-antiguedad').value = comparable.antiguedad;
                document.getElementById('comp-calidad').value = comparable.calidad;
                document.getElementById('comp-sup-cubierta').value = comparable.supCubierta;
                document.getElementById('comp-sup-terreno').value = comparable.supTerreno;
                document.getElementById('comp-cochera').value = comparable.cochera;
                document.getElementById('comp-observaciones').value = comparable.observaciones || '';
                
                // CORRECCIÓN: Cargar los valores de los campos adicionales
                if (comparable.supSemicubierta) document.getElementById('comp-sup-semicubierta').value = comparable.supSemicubierta;
                if (comparable.supDescubierta) document.getElementById('comp-sup-descubierta').value = comparable.supDescubierta;
                if (comparable.supBalcon) document.getElementById('comp-sup-balcon').value = comparable.supBalcon;
            }
        } else {
            // Modo agregación
            document.getElementById('modal-title').textContent = 'Agregar Comparable';
            document.getElementById('comparable-id').value = '';
        }
        
        // Mostrar modal
        modal.style.display = 'block';
    }

    closeComparableModal() {
        const modal = document.getElementById('modal-comparable');
        modal.style.display = 'none';
    }

    saveComparable() {
        const id = document.getElementById('comparable-id').value;
        const isEdit = id !== '';
        
        // CORRECCIÓN CLAVE: Buscar elementos DENTRO del modal
        const form = document.querySelector('#modal-comparable form');
        
        // CORRECCIÓN: Solo validar campos obligatorios realmente necesarios
        const requiredFields = [
            'comp-tipo-propiedad', 'comp-precio', 'comp-direccion', 
            'comp-localidad', 'comp-barrio', 'comp-antiguedad', 'comp-calidad', 'comp-sup-cubierta'
        ];
        
        for (const fieldId of requiredFields) {
            // CORRECCIÓN CLAVE: Buscar dentro del formulario del modal
            const field = form.querySelector(`#${fieldId}`);
            if (!field || !field.value || typeof field.value !== 'string' || !field.value.trim()) {
                window.tasacionApp.showNotification(`Por favor, complete todos los campos obligatorios (${fieldId})`, 'error');
                // CORRECCIÓN CLAVE: Enfocar el campo específico que faltó
                if (field) field.focus();
                return false;
            }
        }
        
        // Crear objeto comparable
        const comparable = {
            id: isEdit ? parseInt(id) : this.getNextId(),
            tipoPropiedad: document.getElementById('comp-tipo-propiedad').value,
            precio: parseFloat(document.getElementById('comp-precio').value),
            direccion: document.getElementById('comp-direccion').value,
            localidad: document.getElementById('comp-localidad').value,
            barrio: document.getElementById('comp-barrio').value,
            antiguedad: parseInt(document.getElementById('comp-antiguedad').value),
            calidad: document.getElementById('comp-calidad').value,
            supCubierta: parseFloat(document.getElementById('comp-sup-cubierta').value),
            supTerreno: parseFloat(document.getElementById('comp-sup-terreno').value) || 0,
            cochera: document.getElementById('comp-cochera').value,
            observaciones: document.getElementById('comp-observaciones').value,
            
            // CORRECCIÓN CLAVE: Capturar los valores de los nuevos campos
            supSemicubierta: parseFloat(document.getElementById('comp-sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('comp-sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('comp-sup-balcon').value) || 0
        };
        
        // Calcular valor por m²
        const precioAjustado = comparable.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
        comparable.valorM2 = precioAjustado / comparable.supCubierta;
        comparable.valorM2Ajustado = comparable.valorM2; // Inicialmente sin factores
        
        if (isEdit) {
            // Modo edición
            const index = window.tasacionApp.comparables.findIndex(c => c.id === comparable.id);
            if (index !== -1) {
                // Mantener factores de ajuste si ya existen
                const factoresExistentes = window.tasacionApp.comparables[index].factores;
                comparable.factores = factoresExistentes;
                
                // Recalcular valor ajustado si hay factores
                if (factoresExistentes && Object.keys(factoresExistentes).length > 0) {
                    const correccionTotal = Object.values(factoresExistentes).reduce((sum, val) => sum + val, 0);
                    comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
                }
                
                window.tasacionApp.comparables[index] = comparable;
            }
        } else {
            // Modo agregación
            comparable.factores = {}; // Inicialmente sin factores de ajuste
            window.tasacionApp.comparables.push(comparable);
        }
        
        // Actualizar UI
        this.updateComparablesUI();
        
        // Cerrar modal
        this.closeComparableModal();
        
        // Mostrar notificación
        window.tasacionApp.showNotification(
            isEdit ? 'Comparable actualizado correctamente' : 'Comparable agregado correctamente', 
            'success'
        );
    }

    getNextId() {
        if (window.tasacionApp.comparables.length === 0) {
            return 1;
        }
        const maxId = Math.max(...window.tasacionApp.comparables.map(c => c.id));
        return maxId + 1;
    }

    deleteComparable(comparableId) {
        if (confirm('¿Está seguro de que desea eliminar este comparable?')) {
            window.tasacionApp.comparables = window.tasacionApp.comparables.filter(c => c.id !== comparableId);
            this.updateComparablesUI();
            window.tasacionApp.showNotification('Comparable eliminado correctamente', 'success');
        }
    }

    updateComparablesUI() {
        const container = document.getElementById('comparables-container');
        const noComparables = document.getElementById('no-comparables');
        const siguienteBtn = document.getElementById('btn-siguiente-2');

        container.innerHTML = '';

        if (window.tasacionApp.comparables.length === 0) {
            noComparables.style.display = 'block';
            siguienteBtn.disabled = true;
        } else {
            noComparables.style.display = 'none';
            siguienteBtn.disabled = false;
        }

        window.tasacionApp.comparables.forEach(comparable => {
            const card = document.createElement('div');
            card.className = 'comparable-card';
            card.innerHTML = `
                <div class="comparable-header">
                    <h4>Comparable ${comparable.id}</h4>
                    <div class="comparable-actions">
                        <button class="btn-edit" onclick="window.comparablesManager.openComparableModal(${comparable.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="window.comparablesManager.deleteComparable(${comparable.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="comparable-body">
                    <p><i class="fas fa-map-marker-alt"></i> ${comparable.direccion}, ${comparable.barrio}</p>
                    <p><i class="fas fa-tag"></i> Precio: ${window.tasacionApp.formatCurrency(comparable.precio)}</p>
                    <p><i class="fas fa-ruler-combined"></i> Sup. Cubierta: ${comparable.supCubierta} m²</p>
                    <p><i class="fas fa-calculator"></i> Valor m²: ${window.tasacionApp.formatCurrency(comparable.valorM2Ajustado)}/m²</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    reset() {
        // Este método ahora no limpia los datos, solo la UI.
        // El estado real (this.comparables) se maneja en TasacionApp.resetForm()
        this.updateComparablesUI();
    }
}

// Inicializar el gestor de comparables
document.addEventListener('DOMContentLoaded', () => {
    window.comparablesManager = new ComparablesManager();
});
