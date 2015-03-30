var test = require('tape'),
    Fraudster = require('fraudster'),
    fraudster = new Fraudster(),
    pathToObjectUnderTest = '../index.js',
    errors = require('../lib/errors');


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

