"use strict";
const settings_1 = require("./settings");
const arlo_platform_1 = require("./arlo-platform");
module.exports = (api) => {
    api.registerPlatform(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, arlo_platform_1.ArloPlatform);
};
//# sourceMappingURL=index.js.map