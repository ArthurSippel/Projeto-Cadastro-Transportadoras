const express = require('express');
const session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require('mysql2');
const path = require('path');

const app = express();
const porta = 3000 //define cód de porta utilizada

const authMiddleware = require('./middlewares/middlewares'); // Middlewares


app.use(express.urlencoded({ extended: true })); //configuração para uso de 'url extension'

app.use(express.static(path.join(__dirname,"public"))) //configuração para utilizar a pasta public em arquivos estáticos (css, imagens e JavaScript no front)

app.use(session({ //configuração para uso de 'session'
    secret: 'chave-senha',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 108000000 }

}));

app.set('view engine', 'ejs');

const conectar = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senai',
    database: 'transp'
});



//----------------------------------------------------------------------------------------------------------------------
// VIEWS
//----------------------------------------------------------------------------------------------------------------------

// Página inicial
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Login
app.get('/login', (req, res) => {
    res.render('login');
});

// Cadastro
app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

// Home
app.get('/home', authMiddleware, (req, res) => {
    res.render('home');
});

// Erro de login
app.get('/erro_login', (req, res) => {
    res.render('erro_login');
});

// Erro de cadastro
app.get('/erro_cadastro', (req, res) => {
    res.render('erro_cadastro');
});

//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
// ROTA DE CADASTRO
//----------------------------------------------------------------------------------------------------------------------

app.post('/cadastro/autenticacao', async (req, res) => {

    const { usuario, senha } = req.body;

    if (usuario === '' || senha === '') {
        res.redirect('/erro_cadastro');
    }

    
    const [results] = conectar.promise().query(
        'SELECT * FROM usuarios WHERE usuario = ?',
        [usuario]
    );
    if (results.length > 0) {
        res.redirect('/erro_cadastro');
    }


    // Criptografia senha
    const hash = await bcrypt.hash(senha, saltRounds);

    await conectar.promise().query(
        'INSERT INTO usuarios (usuario, senha) VALUES (?, ?)',
        [usuario, hash]
    );

    res.redirect('/login');

});

//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
// ROTA DE LOGIN
//----------------------------------------------------------------------------------------------------------------------

app.post('/login/autenticacao', async (req, res) => {

    const { usuario, senha } = req.body;


    if (usuario === '' || senha === '') {
        return res.redirect('/erro_login');
    }


    const [results] = await conectar.promise().query(
        'SELECT * FROM usuarios WHERE usuario = ?',
        [usuario]
    );
    if (results.length === 0) {
        res.redirect('/erro_login');
    }

    const registro = results[0];


    // Compara a senha digitada com a senha criptografada
    const senhaCorreta = await bcrypt.compare(
        senha,
        registro.senha
    );
    if (!senhaCorreta) {
        res.redirect('/erro_login');
    }

    // Salva usuário sessão
    req.session.user = registro.id;

    res.redirect('/home');
});

//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
// ROTA DE LOGOUT
//----------------------------------------------------------------------------------------------------------------------

app.get('/logout', (req, res) => {

    req.session.destroy();

    res.redirect('/login');

});

//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
// ROTAS TRANSPORTADORAS
//----------------------------------------------------------------------------------------------------------------------

// Listar transportadoras
app.get('/transportadoras', authMiddleware, async (req, res) => {

    const [results] = await conectar.promise().query(
        'SELECT * FROM transportadoras'
    );

    res.render('transportadoras', {
        registros: results
    });

});


app.get('/transportadoras/form', authMiddleware, async (req, res) => {

    res.render('form', {
        tipo: 'transportadoras'
    });

});













app.listen(porta, () => {
    console.log(`Servidor rodando: http://localhost:${porta}`);
});