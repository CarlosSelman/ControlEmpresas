'use strict'

//IMPORTACIONES:
//------------------------------------------------------------
const Usuario = require('../modelos/usuario.model');
const usuarioModel = require('../modelos/usuario.model');
//------------------------------------------------------------
const Empresa = require('../modelos/empresa.model');
const empresaModel = require('../modelos/empresa.model');
//------------------------------------------------------------
const Empleado = require('../modelos/empleado.model');
const empleadoModel = require('../modelos/empleado.model');
//------------------------------------------------------------
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../servicios/jwt");
const pdf = require("html-pdf");
//--------------------------------------------------------------
//----------------------------Usuarios--------------------------
//--------------------------------------------------------------
function crearUsuarioEstatico(req,res) {
   var  usuarioModel = new Usuario(); 
   usuarioModel.usuario = 'Admin';
   usuarioModel.password = '123456';
   usuarioModel.rol = 'Rol_Admin'

   Usuario.find({ $or: [
    {usuario: usuarioModel.usuario}
    ]}).exec((err, usuariosEncontrados)=>{
    if (err) return console.log('Error en la peticion del Usuario')  
    
    if (usuariosEncontrados 
        && usuariosEncontrados.length >=1) {
        return console.log('El usuario ya existe')
    }else{
        bcrypt.hash('123456',null,null,(err, passwordEncriptada)=>{
            usuarioModel.password = passwordEncriptada; 
            usuarioModel.save((err,usuarioGuardado)=>{ 
                if (err) return console.log('Error al guardar el Usuario');
                    
                if (usuarioGuardado) {
                    return console.log(usuarioGuardado)    
                }else{
                    return console.log( 'No se ha podido registrar el Usuario')
                }
            })
        })

    }
})
}

function registrar(req,res) {
    var usuarioModel = new Usuario();
    var params = req.body;

    if (params.usuario && params.email && params.password) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.usuario = params.usuario;
        usuarioModel.email = params.email;
        usuarioModel.idEmpresa = params.idEmpresa;
        //usuarioModel.rol='ROL_MAESTRO';
        usuarioModel.imagen = null;
        
        Usuario.find({ $or: [
            {usuario: usuarioModel.usuario},
            {email: usuarioModel.email}
        ]}).exec((err, usuariosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion del Usuario' })  
            
            if (usuariosEncontrados 
                && usuariosEncontrados.length >=1) {
                return res.status(500).send({mensaje: 'El usuario ya existe'})
            }else{
                bcrypt.hash(params.password,null,null,(err, passwordEncriptada)=>{
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err,usuarioGuardado)=>{
                        if (err) return res.status(500).send({mensaje: 'Error al guardar el Usuario'});
                            
                        if (usuarioGuardado) {
                            res.status(200).send(usuarioGuardado)    
                        }else{
                            res.status(404).send({mensaje: 'No se ha podido registrar el Usuario'})
                        }
                    })
                })

            }
        })
    }    
}

function obtenerUsuarios(req, res) {
    //Usuario.find().exec((err,usuariosEncontrados)=>{})
    Usuario.find((err, usuariosEncontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener Usuarios'})
        if(!usuariosEncontrados) return res.status(500).send({mensaje: 'Error en la consulta de Usuarios'})
         //usuariosEncontrados === [datos] || !usuariosEncontrados === [] <-- no trae nada
        if(req.user.rol=='Rol_Admin'){
           return res.status(200).send({usuariosEncontrados})
        }else{
            res.status(403).send({mensaje: 'No tiene los permisos'}) 
        }
        // {
        //  usuariosEncontrados: ["array de lo que contenga esta variable"]   
        // }
        
    })
}

function login(req,res) {
    var params = req.body;

    Usuario.findOne({ usuario: params.usuario },(err,usuarioEncontrado)=>{ 
        
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});

        if (usuarioEncontrado) {  //TRUE O FALSE
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passCorrecta)=>{
                if(passCorrecta){
                    if (params.obtenerToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        });
                    }else{
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({usuarioEncontrado})
                    }
                }else{
                    return res.status(404).send({ mensaje:'El usuario no se a podido identificar'})
                }
            })
        }else{
            return res.status(404).send({ mensaje:'El usuario no  a podido ingresar'})
        }
    })
}

