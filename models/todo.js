module.exports = function(sequelize, DataTypes){
    //CRIA O MODELO [TODO] USADO NO SEQUELIZE
    return sequelize.define("todo", {
       "description":{
           "type": DataTypes.STRING,
           "allowNull": false,
           "validate":{
               len:[1, 250]
           }
         },
        "completed": {
          "type": DataTypes.BOOLEAN,
          "allowNull": false,
          "defaultValue": false
        }
    },{
        "hooks":{
            //é possível executar funcoes antes e depois de inserir um dado
            //estamos colocando um email para lowercase
            "beforeCreate": function(todo, options){
                if(typeof todo.description === 'string'){
                    todo.description = todo.description.trim();
                }
            }
        }
    });
};