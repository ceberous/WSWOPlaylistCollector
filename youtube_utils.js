const YOUTUBE_SEARCH = require( "youtube-search" );
const { google } = require( "googleapis" );
const OAuth2 = google.auth.OAuth2;
const Personal = require( "./personal.js" ).youtube;

const search_config = {
	maxResults: 10 ,
	key: Personal.search_key
};
function search_youtube( phrase ) {
	return new Promise( function( resolve , reject ) {
		try {
			YOUTUBE_SEARCH( phrase , search_config , function( err , results ) {
				console.log( results );
				resolve();
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.search = search_youtube;

const oauth2Client = new OAuth2(
    Personal.oauth_creds.client_id ,
    Personal.oauth_creds.client_secret ,
    Personal.oauth_creds.callback_url
);

oauth2Client.setCredentials( Personal.oauth2Client );

// Initialize the Youtube API library
const youtube = google.youtube({
    version: "v3" ,
    auth: oauth2Client
});

function add_id_playlist( video_id ) {
	return new Promise( function( resolve , reject ) {
		try {
			youtube.playlistItems.insert( {
				"part": 'snippet' ,
				"resource": {
					"snippet": {
					"playlistId": Personal.playlist_ids.main ,
					"resourceId": {
							"kind": "youtube#video" ,
							"videoId": video_id
						}
					}
				}
			} , function( err , data ) {
				console.log( data );
				console.log( err );
				resolve();
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addIDToPlaylist = add_id_playlist;

function custom_add_to_playlist( search_phrase ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let search_results = await search_youtube( search_phrase );
			console.log( search_results[ 0 ] );
			await add_id_playlist( search_results[ 0 ][ "id" ] );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addToPlaylist = custom_add_to_playlist;

( async ()=> {
	//await search_youtube( "Raindrops Dee Clark Vee-Jay: The Definitive Collection , Disc 3" );
	//await search_youtube( "I am the Walrus the beatles" );
	await add_id_playlist( "t1Jm5epJr10" );
	//await custom_add_to_playlist( "I am the Walrus the beatles" );
})();