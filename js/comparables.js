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
                document.getElementById('comp-sup-cubierta').value = comparable.supCubierta || '';
                document.getElementById('comp-sup-terreno').value = comparable.supTerreno || '';
                document.getElementById('comp-cochera').value = comparable.cochera;
                document.getElementById('comp-observaciones').value = comparable.observaciones || '';
                
                // CORRECCIÓN 1: Cargar los nuevos campos al editar
                document.getElementById('comp-sup-semicubierta').value = comparable.supSemicubierta || '';
                document.getElementById('comp-sup-descubierta').value = comparable.supDescubierta || '';
                document.getElementById('comp-sup-balcon').value = comparable.supBalcon || '';
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
        document.getElementById('modal-comparable').style.display = 'none';
    }

    saveComparable() {
        const id = document.getElementById('comparable-id').value;
        const isEdit = id !== '';
        
        // CORRECCIÓN 2: Actualizar la lista de campos obligatorios
        const requiredFields = [
            'comp-tipo-propiedad', 'comp-precio', 'comp-direccion', 
            'comp-localidad', 'comp-barrio', 'comp-antiguedad', 
            'comp-calidad', 'comp-sup-cubierta', // <-- ¡CAMBIO AQUÍ!
            'comp-sup-terreno', 'comp-sup-semicubierta', 'comp-sup-descubierta', 'comp-sup-balcon' // <-- ¡Y AQUÍ!
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value || typeof field.value !== 'string' || !field.value.trim()) {
                window.tasacionApp.showNotification(`Por favor, complete todos los campos obligatorios (${fieldId})`, 'error');
                if (field) field.focus();
                return;
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
            supTerreno: parseFloat(document.getElementById('comp-sup-terreno').value),
            cochera: document.getElementById('comp-cochera').value,
            observaciones: document.getElementById('comp-observaciones').value,
            
            // CORRECCIÓN 3: Capturar los valores de los nuevos campos
            supSemicubierta: parseFloat(document.getElementById('comp-sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('comp-sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('comp-sup-balcon').value) || 0
        };
        
        if (isEdit) {
            // Actualizar comparable existente
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
            // Agregar nuevo comparable
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
        // Encuentra el ID más alto en el array y súmale 1.
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
                        <p><i class="fas fa-calculator"></i> Valor m²: ${window.tasacionApp.formatCurrency(comparable.valorM2)}</p>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    }

    // CORRECCIÓN 4: Actualizar `loadComparables` para poblar los nuevos campos
    loadComparables(comparables) {
        // Actualizar las pestañas de los factores si es necesario
        if (window.factoresManager) {
            window.factoresManager.updateTabs();
        }

        // Cargar los datos de cada comparable en el formulario principal y en el modal de edición
        comparables.forEach(comparable => {
            const card = document.querySelector(`.comparable-card[data-id="${comparable.id}"]`);
            if (card) {
                // Actualizar la información mostrada en la tarjeta
                card.querySelector('.comparable-direccion').textContent = `${comparable.direccion}, ${comparable.barrio}`;
                card.querySelector('.comparable-price').textContent = window.tasacionApp.formatCurrency(comparable.precio);
                card.querySelector('.comparable-valor-m2').textContent = `${window.tasacionApp.formatCurrency(comparable.valorM2)}/m²`;
            }
        });
    }
}

// Inicializar el gestor de comparables
document.addEventListener('DOMContentLoaded', () => {
    window.comparablesManager = new ComparablesManager();
});
