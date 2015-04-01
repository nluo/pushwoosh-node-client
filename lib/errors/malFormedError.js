function MalformedError() {
    var error = Error.apply(this, arguments);
    this.message = error.message || 'Malformed request string';
}

MalformedError.prototype = Object.create(Error.prototype);
MalformedError.prototype.constructor = MalformedError;
MalformedError.prototype.code = 400;

module.exports = MalformedError;
