/**
 * Wait until the given condition is met
 * @param {String} message the message to display when a timeout occurs
 * @param {Function} predicate test condition
 * @param {Number} [maxTime] max time to wait (ms); default is 30000
 * @returns {Promise} thenable async task
 */
function waitUntilAsync(message, predicate, maxTime = 30000) {
    return new Promise((resolve, reject) => {
        let retries = 0;
        const checkFunc = () => {
            if (predicate()) {
                resolve();
            } else if (retries++ * 100 > maxTime) {
                reject(`${message}: timeout`);
            } else {
                setTimeout(checkFunc, 100);
            }
        };
        checkFunc();
    });
}
