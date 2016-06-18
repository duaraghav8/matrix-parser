/*!
 * Copyright(c) 2016 Raghav Dua
 * MIT Licensed
 */

'use strict';

var express = require ('express'),
	should = require ('should'),
	request = require ('supertest');

var matrixParser = require ('..');

describe ('matrixParser ()', function () {
	var server;
	before (function () {
		server = createServer ();
	});

	it ('should default to [ {segment: "", matrix: {}} ] when url = \'/\'', function (done) {
		request (server)
			.get ('/')
			.end (function (err, res) {
				res.body.length.should.equal (1);
				res.body [0].segment.should.equal ('');
				res.body [0].matrix.should.be.empty ();
				done ();
			});
	});

	it ('should default matrix sub-object to {} when no key-value pairs provided', function (done) {
		request (server)
			.get ('/home')
			.end (function (err, res) {
				res.body.length.should.equal (1);
				res.body [0].segment.should.equal ('home');
				res.body [0].should.have.property ('matrix');
				res.body [0].matrix.should.be.empty ();
				done ();
			});
	});

	it ('should ignore trailing semicolon(s)', function (done) {
		request (server)
			.get ('/home;name=raghav;')
			.end (function (err, res) {
				res.body.length.should.equal (1);
				res.body [0].matrix.should.have.property ('name', 'raghav');
				res.body [0].matrix.should.not.have.property ('');
				done ();
			});
	});

	it ('should interpret %20 as space', function (done) {
		request (server)
			.get ('/index;name=raghav%20dua')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('name', 'raghav dua');
				done ();
			});
	});

	it ('should assign a key\'s last declaration as its value and discard its previous declarations', function (done) {
		request (server)
			.get ('/index;name=raghav;name=tyrion;name=lannister')
			.end (function (err, res) {
				res.body [0].matrix.name.should.equal ('lannister');
				done ();
			});
	});

	it ('should ignore all keys without values and =', function (done) {
		request (server)
			.get ('/index;a;b=alphabet;c')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('b', 'alphabet');
				res.body [0].matrix.should.not.have.property ('a');
				res.body [0].matrix.should.not.have.property ('c');
				done ();
			});
	});

	it ('should set a key\'s value to \'\' (empty string) if its value is not provided after =', function (done) {
		request (server)
			.get ('/index;name=;age=20')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('name', '');
				res.body [0].matrix.should.have.property ('age', '20');
				done ();
			});
	});

	it ('should set key to \'\' (empty string) when key is not specified before =', function (done) {
		request (server)
			.get ('/index;=value')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('', 'value');
				done ();
			});
	});

	it ('should set both key and value to \'\' (empty string) when they aren\'t specified', function (done) {
		request (server)
			.get ('/;=')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('', '');
				done ();
			});
	});

	it ('should parse multi-segment URIs', function (done) {
		request (server)
			.get ('/club;name=lakers;address=downtown/members;role=guest')
			.end (function (err, res) {
				res.body.length.should.equal (2);

				res.body [0].segment.should.equal ('club');
				res.body [0].matrix.should.have.property ('name', 'lakers');
				res.body [0].matrix.should.have.property ('address', 'downtown');

				res.body [1].segment.should.equal ('members');
				res.body [1].matrix.should.have.property ('role', 'guest');

				done ();
			});
	});

	it ('should ignore query strings, i.e., EVERYTHING after \'?\'', function (done) {
		request (server)
			.get ('/team;name=lakers?city=LA')
			.end (function (err, res) {
				res.body.length.should.equal (1);
				res.body [0].segment.should.equal ('team');
				res.body [0].matrix.should.have.property ('name', 'lakers');
				done ();
			});
	});

	it ('should interpret comma-separated values as multiple values (array) for the (single) key', function (done) {
		request (server)
			.get ('/home;list=1,2,3,4')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('list');
				res.body [0].matrix.list.should.be.an.Array ();
				res.body [0].matrix.list.length.should.equal (4);

				for (var i = 1; i <= 4; i++) {
					res.body [0].matrix.list [i-1].should.equal (i.toString ());
				}

				done ();
			});
	});

	it ('should interpret \'\' (empty string) if nothing exists between 2 commas: /index;list=a,b,,,', function (done) {
		request (server)
			.get ('/index;list=a,b,,,')
			.end (function (err, res) {
				res.body [0].matrix.should.have.property ('list');
				res.body [0].matrix.list.should.be.an.Array ();
				res.body [0].matrix.list.length.should.equal (5);	//['a','b','','','']

				res.body [0].matrix.list [0].should.equal ('a');
				res.body [0].matrix.list [1].should.equal ('b');
				res.body [0].matrix.list [2].should.equal ('');
				res.body [0].matrix.list [3].should.equal ('');
				res.body [0].matrix.list [4].should.equal ('');

				done ();
			});
	});

	it ('should set segment to \'\' (empty string) when it encounters: /;key=value', function (done) {
		request (server)
			.get ('/;key=value/;green=house')
			.end (function (err, res) {
				res.body.length.should.equal (2);

				res.body [0].segment.should.equal ('');
				res.body [0].matrix.should.have.property ('key', 'value');

				res.body [1].segment.should.equal ('');
				res.body [1].matrix.should.have.property ('green', 'house');

				done ();
			});
	});
});

function createServer () {
	var app = express ();

	//middleware
	app.use (matrixParser ());

	//routes
	app.use (function (req, res) {
		res
			.status (200)
			.send (req.matrix);
	});

	return app;
}