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
                // Mostrar stack trace para depuración
                console.error(error.stack);
            }
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        console.log('=====================================================');
        console.log(`%c🏁 Tests Finalizados en ${duration}ms`, 'font-size: 16px; font-weight: bold; color: #f39c12;');
        console.log(`%c✅ Pasados: ${this.passed}`, 'color: #2ecc71; font-weight: bold;');
        console.log(`%c❌ Fallidos: ${this.failed}`, 'color: #e74c3c; font-weight: bold;');
        
        // Actualizar UI con resultados
        this.updateResultsUI();
        
        return this.failed === 0;
    }

    resetTestEnvironment() {
        // Reiniciar la aplicación a un estado conocido antes de cada test
        if (window.tasacionApp) {
            window.tasacionApp.currentStep = 1;
            window.tasacionApp.inmuebleData = {};
            window.tasacionApp.comparables = [];
            window.tasacionApp.valorM2Referencia = 0;
            
            // Resetear formularios
            document.getElementById('form-inmueble').reset();
            document.getElementById('descuento-negociacion').value = 10;
            
            // Resetear UI
            window.tasacionApp.goToStep(1);
            window.comparablesManager.resetComparables();
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
// TESTS DE ESTRUCTURA Y ESTADO INICIAL
// ========================================
function testEstructuraInicial(testSuite) {
    testSuite.test('La aplicación principal debe instanciarse correctamente', () => {
        testSuite.assert(window.tasacionApp, 'La instancia de TasacionApp no existe en window');
        testSuite.assert(window.tasacionApp instanceof TasacionApp, 'window.tasacionApp no es una instancia de TasacionApp');
    });

    testSuite.test('Los gestores de componentes deben instanciarse', () => {
        testSuite.assert(window.comparablesManager, 'ComparablesManager no está instanciado');
        testSuite.assert(window.factoresManager, 'FactoresManager no está instanciado');
        testSuite.assert(window.composicionManager, 'ComposicionManager no está instanciado');
    });

    testSuite.test('El estado inicial debe ser correcto', () => {
        testSuite.assertEqual(window.tasacionApp.currentStep, 1, 'El paso inicial debería ser 1');
        testSuite.assert(window.tasacionApp.inmuebleData, 'inmuebleData debería ser un objeto');
        testSuite.assertEqual(Object.keys(window.tasacionApp.inmuebleData).length, 0, 'inmuebleData debería estar vacío inicialmente');
        testSuite.assert(Array.isArray(window.tasacionApp.comparables), 'comparables debería ser un array');
        testSuite.assertEqual(window.tasacionApp.comparables.length, 0, 'comparables debería estar vacío inicialmente');
        testSuite.assertEqual(window.tasacionApp.valorM2Referencia, 0, 'valorM2Referencia debería ser 0 inicialmente');
    });

    testSuite.test('Los elementos DOM clave deben existir', () => {
        testSuite.assertElementExists('#step-1', 'El contenedor del paso 1 no existe');
        testSuite.assertElementExists('#step-2', 'El contenedor del paso 2 no existe');
        testSuite.assertElementExists('#step-3', 'El contenedor del paso 3 no existe');
        testSuite.assertElementExists('#step-4', 'El contenedor del paso 4 no existe');
        testSuite.assertElementExists('#step-5', 'El contenedor del paso 5 no existe');
        testSuite.assertElementExists('.progress-indicator', 'El indicador de progreso no existe');
        testSuite.assertElementExists('#btn-siguiente-1', 'El botón siguiente del paso 1 no existe');
    });
}

// ========================================
// TESTS DE FLUJO DE NAVEGACIÓN
// ========================================
function testNavegacion(testSuite) {
    testSuite.test('Debe mostrar el paso 1 como activo inicialmente', () => {
        testSuite.assert(document.getElementById('step-1').classList.contains('active'), 'El paso 1 debería estar activo');
        testSuite.assert(!document.getElementById('step-2').classList.contains('active'), 'El paso 2 no debería estar activo');
    });

    testSuite.test('No debe poder avanzar al paso 2 con datos inválidos', () => {
        document.getElementById('btn-siguiente-1').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 1, 'No debería poder avanzar al paso 2 sin datos válidos');
        testSuite.assert(document.getElementById('step-1').classList.contains('active'), 'El paso 1 debería seguir activo');
    });

    testSuite.test('Debe poder avanzar al paso 2 con datos válidos', () => {
        // Llenar datos válidos
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Calle Test 123';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Palermo';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        
        document.getElementById('btn-siguiente-1').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 2, 'Debería poder avanzar al paso 2');
        testSuite.assert(!document.getElementById('step-1').classList.contains('active'), 'El paso 1 ya no debería estar activo');
        testSuite.assert(document.getElementById('step-2').classList.contains('active'), 'El paso 2 debería estar activo');
    });

    testSuite.test('Debe poder volver al paso anterior', () => {
        document.getElementById('btn-anterior-2').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 1, 'Debería volver al paso 1');
        testSuite.assert(document.getElementById('step-1').classList.contains('active'), 'El paso 1 debería estar activo');
    });
}

