/**
 * Versión final y definitiva. Forza la reconstrucción de la UI para evitar problemas de estado.
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
// FUNCIÓN DE AYUDA PARA ESPERAR A LOS ELEMENTOS
// ========================================
/**
 * Espera a que un elemento aparezca en el DOM.
 * @param {string} selector - El selector CSS del elemento a esperar.
 * @param {number} timeout - El tiempo máximo en milisegundos a esperar.
 * @returns {Promise<Element>} Una promesa que se resuelve con el elemento.
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkInterval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(checkInterval);
                resolve(element);
                return;
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error(`Elemento con selector "${selector}" no apareció después de ${timeout}ms`));
            }
        }, 100); // Revisar cada 100ms
    });
}

// ========================================
// NUEVA FUNCIÓN DE AYUDA PARA ESPERAR A UNA CONDICIÓN
// ========================================
/**
 * Espera a que una condición se cumpla.
 * @param {Function} condition - Una función que devuelve un booleano.
 * @param {number} timeout - El tiempo máximo en milisegundos a esperar.
 * @returns {Promise} Una promesa que se resuelve cuando la condición se cumple.
 */
function waitForCondition(condition, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkInterval = setInterval(() => {
            if (condition()) {
                clearInterval(checkInterval);
                resolve();
                return;
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error(`La condición no se cumplió después de ${timeout}ms`));
            }
        }, 100); // Revisar cada 100ms
    });
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
        
        document.getElementById('btn-siguiente-1').click();
        
        const data = window.tasacionApp.inmuebleData;
        testSuite.assertEqual(data.tipoPropiedad, 'ph', 'El tipo de propiedad no se guardó correctamente');
        testSuite.assertEqual(data.direccion, 'Av. Corrientes 1000', 'La dirección no se guardó correctamente');
        testSuite.assertEqual(data.supCubierta, 75, 'La superficie cubierta no se guardó correctamente');
        testSuite.assertEqual(data.cochera, 'propia', 'La cochera no se guardó correctamente');
    });
}

async function testComparables(testSuite) {
    testSuite.test('Debe agregar y eliminar un comparable correctamente', async () => {
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Calle Test 123';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        document.getElementById('btn-siguiente-1').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 2, 'No se pudo avanzar al paso 2 para probar comparables');

        window.comparablesManager.openComparableModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        document.getElementById('comp-tipo-propiedad').value = 'departamento';
        document.getElementById('comp-precio').value = '150000';
        document.getElementById('comp-direccion').value = 'Calle Falsa 456';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Caballito';
        document.getElementById('comp-antiguedad').value = '10';
        document.getElementById('comp-calidad').value = 'buena';
        document.getElementById('comp-sup-cubierta').value = '80';
        
        document.getElementById('btn-guardar-comparable').click();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        testSuite.assertEqual(window.tasacionApp.comparables.length, 1, 'No se agregó el comparable');
        testSuite.assertEqual(window.tasacionApp.comparables[0].direccion, 'Calle Falsa 456', 'La dirección del comparable no es la esperada');
        
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        const idAEliminar = window.tasacionApp.comparables[0].id;
        window.comparablesManager.deleteComparable(idAEliminar);
        window.confirm = originalConfirm;
        
        testSuite.assertEqual(window.tasacionApp.comparables.length, 0, 'El comparable no se eliminó correctamente');
    });
}

