var Hapi = require('hapi');
var server = new Hapi.Server('localhost', 8000);
var models = require("./models");
var DOMAIN = "tworgy.com";
var crypto = require('crypto');

models.sequelize.sync().success(function () {
  // console.log("Delete all users to begin with for development");
  // models.User.findAll().success(function (users) {
  //   for (var i = 0; i < users.length; i++) {
  //     users[i].destroy();
  //   }
  // });

  server.route({
    method: 'GET',
    path: '/create-new-account',
    handler: function (request, reply) {
      var api_key = crypto.randomBytes(20).toString('hex');
      
      models.User.create({
        username: null,
        email: null,
        api_key: api_key
      }).complete(function(err, user1) {
        console.log('Created user with api_key: ' + api_key + '"');
        reply({api_key: api_key});
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/api/{api_key}/generate-email',
    handler: function (request, reply) {
      models.User.find({api_key: request.params.api_key}).complete(function(err, user) {
        if(user !== undefined && user !== null) {
          if(user.username === "") {
            reply({success: false, error: "Must set a username in options before generating an email"});
          } else if(user.email === "") {
            reply({success: false, error: "Must set a forwarding email address in options before generating an email"});
          } else {
            models.VirtualAlias.count().success(function(count) {
              var email = "alias_" + (count + 1) + "@" + user.domain;
            
              models.VirtualAlias.create({incoming_email: email, UserId: user.id});
              console.log("Generate email => " + email);
              reply({success: true, email: email});
            })
          }
        } else {
          console.log("Could not find user to generate email");
          reply({success: false, error: "Could not find user to generate email for."});
        }
      });
      
    }
  });

  server.route({
    method: 'PUT',
    path: '/api/{api_key}/settings',
    handler: function (request, reply) {
      var settings = JSON.parse(request.payload);
      settings.domain = settings.username + "." + DOMAIN

      models.User.find({api_key: settings.api_key}).complete(function(err, user) {
        if(user !== undefined && user !== null) {
          user.updateAttributes(settings);
          console.log('Updated user with settings =>');
        } else {
          models.User.create(settings);
          console.log('Created user with settings =>');
        }
        console.log(settings);
      });
    }
  });

  server.start(function () {
    console.log('Server running at:', server.info.uri);
  });
});

