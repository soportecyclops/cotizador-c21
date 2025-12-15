// Gestión de comparables
class ComparablesManager {
    constructor() {
        this.comparables = [];
        this.siguienteId = 1;
        this.comparableSeleccionado = null;
        this.init();
    }

    init() {
        // Eventos
        document.getElementById('btn-agregar-comparable').addEventListener('click', () => this.mostrarModalComparable());
        document.getElementById('btn-aplicar-ajustes').addEventListener('click', () => this.aplicarAjustes());
        
        // Eventos para inputs de factores de ajuste
        document.querySelectorAll('#tabla-factores input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const valorSpan = e.target.parentElement.querySelector('.valor-ajuste');
                valorSpan.textContent = `${e.target.value}%`;
            });
        });

        // Cerrar modal
        document.querySelector('.close-modal').addEventListener('click', () => this.cerrarModalComparable());
        
        // Guardar comparable desde modal
        document.getElementById('btn-guardar-comparable').addEventListener('click', () => this.guardarComparableModal());
    }

    mostrarModalComparable(comparable = null) {
        const modal = document.getElementById('modal-comparable');
        modal.style.display = 'block';
        
        if (comparable) {
            // Modo edición
            document.getElementById('modal-titulo').textContent = 'Editar Comparable';
            document.getElementById('modal-id').value = comparable.id;
            document.getElementById('modal-precio').value = comparable.precio;
            document.getElementById('modal-superficie').value = comparable.superficie;
            document.getElementById('modal-antiguedad').value = comparable.antiguedad;
            document.getElementById('modal-direccion').value = comparable.direccion;
        } else {
            // Modo agregar
            document.getElementById('modal-titulo').textContent = 'Agregar Comparable';
            document.getElementById('modal-id').value = '';
            document.getElementById('modal-precio').value = '';
            document.getElementById('modal-superficie').value = '';
            document.getElementById('modal-antiguedad').value = '';
            document.getElementById('modal-direccion').value = '';
        }
    }

    cerrarModalComparable() {
        document.getElementById('modal-comparable').style.display = 'none';
    }

    guardarComparableModal() {
        const id = document.getElementById('modal-id').value;
        const precio = parseFloat(document.getElementById('modal-precio').value);
        const superficie = parseFloat(document.getElementById('modal-superficie').value);
        const antiguedad = parseInt(document.getElementById('modal-antiguedad').value);
        const direccion = document.getElementById('modal-direccion').value;

        if (!precio || !superficie || !antiguedad || !direccion) {
            this.mostrarError('Por favor, complete todos los campos');
            return;
        }

        if (id) {
            // Editar comparable existente
            const index = this.comparables.findIndex(c => c.id == id);
            if (index !== -1) {
                this.comparables[index] = {
                    ...this.comparables[index],
                    precio,
                    superficie,
                    antiguedad,
                    direccion
                };
            }
        } else {
            // Agregar nuevo comparable
            this.comparables.push({
                id: this.siguienteId++,
                precio,
                superficie,
                antiguedad,
                direccion,
                ajustes: {},
                precioCorregido: precio,
                valorM2: precio / superficie
            });
        }

        this.actualizarTablaComparables();
        this.cerrarModalComparable();
        
        // Actualizar progreso
        if (window.progressManager) {
            window.progressManager.markStepCompleted('comparables');
        }
    }

    actualizarTablaComparables() {
        const tbody = document.querySelector('#tabla-comparables tbody');
        tbody.innerHTML = '';

        if (this.comparables.length === 0) {
            document.getElementById('comparables-empty').style.display = 'block';
            document.getElementById('tabla-comparables').classList.add('oculto');
            return;
        }

        document.getElementById('comparables-empty').style.display = 'none';
        document.getElementById('tabla-comparables').classList.remove('oculto');

        this.comparables.forEach(comparable => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${comparable.id}</td>
                <td>$${comparable.precio.toFixed(2)}</td>
                <td>${comparable.superficie.toFixed(2)}</td>
                <td>${comparable.antiguedad}</td>
                <td>${comparable.direccion}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn-icon btn-ajustar" data-id="${comparable.id}" title="Ajustar">⚙️</button>
                        <button class="btn-icon btn-editar" data-id="${comparable.id}" title="Editar">✏️</button>
                        <button class="btn-icon danger btn-eliminar" data-id="${comparable.id}" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Eventos para los botones de la tabla
        document.querySelectorAll('.btn-ajustar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.seleccionarComparable(id);
            });
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const comparable = this.comparables.find(c => c.id === id);
                if (comparable) {
                    this.mostrarModalComparable(comparable);
                }
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.eliminarComparable(id);
            });
        });
    }

    seleccionarComparable(id) {
        this.comparableSeleccionado = this.comparables.find(c => c.id === id);
        
        if (!this.comparableSeleccionado) return;

        // Mostrar sección de factores
        document.getElementById('contenedor-factores').classList.remove('oculto');
        document.getElementById('factores-empty').style.display = 'none';
        document.getElementById('id-comparable-seleccionado').textContent = id;

        // Cargar ajustes existentes si los hay
        document.querySelectorAll('#tabla-factores input[type="range"]').forEach(input => {
            const factor = input.getAttribute('data-factor');
            const valor = this.comparableSeleccionado.ajustes[factor] || 0;
            input.value = valor;
            const valorSpan = input.parentElement.querySelector('.valor-ajuste');
            valorSpan.textContent = `${valor}%`;
        });

        // Actualizar progreso
        if (window.progressManager) {
            window.progressManager.markStepCompleted('factores-ajuste');
        }
    }

    aplicarAjustes() {
        if (!this.comparableSeleccionado) return;

        // Recopilar ajustes
        const ajustes = {};
        let correccionTotal = 0;

        document.querySelectorAll('#tabla-factores input[type="range"]').forEach(input => {
            const factor = input.getAttribute('data-factor');
            const valor = parseFloat(input.value);
            ajustes[factor] = valor;
            correccionTotal += valor;
        });

        // Aplicar corrección al precio
        const precioCorregido = this.comparableSeleccionado.precio * (1 + correccionTotal / 100);
        const valorM2 = precioCorregido / this.comparableSeleccionado.superficie;

        // Actualizar comparable
        this.comparableSeleccionado.ajustes = ajustes;
        this.comparableSeleccionado.correccionTotal = correccionTotal;
        this.comparableSeleccionado.precioCorregido = precioCorregido;
        this.comparableSeleccionado.valorM2 = valorM2;

        // Actualizar tabla de precios corregidos
        this.actualizarTablaPreciosCorregidos();
        
        // Actualizar valor de referencia
        this.actualizarValorReferencia();
        
        // Mostrar mensaje de éxito
        this.mostrarMensaje('Ajustes aplicados correctamente', 'success');
    }

    actualizarTablaPreciosCorregidos() {
        const tbody = document.querySelector('#tabla-precios-corregidos tbody');
        tbody.innerHTML = '';

        const comparablesConAjustes = this.comparables.filter(c => c.ajustes && Object.keys(c.ajustes).length > 0);
        
        if (comparablesConAjustes.length === 0) {
            document.getElementById('precios-corregidos-empty').style.display = 'block';
            document.getElementById('tabla-precios-corregidos').classList.add('oculto');
            return;
        }

        document.getElementById('precios-corregidos-empty').style.display = 'none';
        document.getElementById('tabla-precios-corregidos').classList.remove('oculto');

        comparablesConAjustes.forEach(comparable => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${comparable.id}</td>
                <td>$${comparable.precio.toFixed(2)}</td>
                <td>${(comparable.correccionTotal || 0).toFixed(2)}%</td>
                <td>$${(comparable.precioCorregido || comparable.precio).toFixed(2)}</td>
                <td>$${(comparable.valorM2 || comparable.precio / comparable.superficie).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });

        // Actualizar progreso
        if (window.progressManager) {
            window.progressManager.markStepCompleted('precio-corregido');
        }
    }

    actualizarValorReferencia() {
        const metodo = document.getElementById('metodo-referencia').value;
        const comparablesConAjustes = this.comparables.filter(c => c.ajustes && Object.keys(c.ajustes).length > 0);
        const valoresM2 = comparablesConAjustes.map(c => c.valorM2 || c.precio / c.superficie);
        
        if (valoresM2.length === 0) {
            document.getElementById('valor-m2').textContent = '0.00';
            return;
        }
        
        let valorReferencia;
        
        switch (metodo) {
            case 'promedio':
                valorReferencia = valoresM2.reduce((sum, val) => sum + val, 0) / valoresM2.length;
                break;
            case 'mediana':
                const sorted = [...valoresM2].sort((a, b) => a - b);
                const middle = Math.floor(sorted.length / 2);
                valorReferencia = sorted.length % 2 === 0 
                    ? (sorted[middle - 1] + sorted[middle]) / 2 
                    : sorted[middle];
                break;
            case 'rango':
                const sortedRango = [...valoresM2].sort((a, b) => a - b);
                const inicio = Math.floor(sortedRango.length * 0.25);
                const fin = Math.ceil(sortedRango.length * 0.75);
                const rangoIntermedio = sortedRango.slice(inicio, fin);
                valorReferencia = rangoIntermedio.reduce((sum, val) => sum + val, 0) / rangoIntermedio.length;
                break;
            default:
                valorReferencia = 0;
        }
        
        document.getElementById('valor-m2').textContent = valorReferencia.toFixed(2);
        
        // Actualizar composición del valor
        if (window.composicionManager) {
            window.composicionManager.actualizarComposicion(valorReferencia);
        }
        
        // Actualizar progreso
        if (window.progressManager) {
            window.progressManager.markStepCompleted('valor-m2-referencia');
        }
    }

    eliminarComparable(id) {
        if (confirm('¿Está seguro de que desea eliminar este comparable?')) {
            this.comparables = this.comparables.filter(c => c.id !== id);
            this.actualizarTablaComparables();
            this.actualizarTablaPreciosCorregidos();
            this.actualizarValorReferencia();
        }
    }

    reiniciar() {
        this.comparables = [];
        this.siguienteId = 1;
        this.comparableSeleccionado = null;
        this.actualizarTablaComparables();
        this.actualizarTablaPreciosCorregidos();
        document.getElementById('valor-m2').textContent = '0.00';
        document.getElementById('contenedor-factores').classList.add('oculto');
        document.getElementById('factores-empty').style.display = 'block';
    }

    mostrarError(mensaje) {
        if (window.validationManager) {
            window.validationManager.mostrarErrores([mensaje]);
        } else {
            alert(mensaje);
        }
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        // Crear contenedor de mensaje si no existe
        let messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            document.body.appendChild(messageContainer);
        }

        // Crear mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${tipo}`;
        messageElement.textContent = mensaje;

        // Agregar estilos si no existen
        if (!document.getElementById('message-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'message-styles';
            styleElement.textContent = `
                .message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem;
                    border-radius: 4px;
                    color: white;
                    z-index: 1000;
                    max-width: 400px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .message-success {
                    background-color: #2ecc71;
                }
                .message-error {
                    background-color: #e74c3c;
                }
                .message-info {
                    background-color: #3498db;
                }
            `;
            document.head.appendChild(styleElement);
        }

        // Agregar mensaje al contenedor
        messageContainer.appendChild(messageElement);

        // Eliminar mensaje después de 3 segundos
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    exportarDatos() {
        const datos = {
            inmueble: {
                direccion: document.getElementById('direccion').value,
                superficieCubierta: document.getElementById('superficie-cubierta').value,
                superficieSemicubierta: document.getElementById('superficie-semicubierta').value,
                superficieDescubierta: document.getElementById('superficie-descubierta').value,
                superficieBalcon: document.getElementById('superficie-balcon').value,
                antiguedad: document.getElementById('antiguedad').value,
                ubicacion: document.getElementById('ubicacion').value
            },
            comparables: this.comparables,
            valorM2Referencia: document.getElementById('valor-m2').textContent,
            valorTotal: document.getElementById('valor-total').textContent
        };

        const datosJson = JSON.stringify(datos, null, 2);
        const blob = new Blob([datosJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasacion_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Inicializar el gestor de comparables
window.comparablesManager = new ComparablesManager();

// Evento para cambiar el método de cálculo del valor de referencia
document.getElementById('metodo-referencia').addEventListener('change', () => {
    if (window.comparablesManager.comparables.length > 0) {
        window.comparablesManager.actualizarValorReferencia();
    }
});

// Evento para exportar datos
document.getElementById('btn-exportar').addEventListener('click', () => {
    window.comparablesManager.exportarDatos();
});
