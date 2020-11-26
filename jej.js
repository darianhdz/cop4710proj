const got = require('got');
const jsdom = require("jsdom");
const fs = require("fs");
const mysql = require('mysql');
const { JSDOM } = jsdom;

var vgmUrl= 'https://steamspy.com/app/';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
	password: 'password',
    database: 'gamerecs'
});

connection.connect();

const isMidi = (link) => {
  // Return false if there is no href attribute.
  if(typeof link.href === 'undefined') { return false }

  return link.href.includes('/tag');
};

const noParens = (link) => {
  // Regular expression to determine if the text has parentheses.
  const parensRegex = /^((?!\().)*$/;
  return parensRegex.test(link.textContent);
};

fs.readFile("./games.json", (err, data) => {
	data = JSON.parse(data).applist.apps;
(async () => {
	for(let i = 0; i < data.length; i++)
	{
		console.log(data[i].name);
		console.log(data[i].appid);
		vgmUrl += data[i].appid;
		const response = await got(vgmUrl);
		const dom = new JSDOM(response.body);

		// Create an Array out of the HTML Elements for filtering using spread syntax.
		const nodeList = [...dom.window.document.querySelectorAll('a')];

		var x = 0;
		var y = 0;
		var tag1, tag2, tag3;
		nodeList.filter(isMidi).filter(noParens).forEach(link => {
		if(x > 22)
		{
		  if(y == 0)
		  {
			  tag1 = link.href;
		  }
		  else if(y == 1)
		  {
			  tag2 = link.href;
		  }
		  else if(y == 2)
		  {
			  tag3 = link.href;
		  }
		  y++;
		}
		x++;
		});
		console.log(tag1);
		console.log(tag2);
		console.log(tag3);
		if(tag1 != null && tag2 != null && tag3 != null)
		{
			connection.query('SELECT * FROM all_games WHERE Game_ID = ?', [data[i].appid], function(error,results, fields) {
				if(error) { console.log(error);}
				if(results.length < 1)
				{
					connection.query('INSERT INTO all_games(Game_ID, Game_Tag1, Game_Tag2, Game_Tag3, Name) VALUES (?, ?, ?, ?, ?)', [data[i].appid,tag1,tag2,tag3, data[i].name], (error) => { 
					if (error) { 
						console.log("i:\nappid: %d\ngame: %s", data[i].appid, data[i].name);
						throw error;} 
					});
				}
			});
		}
		vgmUrl = 'https://steamspy.com/app/';
	}
})();

});