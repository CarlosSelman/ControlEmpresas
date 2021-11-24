const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    nombre: String,
    usuario: String,
    email:String,
    password:String,
    rol: String,
    imagen: String,
    idEmpresa: {type: Schema.Types.ObjectId, ref : 'empresas'}
})

module.exports = mongoose.model('usuarios', UsuarioSchema)