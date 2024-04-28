const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('camaras', {
    id: {
      autoIncrement: true,
      type: DataTypes.MEDIUMINT,
      allowNull: false,
      primaryKey: true,
      comment: "Código que identifica cada cámara"
    },
    nombre: {
      type: DataTypes.CHAR(50),
      allowNull: false,
      comment: "Identificador en texto que se le dará a cada cámara"
    },
    id_ciudad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Identifica la ciudad en la que está instalada la cámara"
    },
    gps: {
      type: DataTypes.CHAR(80),
      allowNull: false,
      comment: "Link de la posición geográfica donde se encuentra instalada esa cámara"
    },
    detalles_tecnicos: {
      type: DataTypes.CHAR(100),
      allowNull: false,
      comment: "Datos técnicos de la cámara y el dispositivo electrónico"
    },
    mac: {
      type: DataTypes.CHAR(60),
      allowNull: false,
      comment: "Mac de la tarjeta de red del dispositivo que controla la cámara"
    },
    posicion: {
      type: DataTypes.CHAR(20),
      allowNull: false,
      comment: "Indica si está de frente ó detrás del vehículo que está leyendo"
    },
    latitud: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitud: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'camaras',
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
      {
        name: "id_ciudad",
        using: "BTREE",
        fields: [
          { name: "id_ciudad" },
        ]
      },
    ]
  });
};
