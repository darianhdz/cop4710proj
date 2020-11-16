var util = require('util')
  , OpenIDStrategy = require('@passport-next/passport-openid').Strategy
  , SteamWebAPI = require('steam-web');

function getUserProfile(key, steamID, callback) {
  var steam = new SteamWebAPI({ apiKey: key, format: 'json' });

  steam.getPlayerSummaries({
    steamids: [ steamID ],
    callback: function(err, result) {
      if(err) {
        return callback(err);
      }

      var profile = {
        provider: 'steam',
        _json: result.response.players[0],
        id: result.response.players[0].steamid,
        displayName: result.response.players[0].personaname,
        photos: [{
          value: result.response.players[0].avatar
        }, {
          value: result.response.players[0].avatarmedium
        }, {
          value: result.response.players[0].avatarfull
        }]
      };

      callback(null, profile);
    }
  });
}

function Strategy(options, validate) {
  options = options || {};
  options.providerURL = options.providerURL || 'https://steamcommunity.com/openid';
  options.profile =  (options.profile === undefined) ? true : options.profile;
  options.stateless = true; //Steam only works as a stateless OpenID

  var originalPassReqToCallback = options.passReqToCallback;
  options.passReqToCallback = true; //Request needs to be verified

  function verify(req, identifier, profile, done) {
    var validOpEndpoint = 'https://steamcommunity.com/openid/login';
    var identifierRegex = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;

    if(req.query['openid.op_endpoint'] !== validOpEndpoint ||
       !identifierRegex.test(identifier)) {
      return done(null, false, { message: 'Claimed identity is invalid.' });
    }

    var steamID = identifierRegex.exec(identifier)[0];

    if(options.profile) {
      getUserProfile(options.apiKey, steamID, function(err, profile) {
        if(err) {
          done(err);
        } else {
          if(originalPassReqToCallback) {
            validate(req, identifier, profile, done);
          } else {
            validate(identifier, profile, done);
          }
        }
      });
    } else {
      if(originalPassReqToCallback) {
        validate(req, identifier, profile, done);
      } else {
        validate(identifier, profile, done);
      }
    }
  }

  OpenIDStrategy.call(this, options, verify);

  this.name = 'steam';
  this.stateless = options.stateless;
}

util.inherits(Strategy, OpenIDStrategy);

module.exports = Strategy;
