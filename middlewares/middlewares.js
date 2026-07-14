const authMiddleware = (req, res, next) => {
    if(req.session.user) {
        next(); // usuário autenticado, pode seguir
    } else {
        res.status(401).send('login'); // usuário não autenticado, retorna erro
    }
};

module.exports = authMiddleware;