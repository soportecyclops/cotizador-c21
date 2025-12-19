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
                document.getElementById('comp-sup-terreno').value = comparable.supTerreno || 0;
                document.getElementById('comp-cochera').value = comparable.cochera || 'no';
                document.getElementById('comp-observaciones').value = comparable.observaciones || '';
                
                // Cargar los valores de los campos adicionales
                document.getElementById('comp-sup-semicubierta').value = comparable.supSemicubierta || 0;
                document.getElementById('comp-sup-descubierta').value = comparable.supDescubierta || 0;
                document.getElementById('comp-sup-balcon').value = comparable.supBalcon || 0;
            }
        } else {
            // Modo agregación
            document.getElementById('modal-title').textContent = 'Agregar Comparable';
            document.getElementById('comparable-id').value = '';
            
            // Establecer valores por defecto para los campos opcionales
            document.getElementById('comp-sup-semicubierta').value = 0;
            document.getElementById('comp-sup-descubierta').value = 0;
            document.getElementById('comp-sup-balcon').value = 0;
            document.getElementById('comp-sup-terreno').value = 0;
            document.getElementById('comp-cochera').value = 'no';
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
        
        // CORRECCIÓN: Solo validar campos obligatorios realmente necesarios
        const requiredFields = [
            'comp-tipo-propiedad', 'comp-precio', 'comp-direccion', 
            'comp-localidad', 'comp-barrio', 'comp-antiguedad', 
            'comp-calidad', 'comp-sup-cubierta'
        ];
        
        // Validar campos obligatorios
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value || (typeof field.value === 'string' && !field.value.trim())) {
                window.tasacionApp.showNotification(`Por favor, complete todos los campos obligatorios (${fieldId})`, 'error');
                if (field) field.focus();
                return false;
            }
        }
        
        // CORRECCIÓN: Obtener todos los valores del formulario de manera consistente
        const getValue = (fieldId, defaultValue = 0) => {
            const field = document.getElementById(fieldId);
            if (!field) return defaultValue;
            
            // Para campos numéricos
            if (fieldId.includes('sup-') || fieldId === 'comp-precio' || fieldId === 'comp-antiguedad') {
                return parseFloat(field.value) || defaultValue;
            }
            
            // Para campos de texto
            return field.value || defaultValue;
        };
        
        // Crear objeto comparable con los datos del formulario
        const formData = {
            id: isEdit ? parseInt(id) : this.getNextId(),
            tipoPropiedad: getValue('comp-tipo-propiedad', ''),
            precio: getValue('comp-precio'),
            direccion: getValue('comp-direccion', ''),
            localidad: getValue('comp-localidad', ''),
            barrio: getValue('comp-barrio', ''),
            antiguedad: getValue('comp-antiguedad'),
            calidad: getValue('comp-calidad', ''),
            supCubierta: getValue('comp-sup-cubierta'),
            supTerreno: getValue('comp-sup-terreno'),
            cochera: getValue('comp-cochera', 'no'),
            observaciones: getValue('comp-observaciones', ''),
            supSemicubierta: getValue('comp-sup-semicubierta'),
            supDescubierta: getValue('comp-sup-descubierta'),
            supBalcon: getValue('comp-sup-balcon')
        };

        // --- INICIO DE DIAGNÓSTICO ---
        console.log("DIAGNÓSTICO: Datos leídos del formulario:", formData);
        // --- FIN DE DIAGNÓSTICO ---

        if (isEdit) {
            // Modo edición
            const index = window.tasacionApp.comparables.findIndex(c => c.id === formData.id);
            if (index !== -1) {
                // Mantener factores de ajuste si ya existen
                const factoresExistentes = window.tasacionApp.comparables[index].factores || {};
                formData.factores = factoresExistentes;
                
                // Calcular valores
                const precioAjustado = formData.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
                formData.valorM2 = precioAjustado / formData.supCubierta;
                
                const correccionTotal = Object.values(factoresExistentes).reduce((sum, val) => sum + val, 0);
                formData.valorM2Ajustado = formData.valorM2 * (1 + correccionTotal / 100);

                // --- INICIO DE DIAGNÓSTICO ---
                console.log("DIAGNÓSTICO: Objeto a guardar (edición):", formData);
                // --- FIN DE DIAGNÓSTICO ---

                // SOLUCIÓN CLAVE: Reemplazar el objeto en el array para asegurar que la referencia se actualice
                window.tasacionApp.comparables[index] = formData;
            }
        } else {
            // Modo agregación
            formData.factores = {}; // Inicialmente sin factores de ajuste
            
            // Calcular valores
            const precioAjustado = formData.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
            formData.valorM2 = precioAjustado / formData.supCubierta;
            formData.valorM2Ajustado = formData.valorM2;

            // --- INICIO DE DIAGNÓSTICO ---
            console.log("DIAGNÓSTICO: Objeto a guardar (agregado):", formData);
            // --- FIN DE DIAGNÓSTICO ---

            window.tasacionApp.comparables.push(formData);
        }
        
        // --- INICIO DE DIAGNÓSTICO ---
        console.log("DIAGNÓSTICO: Estado del array de comparables después de guardar:", window.tasacionApp.comparables);
        // --- FIN DE DIAGNÓSTICO ---
        
        // Actualizar UI
        this.updateComparablesUI();
        
        // Cerrar modal
        this.closeComparableModal();
        
        // Mostrar notificación
        window.tasacionApp.showNotification(
            isEdit ? 'Comparable actualizado correctamente' : 'Comparable agregado correctamente', 
            'success'
        );
        
        return true;
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

        // --- INICIO DE DIAGNÓSTICO ---
        console.log("DIAGNÓSTICO: updateComparablesUI llamado. Estado actual del array:", window.tasacionApp.comparables);
        // --- FIN DE DIAGNÓSTICO ---

        container.innerHTML = '';

        if (window.tasacionApp.comparables.length === 0) {
            noComparables.style.display = 'block';
            siguienteBtn.disabled = true;
        } else {
            noComparables.style.display = 'none';
            siguienteBtn.disabled = false;
        }

        window.tasacionApp.comparables.forEach(comparable => {
            // --- INICIO DE DIAGNÓSTICO ---
            console.log(`DIAGNÓSTICO: Renderizando tarjeta para Comparable ${comparable.id} con supCubierta: ${comparable.supCubierta}`);
            // --- FIN DE DIAGNÓSTICO ---
            
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
