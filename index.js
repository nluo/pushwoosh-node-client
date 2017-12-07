var request = require('request'),
    extend = require('util')._extend,
    errors = require('./lib/errors'),
    host = 'https://cp.pushwoosh.com/json',
    apiVersion = '1.3';

function PushwooshClient(appCode, authToken, options) {
    var isTargetedMessage = false;
    if(!options && authToken && authToken.hasOwnProperty('isTargetedMessage')){
        isTargetedMessage = true;
        if(!appCode) {
            throw new Error('Authentication Token from Pushwoosh must be provided');
        }
    }
    if (!appCode || !authToken) {
        throw new Error('Application/ApplicationsGroup ID and Authentication Token from Pushwoosh must be provided');
    }

    if(!isTargetedMessage) {
        this.appCode = appCode;
        this.authToken = authToken;
    }
    else{
        this.options = authToken;
        this.authToken = appCode;
        this.appCode = null;
    }

    // parse the options
    options = options || {};

    this.host = options.host || host;
    this.apiVersion = options.apiVersion || apiVersion;
    this.useApplicationsGroup = options.useApplicationsGroup;

    // Default shouldSendToAllDevices to true if not provided
    this.shouldSendToAllDevices =
        typeof options.shouldSendToAllDevices === 'undefined'
        ? true
        : options.shouldSendToAllDevices;
}

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
        if (Array.isArray(device) || typeof device === 'string') {
            options = {};
        } else if (typeof device === 'object') {
            options = device;
            device = null;
        }
    }

    var defaultOptions = {
        send_date: 'now',
        ignore_user_timezone: true,
        content: msg
    };

    var devices = [];

    if (device && typeof device === 'string') {
        devices.push(device);
    }

    if (Array.isArray(device)) {
        devices = device;
    }

    if (this.shouldSendToAllDevices === false && devices.length === 0) {
        return callback(new Error('You have configured not send to all devices, but you have not provided any devices to send!'))
    }

    if (devices.length > 0) {
      defaultOptions.devices = devices;
    }

    var notification = extend(defaultOptions, options);

    var body = {
        request: {
            auth: client.authToken,
            notifications: [notification]
        }
    };

    if (client.useApplicationsGroup) {
        body.request.applications_group = client.appCode;
    } else {
        body.request.application = client.appCode;
    }

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
    });
};

PushwooshClient.prototype.registerDevice = function (options, callback) {
    var client = this;

    if (typeof options.push_token !== 'string') {
        return callback(new Error('Device push token must be provided (string)'));
    }
    if (typeof options.hwid !== 'string') {
        return callback(new Error('Device hwid must be provided (string)'));
    }
    if (typeof options.device_type !== 'number') {
        return callback(new Error('Device type must be provided (number)'));
    }

    var body = {
        request: {
            application: client.appCode,
            push_token: options.push_token,
            hwid: options.hwid,
            device_type: options.device_type
        }
    };
    if (options.timezone) {
        body.request.timezone = options.timezone;
    }
    if (options.language) {
        body.request.language = options.language;
    }

    client.sendRequest('registerDevice', body, function(error, response, body){
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    });
};

PushwooshClient.prototype.unregisterDevice = function (options, callback) {
    var client = this;

    if (typeof options.hwid !== 'string') {
        return callback(new Error('Device hwid must be provided (string)'));
    }

    var body = {
        request: {
            application: client.appCode,
            hwid: options.hwid
        }
    };

    client.sendRequest('unregisterDevice', body, function(error, response, body){
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    });
};

PushwooshClient.prototype.setTags = function(options, callback) {
    var client = this;

    if (typeof options.hwid !== 'string') {
        return callback(new Error('Device hwid must be provided (string)'));
    }

    if (typeof options.tags !== 'object') {
        return callback(new Error('Tags must be provided (object)'));
    }

    var body = {
        request: {
            application: client.appCode,
            hwid: options.hwid,
            tags: options.tags
        }
    };

    client.sendRequest('setTags', body, function(error, response, body){
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    });
};

PushwooshClient.prototype.getTags = function(options, callback) {
    var client = this;

    if (typeof options.hwid !== 'string') {
        return callback(new Error('Device hwid must be provided (string)'));
    }

    var body = {
        request: {
            application: client.appCode,
            hwid: options.hwid
        }
    };

    client.sendRequest('getTags', body, function(error, response, body){
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    });
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

PushwooshClient.prototype.sendTargetedMessage = function (msg, options, callback) {

    var client = this;
    if (!msg || typeof msg !== 'string') {
        return callback(new Error('Message has to be provided'));
    }

    if(options){
        if(options.hasOwnProperty('application')) return callback(new Error('application cannot be used in a Targeted Message'));
        else if(options.hasOwnProperty('applications_group')) return callback(new Error('applications_group cannot be used in a Targeted Message'));
        else if(options.hasOwnProperty('platforms')) return callback(new Error('platforms cannot be used in a Targeted Message'));
        else if(options.hasOwnProperty('devices')) return callback(new Error('devices cannot be used in a Targeted Message'));
        else if(options.hasOwnProperty('filter')) return callback(new Error('filter cannot be used in a Targeted Message'));
        else if(options.hasOwnProperty('conditions')) return callback(new Error('conditions cannot be used in a Targeted Message'));
    }

    if (!options || !options.hasOwnProperty('devices_filter') || typeof options.devices_filter !== 'string') {
        return callback(new Error('Devices Filter has to be provided'));
    }

    var defaultOptions = {
        send_date: 'now',
        content: msg
    };

    var notification = extend(defaultOptions, options);

    var body = {
        request: {
            auth: client.authToken,
        }
    };

    body.request = extend(body.request, notification);

    client.sendRequest('createTargetedMessage', body, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        client.parseResponse(response, body, callback);
    });
};

module.exports = PushwooshClient;
