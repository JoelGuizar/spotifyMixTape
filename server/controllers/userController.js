const SpotifyWebApi = require('spotify-web-api-node');

const userController = {};

const Uri = 'http://localhost:3000/';
const clientIdCode = 'e232e159695e4d4d9325ef1261920dd2'; // Will's localhost:3000
const clientSecretCode = '116b171634f94a42a2f7ca0ff74028ee';
// const Uri = 'https://jjwmixtape.herokuapp.com/';
// const clientIdCode = '9147d3932043400a81e2af180da803d6'; // Jeffrey's herokuapp
// const clientSecretCode = '1fc4aae15afa4f97a39d362315552723';


userController.requestAuthorization = (req, res, next) => {
  const scopes = ['playlist-read-private', 'playlist-read-collaborative',
    'playlist-modify-public', 'playlist-modify-private', 'user-library-read', 'user-library-modify'],
    redirectUri = Uri,
    clientId = clientIdCode;
    // state = 'code';

  // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  const spotifyApi = new SpotifyWebApi({
    redirectUri,
    clientId,
  });

  // Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes); // add state

  // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
  res.redirect(authorizeURL);
};

userController.retrieveToken = (req, res, next) => {
  if (req.query.code === undefined) return next();
  const credentials = {
    clientId: clientIdCode,
    clientSecret: clientSecretCode,
    redirectUri: Uri,
  };

  const spotifyApi = new SpotifyWebApi(credentials);

  // The code that's returned as a query parameter to the redirect URI
  const code = req.query.code;
  // console.log(code);

  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {
      // console.log('The token expires in ' + data.body['expires_in']);
      // console.log('The access token is ' + data.body['access_token']);
      // console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      res.cookie('access_token', data.body.access_token);
      res.redirect('/');
    }, function(err) {
      console.log('Something went wrong!', err);
    });
};

userController.getMe = (req, res, next) => {
  const spotifyApi = new SpotifyWebApi({ accessToken: req.cookies.access_token });
  spotifyApi.getMe()
    .then(function(data) {
      //console.log('Some information about the authenticated user', data.body);
      res.locals.me = data.body;
      return next();
    }, function(err) {
      console.log('Something went wrong!', err);
    });
};

module.exports = userController;



