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
//const YOUTUBE = require( "./youtube_utils.js" );
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

			let latest = [];
			for ( let i = 0; i < songs.length; ++i ) {
				let track_container = $( songs[ i ] ).children();
				let track_info = $( track_container[ 0 ] ).children().text();
				track_info = track_info.split( "\n" );
				track_info = track_info.map( x => x.replace( /\t/g , "" ) );
				track_info.shift();
				track_info.pop();
				let db_id = track_info[ 1 ] + "---" + track_info[ 2 ] + "---" + track_info[ 3 ];
				let a1 = new Buffer.from( db_id );
				a1 = a1.toString( "base64" );
				let result = { title: track_info[ 1 ] , artist: track_info[ 2 ] , album: track_info[ 3 ] };
				if ( MyOBJ_DB[ "self" ][ "songs" ][ a1 ] ) { continue; }
				MyOBJ_DB[ "self" ][ "songs" ][ a1 ] = result;
				result.id = a1;
				result.search_string = track_info[ 1 ] + " " + track_info[ 2 ] + " " + track_info[ 3 ];
				latest.push( result );
				//await YOUTUBE.addToPlaylist( result.search_string );
			}
			console.log( latest );
			MyOBJ_DB.save();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {

	MyOBJ_DB = new JFODB( "wswo_playlist_archive_0" );
	// MyRedis = new RMU( 3 );
	// await MyRedis.init();
	// await sleep( 1000 );

	setInterval( function() {
		console.log( "Getting Latest Songs" );
		get_last_20_songs();
	} , 600000 );

	//await get_last_20_songs();
})();