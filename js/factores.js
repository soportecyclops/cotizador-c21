// Gestión de factores de ajuste
class FactoresManager {
    constructor() {
        this.currentComparable = 1;
        // Se usa un objeto para un acceso más fácil por nombre de factor
        this.factors = {
            'ubicacion': { concepto: 'Ubicación', peso: 15, valor: 0 },
            'calidad-de-construccion': { concepto: 'Calidad de Construcción', peso: 12, valor: 0 },
            'expectativa-de-vida': { concepto: 'Expectativa de Vida', peso: 8, valor: 0 },
            'estado-de-mantenimiento': { concepto: 'Estado de Mantenimiento', peso: 15, valor: 0 },
            'conservacion': { concepto: 'Conservación', peso: 15, valor: 0 },
            'superficie-cubierta': { concepto: 'Superficie Cubierta', peso: 7, valor: 0 },
            'dimension-sup-descubierta': { concepto: 'Dimensión/Sup. Descubierta', peso: 10, valor: 0 },
            'estacionamiento': { concepto: 'Estacionamiento', peso: 10, valor: 0 },
            'factibilidad-de-comercializacion': { concepto: 'Factibilidad de Comercialización', peso: 10, valor: 0 },
            'distribucion-equipamiento': { concepto: 'Distribución/Equipamiento', peso: 8, valor: 0 },
            'orientacion-y-vistas': { concepto: 'Orientación y Vistas', peso: 5, valor: 0 }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Eventos para las pestañas de comparables (delegación de eventos)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('factor-tab')) {
                const comparableId = parseInt(e.target.dataset.comparable);
                this.showComparableFactors(comparableId);
            }
        });
    }

    showComparableFactors(comparableId) {
        // Actualizar la pestaña activa
        this.currentComparable = comparableId;
        const tabs = document.querySelectorAll('.factor-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.comparable) === comparableId);
        });

        // Renderizar los factores para el comparable seleccionado
        this.renderFactors(comparableId);
    }

    renderFactors(comparableId) {
        const container = document.getElementById('factors-content');
        container.innerHTML = '';

        const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
        if (!comparable) return;

        // Asegurarse de que el objeto de factores exista en el comparable
        if (!comparable.factores) {
            comparable.factores = {};
        }

        for (const [key, config] of Object.entries(this.factors)) {
            const factorDiv = document.createElement('div');
            factorDiv.className = 'factor-item';
            
            const factorId = `factor-${key}`;
            const savedValue = comparable.factores[config.concepto] || config.valor;

            // CORRECCIÓN 4: Añadir visualización de los límites del factor
            factorDiv.innerHTML = `
                <label>${config.concepto}:</label>
                <input type="range" 
                       id="${factorId}" 
                       class="factor-slider" 
                       min="${-config.peso}" 
                       max="${config.peso}" 
                       value="${savedValue}" 
                       data-factor="${config.concepto}">
                <span class="factor-value">${savedValue > 0 ? '+' : ''}${savedValue}%</span>
                <small class="factor-limits">Rango: ${-config.peso}% a +${config.peso}%</small>
            `;
            container.appendChild(factorDiv);

            const slider = factorDiv.querySelector(`#${factorId}`);
            const valueSpan = factorDiv.querySelector('.factor-value');
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueSpan.textContent = `${value > 0 ? '+' : ''}${value}%`;
                this.updateFactor(comparableId, config.concepto, value);
            });
        }
    }

    updateFactor(comparableId, factorName, value) {
        const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
        if (comparable) {
            comparable.factores[factorName] = value;
            this.recalculateAdjustedValue(comparable);
            // Actualizar la UI de valores ajustados si estamos en el paso 4
            if (window.tasacionApp.currentStep === 4) {
                window.tasacionApp.displayAdjustedValues();
            }
        }
    }

    recalculateAdjustedValue(comparable) {
        if (!comparable.factores) return;
        
        const correccionTotal = Object.values(comparable.factores).reduce((sum, val) => sum + val, 0);
        comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
    }

    initFactors() {
        // Actualizar las pestañas de comparables
        this.updateTabs();
        
        // Inicializar los factores para todos los comparables si no existen
        window.tasacionApp.comparables.forEach(comparable => {
            if (!comparable.factores) {
                comparable.factores = {};
                for (const key in this.factors) {
                    comparable.factores[this.factors[key].concepto] = this.factors[key].valor;
                }
            }
        });

        // Mostrar los factores del primer comparable por defecto
        if (window.tasacionApp.comparables.length > 0) {
            this.showComparableFactors(window.tasacionApp.comparables[0].id);
        }
    }

    updateTabs() {
        const tabsContainer = document.querySelector('.factor-tabs');
        if (!tabsContainer) return;

        tabsContainer.innerHTML = '';

        if (window.tasacionApp && window.tasacionApp.comparables.length > 0) {
            window.tasacionApp.comparables.forEach(comparable => {
                const tab = document.createElement('button');
                tab.className = `factor-tab ${comparable.id === this.currentComparable ? 'active' : ''}`;
                tab.dataset.comparable = comparable.id;
                tab.textContent = `Comparable ${comparable.id}`;
                tabsContainer.appendChild(tab);
            });
        }
    }
    
    reset() {
        const container = document.getElementById('factors-content');
        if(container) {
            container.innerHTML = '';
        }
    }
}

// Inicializar el gestor de factores
document.addEventListener('DOMContentLoaded', () => {
    window.factoresManager = new FactoresManager();
});
