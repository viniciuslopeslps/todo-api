var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");
var bcrypt = require("bcrypt");
var middleware = require("./middleware.js")(db);

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
app.get("/todos", middleware.requireAuthentication, function(req, res){
	//tudo que vem como uma query no parametro 
	var queryParams = req.query;

	var where = {};

	if( queryParams.hasOwnProperty("completed") && queryParams.completed==="true"){
		where.completed = true;
	}else if(queryParams.hasOwnProperty("completed") && queryParams.completed==="false"){
		where.completed = false;
	}
	if(queryParams.hasOwnProperty("q") && queryParams.q.length > 0){
		where.description = {
			$like: "%" + queryParams.q + "%"
		};
    }
    db.todo.findAll({where: where}).then(function(todos){
    	res.json(todos);
    }, function(e){
    	res.status(500).send(); 
    });

    //sem o sequelize
	//var filteredTodos = todos;

	//if( queryParams.hasOwnProperty("completed") && queryParams.completed==="true"){
	//	filteredTodos = _.where(filteredTodos, {completed:true})
	//}else if(queryParams.hasOwnProperty("completed") && queryParams.completed==="false"){
	//		filteredTodos = _.where(filteredTodos, {completed:false})
	//}
    
    //if(queryParams.hasOwnProperty("q") && queryParams.q.length > 0){
    //   filteredTodos = _.filter(filteredTodos, function(item){ 
    //       return item.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1
    //   });
    //}

	//res.json(filteredTodos);
});

//colocar :nomeDoParametro quando quiser colocar um parametro adicional	
app.get("/todos/:id", middleware.requireAuthentication, function(req, res){
	var id = parseInt(req.params.id);

	db.todo.findById(id).then(function(todo){
		if(!!todo){
			res.json(todo.toJSON())
		}else{
			res.status(404).json({"error":"Not found"});
		}
	}, function(e){
		res.status(500).json(e);
	});

	//var matched = _.findWhere(todos, {"id": id});
	
	//if(matched !== undefined){
	//	console.log("found " + matched.id);
	//	res.json(matched);
	//}
	//console.log("Not found");
	//res.status(404).send();
});

app.post("/todos", middleware.requireAuthentication, function(req, res){
    var body = _.pick(req.body, "completed", "description"); //Return a copy, filtered to only values in whitelisted keys 
    body.description = body.description.trim();
    db.todo.create(body).then(function (todo) {
    	//res.user abaixo foi adicionado do requireAuthentication
    	req.user.addTodo(todo).then(function(){
    		return todo.reload();
    	}).then(function(todo){
    		res.json(todo.toJSON());
    	})
	}, function (e) {
		res.status(400).json(e);
	});                  
          
    //FEITO SEM USARO O SEQUELIZE
//    if(! _.isBoolean(body.completed) || ! _.isString(body.description) || body.description.trim().length === 0){
//    	res.status(400).send();
//    }
//    body.description = body.description.trim();
//    body.id = todoNextId++;
//    todos.push(body);
//    console.log("Adicionado com sucesso!");
//    res.json(body);
});

app.delete("/todos/:id", middleware.requireAuthentication, function(req, res){
	var id = parseInt(req.params.id, 10);
    db.todo.destroy({
        where: {
            id: id
        }
    }).then(function(rowsDeleted){
        if(rowsDeleted === 0){
            res.status(404).json({
                "error": "Not Found with id"
            });
        }else{
            res.status(204).json({
                "deleted": "Deleted todo with id" + id
            });
        }
    }, function(){
        res.send(500).send();
    });
    
    
	//var matched = _.findWhere(todos, {"id": id});
	//if(!matched){
	//	res.status(400).json({"error": "Not found"});
	//}
	//todos = _.without(todos, matched);
	//console.log("Removido com sucesso!");
	//res.json(matched);
});

app.put("/todos/:id", middleware.requireAuthentication, function(req, res){
    var id = parseInt(req.params.id);
    var body = _.pick(req.body, "completed","description");
    var validAttributes = {}; 

    if(body.hasOwnProperty("completed")){
        validAttributes.completed = body.completed;
    }
    if(body.hasOwnProperty("description")){
        validAttributes.description = body.description;
    }

    db.todo.findById(id).then(function(todo){
    	if(todo){
    		todo.update(validAttributes).then(function(todo){
    			res.json(todo.toJSON());
    		},function(e){
    			res.status(400).json({"error": e})
    		})
    	}else{
    		res.status(404).send();
    	}
    },function(e){
    	res.status(500).json({"error": e})
    });

    ///sem sequilize
	//var matched = _.findWhere(todos, {"id": id});
	//if(!matched){
	//	return res.status(404).json({"error": "Not found"});
	//}

    
    //if(body.hasOwnProperty("completed") && _.isBoolean(body.completed)){
    //    validAttributes.completed = body.completed;
    //}
    //else{
    //    return res.status(400).send();
    //}
    
    // if(body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length > 0){
    //    validAttributes.description = body.description;
    //}
    //else{
    //    return res.status(400).send();
    //}
    
    //_.extend(matched, validAttributes);
    //res.json(matched);
});

app.post("/users", function(req, res){
    var body = _.pick(req.body, "email", "password"); //Return a copy, filtered to only values in whitelisted keys 
    db.user.create(body).then(function (user) {
		res.json(user.toPublicJson());
	}, function (e) {
		res.status(400).json(e);
	});                  
});

app.post("/users/login", function(req, res){
    var body = _.pick(req.body, "email", "password"); //Return a copy, filtered to only values in whitelisted keys 
    
    db.user.authenticate(body).then(function(user){
    	var token = user.generateToken('authentication');
    	if(token !==undefined){
    		res.header("Auth", token).json(user.toPublicJson());
    	}else{
    		res.status(401).send();
    	}
    },function(e){
    	res.status(401).send();
    });
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});