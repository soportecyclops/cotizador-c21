/**
 * Suite de Tests para el Cotizador Inmobiliario v2.0
 * 
 * Esta suite de tests cubre:
 * - Estructura y estado inicial de la aplicación
 * - Flujo de navegación entre pasos
 * - Carga y validación de datos del inmueble
 * - Gestión de comparables (agregar, editar, eliminar)
 * - Aplicación de factores de ajuste
 * - Cálculo de valor de referencia
 * - Composición del valor final
 * - Prevención de errores humanos comunes
 * - Test de integración con carga completa de datos
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.currentTestName = '';
    }

    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async run() {
        console.log('%c🚀 Iniciando Suite de Tests del Cotizador Inmobiliario', 'font-size: 16px; font-weight: bold; color: #3498db;');
        console.log('=====================================================');
        
        const startTime = performance.now();

        for (const test of this.tests) {
            this.currentTestName = test.name;
            try {
                this.resetTestEnvironment();
                await test.testFunction();
                this.passed++;
                console.log(`%c✅ ${test.name}`, 'color: #2ecc71;');
            } catch (error) {
                this.failed++;
                console.error(`%c❌ ${test.name}`, 'color: #e74c3c; font-weight: bold;');
                console.error(`   Error: ${error.message}`);
                console.error(error.stack);
            }
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        console.log('=====================================================');
        console.log(`%c🏁 Tests Finalizados en ${duration}ms`, 'font-size: 16px; font-weight: bold; color: #f39c12;');
        console.log(`%c✅ Pasados: ${this.passed}`, 'color: #2ecc71; font-weight: bold;');
        console.log(`%c❌ Fallidos: ${this.failed}`, 'color: #e74c3c; font-weight: bold;');
        
        this.updateResultsUI();
        return this.failed === 0;
    }

    resetTestEnvironment() {
        if (window.tasacionApp) {
            window.tasacionApp.currentStep = 1;
            window.tasacionApp.inmuebleData = {};
            window.tasacionApp.comparables = [];
            window.tasacionApp.valorM2Referencia = 0;
            
            document.getElementById('form-inmueble').reset();
            document.getElementById('descuento-negociacion').value = 10;
            
            window.tasacionApp.goToStep(1);
            window.comparablesManager.resetComparables();
        }
    }

    assert(condition, message) {
        if (!condition) throw new Error(message || `Assertion failed in test: ${this.currentTestName}`);
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected "${expected}", but got "${actual}" in test: ${this.currentTestName}`);
        }
    }

    assertNotEqual(actual, expected, message) {
        if (actual === expected) {
            throw new Error(message || `Expected not "${expected}", but got "${actual}" in test: ${this.currentTestName}`);
        }
    }

    assertClose(actual, expected, tolerance = 0.01, message) {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(message || `Expected ${expected} ± ${tolerance}, but got ${actual} in test: ${this.currentTestName}`);
        }
    }

    assertElementExists(selector, message) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(message || `Element with selector "${selector}" not found in test: ${this.currentTestName}`);
        }
        return element;
    }

    updateResultsUI() {
        let resultsContainer = document.getElementById('test-results-container');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'test-results-container';
            resultsContainer.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: white;
                border: 2px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 400px;
                font-family: monospace;
            `;
            document.body.appendChild(resultsContainer);
        }

        const allPassed = this.failed === 0;
        resultsContainer.innerHTML = `
            <h3 style="margin-top: 0; color: ${allPassed ? '#2ecc71' : '#e74c3c'};">
                ${allPassed ? '✅ Todos los tests pasaron' : '❌ Algunos tests fallaron'}
            </h3>
            <p><strong>Pasados:</strong> ${this.passed}</p>
            <p><strong>Fallidos:</strong> ${this.failed}</p>
            <p><strong>Total:</strong> ${this.tests.length}</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">Cerrar</button>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Detalles en la consola (F12)</p>
        `;
    }
}

// ========================================
// TODOS LOS TESTS (se mantienen igual que en la versión original)
// ========================================
// Aquí irían todas las funciones de test que ya tenías
// testEstructuraInicial(testSuite);
// testNavegacion(testSuite);
// etc...

// ========================================
// FUNCIÓN PRINCIPAL PARA EJECUTAR TODOS LOS TESTS
// ========================================
async function runAllTests() {
    const testSuite = new TestSuite();
    
    // Agregar todos los tests a la suite
    testEstructuraInicial(testSuite);
    testNavegacion(testSuite);
    testDatosInmueble(testSuite);
    testComparables(testSuite);
    testFactoresAjuste(testSuite);
    testValorReferencia(testSuite);
    testComposicionValor(testSuite);
    testPrevencionErrores(testSuite);
    testCargaCompleta(testSuite);
    
    // Ejecutar la suite
    const allPassed = await testSuite.run();
    
    return allPassed;
}

// ========================================
// INTEGRACIÓN CON LA APLICACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Crear botón para ejecutar tests
    const testButton = document.createElement('button');
    testButton.id = 'btn-run-tests';
    testButton.className = 'btn-secondary';
    testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests'; // Cambié el icono a uno más representativo
    testButton.style.marginLeft = '10px';
    
    // Agregar el botón a la sección de acciones del PRIMER PASO
    const step1Actions = document.querySelector('#step-1 .form-actions');
    if (step1Actions) {
        step1Actions.appendChild(testButton);
    }
    
    // Agregar evento al botón
    testButton.addEventListener('click', async () => {
        // Mostrar indicador de que se están ejecutando los tests
        testButton.disabled = true;
        testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ejecutando...';
        
        // Ejecutar todos los tests
        await runAllTests();
        
        // Restaurar el botón
        testButton.disabled = false;
        testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
    });
});
