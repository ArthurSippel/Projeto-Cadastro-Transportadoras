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
    return res.redirect('/login');
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
        return res.redirect('/erro_cadastro');
    }

    
    const [results] = await conectar.promise().query(
        'SELECT * FROM usuarios WHERE usuario = ?',
        [usuario]
    );
    if (results.length > 0) {
        return res.redirect('/erro_cadastro');
    }


    // Criptografia senha
    const hash = await bcrypt.hash(senha, saltRounds);

    await conectar.promise().query(
        'INSERT INTO usuarios (usuario, senha) VALUES (?, ?)',
        [usuario, hash]
    );

    return res.redirect('/login');

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
        return res.redirect('/erro_login');
    }

    const registro = results[0];


    // Compara a senha digitada com a senha criptografada
    const senhaCorreta = await bcrypt.compare(
        senha,
        registro.senha
    );
    if (!senhaCorreta) {
        return res.redirect('/erro_login');
    }

    // Salva usuário sessão
    req.session.user = registro.id_usuario;

    return res.redirect('/home');
});

//---------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
// ROTA DE LOGOUT
//----------------------------------------------------------------------------------------------------------------------

app.get('/logout', (req, res) => {

    req.session.destroy();

    return res.redirect('/login');

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


// página adicionar e editar transportadoras
app.get('/transportadoras/form', authMiddleware, (req, res) => {
    res.render('form');
});


// Adicionar transportadora
app.post('/transportadoras/adicionar', authMiddleware, async (req, res) => {

    const {nome_transp, veiculos_transp, regiao_transp} = req.body;

    if (!nome_transp || !veiculos_transp || !regiao_transp) {
        return res.send('Preencha todos os campos.');
    }

    await conectar.promise().query(
        'INSERT INTO transportadoras (nome_transp, veiculos_transp, regiao_transp) VALUES (?, ?, ?)',
        [nome_transp, veiculos_transp, regiao_transp]
    );

    return res.redirect('/transportadoras');

});


// página edição transportadoras
app.get('/transportadoras/editar/:id', authMiddleware, async (req, res) => {

    const [results] = await conectar.promise().query(
        'SELECT * FROM transportadoras WHERE id_transp = ?',
        [req.params.id]
    );

    res.render('editar', { registro: results[0] });

});


//  pagina atualizar transportadoras no banco
app.post('/transportadoras/atualizar', authMiddleware, async (req, res) => {

    const { id_transp, nome_transp, veiculos_transp, regiao_transp } = req.body;

    if (!nome_transp || !veiculos_transp || !regiao_transp) {
        return res.send('Preencha todos os campos.');
    }

    await conectar.promise().query( `UPDATE transportadoras 
                                    SET nome_transp = ?, veiculos_transp = ?, regiao_transp = ? WHERE id_transp = ?`,
        [ nome_transp, veiculos_transp, regiao_transp, id_transp ]
    );

    return res.redirect('/transportadoras');

});


// Deletar transportadora
app.get('/transportadoras/deletar/:id', authMiddleware, async (req, res) => {

    await conectar.promise().query(
        'DELETE FROM transportadoras WHERE id_transp = ?',
        [req.params.id]
    );

    return res.redirect('/transportadoras');

});










app.listen(porta, () => {
    console.log(`Servidor rodando: http://localhost:${porta}`);
});