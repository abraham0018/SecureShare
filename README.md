SecureShare

A secure, peer-to-peer file-sharing application that transfers files directly between devices over a local network — no cloud, no internet dependency, no middleman server. Originally built as a web app and converted into a native Android app using Capacitor, with a custom Wi-Fi discovery and transfer layer underneath.

Download APK https://github.com/abraham0018/SecureShare/releases/tag/v1.0.0

Overview

SecureShare lets you send files directly between devices on the same network. Instead of routing through a third-party server, it discovers nearby devices over Wi-Fi and transfers files peer-to-peer, with encryption and a secure vault protecting files at rest.

The project started as a React web app, then was wrapped into a native Android application using Capacitor, with a custom Java plugin bridging the web layer to native Android networking APIs for device discovery and transfer.

Features
Wi-Fi peer discovery — devices on the same local network find each other automatically via local network service discovery (mDNS)
Direct device-to-device transfer — files move over a local HTTP server, not through the cloud
Cross-platform exchange — send files between a PC browser and an Android phone via a lightweight web UI, PIN pairing, and a /files endpoint
Encryption & secure vault — files are encrypted/decrypted and stored in a protected vault on-device
Native Android app — packaged from the web app using Capacitor, with a custom Java plugin for mDNS discovery and HTTP-based transfer
Tech Stack
Frontend: React, TypeScript, Vite
Native wrapper: Capacitor (Android)
Native layer: Custom Java plugin (mDNS discovery, local HTTP server for transfers)
Security: File encryption/decryption, secure vault storage
Networking: Local network (Wi-Fi) peer discovery and transfer
How It Works
The app starts a local HTTP server and advertises itself on the network via mDNS.
Nearby devices running SecureShare (or a browser, for PC-to-phone transfers) discover each other automatically.
A PIN is displayed to pair devices for a transfer session.
Files are encrypted, sent directly over the local network via HTTP, and decrypted into the receiving device's secure vault.
No file ever leaves the local network or touches a third-party server.
Cross-Platform Use (PC ↔ Phone)

In addition to phone-to-phone transfers, SecureShare supports sending files between a PC browser and an Android device:

The Android app exposes a /files endpoint and a simple web UI
A PIN is shown on-device to authorize the connection
Files can be pushed or pulled between the two without installing anything on the PC
Installation
Download the latest APK from the Releases page.
On your Android device, open the downloaded file to install it.
Since the app isn't distributed through the Play Store, Android will show an "Install blocked" or "Unknown sources" warning — tap Settings in that prompt and allow installs from your browser/file manager, then retry.
Open the app and grant the requested permissions (Wi-Fi and storage access) so device discovery and file transfer work correctly.
Project Status

This was built as a personal final-year project, iterating from an initial WiFi P2P Android prototype into a more complete cross-platform version with vault management and improved file-transfer reliability (including fixes to file-receipt event handling, vault display, and URL encoding).

Possible Extensions
Multi-file / folder transfer with progress tracking
QR-code based pairing as an alternative to PIN entry
iOS support via Capacitor
Transfer history and file integrity verification (checksums)
Disclaimer

This app is intended for transferring files on trusted local networks. Always verify device pairing (PIN) before accepting incoming transfers.
