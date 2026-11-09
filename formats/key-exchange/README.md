# key-exchange/1 (internal apps only; WS-202)

In-person swap of public keys between two devices, by QR code and by NFC, producing `device-keys/1` entries.
Reuses `ws-ecies-1` from the team site. Payload: public key, person, device, installation, app version, a
signature over them, and a short expiry; never a private key. Here: the schema and a synthetic sample only.