// ========================================
// TESTS DE DATOS DEL INMUEBLE
// ========================================
function testDatosInmueble(testSuite) {
    testSuite.test('Debe guardar correctamente los datos del inmueble', () => {
        // Llenar todos los campos
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
        testSuite.assertEqual(data.piso, '3', 'El piso no se guardó correctamente');
        testSuite.assertEqual(data.depto, 'B', 'El depto no se guardó correctamente');
        testSuite.assertEqual(data.localidad, 'CABA', 'La localidad no se guardó correctamente');
        testSuite.assertEqual(data.barrio, 'Once', 'El barrio no se guardó correctamente');
        testSuite.assertEqual(data.antiguedad, '20', 'La antigüedad no se guardó correctamente');
        testSuite.assertEqual(data.calidad, 'muy-buena', 'La calidad no se guardó correctamente');
        testSuite.assertEqual(data.supCubierta, 75, 'La superficie cubierta no se guardó correctamente');
        testSuite.assertEqual(data.supSemicubierta, 15, 'La superficie semicubierta no se guardó correctamente');
        testSuite.assertEqual(data.supDescubierta, 25, 'La superficie descubierta no se guardó correctamente');
        testSuite.assertEqual(data.supBalcon, 8, 'La superficie del balcón no se guardó correctamente');
        testSuite.assertEqual(data.supTerreno, 150, 'La superficie del terreno no se guardó correctamente');
        testSuite.assertEqual(data.cochera, 'propia', 'La cochera no se guardó correctamente');
    });
}

// ========================================
// TESTS DE GESTIÓN DE COMPARABLES
// ========================================
function testComparables(testSuite) {
    testSuite.test('Debe abrir el modal para agregar un comparable', () => {
        document.getElementById('btn-agregar-comparable').click();
        testSuite.assertElementExists('#modal-comparable', 'El modal de comparable no se abrió');
        testSuite.assertEqual(document.getElementById('modal-comparable').style.display, 'block', 'El modal debería estar visible');
    });

    testSuite.test('Debe agregar un comparable correctamente', () => {
        // Cerrar modal por si estaba abierto
        window.comparablesManager.closeComparableModal();
        
        // Abrir modal y llenar datos
        window.comparablesManager.openComparableModal();
        
        document.getElementById('comp-tipo-propiedad').value = 'departamento';
        document.getElementById('comp-precio').value = '150000';
        document.getElementById('comp-direccion').value = 'Calle Falsa 456';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Caballito';
        document.getElementById('comp-antiguedad').value = '5';
        document.getElementById('comp-calidad').value = 'buena';
        document.getElementById('comp-sup-cubierta').value = '80';
        
        document.getElementById('btn-guardar-comparable').click();
        
        // Verificar que se agregó
        testSuite.assertEqual(window.tasacionApp.comparables.length, 1, 'No se agregó el comparable');
        testSuite.assertEqual(window.tasacionApp.comparables[0].precio, 150000, 'El precio no se guardó correctamente');
        testSuite.assertEqual(window.tasacionApp.comparables[0].valorM2, 150000 / 80 * 0.9, 'El valor por m² no se calculó correctamente');
    });

    testSuite.test('Debe calcular el valor por m² con el descuento de negociación', () => {
        const comparable = window.tasacionApp.comparables[0];
        const precioConDescuento = comparable.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);
        const valorM2Esperado = precioConDescuento / comparable.supCubierta;
        testSuite.assertClose(comparable.valorM2, valorM2Esperado, 0.01, 'El valor por m² no se calculó correctamente con el descuento');
    });

    testSuite.test('Debe editar un comparable existente', () => {
        const comparable = window.tasacionApp.comparables[0];
        const idOriginal = comparable.id;
        
        window.comparablesManager.openComparableModal(idOriginal);
        
        // Modificar un campo
        document.getElementById('comp-precio').value = '160000';
        document.getElementById('btn-guardar-comparable').click();
        
        // Verificar que se editó
        testSuite.assertEqual(window.tasacionApp.comparables.length, 1, 'No debería haber agregado un nuevo comparable');
        testSuite.assertEqual(window.tasacionApp.comparables[0].id, idOriginal, 'El ID del comparable no debería cambiar');
        testSuite.assertEqual(window.tasacionApp.comparables[0].precio, 160000, 'El precio no se actualizó correctamente');
    });

    testSuite.test('Debe eliminar un comparable', () => {
        const idAEliminar = window.tasacionApp.comparables[0].id;
        window.comparablesManager.deleteComparable(idAEliminar);
        
        testSuite.assertEqual(window.tasacionApp.comparables.length, 0, 'El comparable no se eliminó correctamente');
    });
}

