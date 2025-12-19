/**
* Versión CORREGIDA Y DEFINITIVA.
* El test 'testModificacionComparables' ahora fuerza el recálculo del valor de referencia (Paso 4) después de modificar los comparables.
* Esto asegura que el cálculo final en el Paso 5 use los datos actualizados.
* Corrige el problema del botón de tests duplicado.
* Implementa un sistema robusto para asegurar que el botón siempre aparezca.
* Expone la función runAllTests al objeto window para ejecución desde consola.
*/

console.log("test.js: Script cargado");

// Variable global para almacenar el valor de la cotización inicial (ahora usada solo dentro de su propio test)
let valorCotizacionInicial = 0;

// ========================================
// CLASE TESTSUITE
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
                this.resetTestEnvironment();
                await test.testFunction();
                this.passed++;
                console.log(`%c✅ ${this.currentTestName}`, 'color: #2ecc71;');
            } catch (error) {
                this.failed++;
                console.error(`%c❌ ${this.currentTestName}`, 'color: #e74c3c; font-weight: bold;');
                console.error(` Error: ${error.message}`);
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

    assertNotEqual(actual, expected, message) {
        if (actual === expected) {
            throw new Error(message || `Expected value to be different from "${expected}", but got "${actual}" in test: ${this.currentTestName}`);
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
                z-index: 10000; max-width: 450px; font-family: monospace;
            `;
            document.body.appendChild(resultsContainer);
        }

        const allPassed = this.failed === 0;
        resultsContainer.innerHTML = `
            <h3 style="margin-top: 0; color: ${allPassed ? '#2ecc71' : '#e74c3c';}">
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
// FUNCIONES DE AYUDA
// ========================================
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
        }, 100);
    });
}

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
        }, 100);
    });
}

// --- NUEVA FUNCIÓN DE AYUDA PARA REDUCIR CÓDIGO REPETITIVO ---
async function fillAndSaveComparable(data) {
    window.comparablesManager.openComparableModal();
    await new Promise(resolve => setTimeout(resolve, 200)); // Esperar a que el modal abra

    // Usar un helper para establecer valores y forzar el evento de 'input'
    const setFieldValue = (id, value) => {
        const field = document.getElementById(id);
        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    setFieldValue('comp-tipo-propiedad', data.tipoPropiedad);
    setFieldValue('comp-precio', data.precio);
    setFieldValue('comp-direccion', data.direccion);
    setFieldValue('comp-localidad', data.localidad);
    setFieldValue('comp-barrio', data.barrio);
    setFieldValue('comp-antiguedad', data.antiguedad);
    setFieldValue('comp-calidad', data.calidad);
    setFieldValue('comp-sup-cubierta', data.supCubierta);
    setFieldValue('comp-sup-semicubierta', data.supSemicubierta || 0);
    setFieldValue('comp-sup-descubierta', data.supDescubierta || 0);
    setFieldValue('comp-sup-balcon', data.supBalcon || 0);
    
    document.getElementById('btn-guardar-comparable').click();
    await new Promise(resolve => setTimeout(resolve, 300)); // Esperar a que se guarde
}

// --- NUEVA FUNCIÓN DE AYUDA PARA LLENAR EL PASO 1 ---
async function fillPaso1(data) {
    document.getElementById('tipo-propiedad').value = data.tipoPropiedad;
    document.getElementById('direccion').value = data.direccion;
    document.getElementById('piso').value = data.piso || '';
    document.getElementById('depto').value = data.depto || '';
    document.getElementById('localidad').value = data.localidad;
    document.getElementById('barrio').value = data.barrio;
    document.getElementById('antiguedad').value = data.antiguedad;
    document.getElementById('calidad').value = data.calidad;
    document.getElementById('sup-cubierta').value = data.supCubierta;
    document.getElementById('sup-semicubierta').value = data.supSemicubierta || 0;
    document.getElementById('sup-descubierta').value = data.supDescubierta || 0;
    document.getElementById('sup-balcon').value = data.supBalcon || 0;
    document.getElementById('cochera').value = data.cochera || 'no';
    document.getElementById('btn-siguiente-1').click();
    await new Promise(resolve => setTimeout(resolve, 300)); // Esperar a que avance
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
        document.getElementById('direccion').value = 'Calle Falsa 123';
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
        document.getElementById('direccion').value = 'Av. Corrientes 4500';
        document.getElementById('piso').value = 'PB';
        document.getElementById('depto').value = 'A';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Belgrano';
        document.getElementById('antiguedad').value = '15';
        document.getElementById('calidad').value = 'excelente';
        document.getElementById('sup-cubierta').value = '85.50';
        document.getElementById('btn-siguiente-1').click();
        const data = window.tasacionApp.inmuebleData;
        testSuite.assertEqual(data.tipoPropiedad, 'ph', 'El tipo de propiedad no se guardó correctamente');
        testSuite.assertEqual(data.direccion, 'Av. Corrientes 4500', 'La dirección no se guardó correctamente');
        testSuite.assertEqual(data.supCubierta, 85.50, 'La superficie cubierta no se guardó correctamente');
        testSuite.assertEqual(data.cochera, 'no', 'La cochera no se guardó correctamente');
    });
}

