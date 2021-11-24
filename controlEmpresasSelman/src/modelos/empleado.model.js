const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpleadoSchema = Schema({
    idEmpresa: {type: Schema.Types.ObjectId, ref : 'empresas'},
    puesto: String,
    nombre: String,
    departamento: String
})

module.exports = mongoose.model('empleados', EmpleadoSchema)