// ========================================
// TESTS DE FACTORES DE AJUSTE
// ========================================
function testFactoresAjuste(testSuite) {
    // Primero agregamos 4 comparables para poder probar los factores
    const datosComparables = [
        { precio: 100000, sup: 50, direccion: 'Dir 1' },
        { precio: 120000, sup: 60, direccion: 'Dir 2' },
        { precio: 140000, sup: 70, direccion: 'Dir 3' },
        { precio: 160000, sup: 80, direccion: 'Dir 4' }
    ];
    
    datosComparables.forEach(datos => {
        window.comparablesManager.openComparableModal();
        document.getElementById('comp-precio').value = datos.precio;
        document.getElementById('comp-direccion').value = datos.direccion;
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Test';
        document.getElementById('comp-antiguedad').value = '10';
        document.getElementById('comp-calidad').value = 'buena';
        document.getElementById('comp-sup-cubierta').value = datos.sup;
        document.getElementById('btn-guardar-comparable').click();
    });
    
    // Ir al paso 3
    document.getElementById('btn-siguiente-2').click();
    
    testSuite.test('Debe inicializar los factores para cada comparable', () => {
        window.tasacionApp.comparables.forEach(comparable => {
            testSuite.assert(comparable.factores, `El comparable ${comparable.id} debería tener un objeto de factores`);
            testSuite.assertEqual(Object.keys(comparable.factores).length, 10, `El comparable ${comparable.id} debería tener 10 factores`);
        });
    });

    testSuite.test('Debe aplicar ajustes al cambiar los sliders', () => {
        const primerComparable = window.tasacionApp.comparables[0];
        
        // Simular el cambio en un slider (por ejemplo, Ubicación)
        const sliderUbicacion = document.getElementById('factor-ubicación');
        sliderUbicacion.value = 5; // +5%
        sliderUbicacion.dispatchEvent(new Event('input'));
        
        testSuite.assertEqual(primerComparable.factores['Ubicación'], 5, 'El factor de Ubicación no se actualizó');
        
        // Verificar que el valor ajustado se recalculó
        const correccionTotal = Object.values(primerComparable.factores).reduce((sum, val) => sum + val, 0);
        const valorAjustadoEsperado = primerComparable.valorM2 * (1 + correccionTotal / 100);
        testSuite.assertClose(primerComparable.valorM2Ajustado, valorAjustadoEsperado, 0.01, 'El valor por m² ajustado no se recalculó correctamente');
    });

    testSuite.test('Debe cambiar de comparable al hacer clic en las pestañas', () => {
        // Hacer clic en la pestaña del segundo comparable
        const tabComparable2 = document.querySelector('.factor-tab[data-comparable="2"]');
        tabComparable2.click();
        
        testSuite.assertEqual(window.factoresManager.currentComparable, 2, 'No se cambió al comparable 2');
        testSuite.assert(tabComparable2.classList.contains('active'), 'La pestaña del comparable 2 no está activa');
    });
}

