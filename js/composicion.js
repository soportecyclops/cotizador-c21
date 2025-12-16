// Gestión de composición del valor
class ComposicionManager {
    constructor() {
        this.coeficientes = {
            cubierta: 1.0,
            semicubierta: 0.5,
            descubierta: 0.2,
            balcon: 0.33
        };
        this.init();
    }

    init() {
        // Este componente se inicializa principalmente desde la aplicación principal
        // cuando se calcula la composición del valor
    }

    calculateValorTotal() {
        const inmueble = window.tasacionApp.inmuebleData;
        const valorM2Referencia = window.tasacionApp.valorM2Referencia;
        
        if (!inmueble || !valorM2Referencia) return 0;
        
        // Calcular valores parciales
        const valorCubierta = inmueble.supCubierta * this.coeficientes.cubierta * valorM2Referencia;
        const valorSemicubierta = inmueble.supSemicubierta * this.coeficientes.semicubierta * valorM2Referencia;
        const valorDescubierta = inmueble.supDescubierta * this.coeficientes.descubierta * valorM2Referencia;
        const valorBalcon = inmueble.supBalcon * this.coeficientes.balcon * valorM2Referencia;
        
        // Valor estimado para cochera
        const valorCochera = inmueble.cochera === 'propia' ? 5000 : 
                             inmueble.cochera === 'comun' ? 2000 : 0;
        
        // Calcular valor total
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + valorCochera;
        
        return valorTotal;
    }

    generateCompositionChart() {
        // Esta función podría generar un gráfico de composición del valor
        // usando una librería como Chart.js si se desea agregar en el futuro
    }

    // CAMBIO: Añadido el método reset() por consistencia.
    /**
     * Resetea el estado del gestor de composición.
     * Actualmente no mantiene estado, pero el método se añade para consistencia.
     */
    reset() {
        // No hay estado interno que limpiar, pero el método es necesario para el flujo de reset general.
        // Si en el futuro se almacenan datos o gráficos, se limpiarían aquí.
    }
}

// Inicializar el gestor de composición
document.addEventListener('DOMContentLoaded', () => {
    window.composicionManager = new ComposicionManager();
});
