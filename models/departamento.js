const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('departamento', {
    cod: {
      autoIncrement: true,
      type: DataTypes.TINYINT,
      allowNull: false,
      primaryKey: true,
      comment: "llave primaria del depoartamento"
    },
    nombre: {
      type: DataTypes.CHAR(50),
      allowNull: false,
      comment: "nombre del departamento"
    },
    cod_pais: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true,
      comment: "llave foranea de la tabla pais"
    }
  }, {
    sequelize,
    tableName: 'departamento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cod" },
          { name: "cod_pais" },
        ]
      },
    ]
  });
};
