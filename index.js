var request = require('request'),
    host = 'https://cp.pushwoosh.com/json',
    apiVersion = '1.3';

function PushwooshClient(appCode, authToken, options) {
    if (!appCode || !authToken) {
        throw new Error('Application ID and Authentication Token from Pushwoosh must be provided');
    }

    this.appCode = appCode;
    this.authToken = authToken;

    // parse the options
    options = options || {};

    this.host = options.host || host;
    this.apiVersion = options.apiVersion || apiVersion;

};


PushwooshClient.prototype.sendMessage = function (msg, options, callback) {

    if (!msg || typeof msg !== 'string') {
        throw new Error('Message has to be provided');
    }

    if (!callback) {
        callback = options;
        options = {};
    }

    if (typeof callback !== 'function') {
        throw new Error('A callback function must be provided');
    }

    var body = {
        request: {
            application: this.appCode,
            auth: this.authToken,
            notifications: [{
                send_date: options.sendDate || 'now',
                ignore_user_timezone: true,
                content: msg,
                devices: options.devices
            }]
        }
    };

    request({
        method: 'POST',
        uri: this.host + '/' + this.apiVersion +'/' +'createMessage',
        json: true,
        body: body
    }, function(error, response, body){
        if (error) {
            return callback(error);
        }

        if (response.statusCode == 200 && body.status_code == 200) {
            callback(null, body.response);
        }

        if (response.statusCode == 200 && body.status_code == 210) {
            callback(body.status_message);
        }

        if (response.statusCode == 500) {
            callback ('Internal Error');
        }

        if (response.statusCode == 400) {
            callback('Malformed request string');
        }
    });
};

PushwooshClient.prototype.deleteMessage = function (msgCode, callback) {
    if (!msgCode) {
        return callback('Message code must be provided');
    }

};

module.exports = PushwooshClient;