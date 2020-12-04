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
					request.session.username = newmail;
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
					request.session.password = newword;
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

app.post('/remove', function(request, response) {
	var email = request.body.email;
	var password = request.body.password;
	if (email && password) {
		var sql1 = "DELETE FROM user WHERE email = ? AND password = ?";
		connection.query(sql1, [email, password], function(error, results, fields) {
			if (error) {
     			console.log(error);
			}
			
				response.redirect('/');
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

app.get('/account',function(req,res){
    res.sendFile('account.html',{'root': __dirname + '/templates'});
})

app.get('/viewList', function(req, res) {
	var sql = "SELECT * FROM recommendation_list WHERE User_User_ID_Steam = ?";
	connection.query(sql, [req.session.steamid], function(error, results, fields) {
		if(error){console.log(error);}
		var x = results;
		console.log(x);
		sql = "SELECT Game_Tag1, COUNT(*) AS tags FROM recommendation_list GROUP BY Game_Tag1 ORDER BY COUNT(*) DESC LIMIT 3";
		connection.query(sql, function(error, results, fields) {
			if(error){console.log(error);}
			console.log(x);
			res.render(__dirname + '/templates/lists.html', {list: x, top: results});	
			res.end();
		});
	});		
});

app.get('/dashboard',function(req,res){
	if(req.session.loggedin == true) {
		var name = req.session.username;
		res.render( __dirname + '/templates/dashboard.html', {name: name});
	} else {
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

app.get('/createListPage' ,function(req,res){
	res.sendFile('createList.html', {'root': __dirname + '/templates'});
});

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
	req.session.steamid = user_id;
	if(email && password && user_id) {
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

app.post('/creator', function(req,res) {
	//https://steamcdn-a.akamaihd.net/steam/apps/<APPID>/header.jpg format to get image of game
	console.log(req.session.steamid);
	var url1 = 'https://steamcdn-a.akamaihd.net/steam/apps/';
	var url2 = '/header.jpg';
	var user_tag1, user_tag2, user_tag3;
	user_tag1 = req.body.tag1;
	user_tag2 = req.body.tag2;
	user_tag3 = req.body.tag3;
	req.session.tag1 = user_tag1;
	req.session.tag2 = user_tag2;
	req.session.tag3 = user_tag3;
	if(user_tag1 && user_tag2 && user_tag3)
	{
		console.log(user_tag1);
		var sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ? AND all_games.Game_Tag2 = ? AND all_games.Game_Tag3 = ?";
		connection.query(sql, [user_tag1, user_tag2, user_tag3], function(error, results, fields) {
			if (error) {
				console.log(error);
			}
			if(results.length > 0)
			{
				var rows = results[0].Name;
				var hash = results[0].Game_ID;
				var urlImg = url1 + hash + url2;
				req.session.gamedata = results[0];
				console.log(urlImg);
				res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
				console.log(req.session.gamedata.Game_ID);
			}
			else
			{
				sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ? AND all_games.Game_Tag2 = ?";
				connection.query(sql, [user_tag1, user_tag2], function(error, results, fields) {
					if (error) {
						console.log(error);
					}
					if(results.length > 0)
					{
						var rows = results[0].Name;
						var hash = results[0].Game_ID;
						var urlImg = url1 + hash + url2;
						req.session.gamedata = results[0];
						res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
						
					}
					else
					{
						sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
						connection.query(sql, [user_tag1], function(error, results, fields) {
								if (error) {
									console.log(error);
								}
								if(results.length > 0)
								{
									var rows = results[0].Name;
									var hash = results[0].Game_ID;
									var urlImg = url1 + hash + url2;
									req.session.gamedata = results[0];
									res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
									
								}
						});
					}
				});
			}
		});
		
	}
	
	
});

app.post('/builderYes', function(req,res) {
	var url1 = 'https://steamcdn-a.akamaihd.net/steam/apps/';
	var url2 = '/header.jpg';
	var steamid = req.session.steamid;
	var gameid = req.session.gamedata.Game_ID;
	var name = req.session.gamedata.Name;
	var tag1 = req.session.gamedata.Game_Tag1;
	var tag2 = req.session.gamedata.Game_Tag2;
	var tag3 = req.session.gamedata.Game_Tag3;
	var sql = "SELECT * FROM recommendation_list WHERE Game_ID = ? AND User_User_ID_Steam = ?";
	connection.query(sql, [gameid, steamid], function(error, results, fields) {
		if(error){console.log(error)};
		if(results.length < 1)
		{
			sql = "INSERT INTO recommendation_list(User_User_ID_Steam, Game_ID, Game_Tag1, Name, Game_Tag2, Game_Tag3) VALUES ('"+steamid+"', '"+gameid+"', '"+tag1+"', '"+name+"', '"+tag2+"', '"+tag3+"')";
			connection.query(sql, [steamid, gameid, tag1, name, tag2, tag3], function(error, results, fields) {
				if(error){ console.log(error)};
				sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ? AND all_games.Game_Tag2 = ? AND all_games.Game_Tag3 = ?";
				connection.query(sql, [tag1, tag2, tag3], function(error, results, fields) {
					if (error) {
						console.log(error);
					}
					if(results.length > 0)
					{
						var rows = results[0].Name;
						var hash = results[0].Game_ID;
						var urlImg = url1 + hash + url2;
						console.log(urlImg);
						req.session.gamedata = results[0];
						console.log(req.session.gamedata.Game_ID);
						res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
						
					}
					else
					{
						sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ? AND all_games.Game_Tag2 = ?";
						connection.query(sql, [tag1, tag2], function(error, results, fields) {
							if (error) {
								console.log(error);
							}
							if(results.length > 0)
							{
								var rows = results[0].Name;
								var hash = results[0].Game_ID;
								var urlImg = url1 + hash + url2;
								req.session.gamedata = results[0];
								console.log(req.session.gamedata.Game_ID);
								res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
								
							}
							else
							{
								sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
								connection.query(sql, [tag1], function(error, results, fields) {
										if (error) {
											console.log(error);
										}
										if(results.length > 0)
										{
											var rows = results[0].Name;
											var hash = results[0].Game_ID;
											var urlImg = url1 + hash + url2;
											req.session.gamedata = results[0];
											console.log(req.session.gamedata.Game_ID);
											res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
											
										}
								});
							}
						});
					}
				});
			});
		}
		else
		{
						sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ? AND all_games.Game_Tag2 = ?";
						connection.query(sql, [tag2, tag1], function(error, results, fields) {
							if (error) {
								console.log(error);
							}
							if(results.length > 0)
							{
								var rows = results[0].Name;
								var hash = results[0].Game_ID;
								var urlImg = url1 + hash + url2;
								req.session.gamedata = results[0];
								console.log(req.session.gamedata.Game_ID);
								res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
								
							}
							else
							{
								sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
								connection.query(sql, [tag1], function(error, results, fields) {
										if (error) {
											console.log(error);
										}
										if(results.length > 0)
										{
											var rows = results[0].Name;
											var hash = results[0].Game_ID;
											var urlImg = url1 + hash + url2;
											req.session.gamedata = results[0];
											console.log(req.session.gamedata.Game_ID);
											res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
											
										}
										else
										{
											sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
											connection.query(sql, [tag2], function(error, results, fields) {
													if (error) {
														console.log(error);
													}
													if(results.length > 0)
													{
														var rows = results[0].Name;
														var hash = results[0].Game_ID;
														var urlImg = url1 + hash + url2;
														req.session.gamedata = results[0];
														console.log(req.session.gamedata.Game_ID);
														res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
														
													}
													else
													{
														sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
														connection.query(sql, [tag3], function(error, results, fields) {
															if (error) {
																console.log(error);
															}
															if(results.length > 0)
															{
																var rows = results[0].Name;
																var hash = results[0].Game_ID;
																var urlImg = url1 + hash + url2;
																req.session.gamedata = results[0];
																console.log(req.session.gamedata.Game_ID);
																res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
																
															}
														});
													}
													
											});
										}
								});
							}
						});
		}
	});
	
	
});

app.post('/builderNo', function(req,res) {
	
	var url1 = 'https://steamcdn-a.akamaihd.net/steam/apps/';
	var url2 = '/header.jpg';
	var steamid = req.session.steamid;
	var gameid = req.session.gamedata.Game_ID;
	var name = req.session.gamedata.Name;
	var tag1 = req.session.gamedata.Game_Tag1;
	var tag2 = req.session.gamedata.Game_Tag2;
	var tag3 = req.session.gamedata.Game_Tag3;
			var sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
								connection.query(sql, [tag3], function(error, results, fields) {
										if (error) {
											console.log(error);
										}
										if(results.length > 0)
										{
											var rows = results[0].Name;
											var hash = results[0].Game_ID;
											var urlImg = url1 + hash + url2;
											req.session.gamedata = results[0];
											console.log(req.session.gamedata.Game_ID);
											res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
											
										}
										else
										{
											sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
											connection.query(sql, [tag2], function(error, results, fields) {
												if (error) {
													console.log(error);
												}
												if(results.length > 0)
												{
													var rows = results[0].Name;
													var hash = results[0].Game_ID;
													var urlImg = url1 + hash + url2;
													req.session.gamedata = results[0];
													console.log(req.session.gamedata.Game_ID);
													res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
													
												}
												else
												{
													sql = "SELECT all_games.Game_ID, all_games.Game_Tag1, all_games.Game_Tag2, all_games.Game_Tag3, all_games.Name FROM all_games LEFT JOIN recommendation_list ON all_games.Game_ID = recommendation_list.Game_ID WHERE recommendation_list.Game_ID IS NULL AND all_games.Game_Tag1 = ?";
													connection.query(sql, [tag1], function(error, results, fields) {
														if (error) {
															console.log(error);
														}
														if(results.length > 0)
														{
															var rows = results[0].Name;
															var hash = results[0].Game_ID;
															var urlImg = url1 + hash + url2;
															req.session.gamedata = results[0];
															console.log(req.session.gamedata.Game_ID);
															res.render(__dirname + '/templates/listViewer.html', {data: rows, urlImg: urlImg, id: hash});
															
														}
													});
												}
											});
										}
								});
		

});

app.get('/getGames', function(req,res) {
	res.sendFile('createList.html',{'root': __dirname + '/templates'});
});