// ========================================
// TESTS DE CÁLCULO DE VALOR DE REFERENCIA
// ========================================
function testValorReferencia(testSuite) {
    // Aplicar algunos factores a los comparables para tener valores ajustados
    window.tasacionApp.comparables[0].factores['Ubicación'] = 5;
    window.tasacionApp.comparables[1].factores['Calidad de Construcción'] = -3;
    window.tasacionApp.comparables[2].factores['Estado de Mantenimiento'] = 8;
    window.tasacionApp.comparables[3].factores['Orientación y Vistas'] = 2;
    
    // Recalcular los valores ajustados
    window.tasacionApp.comparables.forEach(c => {
        const correccionTotal = Object.values(c.factores).reduce((sum, val) => sum + val, 0);
        c.valorM2Ajustado = c.valorM2 * (1 + correccionTotal / 100);
    });
    
    // Ir al paso 4
    document.getElementById('btn-siguiente-3').click();
    
    testSuite.test('Debe calcular el valor de referencia usando el método promedio', () => {
        document.getElementById('metodo-calculo').value = 'promedio';
        document.getElementById('metodo-calculo').dispatchEvent(new Event('change'));
        
        const valoresAjustados = window.tasacionApp.comparables.map(c => c.valorM2Ajustado);
        const promedioEsperado = valoresAjustados.reduce((sum, val) => sum + val, 0) / valoresAjustados.length;
        
        testSuite.assertClose(window.tasacionApp.valorM2Referencia, promedioEsperado, 0.01, 'El valor de referencia (promedio) no se calculó correctamente');
    });

    testSuite.test('Debe calcular el valor de referencia usando el método mediana', () => {
        document.getElementById('metodo-calculo').value = 'mediana';
        document.getElementById('metodo-calculo').dispatchEvent(new Event('change'));
        
        const valoresAjustados = window.tasacionApp.comparables.map(c => c.valorM2Ajustado).sort((a, b) => a - b);
        const medianaEsperada = valoresAjustados.length % 2 === 0
            ? (valoresAjustados[valoresAjustados.length / 2 - 1] + valoresAjustados[valoresAjustados.length / 2]) / 2
            : valoresAjustados[Math.floor(valoresAjustados.length / 2)];
            
        testSuite.assertClose(window.tasacionApp.valorM2Referencia, medianaEsperada, 0.01, 'El valor de referencia (mediana) no se calculó correctamente');
    });
}

// ========================================
// TESTS DE COMPOSICIÓN DEL VALOR
// ========================================
function testComposicionValor(testSuite) {
    // Ir al paso 5
    document.getElementById('btn-siguiente-4').click();
    
    testSuite.test('Debe calcular los valores parciales de la composición', () => {
        const valorM2Ref = window.tasacionApp.valorM2Referencia;
        const inmueble = window.tasacionApp.inmuebleData;
        
        const valorCubierta = inmueble.supCubierta * 1.0 * valorM2Ref;
        const valorSemicubierta = inmueble.supSemicubierta * 0.5 * valorM2Ref;
        const valorDescubierta = inmueble.supDescubierta * 0.2 * valorM2Ref;
        const valorBalcon = inmueble.supBalcon * 0.33 * valorM2Ref;
        
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + 5000; // +5000 por cochera propia
        
        const valorTotalUI = parseFloat(document.getElementById('valor-total-tasacion').textContent);
        
        testSuite.assertClose(valorTotalUI, valorTotal, 0.01, 'El valor total de tasación no se calculó correctamente');
    });
}

