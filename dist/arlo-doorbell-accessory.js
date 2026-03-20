"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArloDoorbellAccessory = void 0;
const arlo_api_1 = require("arlo-api");
const utils_1 = require("./utils/utils");
const arlo_events_1 = __importDefault(require("arlo-api/dist/constants/arlo-events"));
const arlo_camera_accessory_1 = require("./arlo-camera-accessory");
/**
 * Homekit does not support a stand-alone doorbell accessory. It must
 * be part of a video doorbell.
 */
class ArloDoorbellAccessory extends arlo_camera_accessory_1.ArloCameraAccessory {
    constructor(platform, accessory) {
        super(platform, accessory);
        const device = accessory.context.device;
        accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Arlo')
            .setCharacteristic(this.platform.Characteristic.Model, device.modelId)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, device.deviceId);
        // NOTE: Only the doorbell is supported at this time.
        // Get the Doorbell service if it exists, otherwise create a new service.
        // Multiple services can be created for each accessory.
        this.doorbellService =
            accessory.getService(this.platform.Service.Doorbell) ||
                accessory.addService(this.platform.Service.Doorbell);
        // Sets the service name, this is what is displayed as the default name on the Home app.
        this.doorbellService.setCharacteristic(this.platform.Characteristic.Name, (0, utils_1.DisplayName)());
        // Each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Doorbell
        // add characteristic ProgrammableSwitchEvent
        this.doorbellService
            .getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
            .onGet(() => null);
        this.doorbellService.setPrimaryService(true);
        this.basestation = new arlo_api_1.Basestation(platform.arlo, device);
        // Fire off basestation subscribe.
        this.subscribe();
        this.openStream();
    }
    subscribe() {
        // Explicitly enable events.
        this.basestation.enableDoorbellAlerts();
        // Subscribe to basestation events.
        this.basestation.on(arlo_events_1.default.open, () => {
            this.log.debug('Basestation stream opened');
        });
        // It's necessary to debounce the stream closed events as
        // we could end up trying to restore the stream multiple times at once.
        const streamClosed = (data) => {
            this.log.debug(`Basestation stream closed: ${data}`);
            // Let the platform know that an accessory stream was closed.
            this.platform.streamClosed(this);
        };
        const debounceStreamClose = (0, utils_1.debounce)(streamClosed, 2000);
        this.basestation.on(arlo_events_1.default.close, debounceStreamClose);
        this.basestation.on(arlo_events_1.default.error, (data) => {
            this.basestation.close();
            this.log.debug('error encountered');
            this.log.debug(data);
        });
        this.basestation.on(arlo_events_1.default.doorbellAlert, () => {
            this.log('Doorbell alert encountered!');
            this.doorbellService
                .getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
                .updateValue(this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
        });
        // Secret keep alive event.
        this.basestation.on('pong', () => {
            this.log.debug('ping');
        });
    }
    async openStream() {
        this.log.debug('Starting Basestation stream');
        await this.basestation.startStream();
    }
}
exports.ArloDoorbellAccessory = ArloDoorbellAccessory;
//# sourceMappingURL=arlo-doorbell-accessory.js.map