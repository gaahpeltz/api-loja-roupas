const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, "../db/tipos_roupa.json")

// =======================
// DB
// =======================
const readDB = () => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]')
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
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
 *   name: Tipos de Roupa
 *   description: API de Cadastro de Tipos de Roupa
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoRoupa:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
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
 * /tipos-roupa:
 *   get:
 *     summary: Lista todos os tipos de roupa
 *     tags: [Tipos de Roupa]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/', (req, res) => {
    res.json(readDB())
})

// =======================
// GET BY NAME
// =======================
/**
 * @swagger
 * /tipos-roupa/nome/{nome}:
 *   get:
 *     summary: Busca tipos de roupa pelo nome
 *     tags: [Tipos de Roupa]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista filtrada
 */
router.get('/nome/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase()
    const tipos = readDB()

    const resultado = tipos.filter(t =>
        t.nome.toLowerCase().includes(nome)
    )

    res.json(resultado)
})

// =======================
// GET BY ID
// =======================
/**
 * @swagger
 * /tipos-roupa/{id}:
 *   get:
 *     summary: Busca um tipo de roupa pelo ID
 *     tags: [Tipos de Roupa]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tipo encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
    const tipo = readDB().find(t => t.id === req.params.id)

    if (!tipo) {
        return res.status(404).json({ erro: "Tipo de roupa não encontrado!" })
    }

    res.json(tipo)
})

// =======================
// CREATE
// =======================
/**
 * @swagger
 * /tipos-roupa:
 *   post:
 *     summary: Cadastra um novo tipo de roupa
 *     tags: [Tipos de Roupa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - descricao
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Camisa"
 *               descricao:
 *                 type: string
 *                 example: "Roupa superior"
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
    const tipos = readDB()
    const { nome, descricao } = req.body

    if (!nome || !descricao) {
        return res.status(400).json({
            erro: "Nome e descrição são obrigatórios!"
        })
    }

    const existe = tipos.find(
        t => t.nome.toLowerCase() === nome.toLowerCase()
    )

    if (existe) {
        return res.status(400).json({
            erro: "Tipo de roupa já existe"
        })
    }

    const novo = {
        id: uuidv4(),
        nome,
        descricao,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    tipos.push(novo)
    writeDB(tipos)

    res.status(201).json(novo)
})

// =======================
// UPDATE
// =======================
/**
 * @swagger
 * /tipos-roupa/{id}:
 *   put:
 *     summary: Atualiza um tipo de roupa
 *     tags: [Tipos de Roupa]
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
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
    const tipos = readDB()
    const index = tipos.findIndex(t => t.id === req.params.id)

    if (index === -1) {
        return res.status(404).json({
            erro: "Tipo de roupa não encontrado!"
        })
    }

    const { nome, descricao } = req.body

    tipos[index] = {
        ...tipos[index],
        nome: nome || tipos[index].nome,
        descricao: descricao || tipos[index].descricao,
        updated_at: new Date().toISOString()
    }

    writeDB(tipos)

    res.json(tipos[index])
})

// =======================
// DELETE
// =======================
/**
 * @swagger
 * /tipos-roupa/{id}:
 *   delete:
 *     summary: Remove um tipo de roupa
 *     tags: [Tipos de Roupa]
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
    const tipos = readDB()
    const index = tipos.findIndex(t => t.id === req.params.id)

    if (index === -1) {
        return res.status(404).json({
            erro: "Tipo de roupa não encontrado!"
        })
    }

    const removido = tipos.splice(index, 1)
    writeDB(tipos)

    res.json(removido[0])
})

module.exports = router
// Desenvolvido por: Danieli Zeferino Mota