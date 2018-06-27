require("dotenv").config();

var keys = require("./keys.js");
var inquirer = require("inquirer");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

function startLiri() {
    inquirer.prompt([
        {
        type: "list",
        name: "userGuess",
        message: "What would you like to do?",
        choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"]
        }

    ]).then(function(command) {
        if (command.userGuess === "my-tweets") {
            twitterFunction();
        }
        else if (command.userGuess === "spotify-this-song") {
            spotifyFunction();
        }
        else if (command.userGuess === "movie-this") {
            movieFunction();
        }
        else if (command.userGuess === "do-what-it-says") {
            sayWhat();
        }
        else {
            console.log("Please choose from the list");
            startLiri();
        }
        recordData(command.userGuess);
    });
}

function twitterFunction() {
    client.get('search/tweets', {q: 'MaggieMiner6', count: 20}, function(error, tweets, response) {
        if(error){
            console.log("Something went wrong!");
            }
        else {
            for (var i=0; i<tweets.statuses.length; i++) {
                var tweetData = (i+1) + ". " + tweets.statuses[i].text + " on " + tweets.statuses[i].created_at;
                console.log(tweetData);
                recordData(tweetData);
            }
        }
     });
}
function spotifyFunction() {
    inquirer.prompt([
        {
          type: "input",
          name: "userSong",
          message: "Which song would you like to know more about?",
      
        }
      ]).then(function(songChoice) {
          if (songChoice.userSong === ""){
            spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE').then(function(data) {
                // console.log(data); 
                var artistData = "Artist(s): " + data.album.artists[0].name;
                var nameData = "Song name: " + data.name;
                var albumData = "Album: " + data.album.name; 
                var prevData = "Spotify preview at: " + data.preview_url;
                console.log(artistData + "\n" + nameData + "\n" + albumData + "\n" + prevData);
                recordData(artistData);
                recordData(nameData);
                recordData(albumData);
                recordData(prevData);
              })
              .catch(function(err) {
                console.error('Error occurred: ' + err); 
              });
            }       
        
          else {
            spotSearch(songChoice.userSong);
        }
      });
}

function spotSearch(song) {
    spotify.search({ type: 'track', query: song }, function(err, data) {
        if (err) {
        return console.log('Error occurred: ' + err);
        }
        else { 
            var mostPopular = parseFloat(data.tracks.items[0].popularity);
            var index = 0;
            for (var i = 0; i<data.tracks.items.length; i++) {
                if (parseFloat(data.tracks.items[i].popularity) > mostPopular){
                    mostPopular = parseFloat(data.tracks.items[i].popularity);
                    index = i;
                }
            }
        }
        var nameData = "Song name: " + data.tracks.items[index].name;
        var artistData = "Artist(s): " + data.tracks.items[index].artists[0].name;
        var albumData = "Album: " + data.tracks.items[index].album.name; 
        var prevData = "Spotify preview at: " + data.tracks.items[index].preview_url;
        console.log(nameData + "\n" + artistData + "\n" + albumData + "\n" + prevData);
        recordData(artistData);
        recordData(nameData);
        recordData(albumData);
        recordData(prevData);
    });
}

function movieFunction() {
    inquirer.prompt([
        {
          type: "input",
          name: "userMovie",
          message: "Which movie would you like to know more about?",
      
        }
      ]).then(function(movieChoice) {
          if (movieChoice.userMovie === "") {
              movieChoice.userMovie = "Mr. Nobody";
          }
            request("http://www.omdbapi.com/?t=" + movieChoice.userMovie + "&y=&plot=short&apikey=trilogy", function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    var movieName = "Movie: " + movieChoice.userMovie;
                    var movieYear = "The movie's year is: " + JSON.parse(body).Year;
                    var imdbData = "The movie's IMDB rating is: " + JSON.parse(body).imdbRating;
                    var tomatoData = "The movie's Rotten Tomatoes rating is: " + JSON.parse(body).Ratings[1].Value;
                    var movieCountry = "The movie was made in: " + JSON.parse(body).Country;
                    var movieLang = "The movie's language(s) is/are: " + JSON.parse(body).Language;
                    var moviePlot = "The plot is: " + JSON.parse(body).Plot;
                    var movieStars = "The movie stars: " + JSON.parse(body).Actors;
                    console.log(movieName + "\n" + movieYear + "\n" + imdbData + "\n" + tomatoData + "\n" + movieCountry + "\n"+ movieLang + "\n" + moviePlot + "\n" + movieStars);
                    recordData(movieName);
                    recordData(movieYear);
                    recordData(imdbData);
                    recordData(tomatoData);
                    recordData(movieCountry);
                    recordData(movieLang);
                    recordData(moviePlot);
                    recordData(movieStars);
                }
                    
            });
    });
}

function sayWhat() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
          return console.log(error);
        }
        var dataArr = data.split(",");
        spotSearch(dataArr[1]);
      });
}

function recordData(myData) {
    fs.appendFile("log.txt", myData +  "\n", function(err) {
        if (err) {
          console.log(err);
        }
      });
}

startLiri();