// Gestión de factores de ajuste
class FactoresManager {
    constructor() {
        this.currentComparable = 1;
        this.factors = [
            { concepto: 'Ubicación', peso: 15, valor: 0 },
            { concepto: 'Calidad de Construcción', peso: 12, valor: 0 },
            { concepto: 'Expectativa de Vida', peso: 8, valor: 0 },
            { concepto: 'Estado de Mantenimiento', peso: 15, valor: 0 },
            { concepto: 'Conservación', peso: 15, valor: 0 },
            { concepto: 'Superficie Cubierta', peso: 7, valor: 0 },
            { concepto: 'Dimensión/Sup. Descubierta', peso: 10, valor: 0 },
            { concepto: 'Estacionamiento', peso: 10, valor: 0 },
            { concepto: 'Factibilidad de Comercialización', peso: 10, valor: 0 },
            { concepto: 'Distribución/Equipamiento', peso: 8, valor: 0 },
            { concepto: 'Orientación y Vistas', peso: 5, valor: 0 }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Eventos para las pestañas de comparables
        document.querySelectorAll('.factor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const comparableId = parseInt(e.target.dataset.comparable);
                this.switchComparable(comparableId);
            });
        });
    }

    switchComparable(comparableId) {
        // Actualizar pestañas activas
        document.querySelectorAll('.factor-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.factor-tab[data-comparable="${comparableId}"]`).classList.add('active');
        
        // Mostrar factores del comparable seleccionado
        this.renderFactors(comparableId);
    }

    renderFactors(comparableId) {
        const container = document.getElementById('factors-content');
        container.innerHTML = '';

        const comparable = window.tasacionApp.comparables.find(c => c.id == comparableId);
        if (!comparable) return;

        for (const [name, config] of Object.entries(this.factors)) {
            const factorDiv = document.createElement('div');
            factorDiv.className = 'factor-item';
            // CORRECCIÓN CLAVE: El ID del slider se genera dinámicamente y de forma segura
            const factorId = `factor-${name.toLowerCase().replace(/\s+/g, '-')}`;
            factorDiv.innerHTML = `
                <label>${name}:</label>
                <input type="range" class="factor-slider" min="${-config.peso}" max="${config.peso}" value="${comparable.factores[name] || config.default}" data-factor="${name}">
                <span class="factor-value">${comparable.factores[name] || config.default}%</span>
            `;
            container.appendChild(factorDiv);

            // CORRECCIÓN CLAVE: El ID del slider se genera dinámicamente y de forma segura
            const slider = factorDiv.querySelector(`#${factorId}`);
            const valueSpan = factorDiv.querySelector('.factor-value');
            
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueSpan.textContent = `${value}%`;
                this.updateFactor(comparableId, name, value);
            });
        }
    }

    updateFactor(comparableId, factorName, value) {
        const comparable = window.tasacionApp.comparables.find(c => c.id == comparableId);
        if (comparable) {
            if (!comparable.factores) {
                comparable.factores = {};
            }
            comparable.factores[factorName] = parseInt(value);
            this.recalculateAdjustedValue(comparable);
            window.tasacionApp.displayAdjustedValues();
        }
    }

    recalculateAdjustedValue(comparable) {
        const correccionTotal = Object.values(comparable.factores).reduce((sum, val) => sum + val, 0);
        comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
    }

    initFactors() {
        // Inicializar los factores para todos los comparables si no existen
        window.tasacionApp.comparables.forEach(comparable => {
            if (!comparable.factores) {
                comparable.factores = {};
                for (const name in this.factors) {
                    comparable.factores[name] = this.factors[name].valor;
                }
            }
        });
        // Mostrar los factores del primer comparable por defecto
        if (window.tasacionApp.comparables.length > 0) {
            this.showComparableFactors(window.tasacionApp.comparables[0].id);
        }
    }
    
    reset() {
        // Este método se llama para limpiar la UI de factores
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
