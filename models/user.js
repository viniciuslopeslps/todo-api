module.exports = function(sequelize, DateTypes){
    return sequelize.define('user', {
        "email": {
            "type": DateTypes.STRING,
            "allowNull": false,
            "unique": true,
            "validate": {
                "isEmail": true
            }
        },
        "password": {
            "type": DateTypes.STRING,
            "allowNull": false,
            "validate":{
                len: [7, 100]
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
        }
    });
}