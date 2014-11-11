"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    api_key: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    domain: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.VirtualAlias)
      }
    }
  });

  return User;
};