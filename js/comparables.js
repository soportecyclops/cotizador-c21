// Gestión de comparables
class ComparablesManager {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('btn-agregar-comparable')
            ?.addEventListener('click', () => this.openComparableModal());

        document.querySelector('.close-modal')
            ?.addEventListener('click', () => this.closeComparableModal());

        document.getElementById('btn-cancelar-comparable')
            ?.addEventListener('click', () => this.closeComparableModal());

        document.getElementById('btn-guardar-comparable')
            ?.addEventListener('click', () => this.saveComparable());
    }

    openComparableModal(comparableId = null) {
        const modal = document.getElementById('modal-comparable');
        const form = document.getElementById('form-comparable');
        const modalTitle = document.getElementById('modal-title');
        const comparableIdInput = document.getElementById('comparable-id');

        if (comparableId) {
            modalTitle.textContent = 'Editar Comparable';
            comparableIdInput.value = comparableId;

            const comparable = window.tasacionApp.comparables.find(c => c.id === comparableId);
            if (!comparable) {
                window.tasacionApp.showNotification(
                    'Error: No se pudo encontrar el comparable.',
                    'error'
                );
                return this.closeComparableModal();
            }

            document.getElementById('comp-tipo-propiedad').value = comparable.tipoPropiedad;
            document.getElementById('comp-precio').value = comparable.precio;
            document.getElementById('comp-direccion').value = comparable.direccion;
            document.getElementById('comp-numero').value = comparable.numero || '';
            document.getElementById('comp-piso').value = comparable.piso || '';
            document.getElementById('comp-depto').value = comparable.depto || '';
            document.getElementById('comp-localidad').value = comparable.localidad;
            document.getElementById('comp-barrio').value = comparable.barrio;
            document.getElementById('comp-antiguedad').value = comparable.antiguedad;
            document.getElementById('comp-calidad').value = comparable.calidad;
            document.getElementById('comp-sup-cubierta').value = comparable.supCubierta;
            document.getElementById('comp-sup-terreno').value = comparable.supTerreno || '';
            document.getElementById('comp-cochera').value = comparable.cochera;
            document.getElementById('comp-observaciones').value = comparable.observaciones || '';
        } else {
            form.reset();
            modalTitle.textContent = 'Agregar Comparable';
            comparableIdInput.value = '';
        }

        modal.style.display = 'block';
    }

    closeComparableModal() {
        document.getElementById('modal-comparable').style.display = 'none';
    }

    saveComparable() {
        const id = document.getElementById('comparable-id').value;
        const isEdit = id !== '';

        const requiredFields = [
            'comp-tipo-propiedad',
            'comp-precio',
            'comp-direccion',
            'comp-localidad',
            'comp-barrio',
            'comp-antiguedad',
            'comp-calidad',
            'comp-sup-cubierta'
        ];

        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                window.tasacionApp.showNotification(
                    `Complete el campo obligatorio: ${fieldId.replace('comp-', '')}`,
                    'error'
                );
                field?.focus();
                return;
            }
        }

        const comparable = {
            id: isEdit ? parseInt(id) : this.getNextId(),
            tipoPropiedad: document.getElementById('comp-tipo-propiedad').value,
            precio: parseFloat(document.getElementById('comp-precio').value),
            direccion: document.getElementById('comp-direccion').value,
            numero: document.getElementById('comp-numero').value,
            piso: document.getElementById('comp-piso').value,
            depto: document.getElementById('comp-depto').value,
            localidad: document.getElementById('comp-localidad').value,
            barrio: document.getElementById('comp-barrio').value,
            antiguedad: parseInt(document.getElementById('comp-antiguedad').value),
            calidad: document.getElementById('comp-calidad').value,
            supCubierta: parseFloat(document.getElementById('comp-sup-cubierta').value),
            supTerreno: parseFloat(document.getElementById('comp-sup-terreno').value) || 0,
            cochera: document.getElementById('comp-cochera').value,
            observaciones: document.getElementById('comp-observaciones').value
        };

        const precioAjustado =
            comparable.precio * (1 - window.tasacionApp.descuentoNegociacion / 100);

        comparable.valorM2 = precioAjustado / comparable.supCubierta;
        comparable.valorM2Ajustado = comparable.valorM2;

        if (isEdit) {
            const index = window.tasacionApp.comparables.findIndex(c => c.id === comparable.id);
            if (index !== -1) {
                const factores = window.tasacionApp.comparables[index].factores || {};
                comparable.factores = factores;

                const correccionTotal = Object.values(factores)
                    .reduce((s, v) => s + v, 0);

                comparable.valorM2Ajustado =
                    comparable.valorM2 * (1 + correccionTotal / 100);

                window.tasacionApp.comparables[index] = comparable;
            }
        } else {
            comparable.factores = {};
            window.tasacionApp.comparables.push(comparable);
        }

        this.updateComparablesUI();
        this.closeComparableModal();

        window.tasacionApp.showNotification(
            isEdit ? 'Comparable actualizado correctamente' : 'Comparable agregado correctamente',
            'success'
        );
    }

    getNextId() {
        if (!window.tasacionApp.comparables.length) return 1;
        return Math.max(...window.tasacionApp.comparables.map(c => c.id)) + 1;
    }

    deleteComparable(id) {
        if (!confirm('¿Eliminar este comparable?')) return;
        window.tasacionApp.comparables =
            window.tasacionApp.comparables.filter(c => c.id !== id);
        this.updateComparablesUI();
    }

    updateComparablesUI() {
        const container = document.getElementById('comparables-container');
        const empty = document.getElementById('no-comparables');
        const btnNext = document.getElementById('btn-siguiente-2');

        if (!window.tasacionApp.comparables.length) {
            container.style.display = 'none';
            empty.style.display = 'block';
            btnNext.disabled = true;
            return;
        }

        container.style.display = '';
        empty.style.display = 'none';
        btnNext.disabled = window.tasacionApp.comparables.length < 4;
        container.innerHTML = '';

        window.tasacionApp.comparables.forEach(c => {
            const card = document.createElement('div');
            card.className = 'comparable-card';

            const dir = `${c.direccion} ${c.numero || ''}${c.piso ? ` Piso ${c.piso}` : ''}${c.depto ? ` Depto ${c.depto}` : ''}`;

            card.innerHTML = `
                <div class="comparable-header">
                    <div class="comparable-id">${c.id}</div>
                    <div class="comparable-actions-card">
                        <button onclick="window.comparablesManager.openComparableModal(${c.id})">✏️</button>
                        <button onclick="window.comparablesManager.deleteComparable(${c.id})">🗑️</button>
                    </div>
                </div>
                <div class="comparable-info">
                    <p><strong>Tipo:</strong> ${c.tipoPropiedad}</p>
                    <p><strong>Dirección:</strong> ${dir}</p>
                    <p><strong>Barrio:</strong> ${c.barrio}</p>
                    <p><strong>Antigüedad:</strong> ${c.antiguedad} años</p>
                    <p><strong>Sup. Cubierta:</strong> ${c.supCubierta} m²</p>
                </div>
                <div class="comparable-values">
                    <div class="comparable-price">$${c.precio.toLocaleString()}</div>
                    <div class="comparable-price-m2">$${c.valorM2.toFixed(2)}/m²</div>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.comparablesManager = new ComparablesManager();
});
