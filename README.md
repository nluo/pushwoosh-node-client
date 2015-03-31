# pushwoosh-node-client
A node js client to consume the Push Woosh API

## Installation

## Usage
```javascript
  var Pushwoosh = require('pushwoosh-node-client');
  var client= new Pushwoosh("AppCode", "AuthToken");

};

client.sendMessage('Hello world', 'device token', function(error, response) {
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
