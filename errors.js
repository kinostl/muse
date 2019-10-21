class DatabaseError extends Error {
    constructor(params) {
        super(params);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class MuseError extends Error {
    constructor(params) {
        super(params);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    DatabaseError,
    MuseError,
}
