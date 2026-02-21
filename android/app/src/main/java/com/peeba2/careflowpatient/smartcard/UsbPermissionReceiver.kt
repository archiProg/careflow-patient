package com.peeba2.careflowpatient.smartcard

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.hardware.usb.UsbManager
import android.widget.Toast

class UsbPermissionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.peeba2.careflowpatient.USB_PERMISSION") {
            val granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)
            if (granted) {
                Toast.makeText(context, "USB permission granted", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, "USB permission denied", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
