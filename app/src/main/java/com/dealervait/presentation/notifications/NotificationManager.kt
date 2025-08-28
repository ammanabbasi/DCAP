// File: presentation/notifications/NotificationManager.kt
// Purpose: Complete push notification system with FCM integration
// Dependencies: Firebase Cloud Messaging, NotificationCompat

package com.dealervait.presentation.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.content.ContextCompat
import com.dealervait.R
import com.dealervait.presentation.ui.activities.MainActivity
import dagger.hilt.android.qualifiers.ApplicationContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Handles all push notifications and in-app notifications
 */
@Singleton
class NotificationManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    companion object {
        // Notification channels
        const val CHANNEL_NEW_LEADS = "new_leads"
        const val CHANNEL_MESSAGES = "messages"
        const val CHANNEL_VEHICLE_UPDATES = "vehicle_updates"
        const val CHANNEL_DOCUMENTS = "documents"
        const val CHANNEL_SYSTEM = "system"
        const val CHANNEL_REMINDERS = "reminders"

        // Notification IDs
        private const val NOTIFICATION_ID_NEW_LEAD = 1001
        private const val NOTIFICATION_ID_MESSAGE = 1002
        private const val NOTIFICATION_ID_VEHICLE_SOLD = 1003
        private const val NOTIFICATION_ID_DOCUMENT_UPLOADED = 1004
        private const val NOTIFICATION_ID_APPOINTMENT_REMINDER = 1005
        private const val NOTIFICATION_ID_LOW_INVENTORY = 1006

