/**
 * Versión final corrigiendo la secuencia de UI y el estado del bucle.
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
        // ... (código del test existente sin cambios) ...
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
        // ... (código del test existente sin cambios) ...
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
// TEST DE COMPOSICIÓN (CORREGIDO)
// ========================================
async function testComposicionManager(testSuite) {
    testSuite.test('Debe calcular el valor total de la tasación', async () => {
        // 1. Preparamos un escenario completo hasta el paso 5
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

        // Agregamos un comparable para poder avanzar
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

        // Simulamos que ya tenemos un valor de referencia
        window.tasacionApp.valorM2Referencia = 2000;

        // 2. ---- CAMBIO CLAVE AQUÍ ----
        // Navegamos al paso 4 para que los elementos de la UI existan antes de calcular
        window.tasacionApp.goToStep(4);
        await new Promise(resolve => setTimeout(resolve, 200));

        // 3. Ejecutamos el cálculo de la composición
        window.tasacionApp.calculateComposition();

        // 4. Obtenemos el valor total calculado por el manager
        const valorTotalCalculado = window.composicionManager.calculateValorTotal();

        // 5. Verificamos que el valor del manager coincida con el mostrado en la UI
        const valorTotalEnUI = parseFloat(document.getElementById('valor-total-tasacion').textContent.replace('$', '').replace(',', ''));
        
        testSuite.assertClose(valorTotalCalculado, valorTotalEnUI, 0.01, 'El valor total calculado por el manager no coincide con el de la UI');
    });
}

// ========================================
// TEST DE FLUJO COMPLETO (CORREGIDO)
// ========================================
async function testFlujoCompleto(testSuite) {
    testSuite.test('Debe completar el flujo completo de tasación y calcular el valor final', async () => {
        // --- PASO 1: Datos del Inmueble ---
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
        await new Promise(resolve => setTimeout(resolve, 200));

        // --- PASO 2: Agregar Comparables (4) ---
        const comparablesData = [
            { dir: 'Scalabrini Ortiz 1200', barrio: 'Palermo', precio: 280000, sup: 110, ant: '5', cal: 'excelente' },
            { dir: 'Jorge Newbery 800', barrio: 'Colegiales', precio: 250000, sup: 115, ant: '10', cal: 'muy-buena' },
            { dir: 'Gorriti 500', barrio: 'Palermo', precio:265000, sup: 105, ant: '12', cal: 'buena' },
            { dir: 'Dorrego 200', barrio: 'Palermo', precio: 275000, sup: 118, ant: '6', cal: 'muy-buena' }
        ];

        for (let i = 0; i < comparablesData.length; i++) {
            const data = comparablesData[i];
            
            window.comparablesManager.openComparableModal();
            await new Promise(resolve => setTimeout(resolve, 250));
            
            // ---- CAMBIO CLAVE AQUÍ: Limpiamos los campos explícitamente para un estado limpio ----
            const form = document.getElementById('form-comparable');
            if(form) {
                const inputs = form.querySelectorAll('input, select');
                inputs.forEach(input => input.value = '');
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Rellenamos los datos
            document.getElementById('comp-tipo-propiedad').value = 'departamento';
            document.getElementById('comp-precio').value = data.precio;
            document.getElementById('comp-direccion').value = data.dir;
            document.getElementById('comp-localidad').value = 'CABA';
            document.getElementById('comp-barrio').value = data.barrio;
            document.getElementById('comp-antiguedad').value = data.ant;
            document.getElementById('comp-calidad').value = data.cal;
            document.getElementById('comp-sup-cubierta').value = data.sup;
            
            document.getElementById('btn-guardar-comparable').click();
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        testSuite.assertEqual(window.tasacionApp.comparables.length, 4, 'No se agregaron los 4 comparables');

        // --- PASO 3: Aplicar Factores ---
        document.getElementById('btn-siguiente-2').click();
        await new Promise(resolve => setTimeout(resolve, 300));

        const slider1 = document.getElementById('factor-ubicación');
        slider1.value = '5';
        slider1.dispatchEvent(new Event('input', { bubbles: true }));
        
        const slider2 = document.getElementById('factor-calidad-de-construcción');
        slider2.value = '-5';
        slider2.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));

        // --- PASO 4 y 5: Composición y Reporte Final ---
        document.getElementById('btn-siguiente-3').click();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        document.getElementById('btn-siguiente-4').click();
        await new Promise(resolve => setTimeout(resolve, 200));

        // --- VERIFICACIÓN FINAL ---
        const valorFinalTexto = document.getElementById('valor-total-tasacion').textContent;
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
