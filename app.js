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

app.listen(PORT, function(){
	console.log("Server running at: " + PORT);
});