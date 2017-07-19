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

//get /todos?completed=true&q=work (usando query filter)
app.get("/todos", function(req, res){
	//tudo que vem como uma query no parametro 
	var queryParams = req.query;
	var filteredTodos = todos;

	if( queryParams.hasOwnProperty("completed") && queryParams.completed==="true"){
		filteredTodos = _.where(filteredTodos, {completed:true})
	}else if(queryParams.hasOwnProperty("completed") && queryParams.completed==="false"){
			filteredTodos = _.where(filteredTodos, {completed:false})
	}
    
    if(queryParams.hasOwnProperty("q") && queryParams.q.length > 0){
       filteredTodos = _.filter(filteredTodos, function(item){ 
           return item.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1
       });
    }

	res.json(filteredTodos);
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
    var body = _.pick(req.body, "completed","description"); //Return a copy, filtered to only values in whitelisted keys 
    if(! _.isBoolean(body.completed) || ! _.isString(body.description) || body.description.trim().length === 0){
    	res.status(400).send();
    }
    body.description = body.description.trim();
    body.id = todoNextId++;
    todos.push(body);
    console.log("Adicionado com sucesso!");
    res.json(body);
});

app.delete("/todos/:id", function(req, res){
	var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, {"id": id});
	if(!matched){
		res.status(400).json({"error": "Not found"});
	}
	todos = _.without(todos, matched);
	console.log("Removido com sucesso!");
	res.json(matched);
});

app.put("/todos/:id", function(req, res){
    var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, {"id": id});
	if(!matched){
		return res.status(404).json({"error": "Not found"});
	}
    var body = _.pick(req.body, "completed","description");
    var validAttributes = {}; 
    
    if(body.hasOwnProperty("completed") && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    }
    else{
        return res.status(400).send();
    }
    
     if(body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    }
    else{
        return res.status(400).send();
    }
    
    _.extend(matched, validAttributes);
    res.json(matched);
});

app.listen(PORT, function(){
	console.log("Server running at: " + PORT);
});