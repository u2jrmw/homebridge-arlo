"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArloPlatform = void 0;
const util = __importStar(require("util"));
const arlo_api_1 = require("arlo-api");
const arlo_doorbell_accessory_1 = require("./arlo-doorbell-accessory");
const settings_1 = require("./settings");
const utils_1 = require("./utils/utils");
function normalizeMfaCode(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
}
class ArloPlatform {
    // TODO: Use the login result object to bypass logging in if possible. Use client's verifyAuthToken method
    // TODO: Idea, create an accessory to cache token.
    // TODO: Check the login result's session expires to generate a new token when close to expiry.
    constructor(log, config, api) {
        // This is used to track restored cached accessories.
        this.accessories = [];
        this.api = api;
        this.log = log;
        this.log.debug = this.debug.bind(this);
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        if (!config) {
            this.log.error('No configuration provided');
            return;
        }
        const mfaCode = normalizeMfaCode(config.mfaCode);
        const useManualMfa = mfaCode !== undefined;
        if (useManualMfa && !/^\d{6}$/.test(mfaCode)) {
            this.log.error('mfaCode must be exactly 6 digits (the one-time code Arlo sends by email).');
            return;
        }
        if (!config.arloUser || !config.arloPassword) {
            this.log.error('arloUser and arloPassword are required.');
            return;
        }
        if (!config.emailUser) {
            this.log.error('emailUser is required (must match your email MFA factor in Arlo).');
            return;
        }
        let emailImapPort = 0;
        let emailPassword = '';
        let emailServer = '';
        if (!useManualMfa) {
            if (!config.emailPassword ||
                !config.emailServer ||
                config.emailImapPort === undefined ||
                config.emailImapPort === '') {
                this.log.error('Provide mfaCode for manual OTP, or emailPassword, emailServer, and emailImapPort for IMAP MFA.');
                return;
            }
            emailImapPort = parseInt(String(config.emailImapPort), 10);
            emailPassword = config.emailPassword;
            emailServer = config.emailServer;
            if (!Number.isFinite(emailImapPort) || emailImapPort <= 0) {
                this.log.error('emailImapPort must be a positive number.');
                return;
            }
        }
        else {
            // Unused when mfaCode is set; satisfies arlo-api config shape.
            emailImapPort = 993;
        }
        this.config = {
            arloPassword: config.arloPassword,
            arloUser: config.arloUser,
            debug: config.debug === true,
            emailImapPort,
            emailPassword,
            emailServer,
            emailUser: config.emailUser,
            enableRetry: config.enableRetry === true,
            retryInterval: parseInt(config.retryInterval),
            ...(useManualMfa ? { mfaCode } : {}),
        };
        if (this.config.enableRetry) {
            if (this.config.retryInterval <= 0) {
                this.log.error('Retry Interval configuration must be a positive integer');
                return;
            }
        }
        try {
            this.arlo = new arlo_api_1.Client(this.config);
        }
        catch (e) {
            this.log.error('Unable to construct an Arlo client with the provided configuration.');
            this.log.error('You are missing a required configuration.');
            this.log.error(e);
            return;
        }
        this.log.info('Homebridge Arlo configuration loaded successfully.');
        this.debug('Debug logging on.');
        api.on("didFinishLaunching" /* APIEvent.DID_FINISH_LAUNCHING */, () => {
            this.debug('Executed didFinishLaunching callback');
            // Run the method to discover / register your devices as accessories.
            this.discoverDevices();
        });
    }
    /**
     * Event handler called by an accessory when it receives a closed stream event.
     * @param accessory
     */
    streamClosed(accessory) {
        if (!this.config.enableRetry) {
            this.log.error('Retries disabled and stream has been closed. Application stalled.');
            return;
        }
        this.debug(`Stream was closed. Retrying to establish connection in ${this.config.retryInterval} minute(s).`);
        // Restart the stream in x minutes.
        setTimeout(() => accessory.openStream(), this.config.retryInterval * 60000);
    }
    /**
     * Discovers all Arlo devices connected to account.
     *
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    async discoverDevices() {
        const loginSuccessful = await this.login();
        if (!loginSuccessful) {
            return;
        }
        const devices = await this.arlo.getDevices();
        if (devices.length === 0) {
            this.log.error('No arlo devices discovered! Terminating early.');
        }
        // Loop over the discovered devices and register each on if it has not already
        // been registered.
        for (const device of devices) {
            // For now the homebridge arlo platform only supports doorbell events...
            if (device.deviceType !== 'basestation') {
                // Commented until I figure out a more suitable message to display to end user without confusion.
                // this.log.debug(`Ignoring non basestation device with name ${DisplayName(device)}.`);
                continue;
            }
            // Generate a unique id for the accessory this should be generated from
            // something globally unique, but constant. Fortunately, Arlo provides
            // us an `uniqueId` property.
            const uuid = this.api.hap.uuid.generate(device.uniqueId);
            // See if an accessory with the same uuid has already been registered and
            // restored from the cached devices we stored in the `configureAccessory`
            // method.
            const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);
            if (existingAccessory) {
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                // If you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                // existingAccessory.context.device = device;
                // this.api.updatePlatformAccessories([existingAccessory]);
                // Create the accessory handler for the restored accessory.
                // The cached device keeps its context.
                new arlo_doorbell_accessory_1.ArloDoorbellAccessory(this, existingAccessory);
                // It is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                // remove platform accessories when no longer present
                // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
                // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
                this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                    existingAccessory,
                ]);
            }
            else {
                this.log.info('Adding new accessory:', (0, utils_1.DisplayName)());
                // Create a new accessory.
                const accessory = new this.api.platformAccessory((0, utils_1.DisplayName)(), uuid);
                // Store a copy of the device object in the `accessory.context`.
                // The `context` property can be used to store any data about the accessory
                // you may need.
                accessory.context.device = device;
                // Create the accessory handler for the newly created accessory.
                new arlo_doorbell_accessory_1.ArloDoorbellAccessory(this, accessory);
                // Link the accessory to the platform.
                this.api.publishExternalAccessories(settings_1.PLUGIN_NAME, [accessory]);
            }
        }
    }
    /**
     * Login to the arlo system.
     * @returns true when login is successful, false otherwise.
     */
    async login() {
        const loginResult = await this.arlo.login().catch((error) => {
            this.log.error('Unable to login to Arlo using provided credentials.');
            this.log.error(error);
            return false;
        });
        return true;
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     * @param accessory
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }
    /**
     * Wraps log info call if debug configuration is set to true.
     * @param message
     * @param parameters
     */
    debug(message, ...parameters) {
        if (this.config.debug) {
            this.log.info(util.format(message, ...parameters));
        }
    }
}
exports.ArloPlatform = ArloPlatform;
//# sourceMappingURL=arlo-platform.js.map