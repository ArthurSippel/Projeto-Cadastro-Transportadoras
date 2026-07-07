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



//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// PÁGINAS
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    if(req.session.id){
        res.redirect('/home')
    }else{
        res.render('login');
        return
    }
    
});



app.get('/home', (req, res) => {
    res.render('home');
});



app.get('/erro_login', (req, res) => {
    res.render('erro_login');
});



app.get('/erro_cadastro', (req, res) => {
    res.render('erro_cadastro');
});



app.get('/transportadoras', (req, res) => {
    res.render('transportadoras');
});



//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// LOGIN
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//rota página login
app.get('/login', (req, res) => {
    res.render('login');
});


//rota para fazer login
app.post('/login/autenticacao', async (req,res) => {

    usuario = req.body.usuario;
    senha = req.body.senha;

        const [results] = await conectar.promise().query(
            'SELECT * FROM usuarios WHERE usuario = ? and senha = ?',
            [usuario]
        );

        if (results.length === 0) {
            res.redirect('/erro_login');
            return
        }   

        const senhaCorreta = await bcrypt.compare(
            senha, 
            registro.senha
        );

        if (!senhaCorreta || usuario === '' || senha === '') {
            res.redirect('/erro_login');
            return
        }

        const registro = results[0];
        req.session.id = registro.id;

    res.redirect('/home');
})


// rota para fazer logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Erro ao fazer logout');
        }
        res.redirect('/login');
    });
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// CADASTRO
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

//rota para fazer cadastro
app.post('/cadastro/autenticacao', async (req,res) => {

    usuario = req.body.usuario;
    senha = req.body.senha;
    var hash = await bcrypt.hash(senha, saltRounds);

    conectar.query(
        'INSERT INTO usuarios (usuario, senha) VALUES (?, ?)',
        [usuario, hash],

        (err, results) => {
            if (err) {
                res.redirect('/erro_cadastro');
                return
            }

            if (usuario === '' || senha === '') {
                res.redirect('/erro_cadastro');
                return
            }

            res.redirect('/login');
        }
    )
})



//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// TRANSPORTADORAS
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


//rota página transportadoras
app.get('/transportadoras', authMiddleware, (req, res) => {

    conectar.query('SELECT * FROM transportadoras', (err, results) => {

        if (err) {
            console.error(err);
            return res.send('Erro ao buscar transportadoras');
        }

        res.render('transportadoras', { registros: results });
    });

});

//rota para a pág do form de transportadoras
app.get('/transportadoras/form', authMiddleware, (req, res) => {
    res.render('form', { tipo: 'transportadoras' });
});

//rota para os dados passarem form -> banco
app.post('/transportadoras/adicionar', authMiddleware, (req, res) => {

    const { nome_transp, veiculos_transp, regiao_transp } = req.body;

    conectar.query(
        'INSERT INTO transportadoras (nome_transp, veiculos_transp, regiao_transp) VALUES (?, ?, ?)',
        [nome_transp, veiculos_transp, regiao_transp],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao cadastrar transportadora');
            }

            res.redirect('/transportadoras');
        }
    );
});

//rota para a pág de edição
app.get('/transportadoras/editar/:id', authMiddleware, (req, res) => {

    conectar.query(
        'SELECT * FROM transportadoras WHERE id_transp = (?)',
        [req.params.id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao buscar transportadora');
            }

            res.render('editar', {
                tipo: 'transportadoras',
                registros: results[0]
            });
        }
    );
});

//rota para editar dados form -> banco
app.post('/transportadoras/atualizar', authMiddleware, (req, res) => {

    const { id_transp, nome_transp, veiculos_transp, regiao_transp } = req.body;

    conectar.query(
        'UPDATE transportadoras SET nome_transp=?, veiculos_transp=?, regiao_transp=? WHERE id_transp=?',
        [nome_transp, veiculos_transp, regiao_transp, id_transp],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao atualizar');
            }

            res.redirect('/transportadoras');
        }
    );
});

//rota deletar transportadora
app.get('/transportadoras/deletar/:id', authMiddleware, (req, res) => {

    conectar.query(
        'DELETE FROM transportadoras WHERE id_transp=?',
        [req.params.id],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao deletar');
            }

            res.redirect('/transportadoras');
        }
    );
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// REGIÕES
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//rota para pág das regiões
app.get('/regioes', authMiddleware, (req, res) => {

    conectar.query('SELECT * FROM regioes', (err, results) => {

        if (err) {
            console.error(err);
            return res.send('Erro ao buscar regiões');
        }

        res.render('regioes', { registros: results });
    });

});


//rota para pág do form de regiões
app.get('/regioes/form', authMiddleware, (req, res) => {
    res.render('form', { tipo: 'regioes' });
});


//rota rota para os dados passarem form -> banco
app.post('/regioes/adicionar', authMiddleware, (req, res) => {

    const { nome_regioes } = req.body; /// PAREI AQUI ////////////////////////////////////////////////

    conectar.query(
        'INSERT INTO regioes (nome_regioes) VALUES (?)',
        [nome_regioes],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao cadastrar');
            }

            res.redirect('/regioes');
        }
    );
});


//rota para a pág de edição
app.get('/regioes/editar/:id', authMiddleware, (req, res) => {

    conectar.query(
        'SELECT * FROM regioes WHERE id_regioes = (?)',
        [req.params.id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao buscar região');
            }

            res.render('editar', {
                tipo: 'regioes',
                registro: results[0]
            });
        }
    );
});


//rota para editar dados form -> banco
app.post('/regioes/atualizar', authMiddleware, (req, res) => {

    const { id_regioes, nome_regioes } = req.body;

    conectar.query(
        'UPDATE regioes SET nome_regioes=? WHERE id_regioes=?',
        [ nome_regioes, id_regioes ],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao atualizar');
            }

            res.redirect('/regioes');
        }
    );
});

//rota deletar produto
app.get('/regioes/deletar/:id', authMiddleware, (req, res) => {

    conectar.query(
        'DELETE FROM regioes WHERE id_regioes=?',
        [req.params.id],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao deletar');
            }

            res.redirect('/regioes');
        }
    );
});

app.listen(porta, () => {
    console.log(`Servidor rodando: http://localhost:${porta}`);
});