import { PlatformAccessory, Logging, CharacteristicValue } from 'homebridge';
import { ArloPlatform } from './arlo-platform';
export declare class ArloCameraAccessory {
    protected readonly platform: ArloPlatform;
    protected readonly accessory: PlatformAccessory;
    protected readonly log: Logging;
    private cameraService;
    private motionService;
    constructor(platform: ArloPlatform, accessory: PlatformAccessory);
    private controllerOptions;
    private cameraStreamingDelegate;
    private cameraStreamingOptions;
    private cameraFunction;
    private motionFunction;
    handleEventSnapshotsActiveGet(): CharacteristicValue;
    handleEventSnapshotsActiveSet(value: CharacteristicValue): void;
    handleHomeKitCameraActiveGet(): CharacteristicValue;
    handleHomeKitCameraActiveSet(value: CharacteristicValue): void;
    handleMotionDetectedGet(): CharacteristicValue;
}
//# sourceMappingURL=arlo-camera-accessory.d.ts.map