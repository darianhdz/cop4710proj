//https://codehandbook.org/web-app-using-node-js-and-mysql/
//Starting code for node.js
//https://codeshack.io/basic-login-system-nodejs-express-mysql/
//For login authentication

var express = require('express');
var session = require('express-session');
var passport = require('passport');
var util = require('util');
var SteamStrategy = require('passport-steam').Strategy;
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var SteamStore = require('steam-store');
var store = new SteamStore();
var parse = require('csv-parse/lib/sync');

const SteamApi = require('web-api-steam');

var engine = require('consolidate');
app.engine('html', require('ejs').renderFile);

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
				request.session.password = password;
				response.redirect('/dashboard');
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

app.post('/register', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	console.log(username);
	console.log(password);
	if (username && password) {
		var sql = "INSERT INTO user(User_ID_Steam, email, password) VALUES ('NULL', '"+username+"', '"+password+"')";
		connection.query(sql, [username, password], function(error, results, fields) {
			if (error) {
     console.log(error);
}
			
				request.session.loggedin = true;
				request.session.username = username;
				request.session.password = password;
				response.redirect('/dashboard');
					
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/changeEmail', function(request, response) {
	var oldmail = request.body.oldmail;
	var newmail = request.body.newmail;
	var password = request.body.password;
	if (oldmail && password && newmail) {
		var sql1 = "SELECT * FROM user WHERE email = ? AND password = ?";
		connection.query(sql1, [oldmail, password], function(error, results, fields) {
			if (error) {
     console.log(error);
}
			if (results.length > 0) {
				var sql2 = "UPDATE user SET email = ? WHERE email = ? AND password = ?";
				connection.query(sql2, [newmail, oldmail, password], function(error, results, fields) {
					if (error) {
     console.log(error);
}
					
						response.redirect('/dashboard');
						response.end();
				});
			} else {
				response.send('Incorrect Username and/or Password!');
				response.end();
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/changeWord', function(request, response) {
	var email = request.body.email;
	var oldword = request.body.oldword;
	var newword = request.body.newword;
	if (email && oldword && newword) {
		var sql1 = "SELECT * FROM user WHERE email = ? AND password = ?";
		connection.query(sql1, [email, oldword], function(error, results, fields) {
			if (error) {
     console.log(error);
}
			if (results.length > 0) {
				var sql2 = "UPDATE user SET password = ? WHERE email = ? AND password = ?";
				connection.query(sql2, [newword, email, oldword], function(error, results, fields) {
					if (error) {
     console.log(error);
}
					
						response.redirect('/dashboard');
						response.end();
				});
			} else {
				response.send('Incorrect Username and/or Password!');
				response.end();
			}			
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

app.get('/account',function(req,res){
    res.sendFile('account.html',{'root': __dirname + '/templates'});
})

app.get('/dashboard',function(req,res){
	if(req.session.loggedin == true)
	{
	var name = req.session.username;
	res.render( __dirname + '/templates/dashboard.html', {name: name});
	}
	else
	{
		res.send('Login to see this page');
	}
})

app.get('/showSignInPage',function(req,res){
    res.sendFile('signin.html',{'root': __dirname + '/templates'});
})

app.get('/showSignUpPage',function(req,res){
  res.sendFile('signup.html',{'root':__dirname + '/templates'})
})

app.get('/steamIn',function(req,res){
    res.sendFile('steam.html',{'root': __dirname + '/templates'});
})



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: '8D52CB2267D4B6DFC81D4E2D344C0E65'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));

app.get('/steamSignIn', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/steamSignIn');
  });
  
  app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
	var email = req.session.username;
	var password = req.session.password;
	var user_id = req.user.id;
	if(email && password && user_id)
	{
		var sql = "UPDATE user SET User_ID_Steam = ? WHERE email = ? AND password = ?";
		connection.query(sql, [user_id, email, password], function(error, results, fields) {
					
					
						res.redirect('/dashboard');
						res.end();
				});
	}
  });
  
  function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/dashboard');
}

app.get('/createList', function(req,res) {
	var sql = "SELECT User_ID_Steam FROM user WHERE email = ? and password = ?";
	connection.query(sql, [req.session.username, req.session.password], function(error, results, fields) {
		console.log(results[0].User_ID_Steam);
		req.session.id = results[0].User_ID_Steam;
		SteamApi.getOwnedGames(results[0].User_ID_Steam, '8D52CB2267D4B6DFC81D4E2D344C0E65', (err, data) => {
		if(err) throw err;
		var x = JSON.parse(data);
		req.session.data = x;
		res.redirect('/genreCount'); 
		res.end();
	});
	});
});

app.get('/genreCount', function(req, res) {
	var datum = req.session.data;
	console.log(datum);
	datum.response.games.forEach(function(listItem, index){
		console.log(listItem.appid);
		SteamApi.other(listItem.appid, (err, data) => {
			if(err) throw(err);
			let x = JSON.parse(data);
			console.log(x[listItem.appid].data.genres[0].description);
			//note to future self: access returned data : var x = JSON.parse(data);
			//console.log(x[datum.games[0].appid].data.genres[0].description);
		});
	});
});

app.get('/getGames', function(req,res) {
	res.sendFile('createList.html',{'root': __dirname + '/templates'});
});


