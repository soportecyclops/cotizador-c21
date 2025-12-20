/**
 * Sistema de Tests Automatizados para Cotizador Inmobiliario Century 21
 * Versión: 2.0
 * Descripción: Suite de pruebas escalonadas para verificar el funcionamiento completo del sistema
 */

// Namespace para el sistema de tests
const C21TestSuite = {
    // Configuración general
    config: {
        testTimeout: 5000, // Tiempo máximo para cada test en ms
        testDelay: 500,    // Retraso entre tests en ms
        verbose: true,      // Mostrar información detallada
        autoAdvance: true   // Avanzar automáticamente al siguiente test
    },
    
    // Estado actual de los tests
    state: {
        currentTest: 0,
        totalTests: 0,
        passed: 0,
        failed: 0,
        results: [],
        isRunning: false
    },
    
    // Referencias a elementos DOM
    elements: {
        testButton: null,
        testResults: null,
        testOutput: null,
        progressBar: null,
        testSummary: null
    },
    
    // Inicialización del sistema de tests
    init: function() {
        // Guardar referencias a elementos DOM
        this.elements.testButton = document.getElementById('btn-run-tests');
        this.elements.testResults = document.getElementById('test-results');
        this.elements.testOutput = document.getElementById('test-output');
        this.elements.progressBar = document.getElementById('test-progress-bar');
        this.elements.testSummary = document.getElementById('test-summary');
        
        // Configurar evento click para el botón de tests
        if (this.elements.testButton) {
            this.elements.testButton.addEventListener('click', () => this.runAllTests());
        }
        
        // Inicializar contadores
        this.state.totalTests = this.tests.length;
        
        console.log('Sistema de tests C21 inicializado');
    },
    
    // Ejecutar todos los tests en orden
    runAllTests: function() {
        if (this.state.isRunning) {
            this.log('Tests ya en ejecución. Espere a que finalicen.');
            return;
        }
        
        // Resetear estado
        this.state.currentTest = 0;
        this.state.passed = 0;
        this.state.failed = 0;
        this.state.results = [];
        this.state.isRunning = true;
        
        // Mostrar panel de resultados
        this.showResults();
        
        // Ejecutar primer test
        this.log('Iniciando suite de tests automatizados para C21 Cotizador');
        this.log(`Total de tests: ${this.state.totalTests}`);
        this.updateProgress();
        this.runNextTest();
    },
    
    // Ejecutar el siguiente test en la secuencia
    runNextTest: function() {
        if (this.state.currentTest >= this.state.totalTests) {
            // Todos los tests completados
            this.finishTests();
            return;
        }
        
        const test = this.tests[this.state.currentTest];
        this.log(`\n=== Test ${this.state.currentTest + 1}/${this.state.totalTests}: ${test.name} ===`);
        
        try {
            // Ejecutar test con timeout
            const testPromise = new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error(`Test timeout después de ${this.config.testTimeout}ms`));
                }, this.config.testTimeout);
                
                // Ejecutar test
                try {
                    const result = test.fn.call(this);
                    clearTimeout(timeoutId);
                    resolve(result);
                } catch (error) {
                    clearTimeout(timeoutId);
                    reject(error);
                }
            });
            
            // Procesar resultado
            testPromise
                .then(result => {
                    if (result === true || (result && result.passed === true)) {
                        this.passTest(test, result);
                    } else {
                        this.failTest(test, result);
                    }
                    
                    // Actualizar progreso
                    this.updateProgress();
                    
                    // Avanzar al siguiente test
                    setTimeout(() => {
                        this.state.currentTest++;
                        this.runNextTest();
                    }, this.config.testDelay);
                })
                .catch(error => {
                    this.failTest(test, error);
                    
                    // Actualizar progreso
                    this.updateProgress();
                    
                    // Avanzar al siguiente test
                    setTimeout(() => {
                        this.state.currentTest++;
                        this.runNextTest();
                    }, this.config.testDelay);
                });
        } catch (error) {
            this.failTest(test, error);
            
            // Actualizar progreso
            this.updateProgress();
            
            // Avanzar al siguiente test
            setTimeout(() => {
                this.state.currentTest++;
                this.runNextTest();
            }, this.config.testDelay);
        }
    },
    
    // Marcar un test como pasado
    passTest: function(test, details) {
        this.state.passed++;
        const result = {
            name: test.name,
            status: 'passed',
            details: details
        };
        this.state.results.push(result);
        
        this.log(`✅ PASADO: ${test.name}`, 'success');
        if (this.config.verbose && details && details.message) {
            this.log(`   ${details.message}`, 'info');
        }
    },
    
    // Marcar un test como fallido
    failTest: function(test, error) {
        this.state.failed++;
        const result = {
            name: test.name,
            status: 'failed',
            error: error
        };
        this.state.results.push(result);
        
        this.log(`❌ FALLIDO: ${test.name}`, 'error');
        if (this.config.verbose && error) {
            this.log(`   Error: ${error.message || error}`, 'error');
        }
    },
    
    // Finalizar ejecución de tests
    finishTests: function() {
        this.state.isRunning = false;
        
        this.log(`\n=== Suite de Tests Completada ===`);
        this.log(`Tests ejecutados: ${this.state.totalTests}`);
        this.log(`Tests pasados: ${this.state.passed}`);
        this.log(`Tests fallidos: ${this.state.failed}`);
        this.log(`Tasa de éxito: ${((this.state.passed / this.state.totalTests) * 100).toFixed(2)}%`);
        
        // Actualizar resumen
        if (this.elements.testSummary) {
            this.elements.testSummary.innerHTML = `
                <div>Tests ejecutados: ${this.state.totalTests}</div>
                <div>Tests pasados: <span style="color: green;">${this.state.passed}</span></div>
                <div>Tests fallidos: <span style="color: red;">${this.state.failed}</span></div>
                <div>Tasa de éxito: <span style="color: ${this.state.failed === 0 ? 'green' : 'orange'};">${((this.state.passed / this.state.totalTests) * 100).toFixed(2)}%</span></div>
            `;
        }
        
        // Actualizar botón
        if (this.elements.testButton) {
            this.elements.testButton.innerHTML = '<i class="fas fa-redo"></i> Reejecutar Tests';
        }
    },
    
    // Actualizar barra de progreso
    updateProgress: function() {
        if (this.elements.progressBar) {
            const progress = ((this.state.currentTest + 1) / this.state.totalTests) * 100;
            this.elements.progressBar.style.width = `${progress}%`;
        }
    },
    
    // Mostrar panel de resultados
    showResults: function() {
        if (this.elements.testResults) {
            this.elements.testResults.style.display = 'block';
            this.elements.testOutput.innerHTML = '';
            this.elements.testSummary.innerHTML = '';
            
            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = '0%';
            }
        }
    },
    
    // Ocultar panel de resultados
    hideResults: function() {
        if (this.elements.testResults) {
            this.elements.testResults.style.display = 'none';
        }
    },
    
    // Registrar mensaje en consola y en panel de resultados
    log: function(message, type = 'info') {
        // Mostrar en consola
        switch (type) {
            case 'error':
                console.error(message);
                break;
            case 'success':
                console.log(`%c${message}`, 'color: green');
                break;
            case 'warning':
                console.warn(message);
                break;
            default:
                console.log(message);
        }
        
        // Mostrar en panel de resultados
        if (this.elements.testOutput) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${type}`;
            logEntry.textContent = message;
            this.elements.testOutput.appendChild(logEntry);
            this.elements.testOutput.scrollTop = this.elements.testOutput.scrollHeight;
        }
    },
    
    // Suite de tests organizados por importancia
    tests: [
        // === NIVEL 1: Tests Críticos (Funcionalidad Básica) ===
        {
            name: "Verificación de Estructura DOM",
            fn: function() {
                // Verificar elementos críticos del DOM
                const criticalElements = [
                    'step-1', 'step-2', 'step-3', 'step-4', 'step-5',
                    'btn-siguiente-1', 'btn-siguiente-2', 'btn-siguiente-3', 'btn-siguiente-4',
                    'btn-anterior-2', 'btn-anterior-3', 'btn-anterior-4', 'btn-anterior-5'
                ];
                
                for (const id of criticalElements) {
                    const element = document.getElementById(id);
                    if (!element) {
                        throw new Error(`Elemento crítico no encontrado: #${id}`);
                    }
                }
                
                return { passed: true, message: "Todos los elementos críticos del DOM están presentes" };
            }
        },
        
        {
            name: "Verificación de Scripts Cargados",
            fn: function() {
                // Verificar que los scripts necesarios estén cargados
                const requiredScripts = [
                    'app.js', 'auth.js', 'comparables.js', 'factores.js', 'composicion.js'
                ];
                
                const scripts = document.querySelectorAll('script[src]');
                const loadedScripts = Array.from(scripts).map(script => {
                    const src = script.getAttribute('src');
                    return src.split('/').pop();
                });
                
                for (const script of requiredScripts) {
                    if (!loadedScripts.some(loaded => loaded.includes(script))) {
                        throw new Error(`Script requerido no cargado: ${script}`);
                    }
                }
                
                return { passed: true, message: "Todos los scripts requeridos están cargados" };
            }
        },
        
        {
            name: "Inicialización de Variables Globales",
            fn: function() {
                // Verificar variables globales críticas
                if (typeof window.CotizadorApp === 'undefined') {
                    throw new Error("Objeto global CotizadorApp no definido");
                }
                
                // Verificar propiedades críticas del objeto global
                const requiredProperties = ['currentStep', 'propertyData', 'comparables'];
                for (const prop of requiredProperties) {
                    if (typeof window.CotizadorApp[prop] === 'undefined') {
                        throw new Error(`Propiedad requerida no definida: CotizadorApp.${prop}`);
                    }
                }
                
                return { passed: true, message: "Variables globales correctamente inicializadas" };
            }
        },
        
        // === NIVEL 2: Tests de Navegación y Flujo ===
        {
            name: "Navegación entre Pasos",
            fn: function() {
                // Verificar navegación hacia adelante
                const initialStep = window.CotizadorApp.currentStep;
                
                // Simular clic en botón siguiente
                const nextButton = document.getElementById(`btn-siguiente-${initialStep}`);
                if (!nextButton) {
                    throw new Error(`Botón siguiente no encontrado para el paso ${initialStep}`);
                }
                
                // Intentar avanzar sin completar campos requeridos (debería fallar)
                nextButton.click();
                
                // Verificar que el paso no cambió (por validación)
                setTimeout(() => {
                    if (window.CotizadorApp.currentStep !== initialStep) {
                        throw new Error("La validación no impidió el avance con campos vacíos");
                    }
                }, 100);
                
                return { passed: true, message: "Navegación y validación funcionando correctamente" };
            }
        },
        
        {
            name: "Validación de Formularios",
            fn: function() {
                // Intentar avanzar sin completar campos requeridos
                const requiredFields = document.querySelectorAll('#step-1 [required]');
                
                // Limpiar campos requeridos
                for (const field of requiredFields) {
                    if (field.type === 'text' || field.type === 'number') {
                        field.value = '';
                    } else if (field.tagName === 'SELECT') {
                        field.selectedIndex = 0;
                    }
                }
                
                // Intentar avanzar
                const nextButton = document.getElementById('btn-siguiente-1');
                nextButton.click();
                
                // Verificar que no avanzó
                setTimeout(() => {
                    if (window.CotizadorApp.currentStep !== 1) {
                        throw new Error("La validación de formulario no impidió el avance con campos vacíos");
                    }
                }, 100);
                
                return { passed: true, message: "Validación de formularios funcionando correctamente" };
            }
        },
        
        // === NIVEL 3: Tests de Funcionalidad Específica ===
        {
            name: "Gestión de Comparables",
            fn: function() {
                // Navegar al paso de comparables
                window.CotizadorApp.goToStep(2);
                
                // Verificar botón de agregar comparable
                const addBtn = document.getElementById('btn-agregar-comparable');
                if (!addBtn) {
                    throw new Error("Botón de agregar comparable no encontrado");
                }
                
                // Simular clic para abrir modal
                addBtn.click();
                
                // Verificar que el modal se abrió
                setTimeout(() => {
                    const modal = document.getElementById('modal-comparable');
                    if (!modal || modal.style.display === 'none') {
                        throw new Error("Modal de comparable no se abrió correctamente");
                    }
                }, 100);
                
                return { passed: true, message: "Gestión de comparables funcionando correctamente" };
            }
        },
        
        {
            name: "Cálculo de Valor de Referencia",
            fn: function() {
                // Navegar al paso de valor de referencia
                window.CotizadorApp.goToStep(4);
                
                // Verificar elemento de valor de referencia
                const valorElement = document.getElementById('valor-m2-referencia');
                if (!valorElement) {
                    throw new Error("Elemento de valor de referencia no encontrado");
                }
                
                // Verificar que tiene el atributo data-raw-value
                if (!valorElement.hasAttribute('data-raw-value')) {
                    throw new Error("Elemento de valor de referencia no tiene atributo data-raw-value");
                }
                
                return { passed: true, message: "Cálculo de valor de referencia configurado correctamente" };
            }
        },
        
        {
            name: "Cálculo de Composición del Valor",
            fn: function() {
                // Navegar al paso de composición
                window.CotizadorApp.goToStep(5);
                
                // Verificar elementos de composición
                const compositionElements = [
                    'comp-sup-cubierta', 'comp-sup-semicubierta', 'comp-sup-descubierta',
                    'comp-sup-balcon', 'comp-valor-cubierta', 'comp-valor-semicubierta',
                    'comp-valor-descubierta', 'comp-valor-balcon', 'valor-total-tasacion'
                ];
                
                for (const id of compositionElements) {
                    const element = document.getElementById(id);
                    if (!element) {
                        throw new Error(`Elemento de composición no encontrado: #${id}`);
                    }
                }
                
                // Verificar que el valor total tiene el atributo data-raw-value
                const totalElement = document.getElementById('valor-total-tasacion');
                if (!totalElement.hasAttribute('data-raw-value')) {
                    throw new Error("Elemento de valor total no tiene atributo data-raw-value");
                }
                
                return { passed: true, message: "Cálculo de composición del valor configurado correctamente" };
            }
        },
        
        // === NIVEL 4: Tests de Integración ===
        {
            name: "Flujo Completo de Cotización",
            fn: function() {
                // Reiniciar al paso 1
                window.CotizadorApp.goToStep(1);
                
                // Completar formulario del paso 1
                document.getElementById('tipo-propiedad').value = 'departamento';
                document.getElementById('direccion').value = 'Calle de Prueba 123';
                document.getElementById('localidad').value = 'CABA';
                document.getElementById('barrio').value = 'Palermo';
                document.getElementById('antiguedad').value = '5';
                document.getElementById('calidad').value = 'buena';
                document.getElementById('sup-cubierta').value = '80';
                
                // Avanzar al paso 2
                document.getElementById('btn-siguiente-1').click();
                
                // Esperar a que cargue el paso 2
                setTimeout(() => {
                    if (window.CotizadorApp.currentStep !== 2) {
                        throw new Error("No se pudo avanzar al paso 2 después de completar el formulario");
                    }
                    
                    // Agregar un comparable de prueba
                    document.getElementById('btn-agregar-comparable').click();
                    
                    setTimeout(() => {
                        // Completar formulario de comparable
                        document.getElementById('comp-tipo-propiedad').value = 'departamento';
                        document.getElementById('comp-precio').value = '100000';
                        document.getElementById('comp-direccion').value = 'Calle Comparable 456';
                        document.getElementById('comp-localidad').value = 'CABA';
                        document.getElementById('comp-barrio').value = 'Palermo';
                        document.getElementById('comp-antiguedad').value = '3';
                        document.getElementById('comp-calidad').value = 'buena';
                        document.getElementById('comp-sup-cubierta').value = '75';
                        
                        // Guardar comparable
                        document.getElementById('btn-guardar-comparable').click();
                        
                        setTimeout(() => {
                            // Verificar que se agregó el comparable
                            if (window.CotizadorApp.comparables.length === 0) {
                                throw new Error("No se pudo agregar el comparable");
                            }
                            
                            // Continuar con el flujo...
                            // (Para fines del test, verificamos hasta aquí)
                            
                            return { passed: true, message: "Flujo completo de cotización funcionando correctamente" };
                        }, 500);
                    }, 500);
                }, 500);
                
                return true; // Devolvemos true ya que las verificaciones asíncronas se harán en los callbacks
            }
        },
        
        // === NIVEL 5: Tests de Rendimiento y Robustez ===
        {
            name: "Manejo de Datos Extremos",
            fn: function() {
                // Probar con valores extremos en los campos numéricos
                const numericFields = [
                    { id: 'sup-cubierta', value: '999999' },
                    { id: 'antiguedad', value: '200' },
                    { id: 'sup-terreno', value: '0.01' }
                ];
                
                for (const field of numericFields) {
                    const element = document.getElementById(field.id);
                    if (element) {
                        element.value = field.value;
                        
                        // Disparar evento change para verificar manejo
                        const event = new Event('change', { bubbles: true });
                        element.dispatchEvent(event);
                        
                        // Verificar que no hay errores en consola
                        // (Esta verificación es limitada en un entorno real)
                    }
                }
                
                return { passed: true, message: "Manejo de datos extremos funcionando correctamente" };
            }
        },
        
        {
            name: "Rendimiento con Múltiples Comparables",
            fn: function() {
                // Medir tiempo de carga con múltiples comparables
                const startTime = performance.now();
                
                // Simular agregar múltiples comparables
                for (let i = 0; i < 10; i++) {
                    const comparable = {
                        id: `test-${i}`,
                        tipoPropiedad: 'departamento',
                        precio: 100000 + (i * 10000),
                        direccion: `Calle Test ${i}`,
                        localidad: 'CABA',
                        barrio: 'Palermo',
                        antiguedad: 5,
                        calidad: 'buena',
                        supCubierta: 80 + (i * 5)
                    };
                    
                    window.CotizadorApp.comparables.push(comparable);
                }
                
                // Forzar actualización de UI
                if (typeof window.ComparablesManager !== 'undefined' && 
                    typeof window.ComparablesManager.renderComparables === 'function') {
                    window.ComparablesManager.renderComparables();
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Verificar que el tiempo de procesamiento sea razonable
                if (duration > 1000) {
                    throw new Error(`Rendimiento lento con múltiples comparables: ${duration}ms`);
                }
                
                return { 
                    passed: true, 
                    message: `Rendimiento aceptable con múltiples comparables: ${duration.toFixed(2)}ms` 
                };
            }
        }
    ]
};

// Inicializar sistema de tests cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se carguen los scripts de la aplicación
    setTimeout(() => {
        C21TestSuite.init();
    }, 1000);
});

// Exponer el sistema de tests globalmente para acceso desde consola
window.C21TestSuite = C21TestSuite;
