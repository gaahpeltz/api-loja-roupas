const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../db/clientes.json');

// =======================
// DB
// =======================
const readDB = () => {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeDB = (data) =>
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// =======================
// SWAGGER
// =======================
/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: API de Clientes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *         telefone:
 *           type: string
 *         email:
 *           type: string
 *         cpf_cnpj:
 *           type: string
 *         observacoes:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *
 *     ClienteCreate:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *       properties:
 *         nome:
 *           type: string
 *         telefone:
 *           type: string
 *         email:
 *           type: string
 *         cpf_cnpj:
 *           type: string
 *         observacoes:
 *           type: string
 */

// =======================
// GET ALL
// =======================
/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/', (req, res) => {
    res.json(readDB());
});

// =======================
// GET BY NOME
// =======================
/**
 * @swagger
 * /clientes/nome/{nome}:
 *   get:
 *     summary: Busca cliente por nome
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clientes encontrados
 */
router.get('/nome/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase();

    const resultado = readDB().filter(cliente =>
        cliente.nome.toLowerCase().includes(nome)
    );

    res.json(resultado);
});

// =======================
// GET BY ID
// =======================
/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Busca cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
    const cliente = readDB().find(c => c.id === req.params.id);

    if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);
});

// =======================
// CREATE
// =======================
/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Cria um cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteCreate'
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
    const clientes = readDB();
    const { nome, telefone, email, cpf_cnpj, observacoes } = req.body;

    if (!nome || !email) {
        return res.status(400).json({
            erro: 'Nome e email são obrigatórios'
        });
    }

    const existe = clientes.find(c => c.email === email);

    if (existe) {
        return res.status(400).json({
            erro: 'Email já cadastrado'
        });
    }

    const novo = {
        id: uuidv4(),
        nome,
        telefone: telefone || '',
        email,
        cpf_cnpj: cpf_cnpj || '',
        observacoes: observacoes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    clientes.push(novo);
    writeDB(clientes);

    res.status(201).json(novo);
});

// =======================
// UPDATE
// =======================
/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Atualiza cliente
 *     tags: [Clientes]
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
 *             $ref: '#/components/schemas/ClienteCreate'
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
    const clientes = readDB();
    const index = clientes.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const { nome, telefone, email, cpf_cnpj, observacoes } = req.body;

    if (email) {
        const existe = clientes.find(c => c.email === email && c.id !== req.params.id);

        if (existe) {
            return res.status(400).json({
                erro: 'Email já cadastrado'
            });
        }
    }

    clientes[index] = {
        ...clientes[index],
        nome: nome || clientes[index].nome,
        telefone: telefone || clientes[index].telefone,
        email: email || clientes[index].email,
        cpf_cnpj: cpf_cnpj || clientes[index].cpf_cnpj,
        observacoes: observacoes || clientes[index].observacoes,
        updated_at: new Date().toISOString()
    };

    writeDB(clientes);

    res.json(clientes[index]);
});

// =======================
// DELETE
// =======================
/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Remove cliente
 *     tags: [Clientes]
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
    const clientes = readDB();
    const index = clientes.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const removido = clientes.splice(index, 1);

    writeDB(clientes);

    res.json(removido[0]);
});

module.exports = router;