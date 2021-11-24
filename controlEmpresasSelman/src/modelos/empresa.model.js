const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({
    direccion: String,
    tel: String
})

module.exports = mongoose.model('empresas', EmpresaSchema)