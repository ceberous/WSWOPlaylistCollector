process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

const cheerio = require( "cheerio" );
const JFODB = require( "jsonfile-obj-db" );
var MyOBJ_DB = null;
const RMU = require( "redis-manager-utils" );
var MyRedis = null;
const sleep = require( "./generic_utils.js" ).sleep;
const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequest;
//const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequestWithPuppeteer;

//const wswo_url = "http://daytonoldies.org/";
const wswo_url = "http://radio.securenetsystems.net/songdata/v5/index.cfm?stationCallSign=WSWO-LP";
function get_last_20_songs() {
	return new Promise( async function( resolve , reject ) {
		try {

			let body = await MAKE_REQUEST( wswo_url );
			try { var $ = cheerio.load( body ); }
			catch( err ) { resolve( false ); return; }

			let main_container = $( "#makeMeScrollable" );
			let songs = $( main_container ).children();

			//let latest = [];
			for ( let i = 0; i < songs.length; ++i ) {
				let track_container = $( songs[ i ] ).children();
				let track_info = $( track_container[ 0 ] ).children().text();
				track_info = track_info.split( "\n" );
				track_info = track_info.map( x => x.replace( /\t/g , "" ) );
				track_info.shift();
				track_info.pop();
				// let song = {};
				// if ( track_info[ 0 ] ) { song[ "time_stamp" ] = track_info[ 0 ]; }
				// if ( track_info[ 1 ] ) { song[ "track_info" ] = track_info[ 1 ]; }
				// if ( track_info[ 2 ] ) { song[ "artist" ] = track_info[ 2 ]; }
				// if ( track_info[ 3 ] ) { song[ "album" ] = track_info[ 3 ]; }
				let db_id = track_info[ 1 ] + "---" + track_info[ 2 ] + "---" + track_info[ 3 ];
				let a1 = new Buffer.from( db_id );
				a1 = a1.toString( "base64" );
				if ( !MyOBJ_DB[ "self" ][ a1 ] ) {
					MyOBJ_DB[ "self" ][ a1 ] = { title: track_info[ 1 ] , artist: track_info[ 2 ] , album: track_info[ 3 ] };
				}
				//latest.push( { id: a1 , time_stamp: track_info[ 0 ] , title: track_info[ 1 ] , artist: track_info[ 2 ] , album: track_info[ 3 ] } );
			}
			//console.log( latest );

			MyOBJ_DB.save();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {

	MyOBJ_DB = new JFODB( "wswo_playlist_archive" );
	// MyRedis = new RMU( 3 );
	// await MyRedis.init();
	// await sleep( 1000 );

	// setTimeout( function() {
	// 	console.log( "Getting Latest Songs" );
	// 	get_last_20_songs();
	// } , 600000 );

	await get_last_20_songs();
})();