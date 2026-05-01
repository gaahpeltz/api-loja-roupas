const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../db/pedido_item_servicos.json')

// =======================
// DB
// =======================
const readDB = () => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]')
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const writeDB = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// =======================
// SWAGGER
// =======================
/**
 * @swagger
 * tags:
 *   name: Pedido Item Serviços
 *   description: Relação entre itens do pedido e serviços
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoItemServico:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         pedido_item_id:
 *           type: string
 *         servico_id:
 *           type: string
 *         preco_unitario:
 *           type: number
 *         quantidade:
 *           type: number
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
 * /pedido-item-servicos:
 *   get:
 *     summary: Lista todas as relações
 *     tags: [Pedido Item Serviços]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/', (req, res) => {
    res.json(readDB())
})

// =======================
// GET BY ID
// =======================
/**
 * @swagger
 * /pedido-item-servicos/{id}:
 *   get:
 *     summary: Busca relação por ID
 *     tags: [Pedido Item Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relação encontrada
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
    const item = readDB().find(x => x.id === req.params.id)

    if (!item) {
        return res.status(404).json({ erro: 'Não encontrado' })
    }

    res.json(item)
})

// =======================
// CREATE
// =======================
/**
 * @swagger
 * /pedido-item-servicos:
 *   post:
 *     summary: Cria uma nova relação
 *     tags: [Pedido Item Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pedido_item_id
 *               - servico_id
 *               - preco_unitario
 *               - quantidade
 *             properties:
 *               pedido_item_id:
 *                 type: string
 *                 example: "123"
 *               servico_id:
 *                 type: string
 *                 example: "456"
 *               preco_unitario:
 *                 type: number
 *                 example: 10
 *               quantidade:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
    const relacoes = readDB()

    const {
        pedido_item_id,
        servico_id,
        preco_unitario,
        quantidade
    } = req.body

    if (!pedido_item_id || !servico_id || !preco_unitario || !quantidade) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios'
        })
    }

    const valor_total = preco_unitario * quantidade

    const novo = {
        id: uuidv4(),
        pedido_item_id,
        servico_id,
        preco_unitario,
        quantidade,
        valor_total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    relacoes.push(novo)
    writeDB(relacoes)

    res.status(201).json(novo)
})

// =======================
// UPDATE
// =======================
/**
 * @swagger
 * /pedido-item-servicos/{id}:
 *   put:
 *     summary: Atualiza uma relação
 *     tags: [Pedido Item Serviços]
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
 *               pedido_item_id:
 *                 type: string
 *               servico_id:
 *                 type: string
 *               preco_unitario:
 *                 type: number
 *               quantidade:
 *                 type: number
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
    const relacoes = readDB()
    const index = relacoes.findIndex(x => x.id === req.params.id)

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' })
    }

    const {
        pedido_item_id,
        servico_id,
        preco_unitario,
        quantidade
    } = req.body

    const valor_total =
        (preco_unitario ?? relacoes[index].preco_unitario) *
        (quantidade ?? relacoes[index].quantidade)

    relacoes[index] = {
        ...relacoes[index],
        pedido_item_id: pedido_item_id || relacoes[index].pedido_item_id,
        servico_id: servico_id || relacoes[index].servico_id,
        preco_unitario: preco_unitario ?? relacoes[index].preco_unitario,
        quantidade: quantidade ?? relacoes[index].quantidade,
        valor_total,
        updated_at: new Date().toISOString()
    }

    writeDB(relacoes)

    res.json(relacoes[index])
})

// =======================
// DELETE
// =======================
/**
 * @swagger
 * /pedido-item-servicos/{id}:
 *   delete:
 *     summary: Remove uma relação
 *     tags: [Pedido Item Serviços]
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
    const relacoes = readDB()
    const index = relacoes.findIndex(x => x.id === req.params.id)

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' })
    }

    const deletado = relacoes.splice(index, 1)

    writeDB(relacoes)

    res.json(deletado[0])
})

module.exports = router