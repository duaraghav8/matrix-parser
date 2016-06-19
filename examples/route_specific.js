var app = require ('express') (),
	matrixParser = require ('..');
 
var colorCodes = {
	"white": "#FFFFFF",
	"black": "#000000"
};

var mpMiddleware = matrixParser ();
 
app
	.get ('/index*', mpMiddleware, function (req, res, next) {
		var color = req.matrix [0].matrix.color; //req.matrix [0] refers to parameters provided in the /index segment 
		res.send ('Color code for ' + color + ' is ' + colorCodes [color]);
	})
	
	.listen (8080, function () {
		console.log ('listening on port 8080');
	});