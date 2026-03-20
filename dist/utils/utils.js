"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = exports.DisplayName = void 0;
/**
 * Returns a display name used for the accessory creation.
 * @private
 */
function DisplayName() {
    return `Arlo Doorbell`;
}
exports.DisplayName = DisplayName;
// Pulled from https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=3062135#gistcomment-3062135
const debounce = (func, waitFor) => {
    let timeout;
    return (...args) => new Promise((resolve) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};
exports.debounce = debounce;
//# sourceMappingURL=utils.js.map