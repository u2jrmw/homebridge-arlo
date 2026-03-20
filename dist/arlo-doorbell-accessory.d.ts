import { ArloPlatform } from './arlo-platform';
import { PlatformAccessory } from 'homebridge';
import { ArloCameraAccessory } from './arlo-camera-accessory';
/**
 * Homekit does not support a stand-alone doorbell accessory. It must
 * be part of a video doorbell.
 */
export declare class ArloDoorbellAccessory extends ArloCameraAccessory {
    private doorbellService;
    private readonly basestation;
    constructor(platform: ArloPlatform, accessory: PlatformAccessory);
    private subscribe;
    openStream(): Promise<void>;
}
//# sourceMappingURL=arlo-doorbell-accessory.d.ts.map