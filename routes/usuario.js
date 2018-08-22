var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');

// ===================================
// Obtener todos los usuarios
// ===================================
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Usuario.find({}, 'nombre email img rol')
    .skip(desde)
    .limit(5)
    .exec(
      (err, usuarios) => {
        if (err) {
          res.status(500).json({
            ok: false,
            message: 'Error cargando usuarios',
            errors: err
          })
        }
        Usuario.count({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            usuarios: usuarios,
            total: conteo
          });
        })

      })

});


// ===================================
// Actualizar usuario
// ===================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al buscar usuario',
        errors: err
      })
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        message: 'El usuario con el id ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      })
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.rol = body.rol;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: 'Error al actualizar usuario',
          errors: err
        })
      }
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  })

})

// ===================================
// Crear un nuevo usuario
// ===================================

app.post('/', (req, res) => {
  var body = req.body;
  console.log(body)
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    rol: body.rol
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: 'Error al crear usuario',
        errors: err
      })
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });


})

// ===================================
// Eliminar un usuario por id
// ===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al eliminar usuario',
        errors: err
      })
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        message: 'No existe un usuario con ese id',
        errors: { message: 'No existe un usuario con ese id' }
      })
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });

  })

})
module.exports = app;