function editarUsuario(req,res) {
    var idUsuario = req.params.idUsuario;
    var params = req.body;
    
    //BORRAR LA PROPIEDAD DE PASSWORD PARA QUE NO SE PUEDA EDITAR
    delete params.password;

    //req.user.sub <----- id usuario logeado
    if(idUsuario != req.user.sub){
        return res.status(500).send({mensaje: 'No posees los permisos nesesarios para actualizar este Usuario.'})
    }
    
    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err,usuarioActualizado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticions'});
        if(!usuarioActualizado) return res.status(500).send({mensaje: 'No se ha podido actualizar el Usuario'});
        return res.status(200).send({usuarioActualizado});   
     })
}

function eliminarUsuario(req,res) {
    const idUsuario = req.params.idUsuario;
    if(idUsuario != req.user.sub){
        return res.status(500).send({mensaje: 'No posee los permisos para eliminar a este Usuario.'});
    }
    Usuario.findByIdAndDelete(idUsuario,(err,usuarioEliminado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de eliminar'});
        if(!usuarioEliminado) return res.status(500).send({mensaje: 'Error al eliminar el usuario.'});
        return res.status(200).send({usuarioEliminado});   
    })
}

function obtenerCantidadUsuarios(req,res) {
    var idUsuario = req.params.idUsuario
    Usuario.find({ idUsuario:idUsuario }).countDocuments().exec((err,cantidadUsuarios)=>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"})
        if(!cantidadUsuarios) return res.status(500).send({mensaje: "Error en la consulta de los usuarios"})
      //  if(idUsuario != req.user.sub) return res.status(500).send({mensaje: "No tiene los permisos necesarios"})
      if(req.user.rol=='Rol_Admin'){ 
        return res.status(200).send({cantidadUsuarios})
      }else{
        res.status(403).send({mensaje: 'No tiene los permisos'}) 
       }  
    })  
}

//----------------------------Empresas--------------------------
function registrarEmpresas(req,res) {
    var empresaModel = new Empresa();
    var params = req.body;

    if (params.direccion && params.tel) {
        empresaModel.direccion = params.direccion;
        empresaModel.tel = params.tel;
        //usuarioModel.rol='ROL_MAESTRO';
        empresaModel.imagen = null;
        
        Empresa.find({ $or: [
            {direccion: empresaModel.direccion},
            {tel: empresaModel.tel}
        ]}).exec((err, empresasEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de la empresa' })  
            
            if (empresasEncontrados 
                && empresasEncontrados.length >=1) {
                return res.status(500).send({mensaje: 'La empresa ya existe'})
            }else{
                    empresaModel.save((err,empresaGuardado)=>{
                        if (err) return res.status(500).send({mensaje: 'Error al guardar la Empresa'});
                            
                        if (empresaGuardado) {
                            res.status(200).send(empresaGuardado)    
                        }else{
                            res.status(404).send({mensaje: 'No se ha podido registrar la empresa'})
                        }
                    })
            }
        })
    }    
}

function obtenerEmpresas(req, res) {
    //Usuario.find().exec((err,usuariosEncontrados)=>{})
    Empresa.find((err, empresasEncontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener Empresas'})
        if(!empresasEncontrados) return res.status(500).send({mensaje: 'Error en la consulta de Empresas'})
         //usuariosEncontrados === [datos] || !usuariosEncontrados === [] <-- no trae nada
        if(req.user.rol=='Rol_Admin'){
           return res.status(200).send({empresasEncontrados})
        }else{
            res.status(403).send({mensaje: 'No tiene los permisos'}) 
        }
        // {
        //  usuariosEncontrados: ["array de lo que contenga esta variable"]   
        // }  
    })
}

function obtenerCantidadEmpresas(req,res) {
    var idEmpresa = req.params.idEmpresa
    Empresa.find({ idEmpresa:idEmpresa }).countDocuments().exec((err,cantidadEmpresas)=>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"})
        if(!cantidadEmpresas) return res.status(500).send({mensaje: "Error en la consulta de las empresas"})
      //  if(idUsuario != req.user.sub) return res.status(500).send({mensaje: "No tiene los permisos necesarios"})
      if(req.user.rol=='Rol_Admin'){ 
        return res.status(200).send({cantidadEmpresas})
      }else{
        res.status(403).send({mensaje: 'No tiene los permisos'}) 
       }  
    })  
}
//Solo el administrador puede editar
function editarEmpresa(req,res) {
    var idEmpresa = req.params.idEmpresa;
    var params = req.body;
    if(req.user.rol!='Rol_Admin'){
        return res.status(500).send({mensaje: 'No posees los permisos nesesarios para actualizar esta Empresa.'})
    }
    Empresa.findByIdAndUpdate(idEmpresa, params, { new: true }, (err,empresaActualizado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!empresaActualizado) return res.status(500).send({mensaje: 'No se ha podido actualizar esta Empresa'});
        return res.status(200).send({empresaActualizado});   
     })
}

