# device-keys/1 (internal apps only; WS-202)

A key per device, installation and app version, mapped to its person, with authorisation levels.
Not a new shape: it reuses the team site's (SGit-AI/SGit-AI__Website__Web-Summit, dev) `data/keys.json` (agents),
`data/person-keys.json` (people) and `ws-ecies-1` (`admin/tools/person-key.mjs`), extended by device and installation.
Private keys stay in the platform key store (Android Keystore, iOS Secure Enclave/Keychain) and never leave the device.
Here: the schema and a synthetic sample only, public keys made up for the sample.
