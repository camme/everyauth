var oauthModule = require('./oauth2');

var netatmo = module.exports =
oauthModule.submodule('netatmo')
  .configurable({ })

  .oauthHost('https://api.netatmo.net')
  .apiHost('https://api.netatmo.net')

  .authPath('/oauth2/authorize')
  .accessTokenPath('/oauth2/token')

  .entryPath('/auth/netatmo')
  .callbackPath('/auth/netatmo/callback')

  .accessTokenParam('grant_type', 'authorization_code')
  .postAccessTokenParamsVia('data')

  .fetchOAuthUser( function (accessToken) {
    var p = this.Promise();
    this.oauth.get(this.apiHost() + '/api/getuser', accessToken, function (err, data) {
      if (err) return p.fail(err);
      var oauthUser = JSON.parse(data);
      p.fulfill(oauthUser);
    })
    return p;
  })
  .moduleErrback( function (err, seqValues) {
    if (err instanceof Error) {
      var next = seqValues.next;
      return next(err);
    } else if (err.extra) {
      var ghResponse = err.extra.res
        , serverResponse = seqValues.res;
      serverResponse.writeHead(
          ghResponse.statusCode
        , ghResponse.headers);
      serverResponse.end(err.extra.data);
    } else if (err.statusCode) {
      var serverResponse = seqValues.res;
      serverResponse.writeHead(err.statusCode);
      serverResponse.end(err.data);
    } else {
      console.error(err);
      throw new Error('Unsupported error type');
    }
  });

