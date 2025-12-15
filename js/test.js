// Tests para el cotizador inmobiliario
class TestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async run() {
        console.log('Ejecutando tests...');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.passed++;
                console.log(`✓ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.error(`✗ ${test.name}: ${error.message}`);
            }
        }

        console.log(`\nResultados: ${this.passed} pasaron, ${this.failed} fallaron`);
        return this.failed === 0;
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertNotEqual(actual, expected, message) {
        if (actual === expected) {
            throw new Error(message || `Expected not ${expected}, got ${actual}`);
        }
    }

    assertClose(actual, expected, tolerance = 0.01, message) {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(message || `Expected ${expected} ± ${tolerance}, got ${actual}`);
        }
    }
}

// Tests para comparables
function testComparables(testSuite) {
    testSuite.test('Cargar comparables', () => {
        // Simular carga de comparables
        window.comparablesManager.comparables = [
            {
                id: 1,
                precio: 100000,
                superficie: 100,
                antiguedad: 5,
                direccion: 'Calle Falsa 123'
            },
            {
                id: 2,
                precio: 120000,
                superficie: 110,
                antiguedad: 3,
                direccion: 'Avenida Siempre Viva 742'
            }
        ];

        testSuite.assertEqual(window.comparablesManager.comparables.length, 2, 'Debería haber 2 comparables');
        testSuite.assertEqual(window.comparablesManager.comparables[0].precio, 100000, 'El primer comparable debería costar $100,000');
    });

    testSuite.test('Cálculo de ajustes', () => {
        // Seleccionar el primer comparable
        window.comparablesManager.seleccionarComparable(1);
        
        // Aplicar ajustes
        const comparable = window.comparablesManager.comparableSeleccionado;
        comparable.ajustes = {
            ubicacion: 5,
            'calidad-construccion': -3,
            'expectativa-vida': 2,
            'estado-mantenimiento': 8,
            'superficie-cubierta': 0,
            'dimension-descubierta': -5,
            estacionamiento: 5,
            'factibilidad-comercial': 0,
            'distribucion-equipamiento': -2,
            'orientacion-vistas': 3
        };
        
        // Calcular corrección total
        let correccionTotal = 0;
        for (const factor in comparable.ajustes) {
            correccionTotal += comparable.ajustes[factor];
        }
        
        // Aplicar corrección al precio
        const precioCorregido = comparable.precio * (1 + correccionTotal / 100);
        
        testSuite.assertEqual(correccionTotal, 13, 'La corrección total debería ser 13%');
        testSuite.assertClose(precioCorregido, 113000, 0.01, 'El precio corregido debería ser $113,000');
    });

    testSuite.test('Cálculo de valor por m²', () => {
        // Configurar comparables con precios corregidos
        window.comparablesManager.comparables[0].precioCorregido = 113000;
        window.comparablesManager.comparables[1].precioCorregido = 118800;
        
        // Calcular valor por m²
        window.comparablesManager.comparables[0].valorM2 = 113000 / 100;
        window.comparablesManager.comparables[1].valorM2 = 118800 / 110;
        
        testSuite.assertClose(window.comparablesManager.comparables[0].valorM2, 1130, 0.01, 'El valor por m² del primer comparable debería ser $1,130');
        testSuite.assertClose(window.comparablesManager.comparables[1].valorM2, 1080, 0.01, 'El valor por m² del segundo comparable debería ser $1,080');
    });

    testSuite.test('Cálculo de valor de referencia (promedio)', () => {
        // Establecer método de cálculo
        document.getElementById('metodo-referencia').value = 'promedio';
        
        // Calcular valor de referencia
        window.comparablesManager.actualizarValorReferencia();
        
        const valorReferencia = parseFloat(document.getElementById('valor-m2').textContent);
        const valorEsperado = (1130 + 1080) / 2;
        
        testSuite.assertClose(valorReferencia, valorEsperado, 0.01, 'El valor de referencia debería ser el promedio de los valores por m²');
    });
}

// Tests para composición
function testComposicion(testSuite) {
    testSuite.test('Cálculo de composición', () => {
        // Establecer superficies
        document.getElementById('superficie-cubierta').value = 100;
        document.getElementById('superficie-semicubierta').value = 20;
        document.getElementById('superficie-descubierta').value = 30;
        document.getElementById('superficie-balcon').value = 10;
        
        // Establecer valor de referencia
        const valorReferencia = 1105;
        
        // Calcular composición
        const valorTotal = window.composicionManager.actualizarComposicion(valorReferencia);
        
        // Verificar cálculos
        const valorEsperado = 
            100 * 1.0 * valorReferencia +  // Cubierta
            20 * 0.5 * valorReferencia +   // Semicubierta
            30 * 0.2 * valorReferencia +   // Descubierta
            10 * 0.33 * valorReferencia;  // Balcón
        
        testSuite.assertClose(valorTotal, valorEsperado, 0.01, 'El valor total debería coincidir con el cálculo esperado');
    });
}

// Tests de integración
function testIntegracion(testSuite) {
    testSuite.test('Flujo completo de tasación', () => {
        // Reiniciar sistema
        window.comparablesManager.reiniciar();
        window.composicionManager.reiniciar();
        
        // Cargar datos del inmueble
        document.getElementById('direccion').value = 'Calle de Prueba 123';
        document.getElementById('superficie-cubierta').value = 100;
        document.getElementById('superficie-semicubierta').value = 20;
        document.getElementById('superficie-descubierta').value = 30;
        document.getElementById('superficie-balcon').value = 10;
        document.getElementById('antiguedad').value = 5;
        document.getElementById('ubicacion').value = 'Barrio de Prueba';
        
        // Agregar comparables
        window.comparablesManager.comparables = [
            {
                id: 1,
                precio: 100000,
                superficie: 100,
                antiguedad: 5,
                direccion: 'Calle Falsa 123',
                ajustes: {
                    ubicacion: 5,
                    'calidad-construccion': -3,
                    'expectativa-vida': 2,
                    'estado-mantenimiento': 8,
                    'superficie-cubierta': 0,
                    'dimension-descubierta': -5,
                    estacionamiento: 5,
                    'factibilidad-comercial': 0,
                    'distribucion-equipamiento': -2,
                    'orientacion-vistas': 3
                }
            },
            {
                id: 2,
                precio: 120000,
                superficie: 110,
                antiguedad: 3,
                direccion: 'Avenida Siempre Viva 742',
                ajustes: {
                    ubicacion: 3,
                    'calidad-construccion': 0,
                    'expectativa-vida': 5,
                    'estado-mantenimiento': 10,
                    'superficie-cubierta': -2,
                    'dimension-descubierta': 0,
                    estacionamiento: 8,
                    'factibilidad-comercial': 5,
                    'distribucion-equipamiento': 0,
                    'orientacion-vistas': 2
                }
            }
        ];
        
        // Actualizar tablas
        window.comparablesManager.actualizarTablaComparables();
        
        // Aplicar ajustes
        for (const comparable of window.comparablesManager.comparables) {
            window.comparablesManager.comparableSeleccionado = comparable;
            window.comparablesManager.aplicarAjustes();
        }
        
        // Verificar que se calculó el valor de referencia
        const valorReferencia = parseFloat(document.getElementById('valor-m2').textContent);
        testSuite.assert(valorReferencia > 0, 'El valor de referencia debería ser mayor que cero');
        
        // Verificar que se calculó el valor total
        const valorTotal = parseFloat(document.getElementById('valor-total').textContent);
        testSuite.assert(valorTotal > 0, 'El valor total debería ser mayor que cero');
    });
}

// Ejecutar tests
async function runTests() {
    const testSuite = new TestSuite();
    
    // Agregar tests
    testComparables(testSuite);
    testComposicion(testSuite);
    testIntegracion(testSuite);
    
    // Ejecutar tests
    const allPassed = await testSuite.run();
    
    // Mostrar resultado en la página
    const resultDiv = document.createElement('div');
    resultDiv.className = allPassed ? 'test-success' : 'test-failure';
    resultDiv.innerHTML = `
        <h3>Resultados de Tests</h3>
        <p>${testSuite.passed} tests pasaron, ${testSuite.failed} tests fallaron</p>
        <p>Ver la consola para más detalles</p>
    `;
    
    // Agregar estilos para los resultados de tests
    if (!document.getElementById('test-styles')) {
        const style = document.createElement('style');
        style.id = 'test-styles';
        style.textContent = `
            .test-success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 4px;
            }
            .test-failure {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Agregar botón para ejecutar tests
    const testButton = document.createElement('button');
    testButton.textContent = 'Ejecutar Tests';
    testButton.addEventListener('click', () => {
        document.body.appendChild(resultDiv);
        runTests();
    });
    
    // Agregar botón a la sección de acciones generales
    document.getElementById('acciones-generales').appendChild(testButton);
}

// Ejecutar tests al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Agregar botón de tests (comentado para no mostrar en producción)
    // runTests();
});
