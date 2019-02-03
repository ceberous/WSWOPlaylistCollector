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
const R_Key = "WSWO.SONGS";
const sleep = require( "./generic_utils.js" ).sleep;
const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequest;
//const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequestWithPuppeteer;
//const YOUTUBE = require( "./youtube_utils.js" );
//const SPOTIFY = require( "./spotify_utils.js" );


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

			for ( let i = 0; i < songs.length; ++i ) {
				let track_container = $( songs[ i ] ).children();
				let track_info = $( track_container[ 0 ] ).children().text();
				track_info = track_info.split( "\n" );
				track_info = track_info.map( x => x.replace( /\t/g , "" ) );
				track_info.shift();
				track_info.pop();
				let db_id = track_info[ 1 ] + "---" + track_info[ 2 ] + "---" + track_info[ 3 ];
				let db_id_b64 = new Buffer.from( db_id );
				db_id_b64 = db_id_b64.toString( "base64" );
				let result = { title: track_info[ 1 ] , artist: track_info[ 2 ] , album: track_info[ 3 ] };
				let unique = await MyRedis.setIsMember( R_Key , db_id_b64 );
				if ( !unique || unique === "false" || unique === "0" ) {
					console.log( "New Song" );
					await MyRedis.setAdd( R_Key , db_id_b64 );
					result.id = db_id_b64;
					result.time_stamp = track_info[ 0 ];
					result.search_string = track_info[ 1 ] + " " + track_info[ 2 ] + " " + track_info[ 3 ];
					//latest.push( result );
					//await YOUTUBE.addToPlaylist( result.search_string );
					//await SPOTIFY.addToPlaylist( result.title , result.artist );
					console.log( result );
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {

	MyRedis = new RMU( 3 );
	await MyRedis.init();
	await sleep( 1000 );

	console.log( "WSWO Playlist Collector Restarted" );
	get_last_20_songs();

	// Live On the Air Schedule
	// Sunday: Wackadoo Wax 1am-2am, Kel Crum 12-3pm, Steve Radcliffe 6-9pm, Sunday Night Music & Conversation with Tony Peters 9:30-10:00
	// Monday: Tony Peters 10 am-2pm, Panama Jack 3-7pm, Tim Darcy 7-10pm (Last Shift Dec 3rd),  John King 7-10pm (Starting Dec 10, 2018)
	// Tuesday: Dr. Rock 7-10am, Jordan Kelly 10am-2pm, Blazin Brad 2:00-6:00 pm, Shelly “Glad Girl” Wax Carnival 8-11pm
	// Wednesday: Lightning Rod Flash 12-4pm,  Mike Reisz 4-7 pm, Gene Charles 7-10 pm
	// Thursday: Jerry Halasz 10am-2pm, John Bennett  2-6 pm, Chuck Berry 6-9pm
	// Friday: To be Determine now that Football is completed
	// Saturday: Chris Poole 11am-1pm, Gary Quinn 2-6pm, Mike Shaver “The Record Saver” 9-12pm
	// Also Big Band is On Saturday Morning , Not Sure What Time

	// So We Need To Seperated out Different Playlists for each Host
	// Somehow come up with conversion for 'Now Playing' and 'Played 8 minutes ago' etc.. timestamps
	// In order to know which song goes where.
	setInterval( function() {
		console.log( "Getting Latest Songs" );
		get_last_20_songs();
	} , 600000 );

})();