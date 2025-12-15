// Gestor de validaciones
class ValidationManager {
    constructor() {
        this.init();
    }

    init() {
        // Validar formulario de inmueble al enviar
        document.getElementById('formulario-inmueble').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validarFormularioInmueble()) {
                // El formulario es válido
                console.log('Formulario de inmueble válido');
                
                // Actualizar progreso
                if (window.progressManager) {
                    window.progressManager.markStepCompleted('datos-duros');
                }
            }
        });
        
        // Evento para cerrar contenedor de errores
        document.getElementById('btn-cerrar-errores').addEventListener('click', () => {
            document.getElementById('error-container').style.display = 'none';
        });
    }

    validarFormularioInmueble() {
        let isValid = true;
        const errors = [];

        // Validar dirección
        const direccion = document.getElementById('direccion').value.trim();
        if (!direccion) {
            errors.push('La dirección es obligatoria');
            isValid = false;
        }

        // Validar superficies
        const superficieCubierta = parseFloat(document.getElementById('superficie-cubierta').value);
        if (!superficieCubierta || superficieCubierta <= 0) {
            errors.push('La superficie cubierta debe ser mayor a cero');
            isValid = false;
        }

        const superficieSemicubierta = parseFloat(document.getElementById('superficie-semicubierta').value) || 0;
        const superficieDescubierta = parseFloat(document.getElementById('superficie-descubierta').value) || 0;
        const superficieBalcon = parseFloat(document.getElementById('superficie-balcon').value) || 0;

        if (superficieSemicubierta < 0 || superficieDescubierta < 0 || superficieBalcon < 0) {
            errors.push('Las superficies no pueden ser negativas');
            isValid = false;
        }

        // Validar antigüedad
        const antiguedad = parseInt(document.getElementById('antiguedad').value);
        if (!antiguedad || antiguedad < 0) {
            errors.push('La antigüedad debe ser un número mayor o igual a cero');
            isValid = false;
        }

        // Validar ubicación
        const ubicacion = document.getElementById('ubicacion').value.trim();
        if (!ubicacion) {
            errors.push('La ubicación es obligatoria');
            isValid = false;
        }

        // Mostrar errores si los hay
        if (!isValid) {
            this.mostrarErrores(errors);
        }

        return isValid;
    }

    validarComparables() {
        let isValid = true;
        const errors = [];

        if (window.comparablesManager.comparables.length === 0) {
            errors.push('Debe agregar al menos un comparable');
            isValid = false;
        }

        // Validar que todos los comparables tengan ajustes aplicados
        const sinAjustes = window.comparablesManager.comparables.filter(c => 
            !c.ajustes || Object.keys(c.ajustes).length === 0
        );

        if (sinAjustes.length > 0) {
            errors.push(`Hay ${sinAjustes.length} comparable(s) sin ajustes aplicados`);
            isValid = false;
        }

        // Mostrar errores si los hay
        if (!isValid) {
            this.mostrarErrores(errors);
        }

        return isValid;
    }

    mostrarErrores(errors) {
        const errorContainer = document.getElementById('error-container');
        const errorList = document.getElementById('error-list');
        
        // Limpiar errores anteriores
        errorList.innerHTML = '';
        
        // Agregar errores
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        // Mostrar contenedor
        errorContainer.style.display = 'block';
    }
}

// Gestor de progreso
class ProgressManager {
    constructor() {
        this.steps = [
            { id: 'datos-duros', name: 'Datos del Inmueble' },
            { id: 'comparables', name: 'Comparables' },
            { id: 'factores-ajuste', name: 'Factores de Ajuste' },
            { id: 'precio-corregido', name: 'Precio Corregido' },
            { id: 'valor-m2-referencia', name: 'Valor por m²' },
            { id: 'composicion-valor', name: 'Composición del Valor' }
        ];
        this.currentStep = 0;
        this.init();
    }

