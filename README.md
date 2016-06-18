matrix-parser is a Node.js Middleware for parsing [Matrix URIs](https://www.w3.org/DesignIssues/MatrixURIs.html)

#Install
```bash
npm install matrix-parser
```

#API
```javascript
var matrixParser = require ('matrix-parser');
```

The ```matrixParser``` object exposes a single function - the Middleware to parse matrix-style URIs

**NOTE:** The middleware currently doesn't support Matrix URIs to be used in combination with query strings.
You could use matrix parameters **before** the '?', followed by query parameters, but mixing is not currently supported.

#Rules!!
Since there is no official specification of the Matrix URIs, here are the rules I've followed in writing this parser (Suggestions welcome =) )

		1. 

#Examples

###Express: Top-level generic
```javascript
var app = require ('express') (),
	matrixParser = require ('matrix-parser');

app
	.use (matrixParser ())
	.get ('*', function (req, res, next) {
    	res.header ('Content-Type', 'text/plain');
    	res.write ('You posted: ');
    	res.end (JSON.stringify (req.matrix, null, 2));
	})
	.listen (8080, function () {
		console.log ('listening on port 8080');
	});
```

###Test:
```bash
curl 'http://localhost:8080/index;name=RAGHAV%20DUA;house=targarian/profile;age=20;email=duaraghav8%40gmail.com'
```

NOTICE THE %20 USED TO INDICATE SPACE INSTEAD OF +

Output Construct of ```req.matrix```:
```javascript
[
	{
		segment: 'index',
		matrix: {
			name: 'RAGHAV DUA',
			house: 'targarian'
		}
	},
	{
		segment: 'profile',
		matrix: {
			age: 20,
			email: 'duaraghav8@gmail.com'
		}
	}
]
```

###Express: Route-specific
```javascript
var app = require ('express') (),
	matrixParser = require ('matrix-parser');

var colorCodes = {
  "white": "#FFFFFF",
  "black": "#000000"
};

app
	.get ('/index', matrixParser, function (req, res, next) {
    var color = req.matrix [0].color; //req.matrix [0] refers to parameters provided in the /index segment
		res.send ('Color code for ' + color + ' is ' + colorCodes [color]);
	})
	.listen (8080, function () {
		console.log ('listening on port 8080');
	});
```

###Test 1:
```bash
curl 'http://localhost:8080/index;color=white'
```

Output: ```Color code for white is #FFFFFF```

###Test 2:
```bash
curl 'http://localhost:8080/index;color=indigo'
```

Output: ```Color code for white is undefined```
(because color code for indigo is not defined in colorCodes object in our script)

#License
MIT
