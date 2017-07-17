var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//body parser é um middleware a nivel de aplicacao, ou seja, vai interceptar todas as requisiçoes e pegar os seus jsons
app.use(bodyParser.json());

app.get("/", function(req, res){
	res.send("TODO API Root");
});

app.get("/todos", function(req, res){
	res.json(todos);
});

//colocar :nomeDoParametro quando quiser colocar um parametro adicional	
app.get("/todos/:id", function(req, res){
	var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, {"id": id});
	
	if(matched !== undefined){
		console.log("found " + matched.id);
		res.json(matched);
	}
	console.log("Not found");
	res.status(404).send();
});

app.post("/todos", function(req, res){
    var body = _.pick(req.body, "completed","description","id"); //Return a copy, filtered to only values in whitelisted keys 
    if(! _.isBoolean(body.completed) || ! _.isString(body.description) || body.description.trim().length === 0){
    	res.status(400).send();
    }
    body.description = body.description.trim();
    body.id = todoNextId++;
    todos.push(body);
    console.log("Adicionado com sucesso!");
    res.json(body);
});

app.listen(PORT, function(){
	console.log("Server running at: " + PORT);
});