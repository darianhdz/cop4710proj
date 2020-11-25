const fs = require("fs");
const mysql = require('mysql');
const SteamApi = require('web-api-steam');
const https = require('https');

var url = new URL("https://www.steamspy.com/api.php?request=appdetails");


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
	password: 'password',
    database: 'gamerecs'
});


connection.connect();

fs.readFile("./games.json", (err, data) => {
    //data = JSON.parse(data).applist.apps;
   /* for(let i = 0; i < data.length; i++) {
        connection.query('INSERT INTO `steam_games` (`appid`, `name`) VALUES (?, ?);', [data[i].appid, data[i].name], (error) => { 
            if (error) { 
                console.log("i: %d\nappid: %d\ngame: %s", i, data[i].appid, data[i].name);
                throw error;} 
        });
    }*/
	url.searchParams.append('appid', 730);
	https.get('https://www.steamspy.com/api.php?request=appdetails&appid=730', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
});




