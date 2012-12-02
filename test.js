/*
Name:         youtube-feeds - test.js
Description:  Test script for youtube-feeds module validation
Source:       https://github.com/fvdm/nodejs-youtube
Feedback:     https://github.com/fvdm/nodejs-youtube/issues
License:      Unlicense / Public Domain

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
*/

var youtube = require('./'),
    errors = 0

process.on( 'exit', function() {
	if( errors == 0 ) {
		console.log('\nDONE, no errors.\n')
		process.exit(0)
	} else {
		console.log('\nFAIL, '+ errors +' errors occurred!\n')
		process.exit(1)
	}
})

function doTest( err, label, tests ) {
	if( err instanceof Error ) {
		console.log( label +': ERROR' )
		console.log( err, err.stack )
		errors++
	} else {
		var testErrors = []
		tests.forEach( function( test ) {
			if( test[1] !== test[2] ) {
				testErrors.push(test[0])
				errors++
			}
		})
		
		if( testErrors.length == 0 ) {
			console.log( label +': ok' )
		} else {
			console.log( label +': failed ('+ testErrors.join(', ') +')' )
		}
	}
}

// METHODS
doTest( null, 'methods', [
	['feeds', typeof youtube.feeds, 'object'],
	['video', typeof youtube.video, 'function'],
	['user', typeof youtube.user, 'function'],
	['talk', typeof youtube.talk, 'function'],

	['feeds.videos', typeof youtube.feeds.videos, 'function'],
	['feeds.related', typeof youtube.feeds.related, 'function'],
	['feeds.responses', typeof youtube.feeds.responses, 'function'],
	['feeds.comments', typeof youtube.feeds.comments, 'function'],
	['feeds.standard', typeof youtube.feeds.standard, 'function'],
	['feeds.playlist', typeof youtube.feeds.playlist, 'function'],
	
	['video()', typeof youtube.video(), 'object'],
	['video().details', typeof youtube.video().details, 'function'],
	['video().related', typeof youtube.video().related, 'function'],
	['video().responses', typeof youtube.video().responses, 'function'],
	['video().comments', typeof youtube.video().comments, 'function'],
	
	['user()', typeof youtube.user(), 'object'],
	['user().favorites', typeof youtube.user().favorites, 'function'],
	['user().playlists', typeof youtube.user().playlists, 'function'],
	['user().profile', typeof youtube.user().profile, 'function']
])


// FEEDS
youtube.feeds.videos( {q: 'freerun', 'max-results': 3}, function( err, data ) {
	doTest( err, 'feeds.videos', [
		['totalItems', data.totalItems > 3, true],
		['startIndex', data.startIndex, 1],
		['itemsPerPage', data.itemsPerPage, 3],
		['items', data.items[0] && data.items.length == 3, true],
		['items[0].id', data.items[0].id.match(/^[a-z0-9-_]{11}$/i)[0] !== null, true]
	])
})


// User
var user = youtube.user( 'unknowntitle' )

user.profile( function( err, data ) {
	doTest( err, 'user.profile', [
		['id', data.id['$t'], 'tag:youtube.com,2008:user:iNQhUYwHcNIsY3yjJ87bsA'],
		['published', data.published['$t'], '2006-11-18T06:02:05.000Z'],
		['title', data.title['$t'], 'unknowntitle'],
		['yt$location', data['yt$location']['$t'], 'NL'],
		['yt$userId', data['yt$userId']['$t'], 'iNQhUYwHcNIsY3yjJ87bsA'],
		['yt$username', data['yt$username']['$t'], 'unknowntitle']
	])
})


user.favorites( function( err, data ) {
	doTest( null, 'user.favorites', [
		['Error test', err instanceof Error && err.details.code == 403, true]
	])
})


user.playlists( function( err, data ) {
	doTest( err, 'user.playlists', [
		['startIndex', data.startIndex, 1],
		['totalItems', data.totalItems >= 2, true],
		['items', data.items[0] && data.items.length == data.totalItems, true]
	])
})


// VIDEO
var videoId = 'teTk158Pje8'
var video = youtube.video( videoId )

video.details( function( err, data ) {
	doTest( err, 'video.details', [
		['id', data.id, videoId],
		['uploaded', data.uploaded, '2010-03-23T01:53:28.000Z'],
		['uploader', data.uploader, 'unknowntitle'],
		['category', data.category, 'Film'],
		['title', data.title, 'Yellow Friends'],
		['duration', data.duration, 39],
		['accessControl.embed', data.accessControl.embed, 'allowed']
	])
})


video.related( function( err, data ) {
	doTest( err, 'video.related', [
		['startIndex', data.startIndex, 1],
		['items', data.items instanceof Array && data.items.length >= 1, true],
		['items[0]', typeof data.items[0].id, 'string']
	])
})
