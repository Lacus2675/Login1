const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('links/add');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

/*
router.get('/', isLoggedIn, async (req, res) => {
    // listado de todo
    //const links = await pool.query('SELECT * FROM links WHERE user_id = ? ', [req.user.id] );
    // listado de busqueda 
    const links = await pool.query('SELECT * FROM links WHERE user_id = ? AND description = "Pagina de Peliculas"', [req.user.id]);
    res.render('links/list', { links });
});
*/

router.get('/', isLoggedIn, async (req, res) => {
    let condition = { user_id: req.user.id };

    // Verifica si se ha enviado un parámetro de búsqueda
    if (req.query.buscar) {
        condition.description = req.query.buscar;
    }

    try {
        // Convierte la condición a una cadena
        const conditionString = Object.entries(condition)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');

        const links = await pool.query(`SELECT * FROM links WHERE ${conditionString}`);
        res.render('links/list', { links });
    } catch (error) {
        console.error(error);

        res.status(500).send('Error en el servidor');
    }
});


router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
    console.log(links);
    res.render('links/edit', {link: links[0]});
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, url} = req.body; 
    const newLink = {
        title,
        description,
        url
    };
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;

