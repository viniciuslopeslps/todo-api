var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	"id": 1,	
	"desciption": "meet mom for lunch",
	"completed": false
},{
	"id": 2,	
	"desciption": "go to market",
	"completed": false
}];


app.get("/", function(req, res){
	res.send("TODO API Root");
});

app.get("/todos", function(req, res){
	res.json(todos);
});

//colocar :nomeDoParametro quando quiser colocar um parametro adicional	
app.get("/todos/:id", function(req, res){
	var id = parseInt(req.params.id);
	var matched;
	for(var i=0; i < todos.length;i++){
		if(todos[i].id == id){
			matched = todos[i];
			break;
		}
	}

	if(matched !== undefined){
		console.log("found " + matched);
		res.json(matched);
	}
	console.log("Not found");
	res.status(404).send();
});

app.listen(PORT, function(){
	console.log("Server running at: " + PORT);
});