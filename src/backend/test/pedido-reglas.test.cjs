const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizarItems, puedeTransicionar } = require('../dist/api/domain/pedido-reglas.js');

describe('reglas puras de pedidos', () => {
  it('combina productos repetidos y ordena por identificador', () => {
    assert.deepEqual(normalizarItems([
      { productoId: 8, cantidad: 1 },
      { productoId: 3, cantidad: 2 },
      { productoId: 8, cantidad: 4 },
    ]), [
      { productoId: 3, cantidad: 2 },
      { productoId: 8, cantidad: 5 },
    ]);
  });

  it('rechaza cantidades cero e identificadores inválidos', () => {
    assert.throws(() => normalizarItems([{ productoId: 1, cantidad: 0 }]), /no son válidos/);
    assert.throws(() => normalizarItems([{ productoId: -2, cantidad: 1 }]), /no son válidos/);
  });

  it('permite solo transiciones válidas y bloquea estados terminales', () => {
    assert.equal(puedeTransicionar('PENDIENTE', 'CONFIRMADO'), true);
    assert.equal(puedeTransicionar('CONFIRMADO', 'CANCELADO'), true);
    assert.equal(puedeTransicionar('PENDIENTE', 'ENTREGADO'), false);
    assert.equal(puedeTransicionar('ENTREGADO', 'CANCELADO'), false);
  });
});
