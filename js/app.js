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
        this.trackPageView();
    }

    // CORRECCIÓN 1: Nueva función para formatear moneda
    formatCurrency(value) {
        if (isNaN(value) || value === null) return 'USD 0,00';
        const number = parseFloat(value);
        // Usamos 'es-AR' que usa punto como separador de miles y coma para decimales
        const formattedNumber = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
        return `USD ${formattedNumber}`;
    }

    trackPageView() {
        console.log(`Página vista: Paso ${this.currentStep}`);
        let stepViews = JSON.parse(localStorage.getItem('stepViews') || '{}');
        stepViews[`step-${this.currentStep}`] = (stepViews[`step-${this.currentStep}`] || 0) + 1;
        localStorage.setItem('stepViews', JSON.stringify(stepViews));
    }

    setupEventListeners() {
        document.getElementById('btn-siguiente-1').addEventListener('click', () => this.validateAndNext(1));
        document.getElementById('btn-siguiente-2').addEventListener('click', () => this.validateAndNext(2));
        document.getElementById('btn-siguiente-3').addEventListener('click', () => this.validateAndNext(3));
        document.getElementById('btn-siguiente-4').addEventListener('click', () => this.validateAndNext(4));
        
        document.getElementById('btn-anterior-2').addEventListener('click', () => this.goToStep(1));
        document.getElementById('btn-anterior-3').addEventListener('click', () => this.goToStep(2));
        document.getElementById('btn-anterior-4').addEventListener('click', () => this.goToStep(3));
        document.getElementById('btn-anterior-5').addEventListener('click', () => this.goToStep(4));
        
        document.getElementById('descuento-negociacion').addEventListener('change', (e) => {
            this.descuentoNegociacion = parseFloat(e.target.value);
            this.updateComparableValues();
        });
        
        document.getElementById('metodo-calculo').addEventListener('change', () => {
            this.calculateReferenceValue();
        });
        
        document.getElementById('btn-exportar').addEventListener('click', () => this.exportReport());
        document.getElementById('btn-reiniciar').addEventListener('click', () => this.resetApp());
        
        const saveButton = document.getElementById('btn-guardar-backend');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveQuotationLocally());
        }
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
                isValid = true;
                if (isValid) {
                    this.goToStep(5);
                }
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
        
        const superficie = parseFloat(document.getElementById('sup-cubierta').value);
        if (isNaN(superficie) || superficie <= 0) {
            this.showNotification('La superficie cubierta debe ser un número mayor a cero', 'error');
            document.getElementById('sup-cubierta').focus();
            return false;
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

    // CORRECCIÓN 4: La validación de factores ahora siempre es true
    validateFactors() {
        // Los factores por defecto son 0, así que siempre es válido.
        // Se permite al usuario avanzar sin tener que ajustarlos.
        return true;
    }

    calculateReferenceValue() {
        if (!this.comparables || this.comparables.length === 0) {
            document.getElementById('valor-m2-referencia').textContent = this.formatCurrency(0);
            this.valorM2Referencia = 0;
            this.displayAdjustedValues();
            return;
        }

        const metodo = document.getElementById('metodo-calculo').value;
        const valoresAjustados = this.comparables.map(c => c.valorM2Ajustado);
        
        let valorReferencia;
        
        switch (metodo) {
            case 'promedio':
                valorReferencia = valoresAjustados.reduce((sum, val) => sum + val, 0) / valoresAjustados.length;
                break;
            case 'promedio-ponderado':
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
        
        // CORRECCIÓN 1: Usar la nueva función de formato
        document.getElementById('valor-m2-referencia').textContent = this.formatCurrency(valorReferencia);
        this.displayAdjustedValues();
    }

    displayAdjustedValues() {
        const container = document.getElementById('valores-ajustados-container');
        container.innerHTML = '';
        
        if (!this.comparables || this.comparables.length === 0) return;

        const adjustedValues = document.createElement('div');
        adjustedValues.className = 'adjusted-values';
        
        this.comparables.forEach(comparable => {
            const valueItem = document.createElement('div');
            valueItem.className = 'adjusted-value-item';
            // CORRECCIÓN 1: Usar la nueva función de formato
            valueItem.innerHTML = `
                <div class="adjusted-value-label">Comparable ${comparable.id}</div>
                <div class="adjusted-value-amount">${this.formatCurrency(comparable.valorM2Ajustado)}/m²</div>
            `;
            adjustedValues.appendChild(valueItem);
        });
        
        container.appendChild(adjustedValues);
    }

    calculateComposition() {
        const coeficientes = {
            cubierta: 1.0,
            semicubierta: 0.5,
            descubierta: 0.2,
            balcon: 0.33
        };
        
        document.getElementById('comp-sup-cubierta').textContent = this.inmuebleData.supCubierta.toFixed(2);
        document.getElementById('comp-sup-semicubierta').textContent = this.inmuebleData.supSemicubierta.toFixed(2);
        document.getElementById('comp-sup-descubierta').textContent = this.inmuebleData.supDescubierta.toFixed(2);
        document.getElementById('comp-sup-balcon').textContent = this.inmuebleData.supBalcon.toFixed(2);
        
        const valorCubierta = this.inmuebleData.supCubierta * coeficientes.cubierta * this.valorM2Referencia;
        const valorSemicubierta = this.inmuebleData.supSemicubierta * coeficientes.semicubierta * this.valorM2Referencia;
        const valorDescubierta = this.inmuebleData.supDescubierta * coeficientes.descubierta * this.valorM2Referencia;
        const valorBalcon = this.inmuebleData.supBalcon * coeficientes.balcon * this.valorM2Referencia;
        
        const valorCochera = this.inmuebleData.cochera === 'propia' ? 5000 : 
                             this.inmuebleData.cochera === 'comun' ? 2000 : 0;
        
        // CORRECCIÓN 1: Usar la nueva función de formato en todos los valores
        document.getElementById('comp-valor-m2').textContent = this.formatCurrency(this.valorM2Referencia);
        document.getElementById('comp-valor-cubierta').textContent = this.formatCurrency(valorCubierta);
        
        document.getElementById('comp-valor-m2-semi').textContent = this.formatCurrency(this.valorM2Referencia * coeficientes.semicubierta);
        document.getElementById('comp-valor-semicubierta').textContent = this.formatCurrency(valorSemicubierta);
        
        document.getElementById('comp-valor-m2-desc').textContent = this.formatCurrency(this.valorM2Referencia * coeficientes.descubierta);
        document.getElementById('comp-valor-descubierta').textContent = this.formatCurrency(valorDescubierta);
        
        document.getElementById('comp-valor-m2-balc').textContent = this.formatCurrency(this.valorM2Referencia * coeficientes.balcon);
        document.getElementById('comp-valor-balcon').textContent = this.formatCurrency(valorBalcon);
        
        document.getElementById('comp-valor-m2-cochera').textContent = 'Global';
        document.getElementById('comp-valor-cochera').textContent = this.formatCurrency(valorCochera);
        
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + valorCochera;
        // CORRECCIÓN 1: Formato final correcto
        document.getElementById('valor-total-tasacion').textContent = this.formatCurrency(valorTotal);
    }

    goToStep(step) {
        document.getElementById(`step-${this.currentStep}`).classList.remove('active');
        document.getElementById(`step-${step}`).classList.add('active');
        this.currentStep = step;
        this.updateProgressIndicator();
        this.trackPageView();
        
        if (step === 3) {
            setTimeout(() => {
                if (window.factoresManager) {
                    window.factoresManager.initFactors();
                }
            }, 300);
        }
        
        if (step === 4) {
            setTimeout(() => {
                this.calculateReferenceValue();
            }, 300);
        }
        
        // CORRECCIÓN 3 y 5: Lógica actualizada para los pasos 2 y 5
        if (step === 2) {
            // CORRECCIÓN 5: Forzar actualización de la UI de comparables al volver
            setTimeout(() => {
                this.updateComparableValues();
            }, 300);
        }

        if (step === 5) {
            setTimeout(() => {
                // CORRECCIÓN 3: Asegurarse que el valor de referencia esté actualizado
                this.calculateReferenceValue();
                // Luego calcular la composición con el valor correcto
                this.calculateComposition();
            }, 300);
        }
    }

    updateProgressIndicator() {
        for (let i = 1; i < this.currentStep; i++) {
            const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
            stepEl.classList.add('completed');
            stepEl.setAttribute('aria-selected', 'false');
        }
        
        const currentStepEl = document.querySelector(`.progress-step[data-step="${this.currentStep}"]`);
        currentStepEl.classList.add('active');
        currentStepEl.setAttribute('aria-selected', 'true');
        
        for (let i = this.currentStep + 1; i <= this.totalSteps; i++) {
            const step = document.querySelector(`.progress-step[data-step="${i}"]`);
            step.classList.remove('completed', 'active');
            step.setAttribute('aria-selected', 'false');
        }
    }

    updateComparableValues() {
        this.comparables.forEach(comparable => {
            const precioAjustado = comparable.precio * (1 - this.descuentoNegociacion / 100);
            comparable.valorM2 = precioAjustado / comparable.supCubierta;
            
            if (comparable.factores && Object.keys(comparable.factores).length > 0) {
                const correccionTotal = Object.values(comparable.factores).reduce((sum, val) => sum + val, 0);
                comparable.valorM2Ajustado = comparable.valorM2 * (1 + correccionTotal / 100);
            } else {
                comparable.valorM2Ajustado = comparable.valorM2;
            }
        });
        
        if (window.comparablesManager) {
            window.comparablesManager.updateComparablesUI();
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async saveQuotationLocally() {
        const quotationData = {
            id: new Date().getTime(),
            inmuebleData: this.inmuebleData,
            comparables: this.comparables,
            valorM2Referencia: this.valorM2Referencia,
            valorFinal: document.getElementById('valor-total-tasacion').textContent,
            fecha: new Date().toISOString()
        };

        try {
            let savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
            savedQuotations.push(quotationData);
            localStorage.setItem('savedQuotations', JSON.stringify(savedQuotations));

            this.showNotification(`Cotización guardada localmente con ID: ${quotationData.id}`, 'success');

        } catch (error) {
            this.showNotification('No se pudo guardar la cotización localmente.', 'error');
        }
    }

    async loadQuotationLocally(quotationId) {
        try {
            const savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
            const data = savedQuotations.find(q => q.id == quotationId);

            if (!data) {
                throw new Error('No se encontró la cotización.');
            }
            
            this.inmuebleData = data.inmuebleData;
            this.comparables = data.comparables;
            this.valorM2Referencia = data.valorM2Referencia;
            
            this.updateUIWithLoadedData();
            this.goToStep(5);

            this.showNotification('Cotización cargada correctamente.', 'success');

        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    updateUIWithLoadedData() {
        document.getElementById('tipo-propiedad').value = this.inmuebleData.tipoPropiedad || '';
        document.getElementById('direccion').value = this.inmuebleData.direccion || '';
        document.getElementById('piso').value = this.inmuebleData.piso || '';
        document.getElementById('depto').value = this.inmuebleData.depto || '';
        document.getElementById('localidad').value = this.inmuebleData.localidad || '';
        document.getElementById('barrio').value = this.inmuebleData.barrio || '';
        document.getElementById('antiguedad').value = this.inmuebleData.antiguedad || '';
        document.getElementById('calidad').value = this.inmuebleData.calidad || '';
        document.getElementById('sup-cubierta').value = this.inmuebleData.supCubierta || '';
        document.getElementById('sup-semicubierta').value = this.inmuebleData.supSemicubierta || '';
        document.getElementById('sup-descubierta').value = this.inmuebleData.supDescubierta || '';
        document.getElementById('sup-balcon').value = this.inmuebleData.supBalcon || '';
        document.getElementById('sup-terreno').value = this.inmuebleData.supTerreno || '';
        document.getElementById('cochera').value = this.inmuebleData.cochera || 'no';
        
        if (window.comparablesManager) {
            window.comparablesManager.loadComparables(this.comparables);
        }
    }

    exportReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica");
        const primaryColor = [0, 51, 102];
        const secondaryColor = [100, 100, 100];

        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("INFORME DE TASACIÓN", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text("Century21 Inmobiliaria", 105, 28, { align: 'center' });
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 105, 35, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("1. Datos del Inmueble", 20, 55);
        doc.setDrawColor(...secondaryColor);
        doc.line(20, 57, 190, 57);

        doc.setFontSize(11);
        let yPos = 65;
        const lineHeight = 7;

        const datosInmueble = [
            `Dirección: ${this.inmuebleData.direccion}`,
            `Tipo: ${this.inmuebleData.tipoPropiedad}`,
            `Ubicación: ${this.inmuebleData.localidad}, ${this.inmuebleData.barrio}`,
            `Antigüedad: ${this.inmuebleData.antiguedad} años`,
            `Calidad: ${this.inmuebleData.calidad}`,
            `Sup. Cubierta: ${this.inmuebleData.supCubierta} m²`,
            `Sup. Semicubierta: ${this.inmuebleData.supSemicubierta} m²`,
            `Sup. Descubierta: ${this.inmuebleData.supDescubierta} m²`,
        ];

        datosInmueble.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += lineHeight;
        });

        yPos += 10;
        doc.setFontSize(16);
        doc.text("2. Análisis de Comparables", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 10;

        doc.setFontSize(10);
        doc.text("Se analizaron las siguientes propiedades similares para determinar el valor de referencia:", 20, yPos);
        yPos += lineHeight;

        const headers = ["Dirección", "Precio Venta", "Valor m² Ajustado"];
        // CORRECCIÓN 1: Formatear valores para el PDF
        const data = this.comparables.map(c => [
            c.direccion,
            this.formatCurrency(c.precio),
            `${this.formatCurrency(c.valorM2Ajustado)}/m²`
        ]);
        
        let xPos = 20;
        headers.forEach(header => {
            doc.text(header, xPos, yPos);
            xPos += 60;
        });
        yPos += lineHeight;
        doc.line(20, yPos-1, 190, yPos-1);

        data.forEach(row => {
            xPos = 20;
            row.forEach(cell => {
                doc.text(cell, xPos, yPos);
                xPos += 60;
            });
            yPos += lineHeight;
        });

        yPos += 10;
        doc.setFontSize(16);
        doc.text("3. Valor de Tasación", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 15;

        doc.setFontSize(12);
        doc.text(`Valor de Referencia por m²: ${this.formatCurrency(this.valorM2Referencia)}`, 20, yPos);
        yPos += lineHeight * 2;
        
        doc.setFontSize(18);
        doc.setTextColor(...primaryColor);
        const valorFinalTexto = document.getElementById('valor-total-tasacion').textContent;
        doc.text(`Valor Final de Tasación: ${valorFinalTexto}`, 20, yPos);
        
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text("Este informe es una estimación y puede variar según las condiciones del mercado.", 105, 280, { align: 'center' });
        doc.text("Generado por Cotizador Inmobiliario Century21 V2.0", 105, 285, { align: 'center' });

        doc.save(`informe_tasacion_${this.inmuebleData.direccion.replace(/ /g, '_')}.pdf`);
        this.showNotification('Informe exportado correctamente', 'success');
    }
    
    resetForm() {
        this.inmuebleData = {};
        this.comparables = [];
        this.valorM2Referencia = 0;
        this.descuentoNegociacion = 10;

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

        this.goToStep(1);

        if (window.comparablesManager) {
            window.comparablesManager.reset();
        }
        if (window.factoresManager) {
            window.factoresManager.reset();
        }
        if (window.composicionManager) {
            window.composicionManager.reset();
        }

        const modal = document.getElementById('modal-comparable');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetApp() {
        if (confirm('¿Está seguro de que desea reiniciar la aplicación? Se perderán todos los datos ingresados.')) {
            this.resetForm();
            this.showNotification('Aplicación reiniciada correctamente', 'success');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tasacionApp = new TasacionApp();
});
