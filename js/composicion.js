// Gestión de composición del valor
class ComposicionManager {
    constructor() {
        this.valorM2Referencia = 0;
        this.coeficientes = {
            cubierta: 1.0,
            semicubierta: 0.5,
            descubierta: 0.2,
            balcon: 0.33
        };
        this.init();
    }

    init() {
        // Eventos para los campos de superficie del inmueble
        document.getElementById('superficie-cubierta').addEventListener('input', () => this.actualizarComposicion());
        document.getElementById('superficie-semicubierta').addEventListener('input', () => this.actualizarComposicion());
        document.getElementById('superficie-descubierta').addEventListener('input', () => this.actualizarComposicion());
        document.getElementById('superficie-balcon').addEventListener('input', () => this.actualizarComposicion());
    }

    actualizarComposicion(valorM2Referencia = null) {
        // Actualizar valor de referencia si se proporciona
        if (valorM2Referencia !== null) {
            this.valorM2Referencia = valorM2Referencia;
        }

        // Obtener superficies del formulario
        const superficieCubierta = parseFloat(document.getElementById('superficie-cubierta').value) || 0;
        const superficieSemicubierta = parseFloat(document.getElementById('superficie-semicubierta').value) || 0;
        const superficieDescubierta = parseFloat(document.getElementById('superficie-descubierta').value) || 0;
        const superficieBalcon = parseFloat(document.getElementById('superficie-balcon').value) || 0;

        // Actualizar valores en la tabla
        document.getElementById('m2-cubierta').textContent = superficieCubierta.toFixed(2);
        document.getElementById('m2-semicubierta').textContent = superficieSemicubierta.toFixed(2);
        document.getElementById('m2-descubierta').textContent = superficieDescubierta.toFixed(2);
        document.getElementById('m2-balcon').textContent = superficieBalcon.toFixed(2);

        // Calcular valores parciales
        const valorCubierta = superficieCubierta * this.coeficientes.cubierta * this.valorM2Referencia;
        const valorSemicubierta = superficieSemicubierta * this.coeficientes.semicubierta * this.valorM2Referencia;
        const valorDescubierta = superficieDescubierta * this.coeficientes.descubierta * this.valorM2Referencia;
        const valorBalcon = superficieBalcon * this.coeficientes.balcon * this.valorM2Referencia;

        // Actualizar valores parciales en la tabla
        document.getElementById('valor-cubierta').textContent = `$${valorCubierta.toFixed(2)}`;
        document.getElementById('valor-semicubierta').textContent = `$${valorSemicubierta.toFixed(2)}`;
        document.getElementById('valor-descubierta').textContent = `$${valorDescubierta.toFixed(2)}`;
        document.getElementById('valor-balcon').textContent = `$${valorBalcon.toFixed(2)}`;

        // Calcular valor total
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon;
        document.getElementById('valor-total').textContent = valorTotal.toFixed(2);

        // Actualizar progreso
        if (window.progressManager && valorTotal > 0) {
            window.progressManager.markStepCompleted('composicion-valor');
        }

        return valorTotal;
    }

    reiniciar() {
        this.valorM2Referencia = 0;
        document.getElementById('valor-m2').textContent = '0.00';
        this.actualizarComposicion();
    }
}

// Inicializar el gestor de composición
window.composicionManager = new ComposicionManager();
