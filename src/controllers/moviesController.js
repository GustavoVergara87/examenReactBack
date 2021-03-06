const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { Console } = require('console');


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                console.log('-----LISTO LAS PELICULAS');
                movies.forEach(element => {
                    console.log(element.title);
                });
                res.json(movies)
                //res.render('moviesList.ejs', { movies })
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                console.log('---LISTO EL DETALLE');
                console.log(movie.title);
                res.json([movie])
                //res.render('moviesDetail.ejs', { movie });
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.json( movies );
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.json( movies );
            });
    },

    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        console.log('-----------------ENTRE A LA FUNCION ADDdd --------');
        console.log('------------------ --------');

        // Hago los 2 llamados indpendientes
        let promGenres = Genres.findAll();
   // Para este caso no necesito hacer la llamada a Actores     
   //     let promActors = Actors.findAll();

//Promise.all espera a que todo se cumpla (o bien al primer rechazo).
 //       Promise.all([promGenres, promActors])
        Promise.all([promGenres])
            .then(([allGenres]) => {

            return res.json( allGenres)
        })
            .catch(error => res.json(error))
    },

    create: function (req, res) {
        console.log('------ENTRE A CREATE');
        console.log('Pelicula :' + req.body.title);
        console.log('C??digo de G??nero :' + req.body.genre_id);

        db.Movie.create(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            }
        )
            .then(() => {
                return res.redirect('http://localhost:3000/')
            })
            .catch(error => res.json(error))
    },
    edit: function (req, res) {
        console.log('------ENTRE AL EDITAR -----');
        let movieId = req.params.id;
        console.log('----BUSCO LA PELI POT ID');
        let promMovies = db.Movie.findByPk(movieId, { include: ['genre', 'actors'] });
        console.log('----BUSCO TODOS LOS GENEROS');
        let promGenres = db.Genre.findAll();
        console.log('----BUSCO TODOS LOS ACTORES');
        let promActors = db.Actor.findAll();

        Promise
            .all([promMovies, promGenres, promActors])
            .then(([Movie, allGenres, allActors]) => {
                console.log('-----TITULO :' + Movie.title);
                console.log('-----GENERO :' +  Movie.genre.name);
                console.log('-----GENERO id :' +  Movie.genre.id);
                return res.render(path.resolve(__dirname, '..', 'views', 'moviesEdit'), { Movie, allGenres, allActors })
            })
            .catch(error => res.json(error))
    },
    update: function (req, res) {
        let movieId = req.params.id;
        db.Movie.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: { id: movieId }
            })
            .then((result) =>
            res.json({ msg: "movie actualizada", result, movie: req.body })
                                // return res.redirect('/movies')
            )
            // .catch(error => res.json(error))
            .catch(error => res.json(error))
    },
    delete: function (req, res) {
        let movieId = req.params.id;

        db.Movie.findByPk(movieId)
            .then(Movie => {
                return res.render(path.resolve(__dirname, '..', 'views', 'moviesDelete'), { Movie })
            })
            .catch(error => res.json(error))
    },
    destroy: function (req, res) {
        let movieId = req.params.id;
        Movies
            .destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acci??n
            .then(() => {
                return res.redirect('/movies')
            })
            .catch(error => res.json(error))
    }
}

module.exports = moviesController;