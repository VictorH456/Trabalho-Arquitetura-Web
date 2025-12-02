require('dotenv').config(); // [Tarefa 3B] Carrega variáveis do arquivo .env
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const helmet = require('helmet'); // [Tarefa 3A] Proteção de Headers
const csrf = require('csurf'); // [Tarefa 4] Proteção CSRF
const rateLimit = require('express-rate-limit'); // [Tarefa 2] Força Bruta

const userController = require('./controllers/userController');
const isAuth = require('./middleware/auth');
const authController = require('./controllers/authController');

const app = express();

// [Tarefa 3A] Helmet: Proteção de Headers HTTP (Deve ser o primeiro middleware)
app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

// Configuração de Sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo-padrao-dev', // [Tarefa 3B] Segredo via .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Em produção (HTTPS), altere para true
}));

// [Tarefa 4] Configuração do CSRF (Deve vir DEPOIS da sessão)
const csrfProtection = csrf();
app.use(csrfProtection);

// Middleware para passar o token CSRF para todas as views automaticamente
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// [Tarefa 2] Rate Limiting: Proteção contra Força Bruta no Login
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // Máximo de 5 tentativas por IP
    message: "Muitas tentativas de login. Tente novamente em 1 minuto."
});

// [Tarefa 3B] Conexão com Banco usando Variável de Ambiente
mongoose.connect(process.env.DB_CONNECTION_STRING)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar no Mongo:', err));

// --- ROTAS ---

// Rota de Login (GET)
app.get('/login', (req, res) => {
    // O csrfToken já está disponível via res.locals, então não precisa passar manualmente
    res.render('login', { erro: req.query.erro, sucesso: req.query.sucesso });
});

// [Tarefa 2] Aplicando o limitador APENAS na rota POST de login
app.post('/login', loginLimiter, authController.login);
app.get('/logout', authController.logout);

app.get('/register', authController.getRegisterForm);
app.post('/register', authController.registerUser);

// Rotas Protegidas
app.get('/', (req, res) => res.redirect('/users'));
app.get('/users', isAuth, userController.getAllUsers);
app.get('/users/new', isAuth, userController.getNewUserForm);

// Rotas de Ação (CRUD)
app.post('/users/delete/:id', isAuth, userController.deleteUser);
app.get('/users/edit/:id', isAuth, userController.getEditUserForm);
app.post('/users/update/:id', isAuth, userController.updateUser);

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));