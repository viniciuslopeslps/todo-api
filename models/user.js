var bcrypt = require("bcrypt");
var _ = require("underscore");
var cryptojs = require("crypto-js");
var jwt = require("jsonwebtoken");

module.exports = function(sequelize, DataTypes){
	var user = sequelize.define('user', {
		"email": {
			"type": DataTypes.STRING,
			"allowNull": false,
			"unique": true,
			"validate": {
				"isEmail": true
			}
		},
		"salt":{
			"type": DataTypes.STRING
		},
		"password_hash": {
			"type": DataTypes.STRING
		},
		"password": {
			"type": DataTypes.VIRTUAL,
			"allowNull": false,
			"validate":{
				len: [7, 100]
			},
			set: function(value){ //criando um "set" para a senha
				var salt = bcrypt.genSaltSync(10); //tipo de código para se único
				var hashedPassword = bcrypt.hashSync(value, salt);
				//armazena virtualmente
				this.setDataValue("password", value);
				this.setDataValue("salt", salt);
				this.setDataValue("password_hash", hashedPassword);
			}
		}
	},{
		"hooks":{
			//é possível executar funcoes antes e depois de inserir um dado
			//estamos colocando um email para lowercase
			"beforeValidate": function(user, options){
				if(typeof user.email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		},
		"classMethods":{
			authenticate: function(body){
				return new Promise(function(resolve, reject){
					if(typeof body.email !== "string" || typeof body.password !== "string"){
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user){
						if(!user || !bcrypt.compareSync(body.password, user.get("password_hash"))){
							return reject();   
						}
						resolve(user);
					}, function(e){
						reject();
					})
				});
			},
            findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						var decodedJWT = jwt.verify(token, 'jwtpassword');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'cryptoPwd');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function (user) {
							if (user) {
								resolve(user);
							} else {
								reject();
							}
						}, function (e) {
                            console.log(e);
							reject();
						});
					} catch (e) {
                        console.log(e);
						reject();
					}
				});
			}
		},
		"instanceMethods": {
			"toPublicJson": function(){
				var json = this.toJSON();
				return _.pick(json, "id", "email", "updatedAt", "createdAt");
			},
			"generateToken": function(type){
				if(!_.isString(type)){
					return undefined;
				}
				try {
					var stringData = JSON.stringify({"id": this.get("id"), "type": type}); //cria uma string com o json dos dados
					var encryptedData = cryptojs.AES.encrypt(stringData, "cryptoPwd").toString(); //encriptografa
					var token = jwt.sign({
						"token": encryptedData
					}, "jwtpassword");
                    
					return token;
				} catch(e) {
					console.log(e);
					return undefined;
				}
			}
		}
	});
	return user;
}