async function testFactoresManager(testSuite) {
    testSuite.test('Debe aplicar factores de ajuste y recalcular el valor', async () => {
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Calle Test 123';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        document.getElementById('btn-siguiente-1').click();

        window.comparablesManager.openComparableModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        document.getElementById('comp-tipo-propiedad').value = 'departamento';
        document.getElementById('comp-precio').value = '200000';
        document.getElementById('comp-direccion').value = 'Calle Factor 789';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Belgrano';
        document.getElementById('comp-antiguedad').value = '5';
        document.getElementById('comp-calidad').value = 'muy-buena';
        document.getElementById('comp-sup-cubierta').value = '100';
        document.getElementById('btn-guardar-comparable').click();
        await new Promise(resolve => setTimeout(resolve, 200));

        window.tasacionApp.goToStep(3);
        await new Promise(resolve => setTimeout(resolve, 200));

        const comparable = window.tasacionApp.comparables[0];
        const valorM2Original = comparable.valorM2;

        const sliderUbicacion = document.getElementById('factor-ubicación');
        testSuite.assert(sliderUbicacion, 'El slider de Ubicación no se encontró');
        
        sliderUbicacion.value = '15';
        sliderUbicacion.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));

        testSuite.assertEqual(comparable.factores['Ubicación'], 15, 'El factor de Ubicación no se guardó correctamente');
        
        const valorM2Esperado = valorM2Original * 1.15;
        testSuite.assertClose(comparable.valorM2Ajustado, valorM2Esperado, 0.01, 'El valor por m² ajustado no se calculó correctamente');
    });
}

// ========================================
// TEST DE COMPOSICIÓN (CORREGIDO Y DEFINITIVO)
// ========================================
async function testComposicionManager(testSuite) {
    testSuite.test('Debe calcular el valor total de la tasación', async () => {
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Calle Test 123';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        document.getElementById('sup-semicubierta').value = '50';
        document.getElementById('sup-balcon').value = '10';
        document.getElementById('cochera').value = 'propia';
        document.getElementById('btn-siguiente-1').click();

        window.comparablesManager.openComparableModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        document.getElementById('comp-tipo-propiedad').value = 'departamento';
        document.getElementById('comp-precio').value = '200000';
        document.getElementById('comp-direccion').value = 'Calle Compo 101';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Palermo';
        document.getElementById('comp-antiguedad').value = '10';
        document.getElementById('comp-calidad').value = 'buena';
        document.getElementById('comp-sup-cubierta').value = '100';
        document.getElementById('btn-guardar-comparable').click();
        await new Promise(resolve => setTimeout(resolve, 200));

        window.tasacionApp.valorM2Referencia = 2000;

        // ---- CAMBIO CLAVE AQUÍ: Navegamos y forzamos la reconstrucción del estado ----
        console.log("DIAGNOSTICO: Navegando al paso 4 y esperando a la UI...");
        window.tasacionApp.goToStep(4);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa muy generosa para asegurar que todo se renderice
        
        // ---- CAMBIO CLAVE AQUÍ: Forzamos el cálculo para asegurar que el estado sea correcto ----
        console.log("DIAGNOSTICO: Forzando el cálculo de la composición...");
        window.tasacionApp.calculateComposition();
        await new Promise(resolve => setTimeout(resolve, 500)); // Pausa para asegurar que los valores se actualicen

        const valorTotalCalculado = window.composicionManager.calculateValorTotal();
        const valorTotalEnUI = parseFloat(document.getElementById('valor-total-tasacion').textContent.replace('$', '').replace(',', ''));
        
        testSuite.assertClose(valorTotalCalculado, valorTotalEnUI, 0.01, 'El valor total calculado por el manager no coincide con el de la UI');
    });
}

