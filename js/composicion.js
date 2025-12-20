/**
 * Gestor de Composición del Valor para Cotizador Inmobiliario Century 21
 * Versión: 2.0
 * Descripción: Módulo para gestionar la composición del valor de la tasación
 */

// Objeto global para el gestor de composición
window.CompositionManager = {
    // Coeficientes de superficie
    surfaceCoefficients: {
        cubierta: 1.0,
        semicubierta: 0.5,
        descubierta: 0.2,
        balcon: 0.33
    },
    
    // Inicialización del gestor
    init: function() {
        console.log('Inicializando CompositionManager...');
        this.setupEventListeners();
        console.log('CompositionManager inicializado correctamente');
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // No se necesitan listeners específicos para este módulo
        // Los cálculos se realizan cuando se navega al paso 5
    },
    
    // Calcular composición del valor
    calculateComposition: function() {
        if (!window.CotizadorApp) {
            console.error('CotizadorApp no disponible');
            return;
        }
        
        const propertyData = window.CotizadorApp.propertyData;
        const valorM2 = window.CotizadorApp.compositionData.valorM2;
        
        // Calcular valores parciales
        const valorCubierta = propertyData.supCubierta * valorM2;
        const valorSemicubierta = propertyData.supSemicubierta * valorM2 * this.surfaceCoefficients.semicubierta;
        const valorDescubierta = propertyData.supDescubierta * valorM2 * this.surfaceCoefficients.descubierta;
        const valorBalcon = propertyData.supBalcon * valorM2 * this.surfaceCoefficients.balcon;
        
        // Valor de cochera (valor fijo)
        const valorCochera = propertyData.cochera !== 'no' ? 15000 : 0;
        
        // Calcular total
        const valorTotal = valorCubierta + valorSemicubierta + valorDescubierta + valorBalcon + valorCochera;
        
        // Actualizar UI
        this.updateCompositionUI({
            valorCubierta,
            valorSemicubierta,
            valorDescubierta,
            valorBalcon,
            valorCochera,
            valorTotal,
            valorM2
        });
        
        // Guardar en datos de composición
        window.CotizadorApp.compositionData.valorTotal = valorTotal;
        
        return valorTotal;
    },
    
    // Actualizar UI de composición
    updateCompositionUI: function(data) {
        if (!window.CotizadorApp) {
            console.error('CotizadorApp no disponible');
            return;
        }
        
        const propertyData = window.CotizadorApp.propertyData;
        
        // Actualizar superficies
        document.getElementById('comp-sup-cubierta').textContent = propertyData.supCubierta.toFixed(2);
        document.getElementById('comp-sup-semicubierta').textContent = propertyData.supSemicubierta.toFixed(2);
        document.getElementById('comp-sup-descubierta').textContent = propertyData.supDescubierta.toFixed(2);
        document.getElementById('comp-sup-balcon').textContent = propertyData.supBalcon.toFixed(2);
        document.getElementById('comp-sup-cochera').textContent = propertyData.cochera !== 'no' ? 'Sí' : 'No';
        
        // Actualizar valores por m2
        document.getElementById('comp-valor-m2').textContent = `USD ${data.valorM2.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-semi').textContent = `USD ${(data.valorM2 * this.surfaceCoefficients.semicubierta).toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-desc').textContent = `USD ${(data.valorM2 * this.surfaceCoefficients.descubierta).toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-balc').textContent = `USD ${(data.valorM2 * this.surfaceCoefficients.balcon).toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-m2-cochera').textContent = `USD ${data.valorCochera.toFixed(2).replace('.', ',')}`;
        
        // Actualizar valores parciales
        document.getElementById('comp-valor-cubierta').textContent = `USD ${data.valorCubierta.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-semicubierta').textContent = `USD ${data.valorSemicubierta.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-descubierta').textContent = `USD ${data.valorDescubierta.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-balcon').textContent = `USD ${data.valorBalcon.toFixed(2).replace('.', ',')}`;
        document.getElementById('comp-valor-cochera').textContent = `USD ${data.valorCochera.toFixed(2).replace('.', ',')}`;
        
        // Actualizar valor total
        const totalElement = document.getElementById('valor-total-tasacion');
        totalElement.textContent = `USD ${data.valorTotal.toFixed(2).replace('.', ',')}`;
        totalElement.setAttribute('data-raw-value', data.valorTotal.toString());
    },
    
    // Generar informe de composición
    generateCompositionReport: function() {
        if (!window.CotizadorApp) {
            console.error('CotizadorApp no disponible');
            return null;
        }
        
        const propertyData = window.CotizadorApp.propertyData;
        const compositionData = window.CotizadorApp.compositionData;
        
        return {
            propiedad: {
                tipo: propertyData.tipoPropiedad,
                direccion: propertyData.direccion,
                localidad: propertyData.localidad,
                barrio: propertyData.barrio
            },
            superficies: {
                cubierta: propertyData.supCubierta,
                semicubierta: propertyData.supSemicubierta,
                descubierta: propertyData.supDescubierta,
                balcon: propertyData.supBalcon
            },
            coeficientes: this.surfaceCoefficients,
            valorM2: compositionData.valorM2,
            valorTotal: compositionData.valorTotal,
            desglose: {
                valorCubierta: propertyData.supCubierta * compositionData.valorM2,
                valorSemicubierta: propertyData.supSemicubierta * compositionData.valorM2 * this.surfaceCoefficients.semicubierta,
                valorDescubierta: propertyData.supDescubierta * compositionData.valorM2 * this.surfaceCoefficients.descubierta,
                valorBalcon: propertyData.supBalcon * compositionData.valorM2 * this.surfaceCoefficients.balcon,
                valorCochera: propertyData.cochera !== 'no' ? 15000 : 0
            }
        };
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se inicialice CotizadorApp
    setTimeout(() => {
        if (window.CompositionManager) {
            window.CompositionManager.init();
        }
    }, 500);
});
