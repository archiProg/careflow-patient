package com.peeba2.careflowpatient.smartcard

import android.app.PendingIntent
import android.content.*
import android.hardware.usb.*
import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream
import java.nio.charset.Charset
import java.util.*

class SmartcardModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SmartcardModule"

    private val ACTION_USB_PERMISSION = "com.peeba2.USB_PERMISSION"
    private val SUPPORTED_DEVICES = listOf(Pair(0x058F, 0x9540), Pair(0x2CE3, 0x9563))

    private var seq: Byte = 0
    private var receiverRegistered = false

    // ============================
    // 🔥 EVENT SENDER
    // ============================

    private fun sendEvent(name: String, map: WritableMap?) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, map)
        }
    }

    // ============================
    // 🔥 INITIALIZE
    // ============================

    override fun initialize() {
        super.initialize()

        if (!receiverRegistered) {
            val filter = IntentFilter().apply {
                addAction(ACTION_USB_PERMISSION)
                addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED)
                addAction(UsbManager.ACTION_USB_DEVICE_DETACHED)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(usbReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                reactContext.registerReceiver(usbReceiver, filter)
            }

            receiverRegistered = true
        }

        // 🔥 ถ้ามี reader เสียบอยู่แล้วตอนเปิดแอป
        val usbManager = reactContext.getSystemService(Context.USB_SERVICE) as UsbManager
        val device = findDevice(usbManager)
        if (device != null) {
            sendEvent("USB_CONNECTED", null)
        }
    }

    override fun onCatalystInstanceDestroy() {
        if (receiverRegistered) {
            try { reactContext.unregisterReceiver(usbReceiver) } catch (_: Exception) {}
            receiverRegistered = false
        }
    }

    // ============================
    // 🔥 USB RECEIVER
    // ============================

    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {

            when (intent?.action) {

                UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                    val device: UsbDevice? =
                        intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)

                    if (device != null && isSupported(device)) {
                        sendEvent("USB_CONNECTED", null)
                    }
                }

                UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                    val device: UsbDevice? =
                        intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)

                    if (device != null && isSupported(device)) {
                        sendEvent("USB_DISCONNECTED", null)
                    }
                }

                ACTION_USB_PERMISSION -> {
                    // ไม่ต้องทำอะไรเพิ่ม
                }
            }
        }
    }

    private fun isSupported(device: UsbDevice): Boolean {
        for ((vid, pid) in SUPPORTED_DEVICES) {
            if (device.vendorId == vid && device.productId == pid)
                return true
        }
        return false
    }

    private fun findDevice(manager: UsbManager): UsbDevice? {
        for (device in manager.deviceList.values) {
            if (isSupported(device)) return device
        }
        return null
    }

    // ============================================================
    // 🚨 IMPORTANT:
    // ด้านล่างนี้ "ไม่แก้ logic การอ่านใด ๆ"
    // ============================================================

    @ReactMethod
    fun readSmartcardData(promise: Promise) {

        // 🔥 แจ้งว่าเริ่มอ่านบัตร
        sendEvent("CARD_DETECTED", null)

        val usbManager = reactContext.getSystemService(Context.USB_SERVICE) as UsbManager
        val device = findDevice(usbManager)
            ?: return promise.reject("NO_DEVICE", "Smartcard reader not found")

        if (!usbManager.hasPermission(device)) {
            val permissionIntent = PendingIntent.getBroadcast(
                reactContext,
                0,
                Intent(ACTION_USB_PERMISSION),
                PendingIntent.FLAG_IMMUTABLE
            )
            usbManager.requestPermission(device, permissionIntent)
            return promise.reject("NO_PERMISSION", "USB permission requested")
        }

        val connection = usbManager.openDevice(device)
            ?: return promise.reject("OPEN_FAIL", "Cannot open device")

        try {
            val intf = device.getInterface(0)
            connection.claimInterface(intf, true)

            var epIn: UsbEndpoint? = null
            var epOut: UsbEndpoint? = null

            for (i in 0 until intf.endpointCount) {
                val ep = intf.getEndpoint(i)
                if (ep.type == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                    if (ep.direction == UsbConstants.USB_DIR_IN) epIn = ep else epOut = ep
                }
            }

            if (epIn == null || epOut == null)
                return promise.reject("ENDPOINT_ERROR", "Bulk endpoint not found")

            fun sendApdu(cmd: ByteArray): ByteArray? {
                val header = ByteArray(10)
                header[0] = 0x6F.toByte()
                val len = cmd.size
                header[1] = (len and 0xFF).toByte()
                header[2] = ((len shr 8) and 0xFF).toByte()
                header[6] = seq++

                val packet = header + cmd

                if (connection.bulkTransfer(epOut, packet, packet.size, 3000) <= 0)
                    return null

                val buffer = ByteArray(2048)
                val recv = connection.bulkTransfer(epIn, buffer, buffer.size, 3000)
                if (recv < 10) return null

                val dataLen =
                    (buffer[1].toInt() and 0xFF) or
                            ((buffer[2].toInt() and 0xFF) shl 8)

                val resp = Arrays.copyOfRange(buffer, 10, 10 + dataLen)
                if (resp.size < 2) return null

                val sw1 = resp[resp.size - 2]
                val sw2 = resp[resp.size - 1]

                if (sw1 == 0x90.toByte() && sw2 == 0x00.toByte())
                    return resp.copyOf(resp.size - 2)

                if (sw1 == 0x61.toByte()) {
                    return sendApdu(byteArrayOf(0x00, 0xC0.toByte(), 0x00, 0x00, sw2))
                }

                return null
            }

            fun readBinary(p1: Int, p2: Int, length: Int): ByteArray? {
                return sendApdu(
                    byteArrayOf(
                        0x80.toByte(),
                        0xB0.toByte(),
                        p1.toByte(),
                        p2.toByte(),
                        0x02,
                        0x00,
                        length.toByte()
                    )
                )
            }

            // POWER ON
            val powerOn = ByteArray(10)
            powerOn[0] = 0x62.toByte()
            powerOn[6] = seq++
            connection.bulkTransfer(epOut, powerOn, powerOn.size, 3000)
            connection.bulkTransfer(epIn, ByteArray(512), 512, 3000)
            Thread.sleep(200)

            // SELECT APP
            sendApdu(
                byteArrayOf(
                    0x00,
                    0xA4.toByte(),
                    0x04,
                    0x00,
                    0x08,
                    0xA0.toByte(),
                    0x00,
                    0x00,
                    0x00,
                    0x54,
                    0x48,
                    0x00,
                    0x01
                )
            ) ?: return promise.reject("SELECT_FAIL", "Select failed")

            val tis620 = Charset.forName("TIS-620")

            val citizenId = readBinary(0x00, 0x04, 0x0D)?.toString(Charsets.US_ASCII)?.trim()
            val nameTH = readBinary(0x00, 0x11, 0x64)?.toString(tis620)?.trim()
            val nameEN = readBinary(0x00, 0x75, 0x64)?.toString(Charsets.US_ASCII)?.trim()
            val birth = readBinary(0x00, 0xD9, 0x08)?.toString(Charsets.US_ASCII)?.trim()
            val genderRaw = readBinary(0x00, 0xE1, 0x01)
            val address = readBinary(0x15, 0x79, 0xA0)?.toString(tis620)?.trim()
            val issue = readBinary(0x01, 0x67, 0x08)?.toString(Charsets.US_ASCII)?.trim()
            val expire = readBinary(0x01, 0x6F, 0x08)?.toString(Charsets.US_ASCII)?.trim()

            val genderCode = genderRaw?.firstOrNull()?.toInt()

            val gender = when (genderCode) {
                49 -> "Male"
                50 -> "Female"
                else -> "Unknown"
            }

            val imageData = ByteArrayOutputStream()
            val photoCommands = listOf(
                Pair(0x01,0x79), Pair(0x02,0x41), Pair(0x03,0x09), Pair(0x03,0xD1),
                Pair(0x04,0x99), Pair(0x05,0x61), Pair(0x06,0x29), Pair(0x06,0xF1),
                Pair(0x07,0xB9), Pair(0x08,0x81), Pair(0x09,0x49), Pair(0x0A,0x11),
                Pair(0x0A,0xD9), Pair(0x0B,0xA1), Pair(0x0C,0x69), Pair(0x0D,0x31),
                Pair(0x0D,0xF9), Pair(0x0E,0xC1), Pair(0x0F,0x89), Pair(0x10,0x51),
                Pair(0x11,0x19), Pair(0x11,0xE1), Pair(0x12,0xA9), Pair(0x13,0x71),
                Pair(0x14,0x39), Pair(0x15,0x01)
            )

            for ((p1,p2) in photoCommands) {
                val len = if (p1 == 0x15 && p2 == 0x01) 0x78 else 0xC8
                val block = readBinary(p1, p2, len) ?: break
                imageData.write(block)
            }

            val rawBytes = imageData.toByteArray()
            val jpegStart = rawBytes.indexOfFirst { it == 0xFF.toByte() }
            val jpegBytes =
                if (jpegStart != -1) rawBytes.copyOfRange(jpegStart, rawBytes.size)
                else rawBytes

            val photoBase64 = Base64.encodeToString(jpegBytes, Base64.NO_WRAP)

            val map = Arguments.createMap()
            map.putString("citizenId", citizenId)
            map.putString("nameTH", nameTH)
            map.putString("nameEN", nameEN)
            map.putString("birthDate", birth)
            map.putInt("genderCode", genderCode ?: -1)
            map.putString("gender", gender)
            map.putString("address", address)
            map.putString("issueDate", issue)
            map.putString("expireDate", expire)
            map.putString("photoBase64", photoBase64)

            promise.resolve(map)

        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        } finally {
            connection.close()
        }
    }
}
