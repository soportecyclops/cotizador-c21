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
        
        // Estrategia clara: resetear siempre el formulario y luego cargar los datos si es edición.
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
        
        // Crear objeto comparable con los datos del formulario de forma explícita
        const formData = {
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
            piso: document.getElementById('comp-piso').value,
            depto: document.getElementById('comp-depto').value,
            supSemicubierta: parseFloat(document.getElementById('comp-sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('comp-sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('comp-sup-balcon').value) || 0
        };

        console.log("DIAGNÓSTICO (Guardado): Objeto formData construido:", formData);

        if (isEdit) {
            // --- SOLUCIÓN DE FUERZA BRUTA PARA LA EDICIÓN ---
            console.log(`DIAGNÓSTICO (Edición): Modo edición detectado para el ID ${formData.id}.`);
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

                console.log("DIAGNÓSTICO (Edición): Objeto final a guardar (con factores y cálculos):", formData);

                // ACCIÓN CLAVE: Eliminar el viejo y agregar el nuevo
                window.tasacionApp.comparables.splice(index, 1);
                window.tasacionApp.comparables.push(formData);

                // Opcional: ordenar por ID para mantener el orden visual
                window.tasacionApp.comparables.sort((a, b) => a.id - b.id);

                console.log("DIAGNÓSTICO (Edición): Array de comparables después de la actualación forzada:", window.tasacionApp.comparables);
            } else {
                console.error(`DIAGNÓSTICO (Edición): Error, no se encontró el índice para el comparable ID ${formData.id}.`);
            }
        } else {
            // MODO AGREGACIÓN
            formData.factores = {}; // Inicialmente sin factores de ajuste
            
            // Calcular valores
            const precioAjustado = formData.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
            formData.valorM2 = precioAjustado / formData.supCubierta;
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
        this.updateComparablesUI();
    }
}

// Inicializar el gestor de comparables
document.addEventListener('DOMContentLoaded', () => {
    window.comparablesManager = new ComparablesManager();
});