function eliminarEmpresa(req,res) {
    var idEmpresa = req.params.idEmpresa;
    // var params = req.body;
    if(req.user.rol!='Rol_Admin'){
        return res.status(500).send({mensaje: 'No posee los permisos para eliminar a esta Empresa'});
    }
    Empresa.findByIdAndDelete(idEmpresa,(err,empresaEliminado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de eliminar'});
        if(!empresaEliminado) return res.status(500).send({mensaje: 'Error al eliminar la empresa.'});
        return res.status(200).send({empresaEliminado});  
    })
}
//----------------------------Empleados--------------------------
function registrarEmpleados(req,res) {
    var empleadoModel = new Empleado();
    var params = req.body;

    if (params.puesto && params.nombre && params.departamento) {
        empleadoModel.idEmpresa = params.idEmpresa;
        empleadoModel.puesto = params.puesto;
        empleadoModel.nombre = params.nombre;
        empleadoModel.departamento = params.departamento;
        //usuarioModel.rol='ROL_MAESTRO';
        //empresaModel.imagen = null;
        
        Empleado.find({ $or: [
             //{idEmpresa: empresaModel.idEmpresa},
             {puesto: empresaModel.puesto},
             {nombre: empresaModel.nombre},
             {departamento: empresaModel.departamento}
            
        ]}).exec((err, empleadosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de el empleado' })  
            
            if (empleadosEncontrados 
                && empleadosEncontrados.length >=1) {
                return res.status(500).send({mensaje: 'El empleado ya existe'})
            }else{
                empleadoModel.save((err,empleadoGuardado)=>{
                        if (err) return res.status(500).send({mensaje: 'Error al guardar el empleado'});
                            
                        if (empleadoGuardado) {
                            res.status(200).send(empleadoGuardado)    
                        }else{
                            res.status(404).send({mensaje: 'No se ha podido registrar el empleado'})
                        }
                    })
            }
        })
    }    
}

function obtenerEmpleadoID(req,res) {
    var idEmpleado = req.params.idEmpleado
       Empleado.findById(idEmpleado, (err,empleadosEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion del empleado'})
        if(!empleadosEncontrado) return res.status(500).send({mensaje: 'Error en obtener los datos del empleado'})
        console.log(empleadosEncontrado.idEmpresa, empleadosEncontrado.nombre,empleadosEncontrado.puesto,empleadosEncontrado.departamento);
        return res.status(200).send({empleadosEncontrado})
    })
}

function obtenerEmpleadosPorEmpresa(req, res) {
    var idEmpresa = req.user.idEmpresa
    Empleado.find({idEmpresa:idEmpresa}, (err,empleadosEncontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener Empleados'})
        if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error en la consulta de Empresas'})
       // if(req.user.rol =='Rol_Empresa' && req.user.idEmpresa == idEmpresa){
           return res.status(200).send({empleadosEncontrados})
      //  }else{
      //      res.status(403).send({mensaje: 'No tiene los permisos'}) 
      //  }
    })
}

function obtenerEmpleadoPuesto(req,res) {
    var puesto = req.body.puesto;
       Empleado.find({puesto:puesto}, (err,empleadoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion del empleado'})
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error en obtener los datos del empleado'})
         return res.status(200).send({empleadoEncontrado})
    })
}

function obtenerEmpleadoNombre(req,res) {
    var nombre = req.body.nombre
       Empleado.find({nombre:nombre}, (err,empleadoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion del empleado'})
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error en obtener los datos del empleado'})    
        //console.log(empleadoEncontrado.idEmpresa, empleadoEncontrado.nombre,empleadoEncontrado.puesto,empleadoEncontrado.departamento);
           return res.status(200).send({empleadoEncontrado})
    })
}

