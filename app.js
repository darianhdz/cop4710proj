//https://codehandbook.org/web-app-using-node-js-and-mysql/
//Starting code for node.js
//https://codeshack.io/basic-login-system-nodejs-express-mysql/
//For login authentication

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database : 'gamerecs'
});

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	console.log(username);
	console.log(password);
	if (username && password) {
		var sql = "SELECT * FROM user WHERE email = ? AND password = ?";
		connection.query(sql, [username, password], function(error, results, fields) {
			if (error) {
     console.log(error);
}
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.listen(3000);
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/style',  express.static(__dirname + '/style'));
app.use('/script',  express.static(__dirname + '/script'));


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname + '/templates/home.html'));
})


app.get('/showSignInPage',function(req,res){
    res.sendFile('signin.html',{'root': __dirname + '/templates'});
})

app.get('/showSignUpPage',function(req,res){
  res.sendFile('signup.html',{'root':__dirname + '/templates'})
})

