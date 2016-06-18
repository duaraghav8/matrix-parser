matrix-parser is a Node.js Middleware for parsing [Matrix URIs](https://www.w3.org/DesignIssues/MatrixURIs.html)

#Install
```bash
npm install matrix-parser
```

#Run Tests
traverse to the root directory 'matrix-parser' and:
```bash
npm install
npm test
```

#API
```javascript
var matrixParser = require ('matrix-parser');
```

The ```matrixParser``` object exposes a single function - the Middleware to parse matrix-style URIs. When used, it creates the matrix Array inside the request object, which can be accessed like ```req.matrix```

**NOTE:** The middleware currently doesn't support Matrix URIs to be used in combination with query strings.
You could use matrix parameters **before** the '?', followed by query parameters, but mixing is not currently supported.

#Rules
Here are the rules matrix-parser follows to parse Matrix URIs

		1. The semicolon ';' is used to delimit key-value pairs (unlike the ampersand '&' in query strings)
			eg- /index;a=b;c=d

		2. '=' is used to delimit the keys and values

		3. The string between / and the first ; is the segment name
			eg- /index;hello=world
			here, segment = "index"

		4. All keys are unique. For compatibility, the key's last declaration is used to assign its value
			eg- /index;key1=value1;key2=v2;key1=helloworld
			here, the value of key1 = helloworld (NOT value1)

		5. Comma ',' is used to assign multiple values to a key
			eg- /index;list=1,2,3,4
			here, list = [1,2,3,4] (array containing the comma-separated values)

		6. Spaces are encoded as %20 instead of +
			eg- /index;msg=hello%20world

		7. If a key is not followed by the delimiter '=' and value, it is discarded
			eg- /index;a=b;noValueKey;c=d
			here, noValueKey will be discarded and will not be present in the matrix

		8. If a key is followed by the delimiter '=' but not a value, its value is set to ''
			eg- /index;key
			here, key = ''

#Format
A typical Matrix URI looks like:
```
http://<DOMAIN>:<PORT>/<SEGMENT-0>;<KEY1>=<VALUE1>;<KEY2>=<VALUE2>/<SEGMENT-1>;<KEY1>=<VALUE1>
```

The constructed Array looks like:
```
[
	{
		segment: <SEGMENT-0>,
		matrix: {
			<KEY1> : <VALUE1>,
			<KEY2> : <VALUE2>
		}
	},
	{
		segment: <SEGMENT-1>,
		matrix: {
			<KEY2> : <VALUE2>
		}
	}
]
```

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
