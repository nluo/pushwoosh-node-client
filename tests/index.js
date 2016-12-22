var test = require('tape'),
    Fraudster = require('fraudster'),
    fraudster = new Fraudster(),
    pathToObjectUnderTest = '../index.js',
    errors = require('../lib/errors'),
    testAppCode = 'testAppCode',
    testAuthToken = 'testAuthToken',
    testHost = 'http://localhost',
    testApiVersion = '123',
    testMsg = 'Hello World',
    testError = 'Oooops',
    testMsgCode = '112233';

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

test('Pushwoosh client exists', function (t) {
    t.plan(2);
    var client = getCleanTestObject();
    t.ok(client, 'Pushwoosh client does exist');
    t.equal(typeof client, 'function', 'Pushwoosh is a function as expected');
});

test('Pushwoosh constructor success case', function (t) {
    t.plan(4);

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken, {host: testHost, apiVersion: testApiVersion});

    t.equal(client.appCode, testAppCode, 'Application code passed correctly');
    t.equal(client.authToken, testAuthToken, 'Auth token passed correctly');
    t.equal(client.apiVersion, testApiVersion, 'API version correct');
    t.equal(client.host, testHost, 'API host correct');

});

test('Pushwoosh constructor success case with options', function (t) {
    t.plan(4);

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    t.equal(client.appCode, testAppCode, 'Application code passed correctly');
    t.equal(client.authToken, testAuthToken, 'Auth token passed correctly');
    t.ok(client.apiVersion, 'API version exists');
    t.ok(client.host, 'API host exists');

});

test('Pushwoosh constructor success case for applications_group', function (t) {
    t.plan(3);

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken, {useApplicationsGroup: true});

    t.equal(client.appCode, testAppCode, 'Application code passed correctly');
    t.equal(client.authToken, testAuthToken, 'Auth token passed correctly');
    t.equal(client.useApplicationsGroup, true, 'useApplicationsGroup correct');

});


test('Pushwoosh constructor test error case 1: no appCode and authToken', function (t) {
    t.plan(2);

    var PwClient = getCleanTestObject();

    try {
        var client = new PwClient();
    } catch (e) {
        t.ok(e, 'Exception exists');
        t.deepEqual(e, new Error('Application ID and Authentication Token from Pushwoosh must be provided'), 'Error does match');
    }
});

test('Pushwoosh constructor test error case 2: appcode/authToken missing', function (t) {
    t.plan(2);

    var PwClient = getCleanTestObject();

    try {
        var client = new PwClient('appCode');
    } catch (e) {
        t.ok(e, 'Exception exists');
        t.deepEqual(e, new Error('Application ID and Authentication Token from Pushwoosh must be provided'), 'Error does match');
    }
});


test('Pushwoosh send message success case with only 2 params msg and callback', function (t) {
    t.plan(5);

    var mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message success case for useApplicationsGroup:true with only 2 params msg and callback', function (t) {
    t.plan(5);

    var mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                applications_group: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken, {useApplicationsGroup: true});


    client.sendMessage(testMsg, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message success case with 3 params: msg, device(as string), callback', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: [mockDevice]
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message success case with one device (as array) but without options (3 params)', function (t) {
    t.plan(5);

    var mockDevice = ['device1'],
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: mockDevice
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, ['device1'], function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh send message success case with multiple devices (in array) but without options (3 params)', function (t) {
    t.plan(5);

    var mockDevice = ['device1', 'device2'],
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: mockDevice
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});


test('Pushwoosh send message success case with 3 params: msg, options, callback', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message success case for useApplicationsGroup:true with 3 params: msg, options, callback', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                applications_group: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken, {useApplicationsGroup: true});


    client.sendMessage(testMsg, mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message success case with 4 params: msg, device, options, callback', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: [mockDevice]
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message success case with multiple devices with all the 4 params(msg, device, options, callback)', function (t) {
    t.plan(5);

    var mockDevice = ['device1', 'device2'],
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: mockDevice
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });

});

test('Pushwoosh send message error case with no msg passed', function (t) {
    t.plan(2);

    var mockDevice = 'someToken',
        mockOptions = {};

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage({}, mockDevice, mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Message has to be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});


test('Pushwoosh send message error case 2', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: [mockDevice]
                }]
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(testError);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, mockOptions, function (err, response) {
        t.notOk(response, 'No response as expected');
        t.deepEqual(err, testError, 'Error is as expected');
    });

});


test('Pushwoosh send message success case with response code 200 but status code 210', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 210,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: [mockDevice]
                }]
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, expectedResult, 'response is the same');
    });

});


test('Pushwoosh send message error case with response code 500', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        mockResponse = {
            statusCode: 500
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: [mockDevice]
                }]
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, mockOptions, function (err, response) {
        t.notOk(response, 'No response as expected');
        t.deepEqual(err, new errors.Internal(), 'Got Internal Error!');
    });

});


