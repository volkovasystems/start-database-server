/*:
	@module-license:
		The MIT License (MIT)

		Copyright (c) 2014 Regynald Reiner Ventura
		Copyright (c) 2014 Richeve Siodina Bebedor
		Copyright (c) 2014 Jann Paolo Caña

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"packageName": "start-database-server",
			"fileName": "start-database-server.js",
			"moduleName": "startDatabaseServer",
			"authorName": "Regynald Reiner Ventura",
			"authorEMail": "regynaldventura@gmail.com",
			"contributorList": [
				{
					"contributorName": "Richeve Siodina Bebedor",
					"contributorEMail": "richeve.bebedor@gmail.com"
				},
				{
					"contributorName": "Jann Paolo Caña",
					"contributorEMail": "paolo.garcia00@yahoo.com"					
				}
			],
			"repository": "git@github.com:volkovasystems/start-database-server.git",
			"testCase": "start-database-server-test.js",
			"isGlobal": true
		}
	@end-module-configuration

	@module-documentation:

	@end-module-documentation

	@include:
		{			
			"work.js@github.com/volkovasystems": "work",
			"chore.js@github.com/volkovasystems": "chore",
			"fs@nodejs": "fs",
			"util@nodejs": "util",
			"path@nodejs": "path"
		}
	@end-include
*/
var startDatabaseServer = function startDatabaseServer( host, port, databasePath, callback ){
	/*:
		@meta-configuration:
			{
				"host:required": "string",
				"port:required": "string",
				"databasePath:required": "string",
				"callback:optional": "function"
			}
		@end-meta-configuration
	*/

	//NOOP override.
	callback = callback || function( ){ };

	if( !fs.existsSync( databasePath ) ){
		try{
			fs.mkdirSync( databasePath );

		}catch( error ){
			console.error( error );
			throw error;
		}
	}

	var databaseLogPath = [ databasePath, "log" ].join( path.sep );
	if( !fs.existsSync( databaseLogPath ) ){
		try{
			fs.writeFileSync( [databaseLogPath, "log.txt"].join( path.sep ) );

		}catch( error ){
			console.error( error );
			throw error;
		}
	}

	var mongoDBServerCommand = [
		"mongod",
		"--bind_ip", host,
		"--port", port,
		"--dbpath", databasePath,
		"--logpath", databaseLogPath,
		"--logappend",
		"--install"
	].join( " " );

	var checkMongoDBServerCommand = [
		"mongo",
		"--host", host,
		"--port", port,
		"--quiet",
		"--eval", "'JSON.stringify( db.stats( ) );'"
	].join( " " );

	work( mongoDBServerCommand,
		function onResult( error, isValid, result ){
			if( error ){
				console.error( error );
				callback( error );

			}else if( isValid ){
				var databaseStatistic = JSON.parse( result );

				var encodedValue = new Buffer( util.inspect( databaseStatistic, { "depth": null } ) ).toString( "base64" );
				console.log( encodedValue );

				callback( null, databaseStatistic );

			}else{
				var error = new Error( "invalid result" );
				console.error( error );
				callback( error );
			}
		},
		function validator( output ){
			try{
				JSON.parse( output );
				return true;

			}catch( error ){
				console.error( error );
				return false;
			}
		} );
};

var work = require( "./work/work.js" );
var fs = require( "fs" );
var util = require( "util" );
var path = require( "path" );

module.exports = startDatabaseServer;