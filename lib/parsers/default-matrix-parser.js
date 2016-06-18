/*!
 * matrix-parser
 * Copyright(c) 2016 Raghav Dua
 * MIT Licensed
 */
 
'use strict';

var queryParser = require ('querystring').parse;

var normalizer = {
	useLastDeclared: function (m) {
		Object.keys (m).forEach (function (k) {
			var value = m [k];
			m [k] = (value.constructor === Array) ? (value [value.length - 1]) : value;
		});
	},

	commaSeparate: function (m) {
		Object.keys (m).forEach (function (k) {
			if (m [k].indexOf (',') !== -1) m [k] = m [k].split (',');
		});
		return m;
	},

	removeTrailingSemicolons: function (seg) {
		var result = '';
		for (var i = 0; i < seg.length; i++) {
			if (seg [i] === ';') {
				if (i === seg.length-1 || seg [i+1] === ';') continue;
			}
			result += seg [i];
		}
		return result;
	},

	removeDanglingKeys: function (seg, m) {
		var reg = /(?:;)[^;=]+(?=;)/g;
		var matches = (seg+';').match (reg);

		if (matches) {
			matches.forEach (function (k) {
				var key = k.slice (1);
				!m [key] && delete m [key];
			});
		}
	}
};

function createMatrix (uri, opts) {
	var matrix = [];

	uri.split ('/').slice (1).forEach (function (segment) {
		segment = normalizer.removeTrailingSemicolons (segment);

		var firstSep = segment.indexOf (';');
		if (firstSep === -1) firstSep = segment.length;

		var segObject = { segment: segment.slice (0, firstSep) };
		var m = queryParser (segment.slice (firstSep + 1), ';', '=', opts);

		normalizer.useLastDeclared (m);
		segObject.matrix = normalizer.commaSeparate (m);
		normalizer.removeDanglingKeys (segment, segObject.matrix);

		matrix.push (segObject);
	});
	
	return matrix;
}

function defaultMatrixParser (val, opts) {
	if (typeof val !== 'string' || !val.length) return [];
	return createMatrix (val, opts);
};

module.exports = defaultMatrixParser;