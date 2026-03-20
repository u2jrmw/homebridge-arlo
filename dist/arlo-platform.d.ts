import { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { arloOptionsInterface } from './arlo-config';
import { Client } from 'arlo-api';
import { ArloDoorbellAccessory } from './arlo-doorbell-accessory';
export declare class ArloPlatform implements DynamicPlatformPlugin {
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly api: API;
    readonly log: Logging;
    config: arloOptionsInterface;
    arlo: Client;
    readonly accessories: PlatformAccessory[];
    constructor(log: Logging, config: PlatformConfig, api: API);
    /**
     * Event handler called by an accessory when it receives a closed stream event.
     * @param accessory
     */
    streamClosed(accessory: ArloDoorbellAccessory): void;
    /**
     * Discovers all Arlo devices connected to account.
     *
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices(): Promise<void>;
    /**
     * Login to the arlo system.
     * @returns true when login is successful, false otherwise.
     */
    login(): Promise<boolean>;
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     * @param accessory
     */
    configureAccessory(accessory: PlatformAccessory): void;
    /**
     * Wraps log info call if debug configuration is set to true.
     * @param message
     * @param parameters
     */
    debug(message: string, ...parameters: unknown[]): void;
}
//# sourceMappingURL=arlo-platform.d.ts.map