'use strict';

var app = require ('express') (),
	//matrixParser = require ('matrix-parser');
	matrixParser = require ('..');

app
	//.use (matrixParser ({ maxKeys: 2 }))
	.use (matrixParser ())

	.get ('*', function (req, res, next) {
    	res.header ('Content-Type', 'text/plain');
    	res.write ('You posted: ');
    	res.end (JSON.stringify (req.matrix, null, 2));
	})
	
	.listen (8080, function () {
		console.log ('listening on port 8080');
	});