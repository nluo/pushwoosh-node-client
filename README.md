# pushwoosh-node-client [![Build Status](https://travis-ci.org/nluo/pushwoosh-node-client.svg?branch=master)](https://travis-ci.org/nluo/pushwoosh-node-client)
A node js client to consume the Pushwoosh API to send push notifications to mobile devices

## Installation

    npm i pushwoosh-client --save
    
## Usage

Send messages to all devices
```javascript
var Pushwoosh = require('pushwoosh-client');
var client= new Pushwoosh("AppCode", "AuthToken");

client.sendMessage('Hello world', function(error, response) {
     if (error) {
        console.log('Some error occurs: ', error);
     }

     console.log('Pushwoosh API response is', response);
}
});
```

To send messages to a specificed device or devices, you can pass a device token or an arrays with devices

```javascript
// Push to a device
client.sendMessage('Hello world', 'device token', function(error, response) {
     if (error) {
        console.log('Some error occurs: ', error);
     }
     console.log('Pushwoosh API response is', response);
}
});
// Push to multiple devices
client.sendMessage('Hello world', ['deviceToken1', 'deivceToken2'], function(error, response) {
     if (error) {
        console.log('Some error occurs: ', error);
     }
     console.log('Pushwoosh API response is', response);
}
});
```

## Tests

    npm test

Currently tests are all passed and with 100% coverage
