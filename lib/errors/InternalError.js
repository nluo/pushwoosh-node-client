function InternalError() {
    var error = Error.apply(this, arguments);
    this.message = error.message || 'Internal Error From Pushwoosh';
}

InternalError.prototype = Object.create(Error.prototype);
InternalError.prototype.constructor = InternalError;
InternalError.prototype.code = 500;

module.exports = InternalError;