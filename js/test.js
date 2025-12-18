/**
 * Versión final y definitiva. Forza la reconstrucción de la UI para evitar problemas de estado.
 */

console.log("test.js: Script cargado");

// ========================================
// CLASE TESTSUITE (SIN CAMBIOS)
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
            throw new Error(message || `Element "${selector}" not found`);
        }
        return element;
    }

    updateResultsUI() {
        let container = document.getElementById('test-results-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'test-results-container';
            container.style.cssText = `
                position: fixed; top: 10px; right: 10px;
                background: white; border: 2px solid #ddd;
                border-radius: 8px; padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000; max-width: 400px;
                font-family: monospace;
            `;
            document.body.appendChild(container);
        }

        const ok = this.failed === 0;
        container.innerHTML = `
            <h3 style="margin-top:0;color:${ok ? '#2ecc71' : '#e74c3c'}">
                ${ok ? '✅ Todos los tests pasaron' : '❌ Algunos tests fallaron'}
            </h3>
            <p><strong>Pasados:</strong> ${this.passed}</p>
            <p><strong>Fallidos:</strong> ${this.failed}</p>
            <p><strong>Total:</strong> ${this.tests.length}</p>
            <button onclick="this.parentElement.remove()">Cerrar</button>
        `;
    }
}

// ========================================
// HELPERS waitForElement / waitForCondition (SIN CAMBIOS)
// ========================================
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const i = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(i);
                resolve(el);
            }
            if (Date.now() - start > timeout) {
                clearInterval(i);
                reject(new Error(`Elemento ${selector} no apareció`));
            }
        }, 100);
    });
}

function waitForCondition(condition, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const i = setInterval(() => {
            if (condition()) {
                clearInterval(i);
                resolve();
            }
            if (Date.now() - start > timeout) {
                clearInterval(i);
                reject(new Error(`Condición no cumplida`));
            }
        }, 100);
    });
}

// ========================================
// BOTÓN DE TESTS (MODIFICADO)
// ========================================
function addTestButton() {
    if (document.getElementById('btn-run-tests')) return;

    const checkInterval = setInterval(() => {
        const step1Actions = document.querySelector('#step-1 .form-actions');
        if (!step1Actions) return;

        clearInterval(checkInterval);

        const btn = document.createElement('button');
        btn.id = 'btn-run-tests';
        btn.className = 'btn-secondary';
        btn.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
        btn.style.marginLeft = '10px';

        step1Actions.appendChild(btn);

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ejecutando...';
            try {
                await runAllTests();
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-flask"></i> Ejecutar Tests';
            }
        });

        console.log("Botón de tests agregado correctamente");
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
        console.error("No se encontró el contenedor del botón de tests");
    }, 5000);
}

// ========================================
// INICIALIZACIÓN (MODIFICADA)
// ========================================
async function initializeTests() {
    await waitForCondition(() => {
        return window.tasacionApp &&
               window.tasacionApp.currentStep !== undefined &&
               document.querySelector('#step-1 .form-actions');
    }, 5000);

    console.log("Inicializando tests después de la app");
    addTestButton();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeTests, 500);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeTests, 500);
}
