const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('detecciones', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      comment: "Código que identificará cada detección de cada cámara"
    },
    fecha_sys: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha y hora en que la detección llegó al servidor"
    },
    id_camara: {
      type: DataTypes.MEDIUMINT,
      allowNull: false,
      comment: "Identifica la cámara que envió la detección"
    },
    dato_detectado: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      comment: "Letras de la placa que la API detectó"
    },
    dato_detectado2: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    dato_detectado3: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    color: {
      type: DataTypes.CHAR(25),
      allowNull: true,
      comment: "Color del vehículo que fue detectado"
    },
    marca: {
      type: DataTypes.CHAR(40),
      allowNull: true,
      comment: "Marca del vehículo que fue detectado"
    },
    tipo_vehiculo: {
      type: DataTypes.CHAR(30),
      allowNull: true,
      comment: "Identifica si el vehículo es moto o carro"
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "porcentaje de efectividad de la captura"
    },
    foto: {
      type: DataTypes.BLOB,
      allowNull: false,
      comment: "permite almacenar la foto de la deteccion que registro"
    }
  }, {
    sequelize,
    tableName: 'detecciones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
