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
//const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequest;
const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequestWithPuppeteer;

const wswo_url = "http://daytonoldies.org/";
function get_last_20_songs() {
	return new Promise( async function( resolve , reject ) {
		try {

			let body = await MAKE_REQUEST( wswo_url );
			try { var $ = cheerio.load( body ); }
			catch( err ) { resolve( false ); return; }

			let container = $( "body" ).find( ".scrollableArea" );
			let songs = $( container[ 0 ] ).children();
			// console.log( songs );
			console.log( $( songs[ 0 ] ).html() );

			// MyOBJ_DB[ "self" ][ "pages" ] = result;
			// MyOBJ_DB.save();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {
	// MyOBJ_DB = new JFODB( "wswo_playlist_archive" );
	// MyRedis = new RMU( 3 );
	// await MyRedis.init();
	// await sleep( 1000 );
	// setTimeout( function() {
	// 	await get_last_20_songs();
	// } , 600000 );

	await get_last_20_songs();
})();