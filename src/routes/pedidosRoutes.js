const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../db/pedidos.json');

// =======================
// DB
// =======================
const readDB = () => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeDB = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// =======================
// SWAGGER
// =======================
/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestão de pedidos
 */

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Pedidos]
 */
router.get('/', (req, res) => {
    res.json(readDB());
});

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: Busca pedido por ID
 *     tags: [Pedidos]
 */
router.get('/:id', (req, res) => {
    const pedido = readDB().find(p => p.id === req.params.id);

    if (!pedido) {
        return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json(pedido);
});

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 */
router.post('/', (req, res) => {
    const pedidos = readDB();

    const { cliente_id, usuario_id, data_prevista, observacoes } = req.body;

    if (!cliente_id) {
        return res.status(400).json({
            erro: 'cliente_id é obrigatório'
        });
    }

    // valida data
    if (data_prevista && isNaN(Date.parse(data_prevista))) {
        return res.status(400).json({
            erro: 'data_prevista inválida'
        });
    }

    const novo = {
        id: uuidv4(),
        cliente_id,
        usuario_id: usuario_id || null,
        status: 'novo',
        data_entrada: new Date().toISOString(),
        data_prevista: data_prevista || null,
        data_saida: null,
        valor_total: 0,
        observacoes: observacoes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    pedidos.push(novo);
    writeDB(pedidos);

    res.status(201).json(novo);
});

/**
 * @swagger
 * /pedidos/{id}:
 *   put:
 *     summary: Atualiza um pedido
 *     tags: [Pedidos]
 */
router.put('/:id', (req, res) => {
    const pedidos = readDB();
    const index = pedidos.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const {
        cliente_id,
        usuario_id,
        status,
        data_prevista,
        data_saida,
        observacoes
    } = req.body;

    const statusValidos = ['novo', 'em andamento', 'finalizado'];

    if (status && !statusValidos.includes(status)) {
        return res.status(400).json({
            erro: 'Status inválido'
        });
    }

    if (data_prevista && isNaN(Date.parse(data_prevista))) {
        return res.status(400).json({
            erro: 'data_prevista inválida'
        });
    }

    pedidos[index] = {
        ...pedidos[index],
        cliente_id: cliente_id || pedidos[index].cliente_id,
        usuario_id: usuario_id ?? pedidos[index].usuario_id,
        status: status || pedidos[index].status,
        data_prevista: data_prevista ?? pedidos[index].data_prevista,
        data_saida: data_saida ?? pedidos[index].data_saida,
        observacoes: observacoes || pedidos[index].observacoes,
        updated_at: new Date().toISOString()
    };

    writeDB(pedidos);

    res.json(pedidos[index]);
});

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     summary: Remove um pedido
 *     tags: [Pedidos]
 */
router.delete('/:id', (req, res) => {
    const pedidos = readDB();
    const index = pedidos.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const removido = pedidos.splice(index, 1);
    writeDB(pedidos);

    res.json(removido[0]);
});

module.exports = router;