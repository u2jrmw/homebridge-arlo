"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArloCameraAccessory = void 0;
const utils_1 = require("./utils/utils");
class ArloCameraAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.log = platform.log;
        this.cameraService = this.cameraFunction(accessory);
        this.cameraService.setPrimaryService(true);
        accessory.configureController(new this.platform.api.hap.CameraController(this.controllerOptions()));
        this.motionService = this.motionFunction(accessory);
    }
    controllerOptions() {
        return {
            delegate: this.cameraStreamingDelegate(),
            streamingOptions: this.cameraStreamingOptions(),
        };
    }
    cameraStreamingDelegate() {
        return {
            handleSnapshotRequest() { },
            handleStreamRequest() { },
            prepareStream() { },
        };
    }
    cameraStreamingOptions() {
        return {
            proxy: false,
            supportedCryptoSuites: [],
            video: {
                resolutions: [
                    [320, 180, 30],
                    [320, 240, 15],
                    [320, 240, 30],
                    [480, 270, 30],
                    [480, 360, 30],
                    [640, 360, 30],
                    [640, 480, 30],
                    [1280, 720, 30],
                    [1280, 960, 30],
                    [1920, 1080, 30],
                    [1600, 1200, 30],
                ],
                codec: {
                    profiles: [],
                    levels: [],
                },
            },
            disable_audio_proxy: false,
            srtp: false,
        };
    }
    cameraFunction(accessory) {
        const service = accessory.getService(this.platform.Service.CameraOperatingMode) ||
            accessory.addService(this.platform.Service.CameraOperatingMode);
        service.setCharacteristic(this.platform.Characteristic.Name, (0, utils_1.DisplayName)());
        service
            .getCharacteristic(this.platform.Characteristic.EventSnapshotsActive)
            .onGet(this.handleEventSnapshotsActiveGet.bind(this));
        service
            .getCharacteristic(this.platform.Characteristic.EventSnapshotsActive)
            .onSet(this.handleEventSnapshotsActiveSet.bind(this));
        service
            .getCharacteristic(this.platform.Characteristic.HomeKitCameraActive)
            .onGet(this.handleHomeKitCameraActiveGet.bind(this));
        service
            .getCharacteristic(this.platform.Characteristic.HomeKitCameraActive)
            .onSet(this.handleHomeKitCameraActiveSet.bind(this));
        return service;
    }
    motionFunction(accessory) {
        const service = accessory.getService(this.platform.Service.MotionSensor) ||
            accessory.addService(this.platform.Service.MotionSensor);
        service.setCharacteristic(this.platform.Characteristic.Name, (0, utils_1.DisplayName)());
        service
            .getCharacteristic(this.platform.Characteristic.MotionDetected)
            .onGet(this.handleMotionDetectedGet.bind(this));
        return service;
    }
    handleEventSnapshotsActiveGet() {
        const currentValue = this.platform.Characteristic.EventSnapshotsActive.DISABLE;
        this.log.debug(this.accessory.displayName, 'GET EventSnapshotsActive:', currentValue);
        return currentValue;
    }
    handleEventSnapshotsActiveSet(value) {
        this.log.debug(this.accessory.displayName, 'SET EventSnapshotsActive:', value);
    }
    handleHomeKitCameraActiveGet() {
        const currentValue = this.platform.Characteristic.HomeKitCameraActive.OFF;
        this.log.debug(this.accessory.displayName, 'GET HomeKitCameraActive:', currentValue);
        return currentValue;
    }
    handleHomeKitCameraActiveSet(value) {
        this.platform.log.debug(this.accessory.displayName, 'SET HomeKitCameraActive:', value);
    }
    handleMotionDetectedGet() {
        return false;
    }
}
exports.ArloCameraAccessory = ArloCameraAccessory;
//# sourceMappingURL=arlo-camera-accessory.js.map