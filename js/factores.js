/**
 * Gestor de Factores de Ajuste para Cotizador Inmobiliario Century 21
 * Versión: 2.0
 * Descripción: Módulo para gestionar los factores de ajuste de comparables
 */

// Objeto global para el gestor de factores
window.FactorsManager = {
    // Estado del gestor
    currentComparable: 1,
    
    // Factores de ajuste predefinidos
    predefinedFactors: {
        estadoConservacion: {
            name: 'Estado de Conservación',
            options: [
                { value: -10, label: 'Malo (-10%)' },
                { value: -5, label: 'Regular (-5%)' },
                { value: 0, label: 'Normal (0%)' },
                { value: 5, label: 'Bueno (+5%)' },
                { value: 10, label: 'Excelente (+10%)' }
            ]
        },
        ubicacion: {
            name: 'Ubicación',
            options: [
                { value: -15, label: 'Mala (-15%)' },
                { value: -7, label: 'Regular (-7%)' },
                { value: 0, label: 'Normal (0%)' },
                { value: 7, label: 'Buena (+7%)' },
                { value: 15, label: 'Excelente (+15%)' }
            ]
        },
        antiguedad: {
            name: 'Antigüedad Relativa',
            options: [
                { value: -10, label: 'Más antiguo (-10%)' },
                { value: -5, label: 'Más antiguo (-5%)' },
                { value: 0, label: 'Similar (0%)' },
                { value: 5, label: 'Más nuevo (+5%)' },
                { value: 10, label: 'Más nuevo (+10%)' }
            ]
        },
        calidad: {
            name: 'Calidad de Construcción',
            options: [
                { value: -10, label: 'Inferior (-10%)' },
                { value: -5, label: 'Inferior (-5%)' },
                { value: 0, label: 'Similar (0%)' },
                { value: 5, label: 'Superior (+5%)' },
                { value: 10, label: 'Superior (+10%)' }
            ]
        },
        amenities: {
            name: 'Amenities',
            options: [
                { value: -10, label: 'Inferiores (-10%)' },
                { value: -5, label: 'Inferiores (-5%)' },
                { value: 0, label: 'Similares (0%)' },
                { value: 5, label: 'Superiores (+5%)' },
                { value: 10, label: 'Superiores (+10%)' }
            ]
        }
    },
    
    // Inicialización del gestor
    init: function() {
        console.log('Inicializando FactorsManager...');
        this.setupEventListeners();
        this.loadFactors();
        console.log('FactorsManager inicializado correctamente');
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Tabs de comparables
        const tabs = document.querySelectorAll('.factor-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const comparableId = parseInt(tab.getAttribute('data-comparable'));
                this.switchToComparable(comparableId);
            });
        });
    },
    
    // Cambiar a un comparable específico
    switchToComparable: function(comparableId) {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        // Verificar que el comparable exista
        if (comparableId < 1 || comparableId > window.CotizadorApp.comparables.length) {
            console.error(`Comparable ${comparableId} no existe`);
            return;
        }
        
        // Actualizar tab activo
        document.querySelectorAll('.factor-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        const activeTab = document.querySelector(`.factor-tab[data-comparable="${comparableId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
        }
        
        // Actualizar comparable actual
        this.currentComparable = comparableId;
        
        // Cargar factores del comparable
        this.loadComparableFactors(comparableId);
    },
    
    // Cargar factores de ajuste
    loadFactors: function() {
        const container = document.getElementById('factors-content');
        if (!container) {
            console.error('Contenedor de factores no encontrado');
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Crear formulario de factores
        const form = document.createElement('div');
        form.className = 'factors-form';
        
        // Agregar cada factor
        for (const [key, factor] of Object.entries(this.predefinedFactors)) {
            const factorElement = this.createFactorElement(key, factor);
            form.appendChild(factorElement);
        }
        
        // Agregar botones de acción
        const actions = document.createElement('div');
        actions.className = 'factor-actions';
        actions.innerHTML = `
            <button type="button" class="btn-secondary" onclick="FactorsManager.resetFactors()">
                <i class="fas fa-undo"></i> Restablecer
            </button>
            <button type="button" class="btn-primary" onclick="FactorsManager.applyFactors()">
                <i class="fas fa-check"></i> Aplicar Factores
            </button>
        `;
        form.appendChild(actions);
        
        container.appendChild(form);
        
        // Cargar factores del primer comparable
        this.loadComparableFactors(1);
    },
    
    // Crear elemento para un factor
    createFactorElement: function(key, factor) {
        const div = document.createElement('div');
        div.className = 'factor-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', `factor-${key}`);
        label.textContent = factor.name;
        div.appendChild(label);
        
        const select = document.createElement('select');
        select.id = `factor-${key}`;
        select.name = key;
        
        // Agregar opciones
        factor.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });
        
        div.appendChild(select);
        
        return div;
    },
    
    // Cargar factores de un comparable específico
    loadComparableFactors: function(comparableId) {
        if (!window.CotizadorApp || !window.CotizadorApp.adjustmentFactors) {
            console.error('CotizadorApp o adjustmentFactors no disponibles');
            return;
        }
        
        // Obtener factores guardados del comparable
        const savedFactors = window.CotizadorApp.adjustmentFactors[comparableId] || {};
        
        // Cargar valores en el formulario
        for (const [key, factor] of Object.entries(this.predefinedFactors)) {
            const select = document.getElementById(`factor-${key}`);
            if (select) {
                select.value = savedFactors[key] || 0;
            }
        }
    },
    
    // Aplicar factores de ajuste
    applyFactors: function() {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        // Obtener factores del formulario
        const factors = {};
        for (const key of Object.keys(this.predefinedFactors)) {
            const select = document.getElementById(`factor-${key}`);
            if (select) {
                factors[key] = parseFloat(select.value);
            }
        }
        
        // Guardar factores
        if (!window.CotizadorApp.adjustmentFactors) {
            window.CotizadorApp.adjustmentFactors = {};
        }
        
        window.CotizadorApp.adjustmentFactors[this.currentComparable] = factors;
        
        // Aplicar ajustes al comparable
        this.applyAdjustmentToComparable(this.currentComparable, factors);
        
        if (window.CotizadorApp.showNotification) {
            window.CotizadorApp.showNotification('Factores de ajuste aplicados correctamente', 'success');
        }
    },
    
    // Aplicar ajuste a un comparable
    applyAdjustmentToComparable: function(comparableId, factors) {
        if (!window.CotizadorApp || !window.CotizadorApp.comparables) {
            console.error('CotizadorApp o comparables no disponibles');
            return;
        }
        
        // Obtener comparable
        const comparable = window.CotizadorApp.comparables[comparableId - 1];
        if (!comparable) {
            console.error(`Comparable ${comparableId} no encontrado`);
            return;
        }
        
        // Calcular ajuste total
        let totalAdjustment = 0;
        for (const value of Object.values(factors)) {
            totalAdjustment += value;
        }
        
        // Aplicar ajuste al precio
        const adjustmentFactor = 1 + (totalAdjustment / 100);
        comparable.originalPrice = comparable.precio;
        comparable.adjustedPrice = comparable.precio * adjustmentFactor;
        comparable.totalAdjustment = totalAdjustment;
        
        // Guardar cambios
        window.CotizadorApp.comparables[comparableId - 1] = comparable;
    },
    
    // Restablecer factores
    resetFactors: function() {
        // Restablecer formulario
        for (const key of Object.keys(this.predefinedFactors)) {
            const select = document.getElementById(`factor-${key}`);
            if (select) {
                select.value = 0;
            }
        }
        
        if (window.CotizadorApp && window.CotizadorApp.showNotification) {
            window.CotizadorApp.showNotification('Factores restablecidos', 'info');
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se inicialice CotizadorApp
    setTimeout(() => {
        if (window.FactorsManager) {
            window.FactorsManager.init();
        }
    }, 500);
});
