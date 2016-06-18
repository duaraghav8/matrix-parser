/*!
 * matrix-parser
 * Copyright(c) 2016 Raghav Dua
 * MIT Licensed
 */

'use strict';

var urlParser = require ('url').parse;
var defaultMatrixParser = require ('./parsers/default-matrix-parser');

module.exports = function (options) {
	var opts = Object.create (options || null);
	var matrixParser = defaultMatrixParser;

	if (typeof options === 'function') {
		opts = undefined;
		matrixParser = options;
	}

	return function (req, res, next) {
		if (!req.matrix) {
			req.matrix = matrixParser (urlParser (req.url).pathname, opts);
		}
		next ();
	};
};