test('Pushwoosh send message error case with response code 500 test 2', function (t) {
    t.plan(5);

    var mockResponse = {
            statusCode: 500
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg
                }]
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, function (err, response) {
        t.notOk(response, 'No response as expected');
        t.deepEqual(err, new errors.Internal(), 'Got Internal Error!');
    });
});

test('Pushwoosh send message error case with response code 400', function (t) {
    t.plan(5);

    var mockResponse = {
            statusCode: 400
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg
                }]
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, function (err, response) {
        t.notOk(response, 'No response as expected');
        t.deepEqual(err, new errors.Malformed(), 'Got Malformed Error!');
    });
});


test('Pushwoosh send message success case with no response code', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockOptions = {},
        mockResponse = {},
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                auth: testAuthToken,
                notifications: [{
                    send_date: 'now',
                    ignore_user_timezone: true,
                    content: testMsg,
                    devices: [mockDevice]
                }]
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);


    client.sendMessage(testMsg, mockDevice, function (err, response) {
        t.notOk(response, 'No response as expected');
        t.deepEqual(err, new Error('Unknown response code / error'), 'Got Correct Error!');
    });
});

test('Pushwoosh client delete message test 1', function (t) {
    t.plan(5);
    var expectedBody = {
            request: {
                auth: testAuthToken,
                message: testMsgCode
            }
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        };
    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.deleteMessage(testMsgCode, function (err, response) {
        t.notOk(err, 'No error');
        t.deepEqual(response, {}, 'Response is as expected');
    });
});

test('Pushwoosh client delete message test error case 1', function (t) {
    t.plan(2);

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.deleteMessage({}, function (err, response) {

        t.deepEqual(err, new Error('Message code must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh client delete message test 2', function (t) {
    t.plan(5);
    var expectedBody = {
            request: {
                auth: testAuthToken,
                message: testMsgCode
            }
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        };
    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(testError);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.deleteMessage(testMsgCode, function (err, response) {

        t.deepEqual(err, testError, 'Error is as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh register token success case with only required params', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh register token success case with required params and timezone', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockTimezone = 'mockTimezone',
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType,
            timezone: mockTimezone
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType,
                timezone: mockTimezone
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh register token success case with required params and language', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockLanguage = 'mockLanguage',
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType,
            language: mockLanguage
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType,
                language: mockLanguage
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh register token success case with required params, timezone and language', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockTimezone = 'mockTimezone',
        mockLanguage = 'mockLanguage',
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType,
            timezone: mockTimezone,
            language: mockLanguage
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType,
                timezone: mockTimezone,
                language: mockLanguage
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh register token error case with no push token', function (t) {
    t.plan(2);

    var mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockOptions = {
            hwid: mockHwid,
            device_type: mockDeviceType
        };

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Device push token must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh register token error case with no hwid', function (t) {
    t.plan(2);

    var mockDevice = 'someToken',
        mockDeviceType = 3,
        mockOptions = {
            push_token: mockDevice,
            device_type: mockDeviceType
        };

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Device hwid must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh register token error case with no device type', function (t) {
    t.plan(2);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid
        };

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Device type must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh register token success case with response code 200 but status code 210', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 210,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, expectedResult, 'response is the same');
    });
});

test('Pushwoosh register token error case with response code 400', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType
        },
        mockResponse = {
            statusCode: 400
        },
        mockBodyResponse = {
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.deepEqual(err, new errors.Malformed(), 'Got Malformed Error!');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh register token error case with response code 500', function (t) {
    t.plan(5);

    var mockDevice = 'someToken',
        mockHwid = 'someHwid',
        mockDeviceType = 3,
        mockOptions = {
            push_token: mockDevice,
            hwid: mockHwid,
            device_type: mockDeviceType
        },
        mockResponse = {
            statusCode: 500
        },
        mockBodyResponse = {
            status_code: 500,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                push_token: mockDevice,
                hwid: mockHwid,
                device_type: mockDeviceType
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.registerDevice(mockOptions, function (err, response) {
        t.deepEqual(err, new errors.Internal(), 'Got Internal Error!');
        t.notOk(response, 'No response as expected');
    });
});


test('Pushwoosh unregister token success case', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.unregisterDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh unregister token error case with no hwid', function (t) {
    t.plan(2);

    var mockOptions = {};

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.unregisterDevice(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Device hwid must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh unregister token success case with response code 200 but status code 210', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 210,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.unregisterDevice(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, expectedResult, 'response is the same');
    });
});

test('Pushwoosh unregister token error case with response code 400', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 400
        },
        mockBodyResponse = {
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.unregisterDevice(mockOptions, function (err, response) {
        t.notOk(response, 'No error as expected');
        t.deepEqual(err, new errors.Malformed(), 'Got Malformed Error!');
    });
});

test('Pushwoosh unregister token error case with response code 500', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 500
        },
        mockBodyResponse = {
            status_code: 500,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.unregisterDevice(mockOptions, function (err, response) {
        t.notOk(response, 'No error as expected');
        t.deepEqual(err, new errors.Internal(), 'Got Internal Error!');
    });
});

test('Pushwoosh get tags success case', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {
            result: {
                  language: "fr"
                }
            }
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        },
        expectedResponse = {
            result: {
                language: "fr"
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.getTags(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, expectedResponse, 'response is the same');
    });
});

