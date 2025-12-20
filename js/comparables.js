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
        
        // Resetear siempre el formulario para un estado limpio
        form.reset();

        if (comparableId) {
            // MODO EDICIÓN
            const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
            if (!comparable) {
                console.error(`Error: No se encontró el comparable con ID ${comparableId} para editar.`);
                return;
            }

            console.log(`DIAGNÓSTICO (Edición): Abriendo modal para Comparable ${comparableId}. Datos originales:`, comparable);

            document.getElementById('modal-title').textContent = 'Editar Comparable';
            document.getElementById('comparable-id').value = comparable.id;
            
            // Cargar los datos de forma explícita y directa
            document.getElementById('comp-tipo-propiedad').value = comparable.tipoPropiedad || '';
            document.getElementById('comp-precio').value = comparable.precio || '';
            document.getElementById('comp-direccion').value = comparable.direccion || '';
            document.getElementById('comp-localidad').value = comparable.localidad || '';
            document.getElementById('comp-barrio').value = comparable.barrio || '';
            document.getElementById('comp-antiguedad').value = comparable.antiguedad || '';
            document.getElementById('comp-calidad').value = comparable.calidad || '';
            document.getElementById('comp-sup-cubierta').value = comparable.supCubierta || '';
            document.getElementById('comp-sup-terreno').value = comparable.supTerreno || 0;
            document.getElementById('comp-cochera').value = comparable.cochera || 'no';
            document.getElementById('comp-observaciones').value = comparable.observaciones || '';
            
            // Cargar los valores de los campos adicionales
            document.getElementById('comp-piso').value = comparable.piso || '';
            document.getElementById('comp-depto').value = comparable.depto || '';
            document.getElementById('comp-sup-semicubierta').value = comparable.supSemicubierta || 0;
            document.getElementById('comp-sup-descubierta').value = comparable.supDescubierta || 0;
            document.getElementById('comp-sup-balcon').value = comparable.supBalcon || 0;

        } else {
            // MODO AGREGACIÓN
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
        
        // Validación de campos obligatorios
        const requiredFields = [
            'comp-tipo-propiedad', 'comp-precio', 'comp-direccion', 
            'comp-localidad', 'comp-barrio', 'comp-antiguedad', 
            'comp-calidad', 'comp-sup-cubierta'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value || (typeof field.value === 'string' && !field.value.trim())) {
                window.tasacionApp.showNotification(`Por favor, complete todos los campos obligatorios (${fieldId})`, 'error');
                if (field) field.focus();
                return false;
            }
        }
        
        // --- FUNCIÓN DE LECTURA ROBUSTA PARA CAMPOS NUMÉRICOS ---
        const getNumericValue = (fieldId) => {
            const field = document.getElementById(fieldId);
            if (!field) return 0;
            // 1. Intentar con el método nativo más robusto
            // 2. Si falla (NaN), intentar con parseFloat
            // 3. Si todo falla, devolver 0 como último recurso
            return field.valueAsNumber || parseFloat(field.value) || 0;
        };
        
        // Crear objeto comparable con la nueva función robusta
        const formData = {
            id: isEdit ? parseInt(id) : this.getNextId(),
            tipoPropiedad: document.getElementById('comp-tipo-propiedad').value,
            precio: getNumericValue('comp-precio'),
            direccion: document.getElementById('comp-direccion').value,
            localidad: document.getElementById('comp-localidad').value,
            barrio: document.getElementById('comp-barrio').value,
            antiguedad: getNumericValue('comp-antiguedad'),
            calidad: document.getElementById('comp-calidad').value,
            supCubierta: getNumericValue('comp-sup-cubierta'),
            supTerreno: getNumericValue('comp-sup-terreno'),
            cochera: document.getElementById('comp-cochera').value,
            observaciones: document.getElementById('comp-observaciones').value,
            // Campos adicionales
            piso: document.getElementById('comp-piso').value,
            depto: document.getElementById('comp-depto').value,
            supSemicubierta: getNumericValue('comp-sup-semicubierta'),
            supDescubierta: getNumericValue('comp-sup-descubierta'),
            supBalcon: getNumericValue('comp-sup-balcon')
        };

        // --- VALIDACIÓN DE INTEGRIDAD ---
        if (formData.supCubierta <= 0) {
            window.tasacionApp.showNotification('La superficie cubierta debe ser un número mayor a cero.', 'error');
            return false;
        }
        // --- FIN DE LA VALIDACIÓN ---

        console.log("DIAGNÓSTICO (Guardado): Objeto formData construido con lectura robusta:", formData);

        if (isEdit) {
            // MODO EDICIÓN
            const index = window.tasacionApp.comparables.findIndex(c => c.id === formData.id);
            
            if (index !== -1) {
                // Mantener factores de ajuste si ya existen
                const factoresExistentes = window.tasacionApp.comparables[index].factores || {};
                formData.factores = factoresExistentes;
                
                // Calcular superficie total para el valor por m²
                const supTotal = formData.supCubierta + 
                                (formData.supSemicubierta * 0.5) + 
                                (formData.supDescubierta * 0.2) + 
                                (formData.supBalcon * 0.33);
                
                // Calcular valores
                const precioAjustado = formData.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
                formData.valorM2 = precioAjustado / supTotal;
                
                const correccionTotal = Object.values(factoresExistentes).reduce((sum, val) => sum + val, 0);
                formData.valorM2Ajustado = formData.valorM2 * (1 + correccionTotal / 100);

                console.log("DIAGNÓSTICO (Edición): Reemplazando objeto en el array. Objeto a guardar:", formData);

                // Reemplazar el objeto en el array
                window.tasacionApp.comparables[index] = formData;
            }
        } else {
            // MODO AGREGACIÓN
            formData.factores = {}; // Inicialmente sin factores de ajuste
            
            // Calcular superficie total para el valor por m²
            const supTotal = formData.supCubierta + 
                            (formData.supSemicubierta * 0.5) + 
                            (formData.supDescubierta * 0.2) + 
                            (formData.supBalcon * 0.33);
            
            // Calcular valores
            const precioAjustado = formData.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
            formData.valorM2 = precioAjustado / supTotal;
            formData.valorM2Ajustado = formData.valorM2;

            window.tasacionApp.comparables.push(formData);
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

        // Limpiar el contenedor por completo
        container.innerHTML = '';

        if (window.tasacionApp.comparables.length === 0) {
            noComparables.style.display = 'block';
            siguienteBtn.disabled = true;
        } else {
            noComparables.style.display = 'none';
            siguienteBtn.disabled = false;
        }

        // Volver a crear todas las tarjetas desde cero
        window.tasacionApp.comparables.forEach(comparable => {
            const card = document.createElement('div');
            card.className = 'comparable-card';
            card.innerHTML = `
                <div class="comparable-header">
                    <div class="comparable-id">${comparable.id}</div>
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
        this.updateComparablesUI();
    }
}

// Inicializar el gestor de comparables
document.addEventListener('DOMContentLoaded', () => {
    window.comparablesManager = new ComparablesManager();
});
