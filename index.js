const bcrypt = require('bcryptjs');
const express = require('express');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
// load the environment variables from the .env file
dotenv.config();
const jwt_secret = process.env.SECRET_JWT;

const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = 3000;
const sequelize = new Sequelize('comuniso_placas_ia', 'comuniso_user_placas_ia', 'Placas2024*IA', {
    host: 'comunisoft.com',
    dialect: 'mysql'
  });

  Date.prototype.isValid = function () {
 
    // If the date object is invalid it
    // will return 'NaN' on getTime()
    // and NaN is never equal to itself
    return this.getTime() === this.getTime();
};

const Detecciones = require("./models/detecciones")(sequelize, Sequelize.DataTypes);
const Camaras = require("./models/camaras")(sequelize, Sequelize.DataTypes);
const Departamento = require("./models/departamento")(sequelize, Sequelize.DataTypes);
const Ciudad = require("./models/ciudad")(sequelize, Sequelize.DataTypes);
const Usuarios = require("./models/usuarios")(sequelize, Sequelize.DataTypes);
// Relaciona las tablas Departamento con Deteccionas así como Departamento con Camaras, la llave foránea de Departamento es cod

Camaras.hasMany(Detecciones, {
    foreignKey: "id_camara"
});
Detecciones.belongsTo(Camaras, {
    foreignKey: "id_camara"
});

Ciudad.hasMany(Camaras, {
    foreignKey: "id_ciudad",
});

Camaras.belongsTo(Ciudad, {
    foreignKey: "id_ciudad",
    targetKey: "id"
});

Departamento.hasMany(Ciudad, {
    foreignKey: "cod_departamento"
});

Ciudad.belongsTo(Departamento, {
    foreignKey: "cod_departamento",
    targetKey: "cod"
});

// Utils
const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const checkIfEmailExists = async (req, res, next) => {
    const { email } = req.body;
    const usuario = await Usuarios.findOne({
        where: {
            email: email
        }
    });
    if (usuario) {
        res.status(400).json({message: "El email ya está registrado!"});
        return;
    }
    next();
}

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization
    if (!token) {
        res.status(401).json({message: "No autorizado", status: false });
        return;
    }
    jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
            res.status(401).json({message: "No autorizado", status: false});
            return;
        }
        req.data = decoded;
        next();
    });
};


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/js", express.static(__dirname + '/placas/js'));
app.use("/css", express.static(__dirname + '/placas/css'));
app.use("/images", express.static(__dirname + '/placas/images'));
app.use(cookieParser());
const toBoo = (value) => {
    return value === "true" ? true : false;
}

app.get("/", isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/placas/index.html');
})

app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/placas/login.html');
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + '/placas/register.html');
});

app.get('/api/auth/check', isAuthenticated, (req, res) => {
    res.status(200).json({message: "Usuario logueado correctamente", status: true, data: req.data});
});

app.post('/api/auth/register', checkIfEmailExists, async (req, res) => {
    const { email, password, nombres, apellidos, telefono } = req.body;
    const fecha_sys = new Date();
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
    // find if the user already exists
        const usuario = await Usuarios.create({
            email: email,
            password: hashedPassword,
            nombres: nombres,
            apellidos: apellidos,
            celular: telefono,
            fecha_sys: fecha_sys
        });
        const token = jwt.sign({id: usuario.cod, nombres: usuario.nombres, apellidos: usuario.apellidos, telefono: usuario.celular, email: usuario.email }, jwt_secret, {expiresIn: '1h'});
        // make the cookie with an expiration time of 1 hour
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.status(200).json({message: "Usuario registrado correctamente"});
    } catch (error) {
        res.status(500).json({message: "Error al registrar el usuario"});
        return;
    }

})

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuarios.findOne({
        where: {
            email: email
        }
    });
    if (!usuario) {
        res.status(400).json({message: "El usuario no existe"});
        return;
    }
    if (!bcrypt.compareSync(password, usuario.password)) {
        res.status(400).json({message: "La contraseña es incorrecta"});
        return;
    }
    const token = jwt.sign({id: usuario.cod, nombres: usuario.nombres, apellidos: usuario.apellidos, telefono: usuario.celular, email: usuario.email }, jwt_secret, {expiresIn: '1h'});
    // make the cookie with an expiration time of 1 hour
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.status(200).json({message: "Usuario logueado correctamente"});
});

app.post('/api/auth/logout', (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true });
        res.status(200).json({message: "Logout correcto", success: true });
    } catch(err) {
        res.status(500).json({message: "No se pudo eliminar la cookie, posiblemente no exista.", success: false})
    }
})

app.get('/api/get-plates', isAuthenticated, async (req, res) => {
    const idRegistro = req.query.idRegistro;
    const repetirRegistros = req.query.repetirRegistros;
    const fechaActual = new Date().toISOString().split("T")[0];
    const fechaInicio = new Date(req.query.fechaInicio).isValid() ? req.query.fechaInicio : "2023-01-01";
    const fechaFinal = new Date(req.query.fechaFinal).isValid() ? req.query.fechaFinal : fechaActual;
    if(idRegistro) {
        const detecciones = await Detecciones.findByPk(idRegistro, {
            include: [
                {
                    model: Camaras,
                    required: true,                
                    include: [
                        {
                            model: Ciudad,
                            required: true,          
                        }
                    ],
                }
            ],
            attributes: {exclude: ['dato_detectado2', 'dato_detectado3']}
        });
        res.send(detecciones);
        return;
    }
    let parametros = {
        where: {
            fecha_sys: {
                [Sequelize.Op.between]: [fechaInicio, fechaFinal]
            }
        },
        include: [
            {
                model: Camaras,
                required: true,                
                include: [
                    {
                        model: Ciudad,
                        required: true,          
                    }
                ],
            }
        ],
        attributes: {exclude: ['foto', 'dato_detectado2', 'dato_detectado3']},
        order: [
            ["id", "ASC"]
        ]
    };
    if (!toBoo(repetirRegistros)) {
        parametros.group = ["dato_detectado"];
    }
    const detecciones = await Detecciones.findAll(parametros)
    res.send(detecciones)
    // show how many records were found
    console.log(detecciones.length);
    console.log(toBoo(repetirRegistros));
    ;
});

app.get('/api/get-cities', isAuthenticated, async (req, res) => {
    const parametros = {
        include: [
            {
                model: Departamento,
                required: true,
            }
        ],
        // order by ascendent cod:
        order: [
            ["cod", "ASC"]
        ]
    };
    const cities = await Ciudad.findAll(parametros);
    res.send(cities);
    console.log(cities.length);
});

app.get('/api/get-departments', isAuthenticated, async (req, res) => {
    const departments = await Departamento.findAll();
    res.send(departments);
    console.log(departments.length);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});