# pushwoosh-node-client

[![Build Status](https://travis-ci.org/nluo/pushwoosh-node-client.svg?branch=master)](https://travis-ci.org/nluo/pushwoosh-node-client) [![Join the chat at https://gitter.im/nluo/pushwoosh-node-client](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nluo/pushwoosh-node-client?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A node js client to consume the Pushwoosh API to send push notifications to mobile devices

## Quick Reference

#### Installation

    npm i pushwoosh-client --save


#### Send message to all devices

```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh("AppCode", "AuthToken");

client.sendMessage('Hello world', function(error, response) {
     if (error) {
        console.log('Some error occurs: ', error);
     }

     console.log('Pushwoosh API response is', response);
});
```

#### To a specific device or devices
To send messages to a specificed device or devices, you can pass a device token or an arrays with devices

```javascript
// Push to a device
client.sendMessage('Hello world', 'device token', function(error, response) {
     ...
});
// Push to multiple devices
client.sendMessage('Hello world', ['deviceToken1', 'deivceToken2'], function(error, response) {
     ...
});
```

#### Extra options/payload
To pass extra options (please refer to the Pushwoosh [doc](http://docs.pushwoosh.com/docs/createmessage) for the available options) , you could define an option object and pass it to the function as a 2nd or 3rd parameter. E.g. if you want to pass addtional payload to the device, you could do:

```javascript
var Pushwoosh = require('pushwoosh-client'),
    client= new Pushwoosh("AppCode", "AuthToken"),
    options = {
        data: {
            username: 'bob smith',
            email: 'bob@example.com'
        }
    };
    client.sendMessage('Hello world', 'device token', options, function(error, response) {
     ...
    });
```
Note that if you define devices or content in the options, the devices and message will be overwritten.
```javascript
var options = {
        data: {
            username: 'bob smith',
            email: 'bob@example.com'
        },
        devices: ['deviceToken1', 'deviceToken2', 'deviceToken3']
    };
client.sendMessage('Hello world', 'device token', options, function(error, response) {
     ...
});
```
Then this will send to ['deviceToken1', 'deviceToken2', 'deviceToken3'] as defined in options.  so you probably just want to just do
```javascript
client.sendMessage('Hello world', options, function(error, response) {
    ...
});
```

#### Applications group
To use Puswoosh `applications_group` code(which allows you to send to multilple applications) instead of `application` code, you must pass a third `options` argument when creating the client with `useApplicationsGroup` set to true:
```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh("AppsGroupCode", "AuthToken", {
    useApplicationsGroup: true,
    ...
});

// Will push using "applications_group":"AppsGroupCode" for all of the explained invocation patterns
client.sendMessage('Hello world', function(error, response) {
     ...
});
// or
client.sendMessage('Hello world', options, function(error, response) {
    ...
});
// ... and so on
```

#### Register device
To register a device's push token in Pushwoosh:
```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh('AppCode', 'AuthToken');

var registerDeviceOptions = {
    push_token: 'pushtoken',
    hwid: 'hwid',
    device_type: 3,
    language: 'en', // optional, two-letter code ISO-639-1
    timezone: -3600 // optional, offset in seconds
};

// this will register the device for the client's 'AppCode' application
client.registerDevice(registerDeviceOptions, function(error, response) {
     ...
});
```

#### Unregister device
To unregister a device in Pushwoosh:
```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh('AppCode', 'AuthToken');

var unregisterDeviceOptions = {
    hwid: 'hwid'
};

// this will unregister the device from the client's 'AppCode' application
client.unregisterDevice(unregisterDeviceOptions, function(error, response) {
     ...
});
```

#### Set tags for device
To set tags for a device in Pushwoosh:
```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh('AppCode', 'AuthToken');
 
var setTagsOptions = {
    hwid: 'hwid',
    tags: {
        price: "1.99",
        language: "pl"
    }
};
 
// this will set the device tags for the client's 'AppCode' application
client.setTags(setTagsOptions , function(error, response) {
    ...
});
```
 
#### Get tags for device
To get tags for a device from Pushwoosh:
```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh('AppCode', 'AuthToken');

var getTagsOptions = {
    hwid: 'hwid'
};

// this will get the device tags for the client's 'AppCode' application
client.getTags(getTagsOptions , function(error, response) {
    ...
});
```

#### Send Targeted Message
To view the syntax for device_filter and to pass extra options (please refer to the Pushwoosh [doc](http://docs.pushwoosh.com/docs/createtargetedmessage) for the available options).

```javascript
var Pushwoosh = require('pushwoosh-client'),
    client= new Pushwoosh("AuthToken"),
    options = {
        device_filter: 'A("00000-00000") * T("gender", EQ, "F")'
    };
    client.sendMessage('Hello world', options, function(error, response) {
     ...
    });
```

### Tests

    npm test

Currently tests are all passed and with 100% coverage