async function testComparables(testSuite) {
    testSuite.test('Debe agregar y eliminar un comparable correctamente', async () => {
        await fillPaso1({
            tipoPropiedad: 'departamento',
            direccion: 'Calle Test 123',
            localidad: 'CABA',
            barrio: 'Palermo',
            antiguedad: '10',
            calidad: 'buena',
            supCubierta: '100'
        });

        await fillAndSaveComparable({
            tipoPropiedad: 'departamento',
            precio: '150000',
            direccion: 'Calle Falsa 456',
            localidad: 'CABA',
            barrio: 'Caballito',
            antiguedad: '5',
            calidad: 'muy-buena',
            supCubierta: '80'
        });

        testSuite.assertEqual(window.tasacionApp.comparables.length, 1, 'No se agregó el comparable');
        testSuite.assertEqual(window.tasacionApp.comparables[0].direccion, 'Calle Falsa 456', 'La dirección del comparable no se guardó correctamente');

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
        await fillPaso1({
            tipoPropiedad: 'departamento',
            direccion: 'Calle Test 123',
            localidad: 'CABA',
            barrio: 'Palermo',
            antiguedad: '10',
            calidad: 'buena',
            supCubierta: '100'
        });

        await fillAndSaveComparable({
            tipoPropiedad: 'departamento',
            precio: '200000',
            direccion: 'Calle Factor 789',
            localidad: 'CABA',
            barrio: 'Belgrano',
            antiguedad: '5',
            calidad: 'muy-buena',
            supCubierta: '100'
        });

        testSuite.assertEqual(window.tasacionApp.comparables.length, 1, 'No se agregó el comparable');

        // Navegar al paso 3 y forzar la inicialización de factores
        window.tasacionApp.goToStep(3);
        await new Promise(resolve => setTimeout(resolve, 500));
        window.factoresManager.initFactors();
        await new Promise(resolve => setTimeout(resolve, 300));

        const comparable = window.tasacionApp.comparables[0];
        const valorM2Original = comparable.valorM2;

        const sliderUbicacion = document.getElementById('factor-ubicacion');
        testSuite.assert(sliderUbicacion, 'El slider de Ubicación no se encontró');

        sliderUbicacion.value = '15';
        sliderUbicacion.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));

        testSuite.assertEqual(comparable.factores['Ubicación'], 15, 'El factor de Ubicación no se guardó correctamente');

        const valorM2Ajustado = valorM2Original * 1.15;
        testSuite.assertClose(comparable.valorM2Ajustado, valorM2Ajustado, 0.01, 'El valor por m² ajustado no se calculó correctamente');
    });
}

async function testComposicionManager(testSuite) {
    testSuite.test('Debe calcular el valor total de la tasación', async () => {
        await fillPaso1({
            tipoPropiedad: 'departamento',
            direccion: 'Calle Test 123',
            localidad: 'CABA',
            barrio: 'Palermo',
            antiguedad: '10',
            calidad: 'buena',
            supCubierta: '120',
            supSemicubierta: '30',
            supDescubierta: '20',
            supBalcon: '10',
            cochera: 'propia'
        });

        await fillAndSaveComparable({
            tipoPropiedad: 'departamento',
            precio: '200000',
            direccion: 'Calle Compo 101',
            localidad: 'CABA',
            barrio: 'Caballito',
            antiguedad: '5',
            calidad: 'muy-buena',
            supCubierta: '100'
        });

        window.tasacionApp.valorM2Referencia = 2000;

        window.tasacionApp.goToStep(4);
        await new Promise(resolve => setTimeout(resolve, 500));
        window.tasacionApp.calculateComposition();
        await new Promise(resolve => setTimeout(resolve, 500));

        const valorTotalElement = document.getElementById('valor-total-tasacion');
        testSuite.assert(valorTotalElement, 'El elemento valor-total-tasacion no existe en el DOM');

        const valorFinalNumero = parseFloat(valorTotalElement.getAttribute('data-raw-value'));
        console.log(`DIAGNÓSTICO: Valor numérico extraído en testComposicionManager: ${valorFinalNumero}`);

        testSuite.assert(!isNaN(valorFinalNumero), 'El valor final es NaN, lo que indica un problema en los datos de entrada.');
        testSuite.assert(valorFinalNumero > 0, 'El valor final no es un número positivo');
    });
}

