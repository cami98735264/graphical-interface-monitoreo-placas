const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ciudad', {
    id: {
      autoIncrement: true,
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true,
      comment: "consecutivo de identificacion de esta ciudad en pay bluem"
    },
    cod: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      comment: "llave primaria, codigo de la ubicacion del usuario"
    },
    nombre_ciudad: {
      type: DataTypes.CHAR(70),
      allowNull: false,
      comment: "nombre de la ciudad"
    },
    cod_departamento: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: "llave foranea de la tabla departamento"
    }
  }, {
    sequelize,
    tableName: 'ciudad',
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
        name: "llave compuesta",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cod" },
          { name: "cod_departamento" },
        ]
      },
    ]
  });
};
