var request = require('request'),
    extend = require('util')._extend,
    errors = require('./lib/errors'),
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

PushwooshClient.prototype.sendMessage = function (msg, device, options, callback) {

    var client = this;
    if (!msg || typeof msg !== 'string') {
        return callback(new Error('Message has to be provided'));
    }

    if (!options) {
        callback = device;
        options = {};
        device = null;
    }

    if (!callback) {
        callback = options;
        if (typeof device === 'object') {
            options = device;
            device = null;
        }

        if (typeof device === 'string') {
            options = {};
        }
    }

    var devices = [];

    if (device && typeof device === 'string') {
        devices.push(device);
    }

    if (device && device instanceof Array) {
        devices = device;
    }

    var defaultOptions = {
        send_date: 'now',
        ignore_user_timezone: true,
        content: msg,
        devices: devices
    };

    var notification = extend(defaultOptions, options);

    var body = {
        request: {
            application: client.appCode,
            auth: client.authToken,
            notifications: [notification]
        }
    };

    client.sendRequest('createMessage', body, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    });
};

PushwooshClient.prototype.deleteMessage = function (msgCode, callback) {

    var client = this;

    if (typeof msgCode !== 'string') {
        return callback(new Error('Message code must be provided'));
    }

    var body = {
        request: {
            auth: client.authToken,
            message: msgCode
        }
    };

    client.sendRequest('deleteMessage', body, function(error, response, body){
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    })
};


PushwooshClient.prototype.sendRequest = function (method, data, callback) {
    request({
        method: 'POST',
        uri: this.host + '/' + this.apiVersion + '/' + method,
        json: true,
        body: data
    }, callback);
};

PushwooshClient.prototype.parseResponse = function(response, body, callback) {
    if (response.statusCode === 200 && body.status_code === 200) {
        return callback(null, body.response);
    }

    if (response.statusCode === 200 && body.status_code === 210) {
        return callback(null, {description: 'Argument error', detail: body.status_message, code: 210});
    }

    if (response.statusCode === 500) {
        return callback(new errors.Internal());
    }

    if (response.statusCode === 400) {
        return callback(new errors.Malformed());
    }

    callback(new Error('Unknown response code / error'));
};

module.exports = PushwooshClient;