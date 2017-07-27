var Sequelize = require("sequelize"); //orm para nodejs
var env = process.env.NODE_ENV || "dev";
var sequelize;
if(env !== "dev"){
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        "dialect": "sqlite",
        "storage": __dirname + "/data/dev-todo-api.sqlite"
    });
}

var db = {};

db.todo = sequelize.import(__dirname + "/models/todo.js"); //aponta para o modulo
db.user = sequelize.import(__dirname + "/models/user.js");
db.token = sequelize.import(__dirname + "/models/token.js");
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//faz os relacionamentos usando seguindo o sequelize
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;