require("dotenv").config();

// connecting all packages
var keys = require('./keys.js');
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require('request');
var fs = require('fs');
var moment = require('moment-timezone');

// For use with requests
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

// taking user input
var command = process.argv[2];
var input;

// Compensating for user not putting quotes around search term
if (process.argv[3]) {

    if (process.argv[3].startsWith('\'')) {
        input = process.argv[3];
    } else {
        var inputArr = process.argv;
        inputArr.splice(0, 3);
        input = inputArr.join(' ');
    }

}

// Placing all items within a function, used to make sense of 'do-what-it-says'
function run() {

    // If user searches for tweets
    switch (command) {
        case 'my-tweets':
            var params = {
                screen_name: 'thatblackid',
                count: 5
            };
            client.get('statuses/user_timeline', params, function (err, data, response) {

                if (err) return console.log(err);

                var tweets = JSON.parse(JSON.stringify(data));

                for (var i in tweets) {

                    // Grabbing date data and changing to be used by moment
                    var dateArr = tweets[i].created_at.split(' ');
                    dateArr.splice(4, 1);
                    dateArr.splice(0, 1);
                    var newDate = dateArr.join(' ');

                    // Changing date provided by twiiter to (my) local time
                    var newMom = moment(newDate, 'MMM-DD-HH-mm-ss-YYYY').tz("America/Chicago")
                    var tweetDate = newMom.format('MMM DD YYYY');
                    var tweetTime = newMom.format('hh:mm A z');

                    console.log(`On ${tweetDate} at ${tweetTime} you tweeted "${tweets[i].text}"`);
                }

            });
        break;

        // If user searches spotify
        case 'spotify-this':

            if (!input) {
                input = 'Fly Me To The Moon';
            }

            spotify.search({ type: 'track', query: input, limit: 1 }, function (err, data) {
                if (err) return console.log(err);

                // Grabbing items from data to be used in template literal
                var songData = JSON.parse(JSON.stringify(data.tracks.items))[0];
                var artist = songData.album.artists[0].name;
                var track = songData.name;
                var previewLink = songData.preview_url;
                var album = songData.album.name;

                console.log(`You searched for "${track}." That is a song by ${artist} off of the album "${album}."`);
                if (previewLink === null) {
                    console.log(`Sorry! Unfortunately, that song doesn't have a preview available.`)
                } else {
                    console.log(`Follow this link to hear a preview! ${previewLink}`);
                }

            });
        break;

        // If user searches for movie
        case 'movie-this':

            if (!input) {
                input = 'mr nobody'
            };

            var queryUrl = "http://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy";

            request(queryUrl, function (err, response, body) {

                if (err) return console.log(err)

                var movie = JSON.parse(body);

                console.log(`          Thanks! Here's some basic info on your film!
                Title: ${movie.Title}
                Year of Release: ${movie.Year}
                IMDB Rating: ${movie.Ratings[0].Value}
                Rotten Tomatoes Rating: ${movie.Ratings[1].Value}
                Produced In: ${movie.Country}
                Languages in Film: ${movie.Language}
                Plot Summary: ${movie.Plot}
                Actors in Film: ${movie.Actors}`);

            });
        break;

        // If user doesn't enter command or incorrect command
        default:
            console.log(`        Please enter one of the following commands.
        - 'my-tweets' - displays your last 20 tweets and when created
        - 'spotify-this' '<type song name here>' - display basic information about the song from spotify
        - 'movie-this' '<type movie title here>' - display basic information about the movie from OMDB
        - 'do-what-it-says' - executes a command written in an external text file`);
        break;

    };

};

// Check if user inputs 'do-what-it-say' and runs the command in the txt file.
if (command === 'do-what-it-says') {
    fs.readFile('./random.txt', 'utf8', function (err, data) {
        if (err) return console.log(err);

        var dataArr = data.split(',')

        command = dataArr[0];

        input = dataArr[1];

        run();

    })

} else {

    run();
}