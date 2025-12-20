/**
 * Aplicación principal del Cotizador Inmobiliario Century 21
 * Gestiona el flujo completo de la aplicación, la navegación entre pasos y los cálculos
 */

class CotizadorApp {
    constructor() {
        this.currentStep = 1;
        this.descuentoNegociacion = 10;
        this.inmuebleData = {};
        this.comparables = [];
        this.valorM2Referencia = 0;
        this.compositionData = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressIndicator();
        this.showStep(1);
        
        // Inicializar managers
        if (typeof ComparablesManager !== 'undefined') {
            this.comparablesManager = new ComparablesManager();
        }
        if (typeof FactoresManager !== 'undefined') {
            this.factoresManager = new FactoresManager();
        }
        if (typeof ComposicionManager !== 'undefined') {
            this.composicionManager = new ComposicionManager();
        }
        
        console.log("Aplicación Cotizador inicializada");
    }

    setupEventListeners() {
        // Eventos de navegación
        document.getElementById('btn-siguiente-1').addEventListener('click', () => {
            if (this.validateStep1()) {
                this.saveStep1Data();
                this.goToStep(2);
            }
        });

        document.getElementById('btn-anterior-2').addEventListener('click', () => {
            this.goToStep(1);
        });

        document.getElementById('btn-siguiente-2').addEventListener('click', () => {
            if (this.comparables.length >= 4) {
                this.goToStep(3);
            } else {
                this.showNotification('Debe agregar al menos 4 comparables para continuar', 'error');
            }
        });

        document.getElementById('btn-anterior-3').addEventListener('click', () => {
            this.goToStep(2);
        });

        document.getElementById('btn-siguiente-3').addEventListener('click', () => {
            this.goToStep(4);
        });

        document.getElementById('btn-anterior-4').addEventListener('click', () => {
            this.goToStep(3);
        });

        document.getElementById('btn-siguiente-4').addEventListener('click', () => {
            this.calculateReferenceValue();
            this.goToStep(5);
        });

        document.getElementById('btn-anterior-5').addEventListener('click', () => {
            this.goToStep(4);
        });

        document.getElementById('btn-reiniciar').addEventListener('click', () => {
            if (confirm('¿Está seguro de que desea reiniciar el cotizador? Se perderán todos los datos ingresados.')) {
                this.resetForm();
            }
        });

        // Evento de cambio en descuento de negociación
        document.getElementById('descuento-negociacion').addEventListener('input', (e) => {
            this.descuentoNegociacion = parseFloat(e.target.value) || 0;
            this.updateComparableValues();
        });

        // Evento de cambio en método de cálculo
        document.getElementById('metodo-calculo').addEventListener('change', () => {
            this.calculateReferenceValue();
        });

        // Eventos de clic en los indicadores de progreso
        document.querySelectorAll('.progress-step').forEach(step => {
            step.addEventListener('click', () => {
                const stepNumber = parseInt(step.dataset.step);
                // Solo permitir navegar a pasos anteriores o al paso actual
                if (stepNumber <= this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });
    }

    validateStep1() {
        const requiredFields = [
            'tipo-propiedad', 'direccion', 'localidad', 'barrio', 
            'antiguedad', 'calidad', 'sup-cubierta'
        ];

        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value || (typeof field.value === 'string' && !field.value.trim())) {
                this.showNotification(`Por favor, complete el campo: ${field.previousElementSibling.textContent}`, 'error');
                if (field) field.focus();
                return false;
            }
        }

        const supCubierta = parseFloat(document.getElementById('sup-cubierta').value);
        if (supCubierta <= 0) {
            this.showNotification('La superficie cubierta debe ser mayor a cero', 'error');
            return false;
        }

        return true;
    }

    saveStep1Data() {
        this.inmuebleData = {
            tipoPropiedad: document.getElementById('tipo-propiedad').value,
            direccion: document.getElementById('direccion').value,
            piso: document.getElementById('piso').value,
            depto: document.getElementById('depto').value,
            localidad: document.getElementById('localidad').value,
            barrio: document.getElementById('barrio').value,
            antiguedad: parseInt(document.getElementById('antiguedad').value),
            calidad: document.getElementById('calidad').value,
            supCubierta: parseFloat(document.getElementById('sup-cubierta').value),
            supSemicubierta: parseFloat(document.getElementById('sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('sup-balcon').value) || 0,
            supTerreno: parseFloat(document.getElementById('sup-terreno').value) || 0,
            cochera: document.getElementById('cochera').value
        };
    }

    goToStep(stepNumber) {
        // Validar que se pueda ir al paso solicitado
        if (stepNumber > 2 && this.comparables.length < 4) {
            this.showNotification('Debe agregar al menos 4 comparables para continuar', 'error');
            return;
        }

        // Ocultar paso actual
        document.getElementById(`step-${this.currentStep}`).classList.remove('active');
        
        // Mostrar nuevo paso
        this.currentStep = stepNumber;
        document.getElementById(`step-${this.currentStep}`).classList.add('active');
        
        // Actualizar indicador de progreso
        this.updateProgressIndicator();
        
        // Inicializar componentes específicos del paso
        this.initializeStepComponents();
        
        console.log(`Página vista: Paso ${this.currentStep}`);
    }

    updateProgressIndicator() {
        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNumber = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    initializeStepComponents() {
        switch (this.currentStep) {
            case 3:
                if (this.factoresManager) {
                    this.factoresManager.initFactors();
                }
                break;
            case 4:
                this.calculateReferenceValue();
                break;
            case 5:
                this.calculateComposition();
                break;
        }
    }

    updateComparableValues() {
        this.comparables.forEach(comparable => {
            const supTotal = comparable.supCubierta + 
                            (comparable.supSemicubierta * 0.5) + 
                            (comparable.supDescubierta * 0.2) + 
                            (comparable.supBalcon * 0.33);
            
            const precioAjustado = comparable.precio * (1 - this.descuentoNegociacion / 100);
            comparable.valorM2 = precioAjustado / supTotal;
            
            const correccionTotal = Object.values(comparable.factores || {}).reduce((sum, val) => sum + val, 0);
            comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
        });
        
        // Actualizar UI si estamos en paso 2
        if (this.currentStep === 2 && this.comparablesManager) {
            this.comparablesManager.updateComparablesUI();
        }
        
        // Recalcular si estamos en pasos 4 o 5
        if (this.currentStep >= 4) {
            this.calculateReferenceValue();
            if (this.currentStep === 5) {
                this.calculateComposition();
            }
        }
    }

    calculateReferenceValue() {
        if (this.comparables.length === 0) return;
        
        const metodo = document.getElementById('metodo-calculo').value;
        const valoresM2 = this.comparables.map(c => c.valorM2Ajustado);
        
        let valorReferencia;
        
        switch (metodo) {
            case 'promedio':
                valorReferencia = valoresM2.reduce((sum, val) => sum + val, 0) / valoresM2.length;
                break;
            case 'promedio-ponderado':
                // Promedio ponderado por superficie total
                const pesos = this.comparables.map(c => {
                    return c.supCubierta + 
                           (c.supSemicubierta * 0.5) + 
                           (c.supDescubierta * 0.2) + 
                           (c.supBalcon * 0.33);
                });
                const pesoTotal = pesos.reduce((sum, val) => sum + val, 0);
                valorReferencia = valoresM2.reduce((sum, val, idx) => sum + (val * pesos[idx]), 0) / pesoTotal;
                break;
            case 'mediana':
                valoresM2.sort((a, b) => a - b);
                const mid = Math.floor(valoresM2.length / 2);
                valorReferencia = valoresM2.length % 2 !== 0 
                    ? valoresM2[mid] 
                    : (valoresM2[mid - 1] + valoresM2[mid]) / 2;
                break;
            default:
                valorReferencia = valoresM2[0];
        }
        
        this.valorM2Referencia = valorReferencia;
        
        // Actualizar UI
        const valorM2Element = document.getElementById('valor-m2-referencia');
        if (valorM2Element) {
            valorM2Element.textContent = this.formatCurrency(valorReferencia);
            valorM2Element.setAttribute('data-raw-value', valorReferencia);
        }
        
        // Mostrar valores ajustados
        this.updateAdjustedValues();
    }

    updateAdjustedValues() {
        const container = document.getElementById('valores-ajustados-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.comparables.forEach((comparable, index) => {
            const div = document.createElement('div');
            div.className = 'adjusted-value-item';
            div.innerHTML = `
                <span>Comparable ${comparable.id}: ${this.formatCurrency(comparable.valorM2Ajustado)}/m²</span>
            `;
            container.appendChild(div);
        });
    }

    calculateComposition() {
        if (!this.valorM2Referencia || !this.inmuebleData) return;
        
        // Calcular valores parciales
        const valorCubierta = this.inmuebleData.supCubierta * this.valorM2Referencia;
        const valorSemicubierta = this.inmuebleData.supSemicubierta * this.valorM2Referencia * 0.5;
        const valorDescubierta = this.inmuebleData.supDescubierta * this.valorM2Referencia * 0.2;
        const valorBalcon = this.inmuebleData.supBalcon * this.valorM2Referencia * 0.33;
        
        // Valor de cochera (valores fijos)
        let valorCochera = 0;
        switch (this.inmuebleData.cochera) {
            case 'propia':
                valorCochera = 15000;
                break;
            case 'comun':
                valorCochera = 8000;
                break;
            default:
                valorCochera = 0;
        }
        
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + valorCochera;
        
        // Actualizar UI
        document.getElementById('comp-sup-cubierta').textContent = this.inmuebleData.supCubierta;
        document.getElementById('comp-sup-semicubierta').textContent = this.inmuebleData.supSemicubierta;
        document.getElementById('comp-sup-descubierta').textContent = this.inmuebleData.supDescubierta;
        document.getElementById('comp-sup-balcon').textContent = this.inmuebleData.supBalcon;
        document.getElementById('comp-sup-cochera').textContent = this.inmuebleData.cochera === 'no' ? '-' : 'Sí';
        
        document.getElementById('comp-valor-m2').textContent = this.formatCurrency(this.valorM2Referencia);
        document.getElementById('comp-valor-m2-semi').textContent = this.formatCurrency(this.valorM2Referencia);
        document.getElementById('comp-valor-m2-desc').textContent = this.formatCurrency(this.valorM2Referencia);
        document.getElementById('comp-valor-m2-balc').textContent = this.formatCurrency(this.valorM2Referencia);
        document.getElementById('comp-valor-m2-cochera').textContent = this.formatCurrency(valorCochera);
        
        document.getElementById('comp-valor-cubierta').textContent = this.formatCurrency(valorCubierta);
        document.getElementById('comp-valor-semicubierta').textContent = this.formatCurrency(valorSemicubierta);
        document.getElementById('comp-valor-descubierta').textContent = this.formatCurrency(valorDescubierta);
        document.getElementById('comp-valor-balcon').textContent = this.formatCurrency(valorBalcon);
        document.getElementById('comp-valor-cochera').textContent = this.formatCurrency(valorCochera);
        
        const valorTotalElement = document.getElementById('valor-total-tasacion');
        valorTotalElement.textContent = this.formatCurrency(valorTotal);
        valorTotalElement.setAttribute('data-raw-value', valorTotal);
        
        // Guardar datos de composición
        this.compositionData = {
            valorCubierta,
            valorSemicubierta,
            valorDescubierta,
            valorBalcon,
            valorCochera,
            valorTotal
        };
    }

    recalculateAfterComparableChange() {
        console.log("DIAGNÓSTICO: Recalculando después de cambio en comparables");
        
        // Si estamos en el paso 4, recalcular el valor de referencia
        if (this.currentStep === 4) {
            this.calculateReferenceValue();
        }
        
        // Si estamos en el paso 5, recalcular la composición
        if (this.currentStep === 5) {
            this.calculateComposition();
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    resetForm() {
        // Resetear datos
        this.currentStep = 1;
        this.inmuebleData = {};
        this.comparables = [];
        this.valorM2Referencia = 0;
        this.compositionData = {};
        
        // Resetear formulario del paso 1
        document.getElementById('tipo-propiedad').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('piso').value = '';
        document.getElementById('depto').value = '';
        document.getElementById('localidad').value = '';
        document.getElementById('barrio').value = '';
        document.getElementById('antiguedad').value = '';
        document.getElementById('calidad').value = '';
        document.getElementById('sup-cubierta').value = '';
        document.getElementById('sup-semicubierta').value = '';
        document.getElementById('sup-descubierta').value = '';
        document.getElementById('sup-balcon').value = '';
        document.getElementById('sup-terreno').value = '';
        document.getElementById('cochera').value = 'no';
        
        // Resetear descuento de negociación
        document.getElementById('descuento-negociacion').value = '10';
        this.descuentoNegociacion = 10;
        
        // Resetear método de cálculo
        document.getElementById('metodo-calculo').value = 'promedio';
        
        // Limpiar composición
        document.getElementById('comp-sup-cubierta').textContent = '0';
        document.getElementById('comp-sup-semicubierta').textContent = '0';
        document.getElementById('comp-sup-descubierta').textContent = '0';
        document.getElementById('comp-sup-balcon').textContent = '0';
        document.getElementById('comp-sup-cochera').textContent = '-';
        
        document.getElementById('comp-valor-m2').textContent = '$0.00';
        document.getElementById('comp-valor-m2-semi').textContent = '$0.00';
        document.getElementById('comp-valor-m2-desc').textContent = '$0.00';
        document.getElementById('comp-valor-m2-balc').textContent = '$0.00';
        document.getElementById('comp-valor-m2-cochera').textContent = '$0.00';
        
        document.getElementById('comp-valor-cubierta').textContent = '$0.00';
        document.getElementById('comp-valor-semicubierta').textContent = '$0.00';
        document.getElementById('comp-valor-descubierta').textContent = '$0.00';
        document.getElementById('comp-valor-balcon').textContent = '$0.00';
        document.getElementById('comp-valor-cochera').textContent = '$0.00';
        
        const valorTotalElement = document.getElementById('valor-total-tasacion');
        valorTotalElement.textContent = 'USD 0,00';
        valorTotalElement.setAttribute('data-raw-value', '0');
        
        // Resetear valor de referencia
        const valorM2Element = document.getElementById('valor-m2-referencia');
        valorM2Element.textContent = 'USD 0,00';
        valorM2Element.setAttribute('data-raw-value', '0');
        
        // Limpiar valores ajustados
        const valoresAjustadosContainer = document.getElementById('valores-ajustados-container');
        if (valoresAjustadosContainer) {
            valoresAjustadosContainer.innerHTML = '';
        }
        
        // Resetear managers
        if (this.comparablesManager) {
            this.comparablesManager.reset();
        }
        if (this.factoresManager) {
            this.factoresManager.reset();
        }
        if (this.composicionManager) {
            this.composicionManager.reset();
        }
        
        // Volver al paso 1
        this.goToStep(1);
        
        console.log("Formulario reseteado");
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tasacionApp = new CotizadorApp();
});
