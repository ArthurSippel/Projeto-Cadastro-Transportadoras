const express = require('express');
const mysql = require('mysql2');

const app = express();

const porta = 3000

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const conectar = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senai',
    database: 'transp'
});

// PÁGINA INICIAL
app.get('/', (req, res) => {
    res.render('index');
});




//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// TRANSPORTADORAS
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


//rota página transportadoras
app.get('/transportadoras', (req, res) => {

    conectar.query('SELECT * FROM transportadoras', (err, results) => {

        if (err) {
            console.error(err);
            return res.send('Erro ao buscar transportadoras');
        }

        res.render('transportadoras', { registros: results });
    });

});

//rota para a pág do form de transportadoras
app.get('/transportadoras/form', (req, res) => {
    res.render('form', { tipo: 'transportadoras' });
});

//rota para os dados passarem form -> banco
app.post('/transportadoras/adicionar', (req, res) => {

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
app.get('/transportadoras/editar/:id', (req, res) => {

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
                registro: results[0]
            });
        }
    );
});

//rota para editar dados form -> banco
app.post('/transportadoras/atualizar', (req, res) => {

    const { id_transp, nome_transp, veiculos_transp, regiao_transp } = req.body;

    conectar.query(
        'UPDATE transportadoras SET nome_transp=?, veiculos_transp=?, regiao_transp=? WHERE id_transp=?',
        [nome_clientes, email_clientes, telefone_clientes, id_clientes],
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
app.get('/transportadoras/deletar/:id', (req, res) => {

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
app.get('/regioes', (req, res) => {

    conectar.query('SELECT * FROM regioes', (err, results) => {

        if (err) {
            console.error(err);
            return res.send('Erro ao buscar regiões');
        }

        res.render('regioes', { registros: results });
    });

});


//rota para pág do form de regiões
app.get('/regioes/form', (req, res) => {
    res.render('form', { tipo: 'regioes' });
});


//rota rota para os dados passarem form -> banco
app.post('/regioes/adicionar', (req, res) => {

    const { nome_regioes } = req.body; /// PAREI AQUI ////////////////////////////////////////////////

    conectar.query(
        'INSERT INTO categorias (nome_categorias) VALUES (?)',
        [nome_categorias],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao cadastrar');
            }

            res.redirect('/categorias');
        }
    );
});


//rota para a pág de edição
app.get('/categorias/editar/:id', (req, res) => {

    conectar.query(
        'SELECT * FROM categorias WHERE id_categorias = (?)',
        [req.params.id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao buscar categoria');
            }

            res.render('editar', {
                tipo: 'categoria',
                registro: results[0]
            });
        }
    );
});


//rota para editar dados form -> banco
app.post('/categorias/atualizar', (req, res) => {

    const { id_categorias, nome_categorias } = req.body;

    conectar.query(
        'UPDATE categorias SET nome_categorias=? WHERE id_categorias=?',
        [ nome_categorias, id_categorias ],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao atualizar');
            }

            res.redirect('/categorias');
        }
    );
});

//rota deletar produto
app.get('/categorias/deletar/:id', (req, res) => {

    conectar.query(
        'DELETE FROM categorias WHERE id_categorias=?',
        [req.params.id],
        (err) => {

            if (err) {
                console.error(err);
                return res.send('Erro ao deletar');
            }

            res.redirect('/categorias');
        }
    );
});