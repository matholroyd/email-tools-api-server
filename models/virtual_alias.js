"use strict";

module.exports = function(sequelize, DataTypes) {
  var VirtualAlias = sequelize.define("VirtualAlias", {
    incoming_email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        VirtualAlias.belongsTo(models.User)
      }
    }
  });

  return VirtualAlias;
};