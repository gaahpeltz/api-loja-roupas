const mongoose = require('mongoose');

async function conectarBanco() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/api_lavanderia');

        console.log('✅ MongoDB conectado com sucesso');

    } catch (error) {

        console.error('❌ Erro ao conectar MongoDB:', error.message);

    }
}

module.exports = conectarBanco;