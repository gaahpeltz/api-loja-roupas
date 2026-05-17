const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const conectarBanco = require('./config/database');

const app = express();

// =======================
// MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());

// =======================
// CONEXÃO COM MONGODB
// =======================
conectarBanco();

// =======================
// SWAGGER
// =======================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Lavanderia',
            version: '1.0.0',
            description: 'Documentação da API equipe: Gabriel Alexandre Peltz, Pedro de Luca, Danieli Zererino Mota, Nicolas Darabas, Miguel Alexandre'
        },
        servers: [
            {
                url: 'http://localhost:3000/api'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =======================
// ROTA RAIZ
// =======================
app.get('/', (req, res) => {
    res.json({
        status: 'API rodando 🚀',
        banco: 'MongoDB conectado com Mongoose',
        docs: 'http://localhost:3000/api-docs'
    });
});

// =======================
// ROTAS
// =======================
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/pedidos', require('./routes/pedidosRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/servicos', require('./routes/servicosRoutes'));
app.use('/api/tipos-roupa', require('./routes/tiposRoupaRoutes'));
app.use('/api/pedido-itens', require('./routes/pedidoItensRoutes'));
app.use('/api/pedido-item-servicos', require('./routes/pedidoItemServicosRoutes'));

// =======================
// 404
// =======================
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada'
    });
});

// =======================
// ERRO GLOBAL
// =======================
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        erro: 'Erro interno do servidor'
    });
});

// =======================
// START SERVER
// =======================
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📖 Swagger em http://localhost:${PORT}/api-docs`);
});