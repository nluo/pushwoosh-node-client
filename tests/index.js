var test = require('tape'),
    Fraudster = require('fraudster'),
    fraudster = new Fraudster(),
    pathToObjectUnderTest = '../index.js',
    errors = require('../lib/errors'),
    testAppCode = 'testAppCode',
    testAuthToken = 'testAuthToken',
    testHost = 'http://localhost',
    testApiVersion = '123';

fraudster.registerAllowables([pathToObjectUnderTest, 'util']);

function resetMocks() {
    fraudster.registerMock('request', {});
    fraudster.registerMock('./lib/errors', errors);
}


function getCleanTestObject() {
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    fraudster.enable({useCleanCache: true, warnOnReplace: false});
    var objectUnderTest = require(pathToObjectUnderTest);
    fraudster.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('Pushwoosh client exists', function(t){
    t.plan(2);
    var client = getCleanTestObject();
    t.ok(client, 'Pushwoosh client does exist');
    t.equal(typeof client, 'function', 'Pushwoosh is a function as expected');
});

test('Pushwoosh constructor success case', function(t){
    t.plan(4);

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken, {host: testHost, apiVersion: testApiVersion});

    t.equal(client.appCode, testAppCode, 'Application code passed correctly');
    t.equal(client.authToken, testAuthToken, 'Auth token passed correctly');
    t.equal(client.apiVersion, testApiVersion, 'API version correct');
    t.equal(client.host, testHost, 'API host correct');

});

test('Pushwoosh constructor success case with options', function(t){
    t.plan(4);

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    t.equal(client.appCode, testAppCode, 'Application code passed correctly');
    t.equal(client.authToken, testAuthToken, 'Auth token passed correctly');
    t.ok(client.apiVersion, 'API version exists');
    t.ok(client.host, 'API host exists');

});


test('Pushwoosh constructor test error case 1: no appCode and authToken', function(t){
    t.plan(2);

    var PwClient = getCleanTestObject();

    try {
        var client = new PwClient();
    } catch (e) {
        t.ok(e, 'Exception exists');
        t.deepEqual(e, new Error('Application ID and Authentication Token from Pushwoosh must be provided'), 'Error does match');
    }
});

test('Pushwoosh constructor test error case 2: appcode/authToken missing', function(t){
    t.plan(2);

    var PwClient = getCleanTestObject();

    try {
        var client = new PwClient('appCode');
    } catch (e) {
        t.ok(e, 'Exception exists');
        t.deepEqual(e, new Error('Application ID and Authentication Token from Pushwoosh must be provided'), 'Error does match');
    }
});

