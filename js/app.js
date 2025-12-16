// Aplicación principal
class TasacionApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.inmuebleData = {};
        this.comparables = [];
        this.descuentoNegociacion = 10; // Valor por defecto
        this.valorM2Referencia = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressIndicator();
    }

    setupEventListeners() {
        // Eventos de navegación entre pasos
        document.getElementById('btn-siguiente-1').addEventListener('click', () => this.validateAndNext(1));
        document.getElementById('btn-siguiente-2').addEventListener('click', () => this.validateAndNext(2));
        document.getElementById('btn-siguiente-3').addEventListener('click', () => this.validateAndNext(3));
        document.getElementById('btn-siguiente-4').addEventListener('click', () => this.validateAndNext(4));
        
        document.getElementById('btn-anterior-2').addEventListener('click', () => this.goToStep(1));
        document.getElementById('btn-anterior-3').addEventListener('click', () => this.goToStep(2));
        document.getElementById('btn-anterior-4').addEventListener('click', () => this.goToStep(3));
        document.getElementById('btn-anterior-5').addEventListener('click', () => this.goToStep(4));
        
        // Evento de descuento de negociación
        document.getElementById('descuento-negociacion').addEventListener('change', (e) => {
            this.descuentoNegociacion = parseFloat(e.target.value);
            this.updateComparableValues();
        });
        
        // Evento de método de cálculo
        document.getElementById('metodo-calculo').addEventListener('change', () => {
            this.calculateReferenceValue();
        });
        
        // Eventos de exportación y reinicio
        document.getElementById('btn-exportar').addEventListener('click', () => this.exportReport());
        document.getElementById('btn-reiniciar').addEventListener('click', () => this.resetApp());
    }

    validateAndNext(step) {
        let isValid = false;
        
        switch (step) {
            case 1:
                isValid = this.validateInmuebleData();
                if (isValid) {
                    this.saveInmuebleData();
                    this.goToStep(2);
                }
                break;
            case 2:
                isValid = this.validateComparables();
                if (isValid) {
                    this.goToStep(3);
                }
                break;
            case 3:
                isValid = this.validateFactors();
                if (isValid) {
                    this.calculateReferenceValue();
                    this.goToStep(4);
                }
                break;
            case 4:
                this.calculateComposition();
                this.goToStep(5);
                break;
        }
    }

    validateInmuebleData() {
        const requiredFields = [
            'tipo-propiedad', 'direccion', 'localidad', 'barrio', 
            'antiguedad', 'calidad', 'sup-cubierta'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.showNotification('Por favor, complete todos los campos obligatorios', 'error');
                field.focus();
                return false;
            }
        }
        
        return true;
    }

    saveInmuebleData() {
        this.inmuebleData = {
            tipoPropiedad: document.getElementById('tipo-propiedad').value,
            direccion: document.getElementById('direccion').value,
            piso: document.getElementById('piso').value,
            depto: document.getElementById('depto').value,
            localidad: document.getElementById('localidad').value,
            barrio: document.getElementById('barrio').value,
            antiguedad: document.getElementById('antiguedad').value,
            calidad: document.getElementById('calidad').value,
            supCubierta: parseFloat(document.getElementById('sup-cubierta').value),
            supSemicubierta: parseFloat(document.getElementById('sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('sup-balcon').value) || 0,
            supTerreno: parseFloat(document.getElementById('sup-terreno').value) || 0,
            cochera: document.getElementById('cochera').value
        };
    }

    validateComparables() {
        if (this.comparables.length < 4) {
            this.showNotification('Debe agregar al menos 4 comparables para continuar', 'error');
            return false;
        }
        
        return true;
    }

    validateFactors() {
        // Verificar que todos los comparables tengan factores de ajuste aplicados
        for (const comparable of this.comparables) {
            if (!comparable.factores || Object.keys(comparable.factores).length === 0) {
                this.showNotification(`Debe aplicar factores de ajuste al Comparable ${comparable.id}`, 'error');
                return false;
            }
        }
        
        return true;
    }

    calculateReferenceValue() {
        const metodo = document.getElementById('metodo-calculo').value;
        const valoresAjustados = this.comparables.map(c => c.valorM2Ajustado);
        
        let valorReferencia;
        
        switch (metodo) {
            case 'promedio':
                valorReferencia = valoresAjustados.reduce((sum, val) => sum + val, 0) / valoresAjustados.length;
                break;
            case 'promedio-ponderado':
                // Implementar lógica de promedio ponderado si es necesario
                valorReferencia = valoresAjustados.reduce((sum, val) => sum + val, 0) / valoresAjustados.length;
                break;
            case 'mediana':
                const sorted = [...valoresAjustados].sort((a, b) => a - b);
                const middle = Math.floor(sorted.length / 2);
                valorReferencia = sorted.length % 2 === 0 
                    ? (sorted[middle - 1] + sorted[middle]) / 2 
                    : sorted[middle];
                break;
        }
        
        this.valorM2Referencia = valorReferencia;
        
        // Actualizar UI
        document.getElementById('valor-m2-referencia').textContent = valorReferencia.toFixed(2);
        
        // Mostrar valores ajustados
        this.displayAdjustedValues();
    }

    displayAdjustedValues() {
        const container = document.getElementById('valores-ajustados-container');
        container.innerHTML = '';
        
        const adjustedValues = document.createElement('div');
        adjustedValues.className = 'adjusted-values';
        
        this.comparables.forEach(comparable => {
            const valueItem = document.createElement('div');
            valueItem.className = 'adjusted-value-item';
            valueItem.innerHTML = `
                <div class="adjusted-value-label">Comparable ${comparable.id}</div>
                <div class="adjusted-value-amount">$${comparable.valorM2Ajustado.toFixed(2)}</div>
            `;
            adjustedValues.appendChild(valueItem);
        });
        
        container.appendChild(adjustedValues);
    }

    calculateComposition() {
        // Obtener coeficientes según tipo de superficie
        const coeficientes = {
            cubierta: 1.0,
            semicubierta: 0.5,
            descubierta: 0.2,
            balcon: 0.33
        };
        
        // Actualizar valores en la tabla
        document.getElementById('comp-sup-cubierta').textContent = this.inmuebleData.supCubierta.toFixed(2);
        document.getElementById('comp-sup-semicubierta').textContent = this.inmuebleData.supSemicubierta.toFixed(2);
        document.getElementById('comp-sup-descubierta').textContent = this.inmuebleData.supDescubierta.toFixed(2);
        document.getElementById('comp-sup-balcon').textContent = this.inmuebleData.supBalcon.toFixed(2);
        
        // Calcular valores parciales
        const valorCubierta = this.inmuebleData.supCubierta * coeficientes.cubierta * this.valorM2Referencia;
        const valorSemicubierta = this.inmuebleData.supSemicubierta * coeficientes.semicubierta * this.valorM2Referencia;
        const valorDescubierta = this.inmuebleData.supDescubierta * coeficientes.descubierta * this.valorM2Referencia;
        const valorBalcon = this.inmuebleData.supBalcon * coeficientes.balcon * this.valorM2Referencia;
        
        // Valor estimado para cochera (puede ser un valor fijo o un porcentaje del total)
        const valorCochera = this.inmuebleData.cochera === 'propia' ? 5000 : 
                             this.inmuebleData.cochera === 'comun' ? 2000 : 0;
        
        // Actualizar valores en la tabla
        document.getElementById('comp-valor-m2').textContent = `$${this.valorM2Referencia.toFixed(2)}`;
        document.getElementById('comp-valor-cubierta').textContent = `$${valorCubierta.toFixed(2)}`;
        
        document.getElementById('comp-valor-m2-semi').textContent = `$${(this.valorM2Referencia * coeficientes.semicubierta).toFixed(2)}`;
        document.getElementById('comp-valor-semicubierta').textContent = `$${valorSemicubierta.toFixed(2)}`;
        
        document.getElementById('comp-valor-m2-desc').textContent = `$${(this.valorM2Referencia * coeficientes.descubierta).toFixed(2)}`;
        document.getElementById('comp-valor-descubierta').textContent = `$${valorDescubierta.toFixed(2)}`;
        
        document.getElementById('comp-valor-m2-balc').textContent = `$${(this.valorM2Referencia * coeficientes.balcon).toFixed(2)}`;
        document.getElementById('comp-valor-balcon').textContent = `$${valorBalcon.toFixed(2)}`;
        
        document.getElementById('comp-valor-m2-cochera').textContent = 'Global';
        document.getElementById('comp-valor-cochera').textContent = `$${valorCochera.toFixed(2)}`;
        
        // Calcular valor total
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + valorCochera;
        document.getElementById('valor-total-tasacion').textContent = valorTotal.toFixed(2);
    }

    goToStep(step) {
        // Ocultar paso actual
        document.getElementById(`step-${this.currentStep}`).classList.remove('active');
        
        // Mostrar nuevo paso
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Actualizar paso actual
        this.currentStep = step;
        
        // Actualizar indicador de progreso
        this.updateProgressIndicator();
        
        // Si vamos al paso 3, inicializar los factores de ajuste
        if (step === 3) {
            window.factoresManager.initFactors();
        }
    }

    updateProgressIndicator() {
        // Actualizar pasos anteriores como completados
        for (let i = 1; i < this.currentStep; i++) {
            document.querySelector(`.progress-step[data-step="${i}"]`).classList.add('completed');
        }
        
        // Actualizar paso actual como activo
        document.querySelector(`.progress-step[data-step="${this.currentStep}"]`).classList.add('active');
        
        // Limpiar pasos siguientes
        for (let i = this.currentStep + 1; i <= this.totalSteps; i++) {
            const step = document.querySelector(`.progress-step[data-step="${i}"]`);
            step.classList.remove('completed', 'active');
        }
    }

    updateComparableValues() {
        // Actualizar valores de todos los comparables con el nuevo descuento
        this.comparables.forEach(comparable => {
            const precioAjustado = comparable.precio * (1 - this.descuentoNegociacion / 100);
            comparable.valorM2 = precioAjustado / comparable.supCubierta;
            
            // Si ya tiene factores de ajuste, recalcular el valor ajustado
            if (comparable.factores && Object.keys(comparable.factores).length > 0) {
                const correccionTotal = Object.values(comparable.factores).reduce((sum, val) => sum + val, 0);
                comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
            } else {
                comparable.valorM2Ajustado = comparable.valorM2;
            }
        });
        
        // Actualizar UI
        window.comparablesManager.updateComparablesUI();
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Eliminar notificación después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    exportReport() {
        // Crear un nuevo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Agregar título
        doc.setFontSize(20);
        doc.text('Informe de Tasación Inmobiliaria', 105, 20, { align: 'center' });
        
        // Agregar fecha
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Agregar datos del inmueble
        doc.setFontSize(16);
        doc.text('Datos del Inmueble', 20, 45);
        
        doc.setFontSize(12);
        let yPos = 55;
        doc.text(`Dirección: ${this.inmuebleData.direccion}`, 20, yPos);
        yPos += 10;
        doc.text(`Tipo: ${this.inmuebleData.tipoPropiedad}`, 20, yPos);
        yPos += 10;
        doc.text(`Localidad: ${this.inmuebleData.localidad}, ${this.inmuebleData.barrio}`, 20, yPos);
        yPos += 10;
        doc.text(`Antigüedad: ${this.inmuebleData.antiguedad} años`, 20, yPos);
        yPos += 10;
        doc.text(`Calidad: ${this.inmuebleData.calidad}`, 20, yPos);
        yPos += 10;
        doc.text(`Superficie Cubierta: ${this.inmuebleData.supCubierta} m²`, 20, yPos);
        
        // Agregar comparables
        yPos += 20;
        doc.setFontSize(16);
        doc.text('Comparables', 20, yPos);
        
        doc.setFontSize(12);
        yPos += 10;
        this.comparables.forEach(comparable => {
            doc.text(`Comparable ${comparable.id}: $${comparable.valorM2Ajustado.toFixed(2)}/m²`, 20, yPos);
            yPos += 10;
        });
        
        // Agregar valor de referencia
        yPos += 10;
        doc.setFontSize(16);
        doc.text('Valor de Referencia', 20, yPos);
        
        doc.setFontSize(12);
        yPos += 10;
        doc.text(`Valor por m²: $${this.valorM2Referencia.toFixed(2)}`, 20, yPos);
        
        // Agregar valor total
        yPos += 20;
        doc.setFontSize(16);
        doc.text('Valor Total de Tasación', 20, yPos);
        
        doc.setFontSize(14);
        yPos += 10;
        const valorTotal = document.getElementById('valor-total-tasacion').textContent;
        doc.text(`$${valorTotal}`, 20, yPos);
        
        // Guardar el PDF
        doc.save('informe_tasacion.pdf');
        
        this.showNotification('Informe exportado correctamente', 'success');
    }

    // ==========================================================
    // MÉTODOS CORREGIDOS / AÑADIDOS
    // ==========================================================
    
    /**
     * Resetea el estado de la aplicación y los campos del formulario.
     * Es una función más robusta para ser usada por los tests y el botón de reinicio.
     */
    resetForm() {
        // Resetear variables de la aplicación
        this.inmuebleData = {};
        this.comparables = [];
        this.valorM2Referencia = 0;
        this.descuentoNegociacion = 10; // Valor por defecto

        // Resetear campos del formulario del paso 1
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
        document.getElementById('descuento-negociacion').value = 10;

        // Volver al paso 1 y actualizar UI
        this.goToStep(1);

        // Resetear otros componentes llamando a su método reset()
        // Esto evita re-instanciarlos, que era la causa del bug.
        if (window.comparablesManager) {
            window.comparablesManager.reset();
        }
        if (window.factoresManager) {
            window.factoresManager.reset();
        }
        if (window.composicionManager) {
            window.composicionManager.reset();
        }

        // CORRECCIÓN: Ocultar el modal, no eliminarlo del DOM
        const modal = document.getElementById('modal-comparable');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Resetea la aplicación mostrando un diálogo de confirmación.
     * Ahora utiliza el método resetForm() para la lógica principal.
     */
    resetApp() {
        if (confirm('¿Está seguro de que desea reiniciar la aplicación? Se perderán todos los datos ingresados.')) {
            this.resetForm(); // <-- Usar la nueva función
            this.showNotification('Aplicación reiniciada correctamente', 'success');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.tasacionApp = new TasacionApp();
});