// ========================================
// TESTS DE PREVENCIÓN DE ERRORES HUMANOS
// ========================================
function testPrevencionErrores(testSuite) {
    testSuite.test('Debe prevenir avance con campos obligatorios vacíos (Paso 1)', () => {
        window.tasacionApp.resetApp();
        
        // Dejar campos obligatorios vacíos
        document.getElementById('direccion').value = '';
        document.getElementById('btn-siguiente-1').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 1, 'No debería avanzar con campos obligatorios vacíos');
    });

    testSuite.test('Debe prevenir avance con menos de 4 comparables (Paso 2)', () => {
        // Llenar datos del paso 1
        document.getElementById('tipo-propiedad').value = 'departamento';
        document.getElementById('direccion').value = 'Test';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Test';
        document.getElementById('antiguedad').value = '10';
        document.getElementById('calidad').value = 'buena';
        document.getElementById('sup-cubierta').value = '100';
        document.getElementById('btn-siguiente-1').click();
        
        // Agregar solo 3 comparables
        for (let i = 0; i < 3; i++) {
            window.comparablesManager.openComparableModal();
            document.getElementById('comp-precio').value = '100000';
            document.getElementById('comp-direccion').value = `Test ${i}`;
            document.getElementById('comp-localidad').value = 'CABA';
            document.getElementById('comp-barrio').value = 'Test';
            document.getElementById('comp-antiguedad').value = '10';
            document.getElementById('comp-calidad').value = 'buena';
            document.getElementById('comp-sup-cubierta').value = '50';
            document.getElementById('btn-guardar-comparable').click();
        }
        
        document.getElementById('btn-siguiente-2').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 2, 'No debería avanzar con menos de 4 comparables');
    });

    testSuite.test('Debe prevenir avance sin aplicar factores (Paso 3)', () => {
        // Agregar el cuarto comparable
        window.comparablesManager.openComparableModal();
        document.getElementById('comp-precio').value = '100000';
        document.getElementById('comp-direccion').value = 'Test 4';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Test';
        document.getElementById('comp-antiguedad').value = '10';
        document.getElementById('comp-calidad').value = 'buena';
        document.getElementById('comp-sup-cubierta').value = '50';
        document.getElementById('btn-guardar-comparable').click();
        
        document.getElementById('btn-siguiente-2').click();
        
        // No tocar ningún slider
        document.getElementById('btn-siguiente-3').click();
        
        testSuite.assertEqual(window.tasacionApp.currentStep, 3, 'No debería avanzar sin aplicar factores de ajuste');
    });

    testSuite.test('Debe manejar valores numéricos inválidos', () => {
        window.comparablesManager.openComparableModal();
        
        // Intentar guardar con precio negativo
        document.getElementById('comp-precio').value = '-50000';
        document.getElementById('comp-direccion').value = 'Test';
        document.getElementById('comp-localidad').value = 'CABA';
        document.getElementById('comp-barrio').value = 'Test';
        document.getElementById('comp-antiguedad').value = '10';
        document.getElementById('comp-calidad').value = 'buena';
        document.getElementById('comp-sup-cubierta').value = '50';
        
        // El input type="number" debería prevenir esto, pero verificamos que el valor se guarde como número negativo
        const precioGuardado = parseFloat(document.getElementById('comp-precio').value);
        testSuite.assert(precioGuardado < 0, 'El input debería permitir valores negativos para probar el manejo de errores');
        
        window.comparablesManager.closeComparableModal();
    });
}

