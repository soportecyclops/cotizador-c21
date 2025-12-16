/**
 * Versión simplificada del test.js para diagnosticar problemas
 */

console.log("test.js: Script cargado");

// ========================================
// CLASE TESTSUITE SIMPLIFICADA
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
        console.log('%c🚀 Iniciando Suite de Tests Simplificada', 'font-size: 16px; font-weight: bold; color: #3498db;');
        console.log('=====================================================');
        
        const startTime = performance.now();

        for (const test of this.tests) {
            this.currentTestName = test.name;
            try {
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
        
        return this.failed === 0;
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
// TESTS MÍNIMOS PARA VERIFICAR INFRAESTRUCTURA
// ========================================
function setupBasicTests(testSuite) {
    testSuite.test('El DOM debe estar cargado', () => {
        testSuite.assert(document.readyState === 'complete' || document.readyState === 'interactive', 
                         'El DOM no está completamente cargado');
    });

    testSuite.test('Debe existir el contenedor del paso 1', () => {
        const step1 = document.getElementById('step-1');
        testSuite.assert(step1, 'No existe el contenedor del paso 1');
    });

    testSuite.test('Debe existir el contenedor de acciones del paso 1', () => {
        const actions = document.querySelector('#step-1 .form-actions');
        testSuite.assert(actions, 'No existe el contenedor de acciones del paso 1');
    });

    testSuite.test('La aplicación debe estar instanciada', () => {
        testSuite.assert(window.tasacionApp, 'La aplicación no está instanciada en window.tasacionApp');
    });
}

// ========================================
// FUNCIÓN PRINCIPAL PARA EJECUTAR TESTS
// ========================================
async function runBasicTests() {
    console.log("runBasicTests: Iniciando tests básicos");
    
    try {
        const testSuite = new TestSuite();
        setupBasicTests(testSuite);
        
        const allPassed = await testSuite.run();
        console.log("runBasicTests: Tests finalizados, resultado:", allPassed);
        
        return allPassed;
    } catch (error) {
        console.error("runBasicTests: Error al ejecutar tests:", error);
        return false;
    }
}

// ========================================
// FUNCIÓN PARA AGREGAR EL BOTÓN DE TEST
// ========================================
function addTestButton() {
    console.log("addTestButton: Intentando agregar botón de test");
    
    // Verificar si el botón ya existe
    if (document.getElementById('btn-run-tests')) {
        console.log("addTestButton: El botón ya existe");
        return;
    }

    // Buscar el contenedor de acciones del primer paso
    const step1Actions = document.querySelector('#step-1 .form-actions');
    console.log("addTestButton: Contenedor de acciones encontrado:", step1Actions);

    if (step1Actions) {
        console.log("addTestButton: Creando botón");
        const testButton = document.createElement('button');
        testButton.id = 'btn-run-tests';
        testButton.className = 'btn-secondary';
        testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
        testButton.style.marginLeft = '10px';
        
        step1Actions.appendChild(testButton);
        console.log("addTestButton: Botón agregado exitosamente");
        
        // Agregar evento al botón
        testButton.addEventListener('click', async () => {
            console.log("addTestButton: Botón clickeado");
            testButton.disabled = true;
            testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ejecutando...';
            
            try {
                await runBasicTests();
            } catch (e) {
                console.error("addTestButton: Error durante la ejecución de tests:", e);
            } finally {
                testButton.disabled = false;
                testButton.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
            }
        });
    } else {
        console.error("addTestButton: No se encontró el contenedor de acciones");
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================
console.log("test.js: Configurando evento DOMContentLoaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("test.js: DOMContentLoaded disparado");
    addTestButton();
});

// Si el DOM ya está cargado, agregar el botón inmediatamente
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("test.js: DOM ya está cargado, agregando botón inmediatamente");
    addTestButton();
}

// Intentar agregar el botón después de un tiempo como respaldo
setTimeout(() => {
    console.log("test.js: Intento de respaldo para agregar botón");
    addTestButton();
}, 1000);
