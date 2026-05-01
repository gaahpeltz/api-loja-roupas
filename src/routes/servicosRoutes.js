const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, "../db/servicos.json");

// =======================
// DB
// =======================
const readDB = () => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
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
 *   name: Serviços
 *   description: Gestão de serviços
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Servico:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *         preco:
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
 * /servicos:
 *   get:
 *     summary: Lista todos os serviços
 *     tags: [Serviços]
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
 * /servicos/{id}:
 *   get:
 *     summary: Busca serviço por ID
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Serviço encontrado
 *       404:
 *         description: Serviço não encontrado
 */
router.get('/:id', (req, res) => {
    const servico = readDB().find(s => s.id === req.params.id);

    if (!servico) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
    }

    res.json(servico);
});

// =======================
// CREATE
// =======================
/**
 * @swagger
 * /servicos:
 *   post:
 *     summary: Cria um novo serviço
 *     tags: [Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Lavagem"
 *               preco:
 *                 type: number
 *                 example: 15.90
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
    const servicos = readDB();

    const { nome, preco } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "nome é obrigatório" });
    }

    const novo = {
        id: uuidv4(),
        nome,
        preco: preco || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    servicos.push(novo);
    writeDB(servicos);

    res.status(201).json(novo);
});

// =======================
// UPDATE
// =======================
/**
 * @swagger
 * /servicos/{id}:
 *   put:
 *     summary: Atualiza um serviço
 *     tags: [Serviços]
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
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Serviço não encontrado
 */
router.put('/:id', (req, res) => {
    const servicos = readDB();
    const index = servicos.findIndex(s => s.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
    }

    const { nome, preco } = req.body;

    servicos[index] = {
        ...servicos[index],
        nome: nome || servicos[index].nome,
        preco: preco ?? servicos[index].preco,
        updated_at: new Date().toISOString()
    };

    writeDB(servicos);

    res.json(servicos[index]);
});

// =======================
// DELETE
// =======================
/**
 * @swagger
 * /servicos/{id}:
 *   delete:
 *     summary: Remove um serviço
 *     tags: [Serviços]
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
 *         description: Serviço não encontrado
 */
router.delete('/:id', (req, res) => {
    const servicos = readDB();
    const index = servicos.findIndex(s => s.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
    }

    const removido = servicos.splice(index, 1);

    writeDB(servicos);

    res.json(removido[0]);
});

module.exports = router;