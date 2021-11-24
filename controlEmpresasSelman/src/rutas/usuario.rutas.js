'use strict'

//IMPORTACIONES
const express = require("express");
const usuarioControlador = require("../controladores/usuario.controlador")

//MIDDLEWARES
var md_autenticacion = require("../middlewares/authenticated")

//RUTAS
var api = express.Router();
//-------------------Usuario--------------------------------------------------------------------------------
api.post('/registrarUsuario',usuarioControlador.registrar);
api.get('/obtenerUsuarios',md_autenticacion.ensureAuth ,usuarioControlador.obtenerUsuarios);
api.get('/obtenerCantidadUsuarios',md_autenticacion.ensureAuth ,usuarioControlador.obtenerCantidadUsuarios);
api.post('/login',usuarioControlador.login);
api.put('/editarUsuario/:idUsuario',md_autenticacion.ensureAuth ,usuarioControlador.editarUsuario)
api.delete('/eliminarUsuario/:idUsuario',md_autenticacion.ensureAuth ,usuarioControlador.eliminarUsuario)
//-------------------Empresas-------------------------------------------------------------------------------
api.post('/registrarEmpresas',usuarioControlador.registrarEmpresas);
api.get('/obtenerEmpresas',md_autenticacion.ensureAuth ,usuarioControlador.obtenerEmpresas);
api.get('/obtenerCantidadEmpresas',md_autenticacion.ensureAuth ,usuarioControlador.obtenerCantidadEmpresas);
api.put('/editarEmpresa/:idEmpresa',md_autenticacion.ensureAuth ,usuarioControlador.editarEmpresa);
api.delete('/eliminarEmpresa/:idEmpresa',md_autenticacion.ensureAuth ,usuarioControlador.eliminarEmpresa);
//-------------------Empleados------------------------------------------------------------------------------
api.post('/registrarEmpleados' ,usuarioControlador.registrarEmpleados);
api.get('/obtenerEmpleadoID/:idEmpleado',md_autenticacion.ensureAuth ,usuarioControlador.obtenerEmpleadoID);
api.get('/obtenerEmpleadoNombre',usuarioControlador.obtenerEmpleadoNombre);
api.get('/obtenerEmpleadosPorEmpresa',md_autenticacion.ensureAuth ,usuarioControlador.obtenerEmpleadosPorEmpresa);
api.get('/obtenerEmpleadoPuesto',usuarioControlador.obtenerEmpleadoPuesto);
api.get('/GenerarPDF' ,md_autenticacion.ensureAuth ,usuarioControlador.GenerarPDF);
api.get('/obtenerEmpleadoDepartamento',usuarioControlador.obtenerEmpleadoDepartamento);
api.put('/editarEmpleado/:idEmpleado',md_autenticacion.ensureAuth ,usuarioControlador.editarEmpleado);
api.delete('/eliminarEmpleado/:idEmpleado',md_autenticacion.ensureAuth ,usuarioControlador.eliminarEmpleado);
api.get('/obtenerCantidadEmpleados',md_autenticacion.ensureAuth ,usuarioControlador.obtenerCantidadEmpleados);
//----------------------------------------------------------------------------------------------------------
module.exports = api;