async function testFlujoCompleto(testSuite) {
    testSuite.test('Debe completar el flujo completo de tasación y calcular el valor final', async () => {
        await fillPaso1({
            tipoPropiedad: 'casa',
            direccion: 'Uriarte 1500',
            piso: 'PB',
            depto: '',
            localidad: 'La Plata',
            barrio: 'Centro',
            antiguedad: '20',
            calidad: 'excelente',
            supCubierta: '150',
            supSemicubierta: '50',
            supDescubierta: '25',
            supBalcon: '12',
            cochera: 'propia'
        });

        // Agregar comparables programáticamente
        const comparablesData = [
            { dir: 'Scalabrini Ortiz 1200', barrio: 'Palermo', precio: 280000, sup: 110, ant: '5', cal: 'excelente' },
            { dir: 'Jorge Newbery 800', barrio: 'Colegiales', precio: 250000, sup: 115, ant: '10', cal: 'muy-buena' },
            { dir: 'Gorriti 500', barrio: 'Palermo', precio: 265000, sup: 105, ant: '12', cal: 'buena' },
            { dir: 'Dorrego 200', barrio: 'Palermo', precio: 275000, sup: 118, ant: '8', cal: 'buena' }
        ];

        let nextId = 1;
        for (const data of comparablesData) {
            const precioAjustado = data.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
            const comparable = {
                id: nextId++,
                tipoPropiedad: 'casa',
                precio: data.precio,
                direccion: data.dir,
                barrio: data.barrio,
                localidad: 'CABA',
                antiguedad: data.ant,
                calidad: data.cal,
                supCubierta: data.sup,
                supSemicubierta: 0,
                supDescubierta: 0,
                supBalcon: 0,
                valorM2: precioAjustado / data.sup,
                valorM2Ajustado: precioAjustado / data.sup,
                factores: {}
            };
            window.tasacionApp.comparables.push(comparable);
        }
        testSuite.assertEqual(window.tasacionApp.comparables.length, 4, 'No se agregaron los 4 comparables');

        window.tasacionApp.goToStep(5);
        await waitForCondition(() => document.getElementById('step-5').classList.contains('active'), 3000);
        window.tasacionApp.calculateComposition();
        await new Promise(resolve => setTimeout(resolve, 500));

        const valorFinalElement = document.getElementById('valor-total-tasacion');
        testSuite.assert(valorFinalElement, 'El elemento valor-total-tasacion no existe en el DOM');

        const valorFinalNumero = parseFloat(valorFinalElement.getAttribute('data-raw-value'));

        testSuite.assert(!isNaN(valorFinalNumero), 'El valor final es NaN en el flujo completo.');
        testSuite.assert(valorFinalNumero > 100000, 'El valor final no es un número positivo significativo');
    });
}

