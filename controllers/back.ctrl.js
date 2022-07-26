let db = require('../db')
const fs = require('fs');
const { upload, maxSizeMB, multer } = require('../helpers/helper')


const adminGET = function(req,res) {

    if (req.session.logueado) {
        let sql = "SELECT * FROM productos"
        db.query(sql, function(err, data) {
            if (err) throw err;
    
            res.render('admin', {
                titulo: "Panel de control",
                logueado: req.session.logueado,
                usuario: req.session.usuario,
                productos: data
            })
        })
    } else {
        res.render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" })
    }
    
   
}

// PRODUCTO GET
const agregarProductoGET = function(req,res) {

    if (req.session.logueado) {
        res.render("agregar-producto", {
            titulo: "Agregar producto",
            logueado: req.session.logueado,
            usuario: req.session.usuario,
        })
    } else {
        res.render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" }) 
    }


   
}
// PRODUCTO POST
const agregarProductoPOST = function(req,res) {

    upload(req, res, function (err) {
        // Manejo de ERRORES de multer
        if (err instanceof multer.MulterError) {
            // Error de Multer al subir imagen
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).render('agregar-producto', { mensaje: `Imagen muy grande, por favor achicar a ${maxSizeMB}`, clase: "danger" });
            }
            return res.status(400).render('agregar-producto', { mensaje: err.code, clase: "danger" });
        } else if (err) {
            // Ocurrió un error desconocido al subir la imagen
            return res.status(400).render('agregar-producto', { mensaje: err, clase: "danger" });
        }

        // SI TODO OK
        let detalleProducto = req.body
        console.log("REQ.FILE -->", req.file)
        const nombreImagen = req.file.filename; // Tomo el nombre del archivo de la imagen
        detalleProducto.rutaImagen = nombreImagen

        let sql = "INSERT INTO productos SET ?"
        db.query(sql, detalleProducto, function(err, data) {
            if (err) throw err;
            console.log("Producto agregado correctamente ")
       
    })
    res.render("agregar-producto", {
        mensaje: "Producto agregado correctamente",
        clase: "success",
        titulo: "Agregar producto"
    })

    })
    

    
}

// EDITAR GET ID
const editarProductoGET = function(req,res) {

    if (req.session.logueado) {
        let id = req.params.id 
        let sql = "SELECT * FROM productos WHERE id = ?"
        db.query(sql, id, function(err, data) {
            if (err) throw err;
    
            if (data == "") {
                res.status(404).render("404", {
                    titulo: "404 - Página no encontrada",
                    mensaje: `Producto con ID ${id} no existe`
                })
            } else {
                res.render('editar-producto', {
                    titulo: `Editando ${data[0].nombre}`,
                    producto: data[0],
                    logueado: req.session.logueado,
                    usuario: req.session.usuario,
                })
            }
        })
    } else {
        res.render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" }) 
    }

    
    

}

// EDITAR POST ID
const editarProductoPOST = function(req, res) {
    
    upload(req, res, function (err) {
        // Manejo de ERRORES de multer
        if (err instanceof multer.MulterError) {
            // Error de Multer al subir imagen
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).render('agregar-producto', { mensaje: `Imagen muy grande, por favor achicar a ${maxSizeMB}`, clase: "danger" });
            }
            return res.status(400).render('agregar-producto', { mensaje: err.code, clase: "danger" });
        } else if (err) {
            // Ocurrió un error desconocido al subir la imagen
            return res.status(400).render('agregar-producto', { mensaje: err, clase: "danger" });
        }
    
    let id = req.params.id
    let detalleProducto = req.body
    
    // chequear si la edición incluyó cambio de imagen
    if (req.hasOwnProperty("file")) { //si se subió la imagen entonces multer adjuntó la propiedad "file"
        console.log("EDITAR: req.FILE -->", req.file)
        const nombreImagen = req.file.filename;
        detalleProducto.rutaImagen = nombreImagen

        // 
        let borrarImagen = 'SELECT rutaImagen FROM productos WHERE id = ?';
        db.query(borrarImagen, id, function (err, data) {
            if (err) throw err;

            console.log("Imagen a borrar", data[0].rutaImagen)
            fs.unlink(`./public/uploads/${data[0].rutaImagen}`, function(err){
                if (err) throw err;


                //Una vez borrada la imagen se procede a actualizar el registro en la DB
                let sql = "UPDATE productos SET ? WHERE id = ?"
                db.query(sql, [detalleProducto, id], function (err, data){
                    if (err) throw err;
                    console.log(data.affectedRows + " registro(s) actualizado(s)");
                })
            })

        })

    }
    
    let sql = "UPDATE productos SET ? WHERE id = ?"
    db.query(sql, [detalleProducto, id], function(err, data){
        if (err) throw err;
        console.log(data.affectedRows + " registro actualizado");
    })

    res.redirect("/admin")

})
    
    
    // ---------
    

}

// BORRAR ID
const borrarGET = function(req, res) {

    if (req.session.logueado) {
        let id = req.params.id

        // Borrar imagen
        let borrarImagen = "SELECT rutaImagen FROM productos WHERE id = ?";
        db.query(borrarImagen, [id], function (err, data) {
            console.log(data[0].rutaImagen)
            if (err) throw err;
            fs.unlink(`public/uploads/${data[0].rutaImagen}`, (err) => {
                if (err) throw err;
                console.log('Archivo borrado');
            });
        });

        // Borrar desde la base de datos
        let sql = "DELETE FROM productos WHERE id = ?"
        db.query(sql, id, function(err, data) {
            if (err) throw err;
            console.log(data.affectedRows + " registro borrado");
        })
    
        res.redirect("/admin")
    } else {
        res.render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" }) 
    }

}

const loginGET = function(req,res) {
    res.render('login')
}

const loginPOST = function(req,res) {
    
    let usuario = req.body.username 
    let clave = req.body.password

    if (usuario && clave) {
        let sql = "SELECT * FROM cuentas WHERE usuario = ? AND clave = ?"
        db.query(sql, [usuario,clave], function(err, data) {
            console.log("DATA", data)
            if (data.length) {
                // ok
                req.session.logueado = true;
                req.session.usuario = usuario
                res.redirect("/admin")
            } else {
                // error
                res.render("login", { 
                    titulo: "Login", 
                    error: "Nombre de usuario o contraseña incorrecto" 
                })
            }
    
        })
    } else {
        res.render("login", { 
            titulo: "Login", 
            error: "Por favor escribe un nombre de usuario y contraseña"
        })
    }

   
}

const logout = function(req, res) {


    req.session.destroy(function(err) {
        console.log(err)
    })

    let sql = "SELECT * FROM productos"
    db.query(sql, function(error, data) {
        if (error) throw err;
        res.render('index', {
            titulo: "Mi emprendimiento",
            productos: data
        })
    })

}

module.exports = {
    adminGET,
    agregarProductoGET,
    agregarProductoPOST,
    editarProductoGET,
    editarProductoPOST,
    borrarGET,
    loginGET,
    loginPOST,
    logout
}