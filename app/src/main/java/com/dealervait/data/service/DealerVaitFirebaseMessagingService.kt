// File: data/service/DealerVaitFirebaseMessagingService.kt
// Purpose: Firebase Cloud Messaging service for push notifications
// Dependencies: Firebase Messaging, NotificationManager

package com.dealervait.data.service

import com.dealervait.core.storage.TokenManager
import com.dealervait.data.api.DealersCloudApiService
import com.dealervait.presentation.notifications.NotificationManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * Firebase Cloud Messaging service for handling push notifications
 */
@AndroidEntryPoint
class DealerVaitFirebaseMessagingService : FirebaseMessagingService() {

    @Inject
    lateinit var notificationManager: NotificationManager

    @Inject
    lateinit var tokenManager: TokenManager

    @Inject
    lateinit var apiService: DealersCloudApiService

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    companion object {
        // Notification types from server
        private const val TYPE_NEW_LEAD = "new_lead"
        private const val TYPE_NEW_MESSAGE = "new_message"
        private const val TYPE_VEHICLE_SOLD = "vehicle_sold"
        private const val TYPE_VEHICLE_PRICE_CHANGED = "vehicle_price_changed"
        private const val TYPE_DOCUMENT_UPLOADED = "document_uploaded"
        private const val TYPE_APPOINTMENT_REMINDER = "appointment_reminder"
        private const val TYPE_LOW_INVENTORY = "low_inventory"
        private const val TYPE_SYSTEM_ALERT = "system_alert"
    }

    /**
     * Called when message is received while app is in foreground
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Timber.d("FCM message received from: ${remoteMessage.from}")
        Timber.d("FCM message data: ${remoteMessage.data}")

        // Handle data payload
        if (remoteMessage.data.isNotEmpty()) {
            handleDataMessage(remoteMessage.data)
        }

        // Handle notification payload (when app is in foreground)
        remoteMessage.notification?.let { notification ->
            Timber.d("FCM notification title: ${notification.title}")
            Timber.d("FCM notification body: ${notification.body}")
            
            // Show custom notification based on type
            val notificationType = remoteMessage.data["type"] ?: "system_alert"
            showCustomNotification(notificationType, remoteMessage.data, notification.title, notification.body)
        }
    }

    /**
     * Called when a new FCM token is generated
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Timber.d("New FCM token received: $token")
        
        // Send token to server
        serviceScope.launch {
            sendTokenToServer(token)
        }
    }

    /**
     * Handle data-only messages
     */
    private fun handleDataMessage(data: Map<String, String>) {
        val messageType = data["type"] ?: return
        
        Timber.d("Handling FCM data message type: $messageType")

        when (messageType) {
            TYPE_NEW_LEAD -> handleNewLeadNotification(data)
            TYPE_NEW_MESSAGE -> handleNewMessageNotification(data)
            TYPE_VEHICLE_SOLD -> handleVehicleSoldNotification(data)
            TYPE_VEHICLE_PRICE_CHANGED -> handleVehiclePriceChangedNotification(data)
            TYPE_DOCUMENT_UPLOADED -> handleDocumentUploadedNotification(data)
            TYPE_APPOINTMENT_REMINDER -> handleAppointmentReminderNotification(data)
            TYPE_LOW_INVENTORY -> handleLowInventoryNotification(data)
            TYPE_SYSTEM_ALERT -> handleSystemAlertNotification(data)
            else -> {
                Timber.w("Unknown FCM message type: $messageType")
                // Show generic notification
                showGenericNotification(data["title"] ?: "Notification", data["body"] ?: "")
            }
        }
    }

    /**
     * Show custom notification based on type
     */
    private fun showCustomNotification(
        type: String,
        data: Map<String, String>,
        title: String?,
        body: String?
    ) {
        when (type) {
            TYPE_NEW_LEAD -> handleNewLeadNotification(data)
            TYPE_NEW_MESSAGE -> handleNewMessageNotification(data)
            TYPE_VEHICLE_SOLD -> handleVehicleSoldNotification(data)
            TYPE_DOCUMENT_UPLOADED -> handleDocumentUploadedNotification(data)
            TYPE_APPOINTMENT_REMINDER -> handleAppointmentReminderNotification(data)
            TYPE_LOW_INVENTORY -> handleLowInventoryNotification(data)
            else -> showGenericNotification(title ?: "Notification", body ?: "")
        }
    }

    /**
     * Handle new lead notification
     */
    private fun handleNewLeadNotification(data: Map<String, String>) {
        val leadName = "${data["first_name"]} ${data["last_name"]}"
        val leadEmail = data["email"] ?: ""
        val leadPhone = data["phone"]

        notificationManager.showNewLeadNotification(
            leadName = leadName,
            leadEmail = leadEmail,
            leadPhone = leadPhone
        )
    }

