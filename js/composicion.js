// Gestión de composición del valor
class ComposicionManager {
    constructor() {
        // Los coeficientes son constantes y representan el peso de cada tipo de superficie
        // en el valor final de la tasación.
        this.coeficientes = {
            cubierta: 1.0,      // 100% del valor por m²
            semicubierta: 0.5,  // 50% del valor por m²
            descubierta: 0.2,  // 20% del valor por m²
            balcon: 0.33        // 33% del valor por m²
        };
        this.init();
    }

    init() {
        // Este componente se inicializa principalmente desde la aplicación principal
        // cuando se calcula la composición del valor en el paso 5.
        // No requiere una inicialización compleja por sí mismo.
    }

    /**
     * Calcula el valor total de la tasación basándose en los datos del inmueble
     * y el valor de referencia por m².
     * @returns {number} El valor total calculado.
     */
    calculateValorTotal() {
        const inmuebleData = window.tasacionApp.inmuebleData;
        const valorM2Referencia = window.tasacionApp.valorM2Referencia;

        // Validar que los datos necesarios existan antes de calcular
        if (!inmuebleData || !valorM2Referencia) {
            console.error("Datos del inmueble o valor de referencia no disponibles para el cálculo.");
            return 0;
        }

        let valorTotal = 0;

        // Calcular el valor para cada tipo de superficie y sumarlo
        if (inmuebleData.supCubierta) {
            valorTotal += inmuebleData.supCubierta * this.coeficientes.cubierta * valorM2Referencia;
        }
        if (inmuebleData.supSemicubierta) {
            valorTotal += inmuebleData.supSemicubierta * this.coeficientes.semicubierta * valorM2Referencia;
        }
        if (inmuebleData.supDescubierta) {
            valorTotal += inmuebleData.supDescubierta * this.coeficientes.descubierta * valorM2Referencia;
        }
        if (inmuebleData.supBalcon) {
            valorTotal += inmuebleData.supBalcon * this.coeficientes.balcon * valorM2Referencia;
        }

        // Valor estimado para cochera (puede ser un valor fijo o un porcentaje del total)
        let valorCochera = 0;
        if (inmuebleData.cochera === 'propia') {
            valorCochera = 5000; // Valor fijo para cochera propia
        } else if (inmuebleData.cochera === 'comun') {
            valorCochera = 2000; // Valor fijo para cochera común
        }
        valorTotal += valorCochera;

        return valorTotal;
    }

    /**
     * Genera un gráfico de composición del valor (placeholder).
     * En una versión futura, se podría usar una librería como Chart.js
     * para visualizar los datos de forma más atractiva.
     */
    generateCompositionChart() {
        // Placeholder para una futura implementación de gráficos.
        console.log("Generando gráfico de composición del valor...");
    }

    /**
     * Resetea el estado del gestor de composición.
     * Actualmente no mantiene estado interno, pero el método se añade
     * por consistencia con el patrón de otros managers.
     */
    reset() {
        // No hay estado interno que limpiar, pero el método es necesario para el flujo de reset general.
        console.log("ComposicionManager reseteado.");
    }
}

// Inicializar el gestor de composición
document.addEventListener('DOMContentLoaded', () => {
    window.composicionManager = new ComposicionManager();
});
