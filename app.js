// 1. Inovacamos  a las dependencias
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session');

//2. seteamos urlencoded para capturar los datos de los formularios
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3. configuramos las variables de entorno en este caso se lo 
//hara en el archivo .env
dotenv.config({path:'./env/.env'});

// 4. damos a conocer donde estaran los archivos publicos
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// 5. Establecer el motor de plantillas ejs
app.set('view engine','ejs');

// 6. configuración de las sessiones
app.use(session({
    secret:'secret12300',
    resave:true,
    saveUninitialized:true
}));

// 7. Invocamos al modulo de conexión de la base de datos
const conexion = require('./database/db');

// 8. Estableciendo las rutas
app.get('/',(req, res)=>{
    res.render('index');
});

app.get('/iniciar_session',(req, res)=>{
    res.render('login');
});

app.get('/registro',(req, res)=>{
    res.render('register');
});

// 9. Realizar el registro
app.post('/registro',async(req, res)=>{
    const user = req.body.user;
    const nombre = req.body.nombre;
    const rol = req.body.rol;
    const password = req.body.password;
    let passwordHash = await bcryptjs.hash(password,8);
    conexion.query('INSERT INTO users SET ?',{user:user, nombre:nombre, rol:rol, password:passwordHash}, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
           res.render('register',{
               alert:true,
               alertTitle:"Registro",
               alertMessage:"Registro Exitoso",
               alertIcon:'success',
               showConfirmButton:false,
               timer:1500,
               ruta:''
           });
        }
    });

});

// 10. Autenticación
app.post('/iniciar_session',async(req, res)=>{
    const user = req.body.user;
    const password = req.body.password;
    let passwordHash = await bcryptjs.hash(password,8);
    if(user && password){
        conexion.query('SELECT * FROM users WHERE user = ?',[user], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(password,results[0].password))){
                res.render('login',{
                    alert:true,
                    alertTitle:"Error",
                    alertMessage:"Usuario o Contraseña incorrectos",
                    alertIcon:"error",
                    showConfirmButton:true,
                    timer:1500,
                    ruta:'iniciar_session'
                });
            }else{
                req.session.name = results[0].name
                res.render('login',{
                    alert:true,
                    alertTitle:"Conexión Exitosa",
                    alertMessage:"Inicio de Sessión Exitoso",
                    alertIcon:"success",
                    showConfirmButton:false,
                    timer:1500,
                    ruta:''
                });
            }
        });
    }else{
        res.render('login',{
            alert:true,
            alertTitle:"Advertencia",
            alertMessage:"Por favor Ingrese Usuario o Contraseña",
            alertIcon:"warning",
            showConfirmButton:true,
            timer:2500,
            ruta:'iniciar_session'
        });
    }
});

app.listen(4000, (req, res)=>{
    console.log('Servidor en el puerto: http://localhost:4000');
});


//https://github.com/infodp/login1_nodejs/blob/main/app.js