test('Pushwoosh get tags error case with no hwid', function (t) {
    t.plan(2);

    var mockOptions = {};

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.getTags(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Device hwid must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh get tags success case with response code 200 but status code 210', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 210,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.getTags(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, expectedResult, 'response is the same');
    });
});

test('Pushwoosh get tags error case with response code 400', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 400
        },
        mockBodyResponse = {
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.getTags(mockOptions, function (err, response) {
        t.notOk(response, 'No error as expected');
        t.deepEqual(err, new errors.Malformed(), 'Got Malformed Error!');
    });
});

test('Pushwoosh get tags error case with response code 500', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        },
        mockResponse = {
            statusCode: 500
        },
        mockBodyResponse = {
            status_code: 500,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.getTags(mockOptions, function (err, response) {
        t.notOk(response, 'No error as expected');
        t.deepEqual(err, new errors.Internal(), 'Got Internal Error!');
    });
});

test('Pushwoosh set tags success case with many tags', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid,
            tags: {
                stringTag: "string value",
                integerTag: 42,
                listTag: ["string1","string2"],
                dateTag: "2015-10-02 22:11",
                booleanTag: true
            }
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 200,
            response: {}
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid,
                tags: {
                    stringTag: "string value",
                    integerTag: 42,
                    listTag: ["string1","string2"],
                    dateTag: "2015-10-02 22:11",
                    booleanTag: true
                }
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.setTags(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, {}, 'response is the same');
    });
});

test('Pushwoosh set tags error case with no hwid', function (t) {
    t.plan(2);

    var mockOptions = {};

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.setTags(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Device hwid must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh set tags error case with no tags', function (t) {
    t.plan(2);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid
        };

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.setTags(mockOptions, function (err, response) {
        t.deepEqual(err, new Error('Tags must be provided'), 'Error as expected');
        t.notOk(response, 'No response as expected');
    });
});

test('Pushwoosh set tags success case with response code 200 but status code 210', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid,
            tags: {
                stringTag: "string value",
                integerTag: 42,
                listTag: ["string1","string2"],
                dateTag: "2015-10-02 22:11",
                booleanTag: true
            }
        },
        mockResponse = {
            statusCode: 200
        },
        mockBodyResponse = {
            status_code: 210,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid,
                tags: {
                    stringTag: "string value",
                    integerTag: 42,
                    listTag: ["string1","string2"],
                    dateTag: "2015-10-02 22:11",
                    booleanTag: true
                }
            }
        },
        expectedResult = {description: 'Argument error', detail: mockBodyResponse.status_message, code: 210};

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.setTags(mockOptions, function (err, response) {
        t.notOk(err, 'No error as expected');
        t.deepEqual(response, expectedResult, 'response is the same');
    });
});

test('Pushwoosh set tags error case with response code 400', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid,
            tags: {
                stringTag: "string value",
                integerTag: 42,
                listTag: ["string1","string2"],
                dateTag: "2015-10-02 22:11",
                booleanTag: true
            }
        },
        mockResponse = {
            statusCode: 400
        },
        mockBodyResponse = {
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid,
                tags: {
                    stringTag: "string value",
                    integerTag: 42,
                    listTag: ["string1","string2"],
                    dateTag: "2015-10-02 22:11",
                    booleanTag: true
                }
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.setTags(mockOptions, function (err, response) {
        t.notOk(response, 'No error as expected');
        t.deepEqual(err, new errors.Malformed(), 'Got Malformed Error!');
    });
});

test('Pushwoosh set tags error case with response code 500', function (t) {
    t.plan(5);

    var mockHwid = 'someHwid',
        mockOptions = {
            hwid: mockHwid,
            tags: {
                stringTag: "string value",
                integerTag: 42,
                listTag: ["string1","string2"],
                dateTag: "2015-10-02 22:11",
                booleanTag: true
            }
        },
        mockResponse = {
            statusCode: 500
        },
        mockBodyResponse = {
            status_code: 500,
            response: {},
            status_message: testError
        },
        expectedBody = {
            request: {
                application: testAppCode,
                hwid: mockHwid,
                tags: {
                    stringTag: "string value",
                    integerTag: 42,
                    listTag: ["string1","string2"],
                    dateTag: "2015-10-02 22:11",
                    booleanTag: true
                }
            }
        };

    fraudster.registerMock('request', function (params, callback) {
        t.ok(params, 'Params exists');
        t.deepEqual(params.body, expectedBody, 'Body are as expected');
        t.equal(params.method, 'POST', 'Method is POST as expected');
        callback(null, mockResponse, mockBodyResponse);
    });

    var PwClient = getCleanTestObject(),
        client = new PwClient(testAppCode, testAuthToken);

    client.setTags(mockOptions, function (err, response) {
        t.notOk(response, 'No error as expected');
        t.deepEqual(err, new errors.Internal(), 'Got Internal Error!');
    });
});