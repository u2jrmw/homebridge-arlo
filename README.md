# Homebridge Arlo (u2jrmw fork)

**Package:** `homebridge-arlo-u2jrmw` · **Upstream:** [wo-d/homebridge-arlo](https://github.com/wo-d/homebridge-arlo) (`homebridge-arlo-v2` on npm)

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/u2jrmw/homebridge-arlo/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/u2jrmw/homebridge-arlo/tree/main)

Homebridge plugin for Arlo.
Supports MFA either by **IMAP** (read the OTP from your inbox) or by entering the **6-digit code** in config as `mfaCode` (you still set `emailUser` to the address that matches your Arlo email MFA factor). Manual codes expire quickly—useful when you cannot use IMAP or for a one-off login.

This plugin depends on [u2jrmw/arlo-api](https://github.com/u2jrmw/arlo-api) (fork of [wo-d/arlo-api](https://github.com/wo-d/arlo-api)) for the MFA behaviour above. See the fork README for configuration details.

Feel free to fork or make pull requests with additional features.

## Caveats

- Library only supports Doorbell events.
- Extremely nascent implementation. There may be unrecoverable states which require restart.
  - When a login occurs to Arlo they close any other open connection. This poses a problem as the underlying library must maintain a connection to listen for events.

## Installation

This varies by homebridge installation and gui.

## Development

### Debugging

[Install homebridge locally](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Windows-10) to development machine.

Update homebridge configuration file. Default location in Windows `C:\Users\{username}\.homebridge\config.json`

```json
{
  "bridge": {
    "name": "test bridge",
    "username": "AA:AA:AA:AA:AA:AA",
    "port": 51826,
    "pin": "111-11-111"
  },
  "platforms": [
    {
      "name": "Config",
      "port": 8581,
      "auth": "form",
      "theme": "auto",
      "tempUnits": "c",
      "lang": "auto",
      "log": {
        "method": "file",
        "path": "C:\\Users\\{username}\\.homebridge\\homebridge.log"
      },
      "platform": "config"
    },
    {
      "arloUser": "user",
      "arloPassword": "pw",
      "emailUser": "email@gmail.com",
      "emailPassword": "pw",
      "emailServer": "imap.gmail.com",
      "emailImapPort": 993,
      "debug": true,
      "enableRetry": true,
      "retryInterval": 5,
      "platform": "Arlo v2"
    }
  ],
  "accessories": []
}
```

For **manual MFA** (no IMAP), omit `emailPassword`, `emailServer`, and `emailImapPort`, and set a fresh 6-digit `mfaCode` from your Arlo email when the plugin needs to log in again.

Included is a VSCode launch profile for debugging the plugin. Courtesy of [jeff-winn](https://github.com/jeff-winn/homebridge-veml7700-sensor). Attach some breakpoints and run the `Launch` profile.
