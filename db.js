var Sequelize = require("sequelize"); //orm para nodejs
var sequelize = new Sequelize(undefined, undefined, undefined, {
    "dialect": "sqlite",
    "storage": __dirname + "/data/dev-todo-api.sqlite"
});

var db = {};

db.todo = sequelize.import(__dirname + "/models/todo.js"); //aponta para o modulo
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;