        // Request codes for pending intents
        private const val REQUEST_CODE_MAIN = 2001
        private const val REQUEST_CODE_LEAD_DETAIL = 2002
        private const val REQUEST_CODE_CONVERSATION = 2003
        private const val REQUEST_CODE_VEHICLE_DETAIL = 2004
        private const val REQUEST_CODE_DOCUMENT_VIEW = 2005
    }

    private val notificationManager = NotificationManagerCompat.from(context)
    
    init {
        createNotificationChannels()
    }

    /**
     * Create notification channels for Android O+
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val systemNotificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // New leads channel
            val newLeadsChannel = NotificationChannel(
                CHANNEL_NEW_LEADS,
                context.getString(R.string.notification_channel_new_leads),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.notification_channel_new_leads_desc)
                enableLights(true)
                lightColor = ContextCompat.getColor(context, R.color.notification_light_green)
                enableVibration(true)
                setShowBadge(true)
            }

            // Messages channel
            val messagesChannel = NotificationChannel(
                CHANNEL_MESSAGES,
                context.getString(R.string.notification_channel_messages),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.notification_channel_messages_desc)
                enableLights(true)
                lightColor = ContextCompat.getColor(context, R.color.notification_light_blue)
                enableVibration(true)
                setShowBadge(true)
            }

            // Vehicle updates channel
            val vehicleUpdatesChannel = NotificationChannel(
                CHANNEL_VEHICLE_UPDATES,
                context.getString(R.string.notification_channel_vehicle_updates),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.notification_channel_vehicle_updates_desc)
                enableLights(true)
                lightColor = ContextCompat.getColor(context, R.color.notification_light_orange)
                setShowBadge(true)
            }

            // Documents channel
            val documentsChannel = NotificationChannel(
                CHANNEL_DOCUMENTS,
                context.getString(R.string.notification_channel_documents),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.notification_channel_documents_desc)
                setShowBadge(false)
            }

            // System notifications channel
            val systemChannel = NotificationChannel(
                CHANNEL_SYSTEM,
                context.getString(R.string.notification_channel_system),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = context.getString(R.string.notification_channel_system_desc)
                setShowBadge(false)
            }

            // Reminders channel
            val remindersChannel = NotificationChannel(
                CHANNEL_REMINDERS,
                context.getString(R.string.notification_channel_reminders),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.notification_channel_reminders_desc)
                enableLights(true)
                lightColor = ContextCompat.getColor(context, R.color.notification_light_purple)
                enableVibration(true)
                setShowBadge(true)
            }

            // Register all channels
            systemNotificationManager.createNotificationChannels(listOf(
                newLeadsChannel,
                messagesChannel,
                vehicleUpdatesChannel,
                documentsChannel,
                systemChannel,
                remindersChannel
            ))
        }
    }

    /**
     * Show new lead notification
     */
    fun showNewLeadNotification(
        leadName: String,
        leadEmail: String,
        leadPhone: String?
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigation_destination", "leads")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_LEAD_DETAIL,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val contactInfo = buildString {
            append(leadEmail)
            if (leadPhone != null) {
                append(" • $leadPhone")
            }
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_NEW_LEADS)
            .setSmallIcon(R.drawable.ic_notification_lead)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_person_circle))
            .setContentTitle(context.getString(R.string.notification_new_lead_title))
            .setContentText(leadName)
            .setSubText(contactInfo)
            .setStyle(NotificationCompat.BigTextStyle()
                .bigText("New lead: $leadName\n$contactInfo")
                .setBigContentTitle(context.getString(R.string.notification_new_lead_title)))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setColor(ContextCompat.getColor(context, R.color.notification_color_green))
            .addAction(
                R.drawable.ic_call,
                context.getString(R.string.action_call),
                createCallPendingIntent(leadPhone ?: "")
            )
            .addAction(
                R.drawable.ic_email,
                context.getString(R.string.action_email),
                createEmailPendingIntent(leadEmail)
            )
            .build()

        try {
            notificationManager.notify(NOTIFICATION_ID_NEW_LEAD, notification)
            Timber.d("New lead notification shown for: $leadName")
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing notification")
        }
    }

    /**
     * Show new message notification
     */
    fun showNewMessageNotification(
        senderName: String,
        message: String,
        conversationId: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigation_destination", "messages")
            putExtra("conversation_id", conversationId)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_CONVERSATION,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Create person for messaging style
        val sender = Person.Builder()
            .setName(senderName)
            .build()

        val notification = NotificationCompat.Builder(context, CHANNEL_MESSAGES)
            .setSmallIcon(R.drawable.ic_notification_message)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_message_circle))
            .setContentTitle(senderName)
            .setContentText(message)
            .setStyle(NotificationCompat.MessagingStyle(sender)
                .addMessage(message, System.currentTimeMillis(), sender)
                .setConversationTitle(senderName))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setColor(ContextCompat.getColor(context, R.color.notification_color_blue))
            .addAction(
                R.drawable.ic_reply,
                context.getString(R.string.action_reply),
                createReplyPendingIntent(conversationId)
            )
            .build()

        try {
            notificationManager.notify(NOTIFICATION_ID_MESSAGE, notification)
            Timber.d("Message notification shown from: $senderName")
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing notification")
        }
    }

    /**
     * Show vehicle sold notification
     */
    fun showVehicleSoldNotification(
        vehicleDetails: String,
        soldTo: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigation_destination", "vehicles")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_VEHICLE_DETAIL,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_VEHICLE_UPDATES)
            .setSmallIcon(R.drawable.ic_notification_sale)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_car_circle))
            .setContentTitle(context.getString(R.string.notification_vehicle_sold_title))
            .setContentText(vehicleDetails)
            .setSubText("Sold to: $soldTo")
            .setStyle(NotificationCompat.BigTextStyle()
                .bigText("🎉 $vehicleDetails\nSold to: $soldTo")
                .setBigContentTitle(context.getString(R.string.notification_vehicle_sold_title)))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_LIGHTS)
            .setColor(ContextCompat.getColor(context, R.color.notification_color_orange))
            .build()

        try {
            notificationManager.notify(NOTIFICATION_ID_VEHICLE_SOLD, notification)
            Timber.d("Vehicle sold notification shown: $vehicleDetails")
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing notification")
        }
    }

    /**
     * Show document uploaded notification
     */
    fun showDocumentUploadedNotification(
        fileName: String,
        category: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigation_destination", "documents")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_DOCUMENT_VIEW,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_DOCUMENTS)
            .setSmallIcon(R.drawable.ic_notification_document)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_document_circle))
            .setContentTitle(context.getString(R.string.notification_document_uploaded_title))
            .setContentText(fileName)
            .setSubText("Category: $category")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setDefaults(NotificationCompat.DEFAULT_LIGHTS)
            .setColor(ContextCompat.getColor(context, R.color.notification_color_purple))
            .build()

        try {
            notificationManager.notify(NOTIFICATION_ID_DOCUMENT_UPLOADED, notification)
            Timber.d("Document uploaded notification shown: $fileName")
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing notification")
        }
    }

    /**
     * Show appointment reminder notification
     */
    fun showAppointmentReminderNotification(
        customerName: String,
        appointmentTime: String,
        appointmentType: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigation_destination", "calendar")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_MAIN,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_notification_reminder)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_calendar_circle))
            .setContentTitle(context.getString(R.string.notification_appointment_reminder_title))
            .setContentText("$appointmentType with $customerName")
            .setSubText("Time: $appointmentTime")
            .setStyle(NotificationCompat.BigTextStyle()
                .bigText("$appointmentType with $customerName\nTime: $appointmentTime")
                .setBigContentTitle(context.getString(R.string.notification_appointment_reminder_title)))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setColor(ContextCompat.getColor(context, R.color.notification_color_purple))
            .build()

        try {
            notificationManager.notify(NOTIFICATION_ID_APPOINTMENT_REMINDER, notification)
            Timber.d("Appointment reminder notification shown for: $customerName")
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing notification")
        }
    }

    /**
     * Show low inventory alert notification
     */
    fun showLowInventoryNotification(
        vehicleType: String,
        currentCount: Int,
        minimumThreshold: Int
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigation_destination", "vehicles")
            putExtra("filter", "low_stock")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            REQUEST_CODE_MAIN,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_SYSTEM)
            .setSmallIcon(R.drawable.ic_notification_warning)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_warning_circle))
            .setContentTitle(context.getString(R.string.notification_low_inventory_title))
            .setContentText("$vehicleType: $currentCount remaining")
            .setSubText("Minimum: $minimumThreshold")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setDefaults(NotificationCompat.DEFAULT_LIGHTS)
            .setColor(ContextCompat.getColor(context, R.color.notification_color_red))
            .build()

        try {
            notificationManager.notify(NOTIFICATION_ID_LOW_INVENTORY, notification)
            Timber.d("Low inventory notification shown for: $vehicleType")
        } catch (e: SecurityException) {
            Timber.e(e, "Permission denied for showing notification")
        }
    }

    /**
     * Create pending intent for phone calls
     */
    private fun createCallPendingIntent(phoneNumber: String): PendingIntent {
        val callIntent = Intent(Intent.ACTION_DIAL).apply {
            data = android.net.Uri.parse("tel:$phoneNumber")
        }
        return PendingIntent.getActivity(
            context,
            REQUEST_CODE_MAIN,
            callIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /**
     * Create pending intent for emails
     */
    private fun createEmailPendingIntent(email: String): PendingIntent {
        val emailIntent = Intent(Intent.ACTION_SENDTO).apply {
            data = android.net.Uri.parse("mailto:$email")
        }
        return PendingIntent.getActivity(
            context,
            REQUEST_CODE_MAIN,
            emailIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /**
     * Create pending intent for message reply
     */
    private fun createReplyPendingIntent(conversationId: String): PendingIntent {
        val replyIntent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigation_destination", "messages")
            putExtra("conversation_id", conversationId)
            putExtra("action", "reply")
        }
        return PendingIntent.getActivity(
            context,
            REQUEST_CODE_CONVERSATION,
            replyIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /**
     * Cancel specific notification
     */
    fun cancelNotification(notificationId: Int) {
        notificationManager.cancel(notificationId)
    }

    /**
     * Cancel all notifications
     */
    fun cancelAllNotifications() {
        notificationManager.cancelAll()
    }

    /**
     * Check if notifications are enabled
     */
    fun areNotificationsEnabled(): Boolean {
        return notificationManager.areNotificationsEnabled()
    }

    /**
     * Check if specific channel is enabled
     */
    fun isChannelEnabled(channelId: String): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val systemNotificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channel = systemNotificationManager.getNotificationChannel(channelId)
            channel?.importance != NotificationManager.IMPORTANCE_NONE
        } else {
            areNotificationsEnabled()
        }
    }
}
