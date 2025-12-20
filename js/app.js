/**
 * Aplicación Principal del Cotizador Inmobiliario Century 21
 * Versión: 2.0
 * Descripción: Controlador principal de la aplicación
 */

// Objeto global para la aplicación
window.CotizadorApp = {
    // Estado actual de la aplicación
    currentStep: 1,
    totalSteps: 5,
    
    // Datos del inmueble
    propertyData: {
        tipoPropiedad: '',
        direccion: '',
        piso: '',
        depto: '',
        localidad: '',
        barrio: '',
        antiguedad: '',
        calidad: '',
        supCubierta: 0,
        supSemicubierta: 0,
        supDescubierta: 0,
        supBalcon: 0,
        supTerreno: 0,
        cochera: 'no'
    },
    
    // Lista de comparables
    comparables: [],
    
    // Datos de factores de ajuste
    adjustmentFactors: {},
    
    // Datos de composición del valor
    compositionData: {
        valorM2: 0,
        valorTotal: 0
    },
    
    // Inicialización de la aplicación
    init: function() {
        console.log('Inicializando CotizadorApp...');
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Inicializar componentes
        this.initializeComponents();
        
        // Cargar datos guardados si existen
        this.loadSavedData();
        
        console.log('CotizadorApp inicializado correctamente');
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botones de navegación
        document.getElementById('btn-siguiente-1').addEventListener('click', () => this.validateAndNext(1));
        document.getElementById('btn-siguiente-2').addEventListener('click', () => this.validateAndNext(2));
        document.getElementById('btn-siguiente-3').addEventListener('click', () => this.validateAndNext(3));
        document.getElementById('btn-siguiente-4').addEventListener('click', () => this.validateAndNext(4));
        
        document.getElementById('btn-anterior-2').addEventListener('click', () => this.goToStep(1));
        document.getElementById('btn-anterior-3').addEventListener('click', () => this.goToStep(2));
        document.getElementById('btn-anterior-4').addEventListener('click', () => this.goToStep(3));
        document.getElementById('btn-anterior-5').addEventListener('click', () => this.goToStep(4));
        
        // Botones de acciones finales
        document.getElementById('btn-reiniciar').addEventListener('click', () => this.restart());
        document.getElementById('btn-exportar').addEventListener('click', () => this.exportReport());
        document.getElementById('btn-guardar-backend').addEventListener('click', () => this.saveToBackend());
        
        // Event listeners para cambios en formularios
        this.setupFormListeners();
    },
    
    // Configurar listeners para formularios
    setupFormListeners: function() {
        // Listener para cambios en el formulario del paso 1
        const step1Inputs = document.querySelectorAll('#step-1 input, #step-1 select');
        step1Inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePropertyData();
            });
        });
        
        // Listener para cambios en el método de cálculo
        const metodoCalculo = document.getElementById('metodo-calculo');
        if (metodoCalculo) {
            metodoCalculo.addEventListener('change', () => {
                this.calculateReferenceValue();
            });
        }
    },
    
    // Inicializar componentes específicos
    initializeComponents: function() {
        // Inicializar componente de comparables si existe
        if (typeof window.ComparablesManager !== 'undefined') {
            window.ComparablesManager.init();
        }
        
        // Inicializar componente de factores si existe
        if (typeof window.FactorsManager !== 'undefined') {
            window.FactorsManager.init();
        }
        
        // Inicializar componente de composición si existe
        if (typeof window.CompositionManager !== 'undefined') {
            window.CompositionManager.init();
        }
    },
    
    // Validar y avanzar al siguiente paso
    validateAndNext: function(step) {
        let isValid = false;
        
        switch (step) {
            case 1:
                isValid = this.validateInmuebleData();
                break;
            case 2:
                isValid = this.validateComparables();
                break;
            case 3:
                isValid = this.validateFactors();
                break;
            case 4:
                isValid = this.validateReferenceValue();
                break;
        }
        
        if (isValid) {
            this.goToStep(step + 1);
        }
    },
    
    // Navegar a un paso específico
    goToStep: function(step) {
        if (step < 1 || step > this.totalSteps) {
            console.error(`Paso inválido: ${step}`);
            return;
        }
        
        // Ocultar todos los pasos
        document.querySelectorAll('.step-content').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostrar el paso actual
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Actualizar indicadores de progreso
        document.querySelectorAll('.progress-step').forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-selected', 'false');
        });
        
        document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${step}"]`).setAttribute('aria-selected', 'true');
        
        // Actualizar estado
        this.currentStep = step;
        
        // Ejecutar acciones específicas del paso
        this.executeStepActions(step);
    },
    
    // Ejecutar acciones específicas según el paso
    executeStepActions: function(step) {
        switch (step) {
            case 2:
                // Actualizar lista de comparables
                if (typeof window.ComparablesManager !== 'undefined') {
                    window.ComparablesManager.renderComparables();
                }
                break;
            case 3:
                // Cargar factores de ajuste
                if (typeof window.FactorsManager !== 'undefined') {
                    window.FactorsManager.loadFactors();
                }
                break;
            case 4:
                // Calcular valor de referencia
                this.calculateReferenceValue();
                break;
            case 5:
                // Calcular composición del valor
                this.calculateComposition();
                break;
        }
    },
    
    // Validar datos del inmueble
    validateInmuebleData: function() {
        // Actualizar datos del inmueble
        this.updatePropertyData();
        
        // Validar campos requeridos
        const requiredFields = [
            'tipo-propiedad', 'direccion', 'localidad', 'barrio', 
            'antiguedad', 'calidad', 'sup-cubierta'
        ];
        
        let isValid = true;
        let firstInvalidField = null;
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
                
                if (field) {
                    field.classList.add('error');
                }
            } else if (field) {
                field.classList.remove('error');
            }
        }
        
        if (!isValid) {
            this.showNotification('Por favor, complete todos los campos requeridos', 'error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return false;
        }
        
        // Validar que la superficie cubierta sea mayor a cero
        const supCubierta = parseFloat(document.getElementById('sup-cubierta').value);
        if (isNaN(supCubierta) || supCubierta <= 0) {
            this.showNotification('La superficie cubierta debe ser mayor a cero', 'error');
            document.getElementById('sup-cubierta').classList.add('error');
            document.getElementById('sup-cubierta').focus();
            return false;
        }
        
        return true;
    },
    
    // Validar comparables
    validateComparables: function() {
        if (this.comparables.length < 4) {
            this.showNotification('Debe agregar al menos 4 comparables para continuar', 'error');
            return false;
        }
        
        return true;
    },
    
    // Validar factores de ajuste
    validateFactors: function() {
        // Aquí iría la validación específica de factores
        // Por ahora, siempre retornamos true
        return true;
    },
    
    // Validar valor de referencia
    validateReferenceValue: function() {
        const valorM2Element = document.getElementById('valor-m2-referencia');
        const valorM2 = parseFloat(valorM2Element.getAttribute('data-raw-value') || '0');
        
        if (isNaN(valorM2) || valorM2 <= 0) {
            this.showNotification('El valor de referencia debe ser mayor a cero', 'error');
            return false;
        }
        
        return true;
    },
    
    // Actualizar datos del inmueble desde el formulario
    updatePropertyData: function() {
        this.propertyData = {
            tipoPropiedad: document.getElementById('tipo-propiedad').value,
            direccion: document.getElementById('direccion').value,
            piso: document.getElementById('piso').value,
            depto: document.getElementById('depto').value,
            localidad: document.getElementById('localidad').value,
            barrio: document.getElementById('barrio').value,
            antiguedad: document.getElementById('antiguedad').value,
            calidad: document.getElementById('calidad').value,
            supCubierta: parseFloat(document.getElementById('sup-cubierta').value) || 0,
            supSemicubierta: parseFloat(document.getElementById('sup-semicubierta').value) || 0,
            supDescubierta: parseFloat(document.getElementById('sup-descubierta').value) || 0,
            supBalcon: parseFloat(document.getElementById('sup-balcon').value) || 0,
            supTerreno: parseFloat(document.getElementById('sup-terreno').value) || 0,
            cochera: document.getElementById('cochera').value
        };
    },
    
    // Calcular valor de referencia
    calculateReferenceValue: function() {
        if (this.comparables.length === 0) return;
        
        const metodo = document.getElementById('metodo-calculo').value;
        let valorM2 = 0;
        
        // Obtener valores ajustados de los comparables
        const valoresAjustados = this.comparables.map(comp => {
            // Aplicar descuento de negociación
            const descuento = parseFloat(document.getElementById('descuento-negociacion').value) || 10;
            const precioConDescuento = comp.precio * (1 - descuento / 100);
            
            // Calcular valor por m2 ajustado
            const supTotal = comp.supCubierta + 
                           (comp.supSemicubierta || 0) * 0.5 + 
                           (comp.supDescubierta || 0) * 0.2 + 
                           (comp.supBalcon || 0) * 0.33;
            
            return precioConDescuento / supTotal;
        });
        
        // Calcular según método seleccionado
        switch (metodo) {
            case 'promedio':
                valorM2 = valoresAjustados.reduce((sum, val) => sum + val, 0) / valoresAjustados.length;
                break;
            case 'promedio-ponderado':
                // Implementar lógica de promedio ponderado
                valorM2 = valoresAjustados.reduce((sum, val) => sum + val, 0) / valoresAjustados.length;
                break;
            case 'mediana':
                // Implementar lógica de mediana
                const sorted = [...valoresAjustados].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                valorM2 = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                break;
        }
        
        // Actualizar UI
        const valorM2Element = document.getElementById('valor-m2-referencia');
        valorM2Element.textContent = `USD ${valorM2.toFixed(2).replace('.', ',')}`;
        valorM2Element.setAttribute('data-raw-value', valorM2.toString());
        
        // Guardar en datos de composición
        this.compositionData.valorM2 = valorM2;
        
        // Mostrar valores ajustados
        this.mostrarValoresAjustados();
    },
    
    // Mostrar valores ajustados de comparables
    mostrarValoresAjustados: function() {
        const container = document.getElementById('valores-ajustados-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.comparables.forEach((comp, index) => {
            // Calcular valor ajustado
            const descuento = parseFloat(document.getElementById('descuento-negociacion').value) || 10;
            const precioConDescuento = comp.precio * (1 - descuento / 100);
            
            const supTotal = comp.supCubierta + 
                           (comp.supSemicubierta || 0) * 0.5 + 
                           (comp.supDescubierta || 0) * 0.2 + 
                           (comp.supBalcon || 0) * 0.33;
            
            const valorM2Ajustado = precioConDescuento / supTotal;
            
            // Crear elemento
            const item = document.createElement('div');
            item.className = 'valor-ajustado-item';
            item.innerHTML = `
                <span>Comparable ${index + 1}: ${comp.direccion}</span>
                <span>USD ${valorM2Ajustado.toFixed(2).replace('.', ',')}</span>
            `;
            
            container.appendChild(item);
        });
    },
    
    // Calcular composición del valor
    calculateComposition: function() {
        const valorM2 = this.compositionData.valorM2;
        
        // Calcular valores parciales
        const valorCubierta = this.propertyData.supCubierta * valorM2;
        const valorSemicubierta = this.propertyData.supSemicubierta * valorM2 * 0.5;
        const valorDescubierta = this.propertyData.supDescubierta * valorM2 * 0.2;
        const valorBalcon = this.propertyData.supBalcon * valorM2 * 0.33;
        
        // Valor de cochera (valor fijo)
        const valorCochera = this.propertyData.cochera !== 'no' ? 15000 : 0;
        
        // Calcular total
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + valorCochera;
        
        // Actualizar UI
        document.getElementById('comp-sup-cubierta').textContent = this.propertyData.supCubierta.toFixed(2);
        document.getElementById('comp-sup-semicubierta').textContent = this.propertyData.supSemicubierta.toFixed(2);
        document.getElementById('comp-sup-descubierta').textContent = this.propertyData.supDescubierta.toFixed(2);
        document.getElementById('comp-sup-balcon').textContent = this.propertyData.supBalcon.toFixed(2);
        document.getElementById('comp-sup-cochera').textContent = this.propertyData.cochera !== 'no' ? 'Sí' : 'No';
        
        document.getElementById('comp-valor-m2').textContent = `USD ${valorM2.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-semi').textContent = `USD ${(valorM2 * 0.5).toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-desc').textContent = `USD ${(valorM2 * 0.2).toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-balc').textContent = `USD ${(valorM2 * 0.33).toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-cochera').textContent = `USD ${valorCochera.toFixed(2).replace('.', ',')}`;
        
        document.getElementById('comp-valor-cubierta').textContent = `USD ${valorCubierta.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-semicubierta').textContent = `USD ${valorSemicubierta.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-descubierta').textContent = `USD ${valorDescubierta.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-balcon').textContent = `USD ${valorBalcon.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-cochera').textContent = `USD ${valorCochera.toFixed(2).replace('.', ',')}`;
        
        const totalElement = document.getElementById('valor-total-tasacion');
        totalElement.textContent = `USD ${valorTotal.toFixed(2).replace('.', ',')}`;
        totalElement.setAttribute('data-raw-value', valorTotal.toString());
        
        // Guardar en datos de composición
        this.compositionData.valorTotal = valorTotal;
    },
    
    // Mostrar notificación
    showNotification: function(message, type = 'info') {
        // Crear elemento de notificación si no existe
        let notificationContainer = document.getElementById('notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Añadir a contenedor
        notificationContainer.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },
    
    // Reiniciar aplicación
    restart: function() {
        if (confirm('¿Está seguro de que desea reiniciar la cotización? Se perderán todos los datos ingresados.')) {
            // Resetear estado
            this.currentStep = 1;
            this.propertyData = {
                tipoPropiedad: '',
                direccion: '',
                piso: '',
                depto: '',
                localidad: '',
                barrio: '',
                antiguedad: '',
                calidad: '',
                supCubierta: 0,
                supSemicubierta: 0,
                supDescubierta: 0,
                supBalcon: 0,
                supTerreno: 0,
                cochera: 'no'
            };
            this.comparables = [];
            this.adjustmentFactors = {};
            this.compositionData = {
                valorM2: 0,
                valorTotal: 0
            };
            
            // Resetear formulario
            document.getElementById('form-inmueble').reset();
            
            // Volver al primer paso
            this.goToStep(1);
            
            // Limpiar localStorage
            localStorage.removeItem('cotizador-data');
            
            this.showNotification('Cotización reiniciada', 'success');
        }
    },
    
    // Exportar informe
    exportReport: function() {
        this.showNotification('Función de exportación en desarrollo', 'info');
    },
    
    // Guardar en backend
    saveToBackend: function() {
        // Preparar datos para enviar
        const data = {
            propertyData: this.propertyData,
            comparables: this.comparables,
            adjustmentFactors: this.adjustmentFactors,
            compositionData: this.compositionData,
            timestamp: new Date().toISOString()
        };
        
        // Enviar al backend
        fetch('/api/save-valuation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar en el servidor');
            }
            return response.json();
        })
        .then(result => {
            this.showNotification('Tasación guardada correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al guardar:', error);
            this.showNotification('Error al guardar la tasación', 'error');
        });
    },
    
    // Guardar datos localmente
    saveDataLocally: function() {
        const data = {
            propertyData: this.propertyData,
            comparables: this.comparables,
            adjustmentFactors: this.adjustmentFactors,
            compositionData: this.compositionData,
            currentStep: this.currentStep
        };
        
        localStorage.setItem('cotizador-data', JSON.stringify(data));
    },
    
    // Cargar datos guardados
    loadSavedData: function() {
        const savedData = localStorage.getItem('cotizador-data');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Restaurar datos
                this.propertyData = data.propertyData || this.propertyData;
                this.comparables = data.comparables || [];
                this.adjustmentFactors = data.adjustmentFactors || {};
                this.compositionData = data.compositionData || this.compositionData;
                
                // Restaurar formulario
                this.restoreForm();
                
                // Ir al paso guardado
                const step = data.currentStep || 1;
                this.goToStep(step);
                
                this.showNotification('Datos recuperados correctamente', 'success');
            } catch (error) {
                console.error('Error al cargar datos guardados:', error);
            }
        }
    },
    
    // Restaurar formulario con datos guardados
    restoreForm: function() {
        // Restaurar datos del inmueble
        document.getElementById('tipo-propiedad').value = this.propertyData.tipoPropiedad;
        document.getElementById('direccion').value = this.propertyData.direccion;
        document.getElementById('piso').value = this.propertyData.piso;
        document.getElementById('depto').value = this.propertyData.depto;
        document.getElementById('localidad').value = this.propertyData.localidad;
        document.getElementById('barrio').value = this.propertyData.barrio;
        document.getElementById('antiguedad').value = this.propertyData.antiguedad;
        document.getElementById('calidad').value = this.propertyData.calidad;
        document.getElementById('sup-cubierta').value = this.propertyData.supCubierta;
        document.getElementById('sup-semicubierta').value = this.propertyData.supSemicubierta;
        document.getElementById('sup-descubierta').value = this.propertyData.supDescubierta;
        document.getElementById('sup-balcon').value = this.propertyData.supBalcon;
        document.getElementById('sup-terreno').value = this.propertyData.supTerreno;
        document.getElementById('cochera').value = this.propertyData.cochera;
    }
};

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.CotizadorApp.init();
});

// Guardar datos automáticamente antes de salir de la página
window.addEventListener('beforeunload', function() {
    window.CotizadorApp.saveDataLocally();
});
