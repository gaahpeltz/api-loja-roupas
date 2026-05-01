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
 *     responses:
 *       200:
 *         description: Lista retornada
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
    const pedido = readDB().find(p => p.id === req.params.id);

    if (!pedido) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    res.json(pedido);
});

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 example: "123"
 *               usuario_id:
 *                 type: string
 *                 example: "456"
 *               data_prevista:
 *                 type: string
 *                 example: "2026-05-01"
 *               observacoes:
 *                 type: string
 *                 example: "Pedido urgente"
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 */
router.post('/', (req, res) => {
    const pedidos = readDB();

    const { cliente_id, usuario_id, data_prevista, observacoes } = req.body;

    if (!cliente_id) {
        return res.status(400).json({ erro: 'cliente_id é obrigatório' });
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: string
 *               usuario_id:
 *                 type: string
 *               status:
 *                 type: string
 *               data_prevista:
 *                 type: string
 *               data_saida:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualizado
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
    const pedidos = readDB();
    const index = pedidos.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    pedidos[index] = {
        ...pedidos[index],
        ...req.body,
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removido
 */
router.delete('/:id', (req, res) => {
    const pedidos = readDB();
    const filtrado = pedidos.filter(p => p.id !== req.params.id);

    writeDB(filtrado);

    res.json({ mensagem: 'Removido com sucesso' });
});

module.exports = router;