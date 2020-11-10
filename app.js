//https://codehandbook.org/web-app-using-node-js-and-mysql/
//Starting code for node.js
//https://codeshack.io/basic-login-system-nodejs-express-mysql/
//For login authentication

var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.post('/auth', function(request, response) {
	console.log('it worked');
	var email = request.body.email;
	var password = request.body.password;
	console.log('it worked');
	if (email && password) {
		var sql = "SELECT * FROM user WHERE email = ? AND password = ?";
		console.log('it worked');
		connection.query(sql,[email, password], function(error, results)
		{
			if(results.length > 0)
			{
				console.log('it worked');
			}
			else
			{
				console.log('boo');
			}
		});
	}
});

app.post('/register', function(request, response) {
	var email = request.body.email;
	var password = request.body.password;
	if (email && password) {
		connection.query("INSERT INTO user(User_ID_Steam,email, password) VALUES (NULL,'+email+', '+password+')", [email, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.email = email;
				response.redirect('/');
			} 
			response.end();
		});
	} else {
		response.send('Please enter Email and Password!');
		response.end();
	}
});


app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/style',  express.static(__dirname + '/style'));
app.use('/script',  express.static(__dirname + '/script'));


app.get('/',function(req,res){
    res.sendFile('home.html',{'root': __dirname + '/templates'});
})


app.get('/showSignInPage',function(req,res){
    res.sendFile('signin.html',{'root': __dirname + '/templates'});
	console.log('it worked');
})

app.get('/showSignUpPage',function(req,res){
  res.sendFile('signup.html',{'root':__dirname + '/templates'})
})

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database : 'gamerecs'
});

connection.connect((err) => {
 if(!err)
 {
    console.log('Database is connected!');
  }
 
else
    console.log('Database not connected! : '+ JSON.stringify(err, undefined,2));
});

app.listen(3000);
