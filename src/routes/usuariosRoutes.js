const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../db/usuarios.json');

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
 *   name: Usuarios
 *   description: Cadastro de usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         senha_hash:
 *           type: string
 *         perfil:
 *           type: string
 *         ativo:
 *           type: boolean
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
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuarios]
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
 * /usuarios/{id}:
 *   get:
 *     summary: Busca usuário por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
    const usuario = readDB().find(u => u.id === req.params.id);

    if (!usuario) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    res.json(usuario);
});

// =======================
// CREATE
// =======================
/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha_hash
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Gabriel"
 *               email:
 *                 type: string
 *                 example: "gabriel@email.com"
 *               senha_hash:
 *                 type: string
 *                 example: "123456"
 *               perfil:
 *                 type: string
 *                 example: "admin"
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
    const usuarios = readDB();

    const { nome, email, senha_hash, perfil, ativo } = req.body;

    if (!nome || !email || !senha_hash) {
        return res.status(400).json({
            erro: 'nome, email e senha_hash são obrigatórios'
        });
    }

    const existe = usuarios.find(u => u.email === email);

    if (existe) {
        return res.status(400).json({
            erro: 'Email já cadastrado'
        });
    }

    const novo = {
        id: uuidv4(),
        nome,
        email,
        senha_hash,
        perfil: perfil || 'user',
        ativo: ativo !== undefined ? ativo : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    usuarios.push(novo);
    writeDB(usuarios);

    res.status(201).json(novo);
});

// =======================
// UPDATE
// =======================
/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Usuarios]
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
 *               email:
 *                 type: string
 *               senha_hash:
 *                 type: string
 *               perfil:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
    const usuarios = readDB();
    const index = usuarios.findIndex(u => u.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    const { nome, email, senha_hash, perfil, ativo } = req.body;

    usuarios[index] = {
        ...usuarios[index],
        nome: nome || usuarios[index].nome,
        email: email || usuarios[index].email,
        senha_hash: senha_hash || usuarios[index].senha_hash,
        perfil: perfil || usuarios[index].perfil,
        ativo: ativo !== undefined ? ativo : usuarios[index].ativo,
        updated_at: new Date().toISOString()
    };

    writeDB(usuarios);

    res.json(usuarios[index]);
});

// =======================
// DELETE
// =======================
/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Usuarios]
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
    const usuarios = readDB();
    const index = usuarios.findIndex(u => u.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Não encontrado' });
    }

    const removido = usuarios.splice(index, 1);

    writeDB(usuarios);

    res.json(removido[0]);
});

module.exports = router;