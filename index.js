'use strict';

const {
    format,
    createLogger,
    transports,
    addColors
} = require('winston');

const ignorePrivate = format(info => {
    if (info.private) {
        return false;
    }
    return info;
});

const configLevels = {
    levels: {
        error: 0,
        debug: 1,
        warn: 2,
        data: 3,
        info: 4,
        verbose: 5,
        silly: 6,
        custom: 7
    },
    colors: {
        error: 'red',
        debug: 'white',
        warn: 'yellow',
        data: 'grey',
        info: 'green',
        verbose: 'cyan',
        silly: 'magenta',
        custom: 'yellow'
    }
};

addColors(configLevels.colors);


const logger = createLogger({
    levels: configLevels.levels,
    format: format.combine(
        ignorePrivate(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => {
            const obj = Object.assign({}, info);
            delete obj.message;
            delete obj.level;
            delete obj.timestamp;
            return `${info.timestamp} ${info.level} - ${info.message}: ${JSON.stringify(obj, null, 2)}`;
        })
    ),
    transports: [
        new transports.File({
            filename: 'errors.log',
            level: 'error',
            maxsize: 10000000,
            handleExceptions: true
        }),
        new transports.File({
            filename: 'full.log',
            maxsize: 10000000,
            handleExceptions: true
        })
    ],
    level: 'silly',
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        handleExceptions: true,
        format: format.combine(
            format.colorize({
                all: true
            }),
            format.printf(info => {
                const obj = Object.assign({}, info);
                delete obj.message;
                delete obj.level;
                delete obj.timestamp;
                return `${info.timestamp} ${info.level} - ${info.message}: ${JSON.stringify(obj, null, 2)}`;
            })
        ),
    }));
}

module.exports = logger;


logger.info('Hello there. How are you?');
logger.custom('hello');
logger.info('Hello again distributed logs', {
    pippo: {
        pluto: 'hello',
        ooo: 2.4,
        sasas: [1, 2, 3],
        ole: {
            prova: true
        }
    }
});
logger.warn('some foobar level-ed message');
logger.error('some baz level-ed message');
logger.silly('some bar level-ed message');


// Messages with { private: true } will not be written when logged.
logger.log({
    private: true,
    level: 'error',
    message: 'This is super secret - hide it.'
});

// uncomment to see logged exceptions in console and file
// throw new Error('Hello, winston!');