    init() {
        // Crear indicador de progreso
        this.createProgressIndicator();
        
        // Actualizar progreso al hacer scroll
        window.addEventListener('scroll', () => this.updateProgressOnScroll());
        
        // Actualizar progreso al hacer clic en los pasos
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.addEventListener('click', () => {
                const targetId = this.steps[index].id;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    createProgressIndicator() {
        const progressContainer = document.querySelector('.progress-indicator');
        progressContainer.innerHTML = '';
        
        this.steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'progress-step';
            stepElement.dataset.step = index;
            
            const stepNumber = document.createElement('div');
            stepNumber.className = 'step-number';
            stepNumber.textContent = index + 1;
            
            const stepLabel = document.createElement('div');
            stepLabel.className = 'step-label';
            stepLabel.textContent = step.name;
            
            stepElement.appendChild(stepNumber);
            stepElement.appendChild(stepLabel);
            progressContainer.appendChild(stepElement);
        });
    }

    updateProgressOnScroll() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        for (let i = this.steps.length - 1; i >= 0; i--) {
            const stepElement = document.getElementById(this.steps[i].id);
            if (stepElement && stepElement.offsetTop <= scrollPosition) {
                this.setActiveStep(i);
                break;
            }
        }
    }

    setActiveStep(stepIndex) {
        if (stepIndex === this.currentStep) return;
        
        // Actualizar clases CSS
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active');
            
            if (index < stepIndex) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
            
            if (index === stepIndex) {
                step.classList.add('active');
            }
        });
        
        this.currentStep = stepIndex;
    }

    markStepCompleted(stepId) {
        const stepIndex = this.steps.findIndex(step => step.id === stepId);
        if (stepIndex !== -1) {
            const stepElement = document.querySelector(`.progress-step[data-step="${stepIndex}"]`);
            if (stepElement) {
                stepElement.classList.add('completed');
            }
        }
    }
}

// Funciones principales del cotizador
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar gestores
    window.validationManager = new ValidationManager();
    window.progressManager = new ProgressManager();
    
    // Evento para calcular todo el proceso
    document.getElementById('btn-calcular-todo').addEventListener('click', () => {
        // Validar formulario de inmueble
        if (!window.validationManager.validarFormularioInmueble()) {
            return;
        }

        // Validar comparables
        if (!window.validationManager.validarComparables()) {
            return;
        }

        // Aplicar ajustes si no se han aplicado
        if (window.comparablesManager.comparables.some(c => !c.ajustes || Object.keys(c.ajustes).length === 0)) {
            if (confirm('Algunos comparables no tienen ajustes aplicados. ¿Desea continuar de todas formas?')) {
                // Actualizar tabla de precios corregidos
                window.comparablesManager.actualizarTablaPreciosCorregidos();
                // Actualizar valor de referencia
                window.comparablesManager.actualizarValorReferencia();
            } else {
                return;
            }
        }

        // Mostrar mensaje de éxito
        window.comparablesManager.mostrarMensaje('Tasación calculada con éxito. Revise el resultado en la sección "Composición del Valor del Inmueble".', 'success');
        
        // Desplazarse a la sección de composición del valor
        document.getElementById('composicion-valor').scrollIntoView({ behavior: 'smooth' });
    });

    // Evento para reiniciar el cálculo
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea reiniciar todo el cálculo?')) {
            // Reiniciar formulario de inmueble
            document.getElementById('formulario-inmueble').reset();
            
            // Reiniciar comparables
            window.comparablesManager.reiniciar();
            
            // Reiniciar composición
            window.composicionManager.reiniciar();
            
            // Reiniciar progreso
            document.querySelectorAll('.progress-step').forEach(step => {
                step.classList.remove('completed', 'active');
            });
            
            // Mostrar mensaje de éxito
            window.comparablesManager.mostrarMensaje('Cálculo reiniciado correctamente', 'info');
        }
    });
});
