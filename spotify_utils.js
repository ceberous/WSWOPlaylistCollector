const SpotifyWebApi = require( "spotify-web-api-node" );
const Personal = require( "./personal.js" ).spotify;

// credentials are optional
const spotifyApi = new SpotifyWebApi( Personal.creds );

function search_spotify( track , artist ) {
	return new Promise( function( resolve , reject ) {
		try {
			spotifyApi.searchTracks( "track:" + track + " " + "artist:" + artist )
				.then( function( data ) {
					console.log( data );
					resolve();
				} , function( err ) {
					console.log( error );
					resolve();
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.search = search_youtube;

function add_to_playlist( track , artist ) {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addToPlaylist = add_to_playlist;


( async ()=> {
	await search_spotify( "So Fine" , "Fiestas"  );
})();