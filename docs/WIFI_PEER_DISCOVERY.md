# WiFi Peer Discovery - Android Plugin

## Native Android Implementation

After exporting to GitHub and running `npx cap add android`, create the following files in the Android project.

### 1. Plugin Registration

**File:** `android/app/src/main/java/app/lovable/.../WifiPeerDiscoveryPlugin.java`

```java
package app.lovable.f7bc2b1000464d0289d407d12f4616d3;

import android.Manifest;
import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

@CapacitorPlugin(
    name = "WifiPeerDiscovery",
    permissions = {
        @Permission(strings = { Manifest.permission.INTERNET }, alias = "internet"),
        @Permission(strings = { Manifest.permission.ACCESS_NETWORK_STATE }, alias = "networkState"),
        @Permission(strings = { Manifest.permission.ACCESS_WIFI_STATE }, alias = "wifiState"),
    }
)
public class WifiPeerDiscoveryPlugin extends Plugin {
    private static final String TAG = "WifiPeerDiscovery";
    private static final String SERVICE_TYPE = "_fileshare._tcp.";
    private static final int SERVER_PORT = 8080;

    private NsdManager nsdManager;
    private NsdManager.DiscoveryListener discoveryListener;
    private NsdManager.RegistrationListener registrationListener;
    private ServerSocket serverSocket;
    private Thread serverThread;
    private String sessionToken;
    private boolean isDiscovering = false;

    @Override
    public void load() {
        nsdManager = (NsdManager) getContext().getSystemService(Context.NSD_SERVICE);
    }

    @PluginMethod
    public void startServer(PluginCall call) {
        sessionToken = UUID.randomUUID().toString();

        serverThread = new Thread(() -> {
            try {
                serverSocket = new ServerSocket(SERVER_PORT);
                Log.d(TAG, "Server started on port " + SERVER_PORT);

                // Register mDNS service
                registerService();

                while (!serverSocket.isClosed()) {
                    Socket client = serverSocket.accept();
                    handleClientConnection(client);
                }
            } catch (IOException e) {
                Log.e(TAG, "Server error", e);
            }
        });
        serverThread.setDaemon(true);
        serverThread.start();

        JSObject ret = new JSObject();
        ret.put("port", SERVER_PORT);
        call.resolve(ret);
    }

    private void registerService() {
        NsdServiceInfo serviceInfo = new NsdServiceInfo();
        serviceInfo.setServiceName(Build.MODEL);
        serviceInfo.setServiceType(SERVICE_TYPE);
        serviceInfo.setPort(SERVER_PORT);

        registrationListener = new NsdManager.RegistrationListener() {
            @Override public void onServiceRegistered(NsdServiceInfo info) {
                Log.d(TAG, "Service registered: " + info.getServiceName());
            }
            @Override public void onRegistrationFailed(NsdServiceInfo info, int code) {
                Log.e(TAG, "Registration failed: " + code);
            }
            @Override public void onServiceUnregistered(NsdServiceInfo info) {
                Log.d(TAG, "Service unregistered");
            }
            @Override public void onUnregistrationFailed(NsdServiceInfo info, int code) {
                Log.e(TAG, "Unregistration failed: " + code);
            }
        };

        nsdManager.registerService(serviceInfo, NsdManager.PROTOCOL_DNS_SD, registrationListener);
    }

    private void handleClientConnection(Socket client) {
        new Thread(() -> {
            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(client.getInputStream()));
                String requestLine = reader.readLine();

                if (requestLine != null && requestLine.startsWith("POST")) {
                    // Read headers
                    String line;
                    String token = null;
                    String fileName = null;
                    int contentLength = 0;

                    while (!(line = reader.readLine()).isEmpty()) {
                        if (line.startsWith("X-Session-Token:")) {
                            token = line.substring(16).trim();
                        } else if (line.startsWith("X-File-Name:")) {
                            fileName = line.substring(12).trim();
                        } else if (line.startsWith("Content-Length:")) {
                            contentLength = Integer.parseInt(line.substring(15).trim());
                        }
                    }

                    // Reject unknown connections
                    if (token == null || !token.equals(sessionToken)) {
                        PrintWriter writer = new PrintWriter(client.getOutputStream());
                        writer.println("HTTP/1.1 403 Forbidden");
                        writer.println("");
                        writer.flush();
                        client.close();
                        return;
                    }

                    // Notify frontend for user approval
                    JSObject event = new JSObject();
                    event.put("fileName", fileName);
                    event.put("fromDevice", client.getInetAddress().getHostAddress());
                    event.put("sessionToken", token);
                    notifyListeners("fileReceived", event);

                    // Save file
                    File outputDir = getContext().getFilesDir();
                    File outputFile = new File(outputDir, fileName != null ? fileName : "received_file");

                    InputStream inputStream = client.getInputStream();
                    FileOutputStream fos = new FileOutputStream(outputFile);
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    int totalRead = 0;

                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        fos.write(buffer, 0, bytesRead);
                        totalRead += bytesRead;
                    }
                    fos.close();

                    // Send success response
                    PrintWriter writer = new PrintWriter(client.getOutputStream());
                    writer.println("HTTP/1.1 200 OK");
                    writer.println("Content-Type: application/json");
                    writer.println("");
                    writer.println("{\"success\":true}");
                    writer.flush();
                }

                client.close();
            } catch (IOException e) {
                Log.e(TAG, "Client handling error", e);
            }
        }).start();
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (isDiscovering) {
            call.resolve();
            return;
        }

        discoveryListener = new NsdManager.DiscoveryListener() {
            @Override
            public void onDiscoveryStarted(String serviceType) {
                Log.d(TAG, "Discovery started");
                isDiscovering = true;
            }

            @Override
            public void onServiceFound(NsdServiceInfo serviceInfo) {
                Log.d(TAG, "Service found: " + serviceInfo.getServiceName());
                // Resolve to get IP
                nsdManager.resolveService(serviceInfo, new NsdManager.ResolveListener() {
                    @Override
                    public void onResolveFailed(NsdServiceInfo info, int code) {
                        Log.e(TAG, "Resolve failed: " + code);
                    }

                    @Override
                    public void onServiceResolved(NsdServiceInfo info) {
                        JSObject device = new JSObject();
                        device.put("id", info.getServiceName());
                        device.put("name", info.getServiceName());
                        device.put("ip", info.getHost().getHostAddress());
                        device.put("port", info.getPort());
                        notifyListeners("deviceFound", device);
                    }
                });
            }

            @Override
            public void onServiceLost(NsdServiceInfo serviceInfo) {
                JSObject device = new JSObject();
                device.put("id", serviceInfo.getServiceName());
                notifyListeners("deviceLost", device);
            }

            @Override
            public void onDiscoveryStopped(String serviceType) {
                Log.d(TAG, "Discovery stopped");
                isDiscovering = false;
            }

            @Override
            public void onStartDiscoveryFailed(String serviceType, int code) {
                Log.e(TAG, "Start discovery failed: " + code);
                isDiscovering = false;
            }

            @Override
            public void onStopDiscoveryFailed(String serviceType, int code) {
                Log.e(TAG, "Stop discovery failed: " + code);
            }
        };

        nsdManager.discoverServices(SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener);
        call.resolve();
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        if (isDiscovering && discoveryListener != null) {
            nsdManager.stopServiceDiscovery(discoveryListener);
        }
        if (registrationListener != null) {
            try {
                nsdManager.unregisterService(registrationListener);
            } catch (Exception e) {
                Log.w(TAG, "Unregister failed", e);
            }
        }
        if (serverSocket != null) {
            try {
                serverSocket.close();
            } catch (IOException e) {
                Log.w(TAG, "Server close failed", e);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void sendFile(PluginCall call) {
        String ip = call.getString("ip");
        int port = call.getInt("port", SERVER_PORT);
        String filePath = call.getString("filePath");

        new Thread(() -> {
            try {
                File file = new File(filePath);
                if (!file.exists()) {
                    JSObject result = new JSObject();
                    result.put("success", false);
                    result.put("error", "File not found");
                    result.put("deviceId", ip);
                    result.put("fileName", filePath);
                    notifyListeners("transferComplete", result);
                    call.resolve(result);
                    return;
                }

                URL url = new URL("http://" + ip + ":" + port + "/upload");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoOutput(true);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("X-Session-Token", sessionToken);
                conn.setRequestProperty("X-File-Name", file.getName());
                conn.setRequestProperty("Content-Length", String.valueOf(file.length()));

                OutputStream os = conn.getOutputStream();
                FileInputStream fis = new FileInputStream(file);
                byte[] buffer = new byte[4096];
                int bytesRead;
                long totalSent = 0;
                long fileSize = file.length();

                while ((bytesRead = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                    totalSent += bytesRead;

                    JSObject progress = new JSObject();
                    progress.put("deviceId", ip);
                    progress.put("progress", (int) ((totalSent * 100) / fileSize));
                    progress.put("fileName", file.getName());
                    notifyListeners("transferProgress", progress);
                }

                fis.close();
                os.flush();
                os.close();

                int responseCode = conn.getResponseCode();
                JSObject result = new JSObject();
                result.put("success", responseCode == 200);
                result.put("deviceId", ip);
                result.put("fileName", file.getName());
                notifyListeners("transferComplete", result);
                call.resolve(result);

            } catch (Exception e) {
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("error", e.getMessage());
                result.put("deviceId", ip);
                result.put("fileName", filePath);
                notifyListeners("transferComplete", result);
                call.resolve(result);
            }
        }).start();
    }
}
```

### 2. Register Plugin in MainActivity

**File:** `android/app/src/main/java/app/lovable/.../MainActivity.java`

```java
package app.lovable.f7bc2b1000464d0289d407d12f4616d3;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WifiPeerDiscoveryPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

### 3. Android Permissions

**File:** `android/app/src/main/AndroidManifest.xml` — add these permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:minSdkVersion="33" />
```

## Setup Instructions

1. **Export to GitHub** via the Lovable export button
2. `git clone` your repo and `cd` into it
3. `npm install`
4. `npx cap add android`
5. `npx cap update android`
6. `npm run build`
7. `npx cap sync`
8. `npx cap run android` (requires Android Studio)

## How It Works

1. **Device A** starts server → registers mDNS service `_fileshare._tcp.`
2. **Device B** starts discovery → finds Device A via mDNS
3. **Device A** selects file → sends POST to Device B's local server
4. **Device B** validates session token → accepts and saves file
5. Both devices see real-time transfer progress

No cloud. No internet. Pure local WiFi peer-to-peer.
