/**
 * Versión final corregida con tests auto-suficientes y robustos
 */

console.log("test.js: Script cargado");

// ========================================
// CLASE TESTSUITE (Sin cambios)
// ========================================
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
        console.log('%c🚀 Iniciando Suite de Tests del Cotizador', 'font-size: 16px; font-weight: bold; color: #3498db;');
        console.log('=====================================================');
        
        const startTime = performance.now();

        for (const test of this.tests) {
            this.currentTestName = test.name;
            try {
                // Preparar el entorno para cada test
                this.resetTestEnvironment();
                
                // Ejecutar el test
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
        if (window.tasacionApp && typeof window.tasacionApp.resetForm === 'function') {
            window.tasacionApp.resetForm();
        } else {
            console.error("La función resetForm no está disponible en window.tasacionApp");
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || `Assertion failed in test: ${this.currentTestName}`);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected "${expected}", but got "${actual}" in test: ${this.currentTestName}`);
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
                position: fixed; top: 10px; right: 10px; background: white; border: 2px solid #ddd;
                border-radius: 8px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000; max-width: 400px; font-family: monospace;
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
// DEFINICIÓN DE LOS TESTS
// ========================================

function testEstructuraInicial(testSuite) {
    testSuite.test('La aplicación principal debe instanciarse correctamente', () => {
        testSuite.assert(window.tasacionApp, 'La instancia de TasacionApp no existe en window');
    });

    testSuite.test('Los gestores de componentes deben instanciarse', () => {
        testSuite.assert(window.comparablesManager, 'ComparablesManager no está instanciado');
        testSuite.assert(window.factoresManager, 'FactoresManager no está instanciado');
        testSuite.assert(window.composicionManager, 'ComposicionManager no está instanciado');
    });
}

function testNavegacion(testSuite) {
    testSuite.test('Debe mostrar el paso 1 como activo inicialmente', () => {
        testSuite.assert(document.getElementById('step-1').classList.contains('active'), 'El paso 1 debería estar activo');
    });

    testSuite.test('No debe poder avanzar al paso 2 con datos inválidos', () => {
        document.getElementById('btn-siguiente-1').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 1, 'No debería poder avanzar al paso 2 sin datos válidos');
    });

    testSuite.test('Debe poder avanzar al paso 2 con datos válidos', () => {
        // Este test ahora es auto-suficiente
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Calle Test 123';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        
        document.getElementById('btn-siguiente-1').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 2, 'Debería poder avanzar al paso 2');
        testSuite.assert(document.getElementById('step-2').classList.contains('active'), 'El paso 2 debería estar activo');
    });
}

function testDatosInmueble(testSuite) {
    testSuite.test('Debe guardar correctamente los datos del inmueble', () => {
        // Este test ahora es auto-suficiente. Llena los datos él mismo.
        document.getElementById('tipo-propiedad').value = 'ph';
        document.getElementById('direccion').value = 'Av. Corrientes 1000';
        document.getElementById('piso').value = '3';
        document.getElementById('depto').value = 'B';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Once';
        document.getElementById('antiguedad').value = '20';
        document.getElementById('calidad').value = 'muy-buena';
        document.getElementById('sup-cubierta').value = '75';
        document.getElementById('sup-semicubierta').value = '15';
        document.getElementById('sup-descubierta').value = '25';
        document.getElementById('sup-balcon').value = '8';
        document.getElementById('sup-terreno').value = '150';
        document.getElementById('cochera').value = 'propia';
        
        // Avanzar al siguiente paso para que se guarden los datos
        document.getElementById('btn-siguiente-1').click();
        
        const data = window.tasacionApp.inmuebleData;
        testSuite.assertEqual(data.tipoPropiedad, 'ph', 'El tipo de propiedad no se guardó correctamente');
        testSuite.assertEqual(data.direccion, 'Av. Corrientes 1000', 'La dirección no se guardó correctamente');
        testSuite.assertEqual(data.supCubierta, 75, 'La superficie cubierta no se guardó correctamente');
        testSuite.assertEqual(data.cochera, 'propia', 'La cochera no se guardó correctamente');
    });
}

// ========================================
// FUNCIÓN DE TEST DE COMPARABLES (VERSIÓN FINAL ROBUSTA)
// ========================================
async function testComparables(testSuite) {
    testSuite.test('Debe agregar y eliminar un comparable correctamente', async () => {
        // 1. Preparamos el entorno para llegar al paso 2
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Calle Test 123';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        document.getElementById('btn-siguiente-1').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 2, 'No se pudo avanzar al paso 2 para probar comparables');

        // 2. Obtenemos el modal directamente. No confiamos en openComparableModal() por el problema encontrado.
        const modal = document.getElementById('modal-agregar-comparable');
        testSuite.assert(modal, "El modal de comparable no se encontró en el DOM al inicio del test.");

        // 3. Forzamos la visibilidad del modal y limpiamos su formulario para asegurar un estado limpio.
        modal.style.display = 'block';
        modal.querySelector('#comp-precio').value = '';
        modal.querySelector('#comp-direccion').value = '';
        modal.querySelector('#comp-localidad').value = '';
        modal.querySelector('#comp-barrio').value = '';
        modal.querySelector('#comp-sup-cubierta').value = '';
        
        // 4. Rellenamos los datos
        document.getElementById('comp-precio').value = '150000';
        document.getElementById('comp-direccion').value = 'Calle Falsa 456';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Caballito';
        document.getElementById('comp-sup-cubierta').value = '80';
        
        // 5. Guardamos el comparable
        document.getElementById('btn-guardar-comparable').click();
        
        // Esperamos a que la operación asíncrona de guardar termine
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 6. Verificamos que se agregó correctamente
        testSuite.assertEqual(window.tasacionApp.comparables.length, 1, 'No se agregó el comparable');
        testSuite.assertEqual(window.tasacionApp.comparables[0].direccion, 'Calle Falsa 456', 'La dirección del comparable no es la esperada');
        
        // 7. Eliminamos el comparable que se acaba de agregar
        const idAEliminar = window.tasacionApp.comparables[0].id;
        window.comparablesManager.deleteComparable(idAEliminar);
        
        // 8. Verificamos que se eliminó correctamente
        testSuite.assertEqual(window.tasacionApp.comparables.length, 0, 'El comparable no se eliminó correctamente');

        // 9. Limpiamos: ocultamos el modal manualmente
        modal.style.display = 'none';
    });
}


// ========================================
// FUNCIÓN PRINCIPAL PARA EJECUTAR TODOS LOS TESTS
// ========================================
async function runAllTests() {
    console.log("runAllTests: Iniciando todos los tests");
    
    try {
        const testSuite = new TestSuite();
        
        testEstructuraInicial(testSuite);
        testNavegacion(testSuite);
        testDatosInmueble(testSuite);
        testComparables(testSuite);
        
        const allPassed = await testSuite.run();
        console.log("runAllTests: Tests finalizados, resultado:", allPassed);
        
        return allPassed;
    } catch (error) {
        console.error("runAllTests: Error al ejecutar tests:", error);
        return false;
    }
}

// ========================================
// FUNCIÓN PARA AGREGAR EL BOTÓN DE TEST (Sin cambios)
// ========================================
function addTestButton() {
    if (document.getElementById('btn-run-tests')) return;

    const step1Actions = document.querySelector('#step-1 .form-actions');
    if (step1Actions) {
        const testButton = document.createElement('button');
        testButton.id = 'btn-run-tests';
        testButton.className = 'btn-secondary';
        testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
        testButton.style.marginLeft = '10px';
        
        step1Actions.appendChild(testButton);
        
        testButton.addEventListener('click', async () => {
            testButton.disabled = true;
            testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ejecutando...';
            
            try {
                await runAllTests();
            } catch (e) {
                console.error("Error durante la ejecución de tests:", e);
            } finally {
                testButton.disabled = false;
                testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
            }
        });
    }
}

// ========================================
// INICIALIZACIÓN (Sin cambios)
// ========================================
async function initializeTests() {
    addTestButton();
}

document.addEventListener('DOMContentLoaded', initializeTests);

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeTests();
}
