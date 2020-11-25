const got = require('got');
const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM } = jsdom;

var vgmUrl= 'https://steamspy.com/app/';

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
  nodeList.filter(isMidi).filter(noParens).forEach(link => {
	  if(x > 22)
	  {
		  console.log(link.href);
	  }
	  x++;
  });
  vgmUrl = 'https://steamspy.com/app/';
	}
})();

});