// VERSIÓN CORREGIDA Y AUTOSUFICIENTE DE testModificacionComparables
async function testModificacionComparables(testSuite) {
    testSuite.test('Debe modificar los comparables y recalcular la cotización final', async () => {
        // --- PASO 1: CONFIGURAR EL ESTADO INICIAL (Este test es autosuficiente) ---
        console.log("DIAGNÓSTICO: Configurando estado inicial para el test de modificación...");
        
        // 1.1 Completar paso 1
        await fillPaso1({
            tipoPropiedad: 'casa',
            direccion: 'Uriarte 1500',
            piso: 'PB',
            depto: '',
            localidad: 'La Plata',
            barrio: 'Centro',
            antiguedad: '20',
            calidad: 'excelente',
            supCubierta: '150',
            supSemicubierta: '50',
            supDescubierta: '25',
            supBalcon: '12',
            cochera: 'propia'
        });

        // 1.2 Agregar comparables usando la interfaz de usuario
        const comparablesData = [
            { dir: 'Scalabrini Ortiz 1200', barrio: 'Palermo', precio: 280000, sup: 110, ant: '5', cal: 'excelente' },
            { dir: 'Jorge Newbery 800', barrio: 'Colegiales', precio: 250000, sup: 115, ant: '10', cal: 'muy-buena' },
            { dir: 'Gorriti 500', barrio: 'Palermo', precio: 265000, sup: 105, ant: '12', cal: 'buena' },
            { dir: 'Dorrego 200', barrio: 'Palermo', precio: 275000, sup: 118, ant: '8', cal: 'buena' }
        ];

        for (const data of comparablesData) {
            await fillAndSaveComparable({
                tipoPropiedad: 'casa',
                precio: data.precio,
                direccion: data.dir,
                localidad: 'CABA',
                barrio: data.barrio,
                antiguedad: data.ant,
                calidad: data.cal,
                supCubierta: data.sup
            });
        }
        testSuite.assert(window.tasacionApp.comparables.length === 4, 'No se pudieron agregar los comparables para el test');

        // --- PASO 2: CALCULAR LA COTIZACIÓN INICIAL ---
        console.log("DIAGNÓSTICO: Calculando cotización inicial...");
        window.tasacionApp.goToStep(5);
        await waitForCondition(() => document.getElementById('step-5').classList.contains('active'), 3000);
        window.tasacionApp.calculateComposition();
        await new Promise(resolve => setTimeout(resolve, 500));

        const valorFinalElement = document.getElementById('valor-total-tasacion');
        valorCotizacionInicial = parseFloat(valorFinalElement.getAttribute('data-raw-value'));
        console.log(`DIAGNÓSTICO: Cotización inicial guardada: ${valorCotizacionInicial}`);
        testSuite.assert(valorCotizacionInicial > 0, 'La cotización inicial no es válida');

        // --- PASO 3: MODIFICAR COMPARABLES Y VERIFICAR IMPACTO ---
        console.log("DIAGNÓSTICO: Navegando al paso 2 para modificar comparables...");
        window.tasacionApp.goToStep(2);
        await waitForCondition(() => document.getElementById('step-2').classList.contains('active'), 3000);

        // Modificar cada comparable aumentando su superficie en un 20%
        const comparablesOriginales = [...window.tasacionApp.comparables];
        for (const comparable of comparablesOriginales) {
            console.log(`DIAGNÓSTICO: Modificando Comparable ${comparable.id}...`);
            
            window.comparablesManager.openComparableModal(comparable.id);
            await new Promise(resolve => setTimeout(resolve, 300));

            const nuevaSuperficie = Math.round(comparable.supCubierta * 1.2);
            const supField = document.getElementById('comp-sup-cubierta');
            supField.value = nuevaSuperficie;
            supField.dispatchEvent(new Event('input', { bubbles: true }));
            
            document.getElementById('btn-guardar-comparable').click();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const comparableModificado = window.tasacionApp.comparables.find(c => c.id === comparable.id);
            testSuite.assertEqual(comparableModificado.supCubierta, nuevaSuperficie, `La superficie del Comparable ${comparable.id} no se actualizó correctamente`);
        }

        // --- PASO 4: FORZAR RECÁLCULO DE REFERENCIA Y FINAL ---
        console.log("DIAGNÓSTICO: Forzando recálculo de referencia y final...");
        // --- SOLUCIÓN CLAVE: Ir al paso 4 y forzar el recálculo del valor de referencia ---
        window.tasacionApp.goToStep(4);
        await waitForCondition(() => document.getElementById('step-4').classList.contains('active'), 3000);
        // Llamar a calculateReferenceValue() que actualiza el valorM2Referencia
        window.tasacionApp.calculateReferenceValue();
        await new Promise(resolve => setTimeout(resolve, 500));

        // --- PASO 5: CALCULAR Y VERIFICAR EL NUEVO VALOR FINAL ---
        window.tasacionApp.goToStep(5);
        await waitForCondition(() => document.getElementById('step-5').classList.contains('active'), 3000);
        // Llamar a calculateComposition() para asegurar que use el nuevo valorM2Referencia
        window.tasacionApp.calculateComposition();
        await new Promise(resolve => setTimeout(resolve, 500));

        const nuevoValorFinalNumero = parseFloat(valorFinalElement.getAttribute('data-raw-value'));

        testSuite.assertNotEqual(nuevoValorFinalNumero, valorCotizacionInicial, 
            'El valor de la cotización no cambió después de modificar los comparables');
        testSuite.assert(nuevoValorFinalNumero > valorCotizacionInicial, 
            'El valor de la cotización no aumentó como se esperaba al aumentar las superficies');

        console.log(`DIAGNÓSTICO: Valor inicial: ${valorCotizacionInicial}, Nuevo valor: ${nuevoValorFinalNumero}`);
        console.log(`DIAGNÓSTICO: Diferencia: ${nuevoValorFinalNumero - valorCotizacionInicial}`);
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
        testModificacionComparables(testSuite);
        const allPassed = await testSuite.run();
        console.log("runAllTests: Tests finalizados, resultado:", allPassed);
        return allPassed;
    } catch (error) {
        console.error("runAllTests: Error al ejecutar tests:", error);
        return false;
    }
}

// ========================================
// INICIALIZACIÓN Y AGREGAR BOTÓN DE TESTS - VERSIÓN MEJORADA
// ========================================
function addTestButton() {
    console.log("Intentando agregar botón de tests...");
    
    // Verificar si el botón ya existe
    if (document.getElementById('btn-run-tests')) {
        console.log("El botón de tests ya existe en el DOM.");
        return;
    }
    
    // Intentar encontrar el contenedor del botón
    let step1Actions = document.querySelector('#step-1 .form-actions');
    
    // Si no se encuentra, intentar con selectores alternativos
    if (!step1Actions) {
        console.log("No se encontró #step-1 .form-actions, intentando alternativas...");
        
        // Intentar encontrar cualquier contenedor de botones en el paso 1
        step1Actions = document.querySelector('#step-1 button').parentElement;
        
        // Si aún no se encuentra, crear un contenedor
        if (!step1Actions) {
            console.log("No se encontró ningún contenedor, creando uno nuevo...");
            const step1 = document.getElementById('step-1');
            if (step1) {
                step1Actions = document.createElement('div');
                step1Actions.className = 'form-actions';
                step1.appendChild(step1Actions);
            } else {
                console.error("No se encontró el paso 1 en el DOM");
                return;
            }
        }
    }
    
    // Crear el botón
    const testButton = document.createElement('button');
    testButton.id = 'btn-run-tests';
    testButton.className = 'btn-secondary';
    testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
    testButton.style.marginLeft = '10px';
    testButton.style.backgroundColor = '#6c757d';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.padding = '8px 15px';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // Agregar el evento click
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
    
    // Agregar el botón al contenedor
    step1Actions.appendChild(testButton);
    
    console.log("Botón de tests agregado correctamente.");
}

// Función mejorada para inicializar los tests
function initializeTests() {
    console.log("Inicializando sistema de tests...");
    
    // Marcar que se ha intentado inicializar
    window.testButtonAdded = true;
    
    // Función para intentar agregar el botón
    const tryAddButton = () => {
        addTestButton();
    };
    
    // Si el DOM ya está cargado, intentar agregar el botón inmediatamente
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        tryAddButton();
    } else {
        // Si no, esperar a que se cargue
        document.addEventListener('DOMContentLoaded', tryAddButton);
    }
    
    // También intentar después de un tiempo, por si otros scripts modifican el DOM
    setTimeout(tryAddButton, 1000);
    setTimeout(tryAddButton, 3000);
    
    // Observar cambios en el DOM para asegurar que el botón siempre esté presente
    const observer = new MutationObserver((mutations) => {
        let shouldAddButton = false;
        
        mutations.forEach((mutation) => {
            // Si se modifica el paso 1, verificar si el botón aún existe
            if (mutation.target.id === 'step-1' || 
                (mutation.target.closest && mutation.target.closest('#step-1'))) {
                if (!document.getElementById('btn-run-tests')) {
                    shouldAddButton = true;
                }
            }
        });
        
        if (shouldAddButton) {
            console.log("Detectados cambios en el paso 1, agregando botón si es necesario...");
            addTestButton();
        }
    });
    
    // Comenzar a observar el documento completo
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Iniciar la inicialización de los tests inmediatamente
initializeTests();

// Exponer las funciones para que puedan ser llamadas manualmente si es necesario
window.addTestButton = addTestButton;
window.runAllTests = runAllTests; // Línea clave para ejecutar tests desde consola