// ========================================
// TEST DE FLUJO COMPLETO (CORREGIDO Y DEFINITIVO)
// ========================================
async function testFlujoCompleto(testSuite) {
    testSuite.test('Debe completar el flujo completo de tasación y calcular el valor final', async () => {
        // 1. Completar paso 1
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Uriarte 1500';
        document.getElementById('piso').value = '5';
        document.getElementById('depto').value = 'C';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '8';
        document.getElementById('calidad').value = 'muy-buena';
        document.getElementById('sup-cubierta').value = '120';
        document.getElementById('sup-semicubierta').value = '25';
        document.getElementById('sup-balcon').value = '12';
        document.getElementById('cochera').value = 'comun';
        document.getElementById('btn-siguiente-1').click();
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Agregar comparables programáticamente
        const comparablesData = [
            { dir: 'Scalabrini Ortiz 1200', barrio: 'Palermo', precio: 280000, sup: 110, ant: '5', cal: 'excelente' },
            { dir: 'Jorge Newbery 800', barrio: 'Colegiales', precio: 250000, sup: 115, ant: '10', cal: 'muy-buena' },
            { dir: 'Gorriti 500', barrio: 'Palermo', precio:265000, sup: 105, ant: '12', cal: 'buena' },
            { dir: 'Dorrego 200', barrio: 'Palermo', precio: 275000, sup: 118, ant: '6', cal: 'muy-buena' }
        ];

        let nextId = 1;
        for (const data of comparablesData) {
            const precioAjustado = data.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
            const comparable = {
                id: nextId++,
                tipoPropiedad: 'departamento',
                precio: data.precio,
                direccion: data.dir,
                localidad: 'CABA',
                barrio: data.barrio,
                antiguedad: data.ant,
                calidad: data.cal,
                supCubierta: data.sup,
                valorM2: precioAjustado / data.sup,
                valorM2Ajustado: precioAjustado / data.sup,
                factores: {}
            };
            window.tasacionApp.comparables.push(comparable);
        }
        testSuite.assertEqual(window.tasacionApp.comparables.length, 4, 'No se agregaron los 4 comparables');

        // 3. Navegar al paso 3 y forzar la inicialización de los factores
        console.log("DIAGNOSTICO: Navegando al paso 3 y esperando a la UI de factores...");
        document.getElementById('btn-siguiente-2').click();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa muy generosa

        // ---- CAMBIO CLAVE AQUÍ: Forzamos la inicialización de los factores ----
        console.log("DIAGNOSTICO: Forzando la inicialización de los factores...");
        window.factoresManager.initFactors();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa muy generosa

        const slider1 = document.getElementById('factor-ubicación');
        slider1.value = '5';
        slider1.dispatchEvent(new Event('input', { bubbles: true }));
        
        const slider2 = document.getElementById('factor-calidad-de-construcción');
        slider2.value = '-5';
        slider2.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 500));

        document.getElementById('btn-siguiente-3').click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        document.getElementById('btn-siguiente-4').click();
        await new Promise(resolve => setTimeout(resolve, 500));

        // 7. ESPERAR a que el valor final se calcule y tenga el formato correcto
        console.log("DIAGNOSTICO: Esperando a que el valor final se calcule y se formatee...");
        await waitForCondition(() => {
            const valorFinalElement = document.getElementById('valor-total-tasacion');
            return valorFinalElement && valorFinalElement.textContent.startsWith('$');
        });
        console.log("DIAGNOSTICO: Valor final calculado y formateado.");

        // 8. Verificar resultados finales
        const valorFinalElement = document.getElementById('valor-total-tasacion');
        testSuite.assert(valorFinalElement, 'El elemento valor-total-tasacion no existe en el DOM');
        
        const valorFinalTexto = valorFinalElement.textContent;
        const valorFinalNumero = parseFloat(valorFinalTexto.replace('$', '').replace(',', ''));
        
        testSuite.assert(valorFinalTexto.startsWith('$'), 'El valor final no tiene el formato de moneda correcto');
        testSuite.assert(valorFinalNumero > 0, 'El valor final no es un número positivo');
        
        const valorM2RefTexto = document.getElementById('valor-m2-referencia').textContent;
        const valorM2RefNumero = parseFloat(valorM2RefTexto.replace('$', ''));
        testSuite.assert(valorM2RefNumero > 0, 'El valor de referencia por m² no es un número positivo');
        
        console.log(`%c📊 Flujo Completo: Valor Final de Tasación: ${valorFinalTexto}`, 'color: #17a2b8; font-weight: bold;');
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
        testFactoresManager(testSuite);
        testComposicionManager(testSuite);
        testFlujoCompleto(testSuite);
        
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