function GenerarPDF(req,res) {
    var idEmpresa = req.user.idEmpresa
    Empleado.find({idEmpresa:idEmpresa}, (err,empleadosEncontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener Empleados'})
        if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error en la consulta de Empresas'})

        //Variables

        var pdfEmpleado = [];
        var ContendPDF = ``;
        var w = 0;

        while(w<empleadosEncontrados.length){
            pdfEmpleado  [w] =
        `
         <tr>
            
            <td>${empleadosEncontrados[w].nombre}</td>
            <td>${empleadosEncontrados[w].puesto}</td>
            <td>${empleadosEncontrados[w].departamento}</td>
         </tr>
         
        ` 
        ContendPDF += pdfEmpleado[w];
        w++;           
        }

        const content = `
        
        <head>
            <meta charset = "utf-8">
            <title> Reporte de los empleados </title> 

            <style>
              table{
                  margin:auto;
                  border-collapse: collapse;
                  margin: 47px;
                  width: 480px; text-align: left;
                  font-size:13px;
                  text-align: center;
                  font-family: 2Lucida Sans Unicode","Lucida Grande", Sans-serif;
              }  
              h1,p{
                  color:black;
                  text-align-center;
              }
              th{
                  font-size: 13px;
                  padding: 8px;
                  font-weight: normal;
              }
              td{
                  border-top: 1 px solid transparent;
                  color: #072C82;
                  border-bottom: 1px solid #fff;
                  padding: 8px;
                  background: #077582
              }

              tr:hover td{background: #4F6B7C;
                   color: #009067;
                }
            </style>
            </head>
            
                <h1>Reporte de datos</h1>
                <p> Empleados que estan registrados
            <table>
                <tr>
                   
                   <td>NOMBRE</td>
                   <td>PUESTO</td>
                   <td>DEPARTAMENTO</td>
                </tr>
            
        
        `
        ContendPDF = content + ContendPDF+'</table>';
        pdf.create(ContendPDF).toFile('./Reporte.pdf',function (err,res) {
            if(err){
                console.log(err)
            }else{
                console.log(res);
            } 
        });
        return res.status(200).send({mensaje: 'PDF creado exitosamente :)'})
    })
}

function obtenerEmpleadoDepartamento(req,res) {
    var departamento = req.body.departamento
       Empleado.find({departamento:departamento}, (err,empleadoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion del empleado'})
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error en obtener los datos del empleado'})    
           return res.status(200).send({empleadoEncontrado})
    })
}

function editarEmpleado(req,res) {
    var idEmpleado = req.params.idEmpleado;
    var params = req.body;
    Empleado.findByIdAndUpdate(idEmpleado, params ,{new:true,useFindAndModify: false}, (err,empleadoActualizado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!empleadoActualizado) return res.status(500).send({mensaje: 'No se ha podido actualizar este empleado'});
      //  if(req.user.rol=='Rol_Empresa'){
        return res.status(200).send({empleadoActualizado});   
     //   }else{
    //       return res.status(500).send({mensaje: 'No posees los permisos nesesarios para actualizar este empleado'})
    //    }
     })
}

function eliminarEmpleado(req,res) {
    var idEmpleado = req.params.idEmpleado;
  //  if(req.user.rol!='Rol_Empresa'){
  //      return res.status(500).send({mensaje: 'No posee los permisos para eliminar a este empleado'});
   // }
    Empleado.findByIdAndDelete(idEmpleado,(err,empleadoEliminado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de eliminar'});
        if(!empleadoEliminado) return res.status(500).send({mensaje: 'Error al eliminar el empleado.'});
        return res.status(200).send({empleadoEliminado});  
    })
}

function obtenerCantidadEmpleados(req,res) {
    var idEmpleado = req.params.idEmpleado
    Empleado.find({ idEmpleado:idEmpleado }).countDocuments().exec((err,cantidadEmpleados)=>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"})
        if(!cantidadEmpleados) return res.status(500).send({mensaje: "Error en la consulta de las empresas"})
      if(req.user.rol=='Rol_Empresa'){ 
        return res.status(200).send({cantidadEmpleados})
      }else{
        res.status(403).send({mensaje: 'No tiene los permisos'}) 
       }  
    })  
}
//----------------------------Exportaciones-----------------------
module.exports = {
    registrar,
    obtenerUsuarios,
    obtenerCantidadUsuarios,
    login,
    editarUsuario,
    eliminarUsuario,
    crearUsuarioEstatico,

    registrarEmpresas,
    obtenerEmpresas,
    obtenerCantidadEmpresas,
    editarEmpresa,
    eliminarEmpresa,

    registrarEmpleados,
    obtenerEmpleadoNombre,
    obtenerEmpleadoID,
    obtenerEmpleadosPorEmpresa,
    obtenerEmpleadoPuesto,
    GenerarPDF,
    obtenerEmpleadoDepartamento,
    editarEmpleado,
    eliminarEmpleado,
    obtenerCantidadEmpleados
}