    /**
     * Handle new message notification
     */
    private fun handleNewMessageNotification(data: Map<String, String>) {
        val senderName = data["sender_name"] ?: "Unknown Sender"
        val message = data["message"] ?: ""
        val conversationId = data["conversation_id"] ?: ""

        notificationManager.showNewMessageNotification(
            senderName = senderName,
            message = message,
            conversationId = conversationId
        )
    }

    /**
     * Handle vehicle sold notification
     */
    private fun handleVehicleSoldNotification(data: Map<String, String>) {
        val vehicleDetails = data["vehicle_details"] ?: "Vehicle"
        val soldTo = data["sold_to"] ?: "Customer"

        notificationManager.showVehicleSoldNotification(
            vehicleDetails = vehicleDetails,
            soldTo = soldTo
        )
    }

    /**
     * Handle vehicle price changed notification
     */
    private fun handleVehiclePriceChangedNotification(data: Map<String, String>) {
        val vehicleDetails = data["vehicle_details"] ?: "Vehicle"
        val oldPrice = data["old_price"]?.toDoubleOrNull() ?: 0.0
        val newPrice = data["new_price"]?.toDoubleOrNull() ?: 0.0
        
        val priceChange = newPrice - oldPrice
        val changeText = if (priceChange > 0) {
            "increased by $${String.format("%.0f", priceChange)}"
        } else {
            "reduced by $${String.format("%.0f", kotlin.math.abs(priceChange))}"
        }

        showGenericNotification(
            title = "Vehicle Price Updated",
            body = "$vehicleDetails price $changeText"
        )
    }

    /**
     * Handle document uploaded notification
     */
    private fun handleDocumentUploadedNotification(data: Map<String, String>) {
        val fileName = data["file_name"] ?: "Document"
        val category = data["category"] ?: "General"

        notificationManager.showDocumentUploadedNotification(
            fileName = fileName,
            category = category
        )
    }

    /**
     * Handle appointment reminder notification
     */
    private fun handleAppointmentReminderNotification(data: Map<String, String>) {
        val customerName = data["customer_name"] ?: "Customer"
        val appointmentTime = data["appointment_time"] ?: "Soon"
        val appointmentType = data["appointment_type"] ?: "Appointment"

        notificationManager.showAppointmentReminderNotification(
            customerName = customerName,
            appointmentTime = appointmentTime,
            appointmentType = appointmentType
        )
    }

    /**
     * Handle low inventory notification
     */
    private fun handleLowInventoryNotification(data: Map<String, String>) {
        val vehicleType = data["vehicle_type"] ?: "Vehicles"
        val currentCount = data["current_count"]?.toIntOrNull() ?: 0
        val minimumThreshold = data["minimum_threshold"]?.toIntOrNull() ?: 5

        notificationManager.showLowInventoryNotification(
            vehicleType = vehicleType,
            currentCount = currentCount,
            minimumThreshold = minimumThreshold
        )
    }

    /**
     * Handle system alert notification
     */
    private fun handleSystemAlertNotification(data: Map<String, String>) {
        val title = data["title"] ?: "System Alert"
        val message = data["message"] ?: "Important system notification"
        
        showGenericNotification(title, message)
    }

    /**
     * Show generic notification for unhandled types
     */
    private fun showGenericNotification(title: String, body: String) {
        // Use the system notification manager for generic notifications
        val notificationManager = androidx.core.app.NotificationManagerCompat.from(this)
        
        val notification = androidx.core.app.NotificationCompat.Builder(
            this, 
            com.dealervait.presentation.notifications.NotificationManager.CHANNEL_SYSTEM
        )
            .setSmallIcon(com.dealervait.R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(androidx.core.app.NotificationCompat.PRIORITY_DEFAULT)
            .build()

        try {
            notificationManager.notify(System.currentTimeMillis().toInt(), notification)
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing generic notification")
        }
    }

    /**
     * Send FCM token to server
     */
    private suspend fun sendTokenToServer(token: String) {
        try {
            // Only send token if user is logged in
            val accessToken = tokenManager.getAccessToken()
            if (accessToken.isNullOrBlank()) {
                Timber.d("No access token available, skipping FCM token registration")
                return
            }

            val response = apiService.registerFcmToken(mapOf("fcm_token" to token))
            if (response.isSuccessful) {
                Timber.d("FCM token registered successfully")
            } else {
                Timber.w("Failed to register FCM token: ${response.code()}")
            }
        } catch (e: Exception) {
            Timber.e(e, "Error registering FCM token with server")
        }
    }

    /**
     * Delete FCM token from server (called during logout)
     */
    suspend fun deleteFcmToken() {
        try {
            val response = apiService.deleteFcmToken()
            if (response.isSuccessful) {
                Timber.d("FCM token deleted successfully")
            } else {
                Timber.w("Failed to delete FCM token: ${response.code()}")
            }
        } catch (e: Exception) {
            Timber.e(e, "Error deleting FCM token from server")
        }
    }
}
