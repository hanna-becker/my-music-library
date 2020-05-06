# My Music Library

My Music Library is a serverless web application that lets you create your own private music library by letting you 
search through the Spotify API. You can even listen to the songs in your library (if they are available through the 
Spotify API in your country). 

## Functionality of the application

This application will allow searching the Spotify API for songs and adding them to or removing them from your personal 
music library. Each user only has access to their own library.

## Implementation

For enabling access to the Spotify API, I needed to register the application with them, whereupon they issued me 
credentials in the form of a client id and secret. I used the AWS secret manager and a KMS key to safely store and 
access an encrypted version of the client secret.

Programmatically accessing the Spotify API for song search and creating miniature players for each song could have been 
implemented in plain TypeScript, but I chose to use the npm module "spotify-web-api-node" which elegantly simplifies 
this step. 

For authenticating against the My Music Library app itself I registered the application with the Auth0 service and 
configured it to use a symmetric signing algorithm. Users can authenticate through a third party account such as Google.

The music library songs are stored in a DynamoDB table in the form of a unique Spotify track ID and a user ID extracted 
from the authentication token. The user ID is the hash key, whereas I specified the track ID to be a sort key. This way, 
the application can easily and efficiently query the database to retrieve all songs from one user.

Additionally, I implemented a Postman collection called "MyMusicLibrary.postman_collection.json" for designing and 
testing the app's REST API.
