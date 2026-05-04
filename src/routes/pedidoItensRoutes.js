const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../db/pedido_itens.json');

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
 *   name: Pedido Itens
 *   description: Itens de um pedido MIGUEL ALEXANDRE
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         pedido_id:
 *           type: string
 *         tipo_roupa_id:
 *           type: string
 *         quantidade:
 *           type: number
 *         descricao:
 *           type: string
 *         status:
 *           type: string
 *         valor_total:
 *           type: number
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

// =======================
// GET ALL
// =======================
/**
 * @swagger
 * /pedido-itens:
 *   get:
 *     summary: Lista todos os itens de pedido
 *     tags: [Pedido Itens]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/', (req, res) => {
    res.json(readDB());
});

// =======================
// GET BY ID
// =======================
/**
 * @swagger
 * /pedido-itens/{id}:
 *   get:
 *     summary: Busca item por ID
 *     tags: [Pedido Itens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
    const item = readDB().find(x => x.id === req.params.id);

    if (!item) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    res.json(item);
});

// =======================
// CREATE
// =======================
/**
 * @swagger
 * /pedido-itens:
 *   post:
 *     summary: Cria um novo item de pedido
 *     tags: [Pedido Itens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pedido_id
 *               - tipo_roupa_id
 *               - quantidade
 *             properties:
 *               pedido_id:
 *                 type: string
 *                 example: "123"
 *               tipo_roupa_id:
 *                 type: string
 *                 example: "456"
 *               quantidade:
 *                 type: number
 *                 example: 2
 *               descricao:
 *                 type: string
 *                 example: "Camisas sociais"
 *               valor_total:
 *                 type: number
 *                 example: 30.50
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
    const itens = readDB();

    const {
        pedido_id,
        tipo_roupa_id,
        quantidade,
        descricao,
        valor_total
    } = req.body;

    if (!pedido_id || !tipo_roupa_id || !quantidade) {
        return res.status(400).json({
            erro: 'pedido_id, tipo_roupa_id e quantidade são obrigatórios'
        });
    }

    const novo = {
        id: uuidv4(),
        pedido_id,
        tipo_roupa_id,
        quantidade,
        descricao: descricao || '',
        status: 'novo',
        valor_total: valor_total || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    itens.push(novo);
    writeDB(itens);

    res.status(201).json(novo);
});

// =======================
// UPDATE
// =======================
/**
 * @swagger
 * /pedido-itens/{id}:
 *   put:
 *     summary: Atualiza um item de pedido
 *     tags: [Pedido Itens]
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
 *               pedido_id:
 *                 type: string
 *               tipo_roupa_id:
 *                 type: string
 *               quantidade:
 *                 type: number
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *               valor_total:
 *                 type: number
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
    const itens = readDB();
    const index = itens.findIndex(x => x.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    const {
        pedido_id,
        tipo_roupa_id,
        quantidade,
        descricao,
        status,
        valor_total
    } = req.body;

    itens[index] = {
        ...itens[index],
        pedido_id: pedido_id || itens[index].pedido_id,
        tipo_roupa_id: tipo_roupa_id || itens[index].tipo_roupa_id,
        quantidade: quantidade || itens[index].quantidade,
        descricao: descricao || itens[index].descricao,
        status: status || itens[index].status,
        valor_total: valor_total ?? itens[index].valor_total,
        updated_at: new Date().toISOString()
    };

    writeDB(itens);

    res.json(itens[index]);
});

// =======================
// DELETE
// =======================
/**
 * @swagger
 * /pedido-itens/{id}:
 *   delete:
 *     summary: Remove um item de pedido
 *     tags: [Pedido Itens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removido com sucesso
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', (req, res) => {
    const itens = readDB();
    const index = itens.findIndex(x => x.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    const deletado = itens.splice(index, 1);

    writeDB(itens);

    res.json(deletado[0]);
});

module.exports = router;