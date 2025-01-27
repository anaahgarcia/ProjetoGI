const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const clientRoutes = require('./src/routes/contactroute/ClientRoute');
const contactRoutes = require('./src/routes/contactroute/ContactRoute');
const leadRoutes = require('./src/routes/contactroute/LeadRoute');
const visitRoutes = require('./src/routes/visitroute/VisitRoute');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MongoDB
const DB_USER = process.env.DB_USER
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD)

mongoose.connect(
    `mongodb+srv://grupoinvictus:grupoinvictus@cluster0.xm9tj.mongodb.net/`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)
.then(() => {
    console.log('MongoDB Atlas Conectado com Sucesso!');
})
.catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
});

// Rotas
app.use('/api/clients', clientRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/visits', visitRoutes);

// Rota padrão
app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API do GrupoInvictus' });
});

// Tratamento de rotas não encontradas
app.use((req, res, next) => {
    const error = new Error('Não encontrado');
    error.status = 404;
    next(error);
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Porta do servidor
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.log('Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
    console.log('Exceção não capturada:', error);
    process.exit(1);
});

module.exports = app;