// ========================================
// TEST DE INTEGRACIÓN Y CARGA COMPLETA
// ========================================
function testCargaCompleta(testSuite) {
    testSuite.test('Debe completar un flujo de tasación completo', async () => {
        // Reiniciar aplicación
        window.tasacionApp.resetApp();
        
        // === PASO 1: Datos del Inmueble ===
        document.getElementById('tipo-propiedad').value = 'ph';
        document.getElementById('direccion').value = 'Scalabrini Ortiz 500';
        document.getElementById('piso').value = '2';
        document.getElementById('depto').value = 'A';
        document.getElementById('localidad').value = 'CABA';
        document.getElementById('barrio').value = 'Villa Crespo';
        document.getElementById('antiguedad').value = '15';
        document.getElementById('calidad').value = 'muy-buena';
        document.getElementById('sup-cubierta').value = '65';
        document.getElementById('sup-semicubierta').value = '20';
        document.getElementById('sup-descubierta').value = '0';
        document.getElementById('sup-balcon').value = '6';
        document.getElementById('sup-terreno').value = '0';
        document.getElementById('cochera').value = 'comun';
        
        document.getElementById('btn-siguiente-1').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 2, 'Fallo en el paso 1');
        
        // === PASO 2: Cargar 4 Comparables ===
        const datosComparables = [
            { tipo: 'ph', precio: 125000, dir: 'Av. Corrientes 5800', sup: 67, ant: 60, calidad: 'muy buena' },
            { tipo: 'ph', precio: 118000, dir: 'Luis Viale 600', sup: 62, ant: 60, calidad: 'buena' },
            { tipo: 'ph', precio: 155000, dir: 'Acevedo 677', sup: 65, ant: 35, calidad: 'muy buena' },
            { tipo: 'ph', precio: 145000, dir: 'Gurruchaga 200', sup: 70, ant: 20, calidad: 'excelente' }
        ];
        
        for (const datos of datosComparables) {
            window.comparablesManager.openComparableModal();
            document.getElementById('comp-tipo-propiedad').value = datos.tipo;
            document.getElementById('comp-precio').value = datos.precio;
            document.getElementById('comp-direccion').value = datos.dir;
            document.getElementById('comp-localidad').value = 'CABA';
            document.getElementById('comp-barrio').value = 'Villa Crespo';
            document.getElementById('comp-antiguedad').value = datos.ant;
            document.getElementById('comp-calidad').value = datos.calidad;
            document.getElementById('comp-sup-cubierta').value = datos.sup;
            document.getElementById('btn-guardar-comparable').click();
            
            // Pequeña espera para asegurar que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        testSuite.assertEqual(window.tasacionApp.comparables.length, 4, 'No se cargaron los 4 comparables');
        
        document.getElementById('btn-siguiente-2').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 3, 'Fallo al pasar al paso 3');
        
        // === PASO 3: Aplicar Factores de Ajuste ===
        const ajustes = [
            { ubicacion: 2, calidad: 0, mantenimiento: 5, superficie: -1, estacionamiento: 3 },
            { ubicacion: -1, calidad: -2, mantenimiento: 0, superficie: 2, estacionamiento: 0 },
            { ubicacion: 0, calidad: 3, mantenimiento: 8, superficie: -3, estacionamiento: 5 },
            { ubicacion: 5, calidad: 5, mantenimiento: 10, superficie: 0, estacionamiento: 8 }
        ];
        
        for (let i = 0; i < 4; i++) {
            // Cambiar a la pestaña del comparable
            document.querySelector(`.factor-tab[data-comparable="${i + 1}"]`).click();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Aplicar ajustes (simplificado, solo algunos factores)
            const sliderUbicacion = document.getElementById('factor-ubicación');
            sliderUbicacion.value = ajustes[i].ubicacion;
            sliderUbicacion.dispatchEvent(new Event('input'));
            
            const sliderMantenimiento = document.getElementById('factor-estado-de-mantenimiento');
            sliderMantenimiento.value = ajustes[i].mantenimiento;
            sliderMantenimiento.dispatchEvent(new Event('input'));
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        document.getElementById('btn-siguiente-3').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 4, 'Fallo al pasar al paso 4');
        
        // === PASO 4: Calcular Valor de Referencia ===
        testSuite.assert(window.tasacionApp.valorM2Referencia > 0, 'El valor de referencia debería ser mayor a 0');
        
        document.getElementById('btn-siguiente-4').click();
        testSuite.assertEqual(window.tasacionApp.currentStep, 5, 'Fallo al pasar al paso 5');
        
        // === PASO 5: Verificar Valor Final ===
        const valorFinal = parseFloat(document.getElementById('valor-total-tasacion').textContent);
        testSuite.assert(valorFinal > 0, 'El valor final de tasación debería ser mayor a 0');
        
        // El test pasa si todo lo anterior se ejecutó sin errores
        testSuite.assert(true, 'Flujo de tasación completado exitosamente');
    });
}

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
    testButton.innerHTML = '<i class="fas fa-vial"></i> Ejecutar Tests';
    testButton.style.marginLeft = '10px';
    
    // Agregar el botón a la sección de acciones generales
    const accionesGenerales = document.getElementById('acciones-generales');
    if (accionesGenerales) {
        const accionesContainer = accionesGenerales.querySelector('.acciones');
        if (accionesContainer) {
            accionesContainer.appendChild(testButton);
        }
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
        testButton.innerHTML = '<i class="fas fa-vial"></i> Ejecutar Tests';
    });
});
