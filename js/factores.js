// Gestión de factores de ajuste
class FactoresManager {
    constructor() {
        this.currentComparable = 1;
        this.factores = [
            { concepto: 'Ubicación', peso: 15, valor: 0 },
            { concepto: 'Calidad de Construcción', peso: 12, valor: 0 },
            { concepto: 'Expectativa de Vida', peso: 8, valor: 0 },
            { concepto: 'Estado de Mantenimiento', peso: 15, valor: 0 },
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
        // Eventos para las pestañas de comparables
        document.querySelectorAll('.factor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const comparableId = parseInt(e.target.getAttribute('data-comparable'));
                this.switchComparable(comparableId);
            });
        });
    }

    initFactors() {
        // Actualizar pestañas según la cantidad de comparables
        const tabsContainer = document.querySelector('.factor-tabs');
        tabsContainer.innerHTML = '';
        
        window.tasacionApp.comparables.forEach((comparable, index) => {
            const tab = document.createElement('button');
            tab.className = 'factor-tab';
            tab.setAttribute('data-comparable', comparable.id);
            tab.textContent = `Comparable ${comparable.id}`;
            
            if (index === 0) {
                tab.classList.add('active');
                this.currentComparable = comparable.id;
            }
            
            tab.addEventListener('click', (e) => {
                const comparableId = parseInt(e.target.getAttribute('data-comparable'));
                this.switchComparable(comparableId);
            });
            
            tabsContainer.appendChild(tab);
        });
        
        // Cargar factores del primer comparable
        this.loadFactors(this.currentComparable);
    }

    switchComparable(comparableId) {
        // Guardar factores del comparable actual
        this.saveFactors(this.currentComparable);
        
        // Actualizar pestaña activa
        document.querySelectorAll('.factor-tab').forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.getAttribute('data-comparable')) === comparableId) {
                tab.classList.add('active');
            }
        });
        
        // Cargar factores del nuevo comparable
        this.currentComparable = comparableId;
        this.loadFactors(comparableId);
    }

    loadFactors(comparableId) {
        const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
        if (!comparable) return;
        
        // Si el comparable no tiene factores, inicializarlos
        if (!comparable.factores) {
            comparable.factores = {};
            this.factores.forEach(factor => {
                comparable.factores[factor.concepto] = 0;
            });
        }
        
        // Generar HTML para los factores
        const factorsContent = document.getElementById('factors-content');
        factorsContent.innerHTML = '';
        
        this.factores.forEach(factor => {
            const factorItem = document.createElement('div');
            factorItem.className = 'factor-item';
            
            const valor = comparable.factores[factor.concepto] || 0;
            
            factorItem.innerHTML = `
                <div class="factor-label">${factor.concepto}</div>
                <div class="factor-weight">${factor.peso}%</div>
                <div class="factor-control">
                    <div class="factor-slider">
                        <input type="range" 
                               id="factor-${factor.concepto.replace(/\s+/g, '-').toLowerCase()}" 
                               min="${-factor.peso}" 
                               max="${factor.peso}" 
                               step="0.1" 
                               value="${valor}">
                    </div>
                    <div class="factor-value">${valor.toFixed(1)}%</div>
                </div>
            `;
            
            factorsContent.appendChild(factorItem);
            
            // Agregar evento para actualizar el valor cuando cambia el slider
            const slider = factorItem.querySelector('input[type="range"]');
            const valueDisplay = factorItem.querySelector('.factor-value');
            
            slider.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                valueDisplay.textContent = `${valor.toFixed(1)}%`;
                
                // Actualizar el valor en el objeto del comparable
                comparable.factores[factor.concepto] = valor;
                
                // Recalcular el valor ajustado
                this.calculateAdjustedValue(comparable);
            });
        });
        
        // Mostrar información del comparable
        this.showComparableInfo(comparable);
    }

    saveFactors(comparableId) {
        const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
        if (!comparable || !comparable.factores) return;
        
        // Guardar los valores actuales de los sliders
        this.factores.forEach(factor => {
            const slider = document.getElementById(`factor-${factor.concepto.replace(/\s+/g, '-').toLowerCase()}`);
            if (slider) {
                comparable.factores[factor.concepto] = parseFloat(slider.value);
            }
        });
    }

    calculateAdjustedValue(comparable) {
        if (!comparable.factores) return;
        
        // Calcular corrección total
        const correccionTotal = Object.values(comparable.factores).reduce((sum, val) => sum + val, 0);
        
        // Aplicar corrección al valor por m²
        comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
        
        // Mostrar información actualizada
        this.showComparableInfo(comparable);
    }

    showComparableInfo(comparable) {
        // Calcular corrección total
        const correccionTotal = Object.values(comparable.factores).reduce((sum, val) => sum + val, 0);
        
        // Crear o actualizar el panel de información
        let infoPanel = document.getElementById('comparable-info-panel');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'comparable-info-panel';
            infoPanel.className = 'comparable-info-panel';
            
            const factorsContent = document.getElementById('factors-content');
            factorsContent.appendChild(infoPanel);
        }
        
        // Actualizar contenido
        infoPanel.innerHTML = `
            <div class="comparable-info-header">
                <h3>Comparable ${comparable.id}</h3>
                <p><strong>Dirección:</strong> ${comparable.direccion} ${comparable.numero || ''}</p>
                <p><strong>Barrio:</strong> ${comparable.barrio}</p>
            </div>
            <div class="comparable-info-values">
                <div class="info-value">
                    <span class="info-label">Valor por m² original:</span>
                    <span class="info-amount">$${comparable.valorM2.toFixed(2)}</span>
                </div>
                <div class="info-value">
                    <span class="info-label">Corrección total:</span>
                    <span class="info-amount ${correccionTotal >= 0 ? 'positive' : 'negative'}">${correccionTotal >= 0 ? '+' : ''}${correccionTotal.toFixed(1)}%</span>
                </div>
                <div class="info-value highlight">
                    <span class="info-label">Valor por m² ajustado:</span>
                    <span class="info-amount">$${comparable.valorM2Ajustado.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        // Agregar estilos si no existen
        if (!document.getElementById('comparable-info-styles')) {
            const styles = document.createElement('style');
            styles.id = 'comparable-info-styles';
            styles.textContent = `
                .comparable-info-panel {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .comparable-info-header h3 {
                    margin-top: 0;
                    color: var(--secondary-color);
                }
                
                .comparable-info-values {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                .info-value {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #eee;
                }
                
                .info-value:last-child {
                    border-bottom: none;
                }
                
                .info-value.highlight {
                    font-weight: bold;
                    background-color: #f8f9fa;
                    padding: 0.75rem;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                }
                
                .info-label {
                    color: var(--gray-color);
                }
                
                .info-amount {
                    font-weight: bold;
                    color: var(--primary-color);
                }
                
                .info-amount.positive {
                    color: var(--success-color);
                }
                
                .info-amount.negative {
                    color: var(--danger-color);
                }
                
                @media (max-width: 768px) {
                    .comparable-info-values {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    
                    .info-value {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.25rem;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Inicializar el gestor de factores
document.addEventListener('DOMContentLoaded', () => {
    window.factoresManager = new FactoresManager();
});
