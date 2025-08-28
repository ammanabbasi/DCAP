// File: presentation/realtime/RealTimeEventManager.kt
// Purpose: Handle real-time WebSocket events and update UI/database accordingly
// Dependencies: WebSocketService, Repositories, Notification system

package com.dealervait.presentation.realtime

import android.content.Context
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.dealervait.R
import com.dealervait.data.local.dao.DashboardCacheDao
import com.dealervait.data.local.dao.LeadDao
import com.dealervait.data.local.dao.VehicleDao
import com.dealervait.data.mappers.toDomainModel
import com.dealervait.data.mappers.toEntity
import com.dealervait.data.websocket.*
import com.dealervait.domain.model.DashboardMetrics
import com.dealervait.domain.model.InventoryAgeMetric
import com.dealervait.domain.model.LeadsStatusMetric
import com.dealervait.presentation.notifications.NotificationManager
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages real-time events from WebSocket and coordinates UI updates
 */
@Singleton
class RealTimeEventManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val webSocketService: DealershipWebSocketService,
    private val notificationManager: NotificationManager,
    private val leadDao: LeadDao,
    private val vehicleDao: VehicleDao,
    private val dashboardCacheDao: DashboardCacheDao
) : DefaultLifecycleObserver {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    // UI notification flows
    private val _toastMessages = MutableSharedFlow<String>()
    val toastMessages: SharedFlow<String> = _toastMessages.asSharedFlow()

    private val _snackbarMessages = MutableSharedFlow<SnackbarMessage>()
    val snackbarMessages: SharedFlow<SnackbarMessage> = _snackbarMessages.asSharedFlow()

    private val _conflictDialogs = MutableSharedFlow<ConflictDialogData>()
    val conflictDialogs: SharedFlow<ConflictDialogData> = _conflictDialogs.asSharedFlow()

    // Event counters for notifications
    private val _unreadMessageCount = MutableStateFlow(0)
    val unreadMessageCount: StateFlow<Int> = _unreadMessageCount.asStateFlow()

    private val _pendingLeadCount = MutableStateFlow(0)
    val pendingLeadCount: StateFlow<Int> = _pendingLeadCount.asStateFlow()

    private var isAppInForeground = true

    init {
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)
        startEventObserving()
    }

    /**
     * Start observing WebSocket events
     */
    private fun startEventObserving() {
        // New lead events
        webSocketService.newLeadEvents
            .onEach { event -> handleNewLead(event) }
            .catch { e -> Timber.e(e, "Error handling new lead event") }
            .launchIn(scope)

        // Lead updated events
        webSocketService.leadUpdatedEvents
            .onEach { event -> handleLeadUpdated(event) }
            .catch { e -> Timber.e(e, "Error handling lead updated event") }
            .launchIn(scope)

        // Vehicle sold events
        webSocketService.vehicleSoldEvents
            .onEach { event -> handleVehicleSold(event) }
            .catch { e -> Timber.e(e, "Error handling vehicle sold event") }
            .launchIn(scope)

        // Vehicle price changed events
        webSocketService.vehiclePriceChangedEvents
            .onEach { event -> handleVehiclePriceChanged(event) }
            .catch { e -> Timber.e(e, "Error handling vehicle price changed event") }
            .launchIn(scope)

        // New message events
        webSocketService.newMessageEvents
            .onEach { event -> handleNewMessage(event) }
            .catch { e -> Timber.e(e, "Error handling new message event") }
            .launchIn(scope)

        // Dashboard update events
        webSocketService.dashboardUpdateEvents
            .onEach { event -> handleDashboardUpdate(event) }
            .catch { e -> Timber.e(e, "Error handling dashboard update event") }
            .launchIn(scope)

        // Document uploaded events
        webSocketService.documentUploadedEvents
            .onEach { event -> handleDocumentUploaded(event) }
            .catch { e -> Timber.e(e, "Error handling document uploaded event") }
            .launchIn(scope)

        // Conflict detection events
        webSocketService.conflictDetectedEvents
            .onEach { event -> handleConflictDetected(event) }
            .catch { e -> Timber.e(e, "Error handling conflict detected event") }
            .launchIn(scope)

        // User status events
        webSocketService.userStatusEvents
            .onEach { event -> handleUserStatusChanged(event) }
            .catch { e -> Timber.e(e, "Error handling user status event") }
            .launchIn(scope)
    }

    /**
     * Handle new lead event
     */
    private suspend fun handleNewLead(event: NewLeadEvent) {
        Timber.d("New lead received: ${event.firstName} ${event.lastName}")

        // Update pending lead count
        _pendingLeadCount.value = _pendingLeadCount.value + 1

        // Show notification if app is in background
        if (!isAppInForeground) {
            notificationManager.showNewLeadNotification(
                leadName = "${event.firstName} ${event.lastName}",
                leadEmail = event.emailAddress,
                leadPhone = event.phoneNumber
            )
        } else {
            // Show in-app notification
            _toastMessages.emit(
                context.getString(
                    R.string.new_lead_received,
                    event.firstName,
                    event.lastName
                )
            )
        }

        // Create snackbar with action
        _snackbarMessages.emit(
            SnackbarMessage(
                message = "New lead: ${event.firstName} ${event.lastName}",
                actionLabel = "View",
                actionData = mapOf("leadId" to event.leadId)
            )
        )
    }

    /**
     * Handle lead updated event
     */
    private suspend fun handleLeadUpdated(event: LeadUpdatedEvent) {
        Timber.d("Lead updated: ${event.leadId} - ${event.field}")

        try {
            // Update local database if the lead exists
            val existingLead = leadDao.getLeadById(event.leadId)
            if (existingLead != null) {
                // Update the specific field
                val updatedLead = updateLeadField(existingLead, event)
                leadDao.updateLead(updatedLead)

                // Show update notification
                _snackbarMessages.emit(
                    SnackbarMessage(
                        message = "Lead updated: ${event.field} changed",
                        actionLabel = "View",
                        actionData = mapOf("leadId" to event.leadId)
                    )
                )
            }
        } catch (e: Exception) {
            Timber.e(e, "Error updating lead ${event.leadId}")
        }
    }

    /**
     * Handle vehicle sold event
     */
    private suspend fun handleVehicleSold(event: VehicleSoldEvent) {
        Timber.d("Vehicle sold: ${event.vehicleId} for ${event.soldPrice}")

        try {
            // Update vehicle status in local database
            val existingVehicle = vehicleDao.getVehicleById(event.vehicleId)
            if (existingVehicle != null) {
                val updatedVehicle = existingVehicle.copy(
                    status = "Sold",
                    price = event.soldPrice,
                    updatedAt = event.saleDate
                )
                vehicleDao.updateVehicle(updatedVehicle)
            }

            // Show celebration notification
            if (!isAppInForeground) {
                notificationManager.showVehicleSoldNotification(
                    vehicleDetails = "Vehicle sold for $${String.format("%.0f", event.soldPrice)}",
                    soldTo = event.soldTo
                )
            } else {
                _toastMessages.emit(
                    context.getString(R.string.vehicle_sold_celebration, event.soldPrice)
                )
            }

            _snackbarMessages.emit(
                SnackbarMessage(
                    message = "🎉 Vehicle sold for $${String.format("%.0f", event.soldPrice)}!",
                    actionLabel = "View",
                    actionData = mapOf("vehicleId" to event.vehicleId)
                )
            )
        } catch (e: Exception) {
            Timber.e(e, "Error handling vehicle sold event")
        }
    }

    /**
     * Handle vehicle price changed event
     */
    private suspend fun handleVehiclePriceChanged(event: VehiclePriceChangedEvent) {
        Timber.d("Vehicle price changed: ${event.vehicleId}")

        try {
            // Update price in local database
            val existingVehicle = vehicleDao.getVehicleById(event.vehicleId)
            if (existingVehicle != null) {
                val updatedVehicle = existingVehicle.copy(
                    price = event.newPrice,
                    updatedAt = System.currentTimeMillis()
                )
                vehicleDao.updateVehicle(updatedVehicle)

                val priceChange = event.newPrice - event.oldPrice
                val changeText = if (priceChange > 0) {
                    "increased by $${String.format("%.0f", priceChange)}"
                } else {
                    "reduced by $${String.format("%.0f", kotlin.math.abs(priceChange))}"
                }

                _snackbarMessages.emit(
                    SnackbarMessage(
                        message = "Vehicle price $changeText",
                        actionLabel = "View",
                        actionData = mapOf("vehicleId" to event.vehicleId)
                    )
                )
            }
        } catch (e: Exception) {
            Timber.e(e, "Error handling vehicle price changed event")
        }
    }

    /**
     * Handle new message event
     */
    private suspend fun handleNewMessage(event: NewMessageEvent) {
        Timber.d("New message received in conversation: ${event.conversationId}")

        // Update unread message count
        _unreadMessageCount.value = _unreadMessageCount.value + 1

        // Show notification if app is in background
        if (!isAppInForeground) {
            notificationManager.showNewMessageNotification(
                senderName = event.senderName,
                message = event.message,
                conversationId = event.conversationId
            )
        } else {
            _snackbarMessages.emit(
                SnackbarMessage(
                    message = "${event.senderName}: ${event.message.take(50)}${if (event.message.length > 50) "..." else ""}",
                    actionLabel = "Reply",
                    actionData = mapOf("conversationId" to event.conversationId)
                )
            )
        }
    }

    /**
     * Handle dashboard update event
     */
    private suspend fun handleDashboardUpdate(event: DashboardUpdateEvent) {
        Timber.d("Dashboard update received")

        try {
            // Create updated dashboard metrics
            val dashboardMetrics = DashboardMetrics(
                inventoryCount = event.inventoryCount,
                crmCount = event.crmCount,
                inventoryAge = emptyList(), // Would be populated from detailed update
                leadsStatus = LeadsStatusMetric(0, 0, 0), // Would be populated from detailed update
                lastUpdated = System.currentTimeMillis()
            )

            // This would typically update the dashboard cache
            // The actual dashboard screen would observe the database changes
            Timber.d("Dashboard metrics updated: ${event.inventoryCount} vehicles, ${event.crmCount} leads")

        } catch (e: Exception) {
            Timber.e(e, "Error updating dashboard metrics")
        }
    }

    /**
     * Handle document uploaded event
     */
    private suspend fun handleDocumentUploaded(event: DocumentUploadedEvent) {
        Timber.d("Document uploaded: ${event.fileName}")

        _snackbarMessages.emit(
            SnackbarMessage(
                message = "Document uploaded: ${event.fileName}",
                actionLabel = "View",
                actionData = mapOf(
                    "documentId" to event.documentId,
                    "entityType" to event.entityType,
                    "entityId" to event.entityId
                )
            )
        )

        if (!isAppInForeground) {
            notificationManager.showDocumentUploadedNotification(
                fileName = event.fileName,
                category = event.category
            )
        }
    }

    /**
     * Handle conflict detection event
     */
    private suspend fun handleConflictDetected(event: ConflictDetectedEvent) {
        Timber.w("Data conflict detected for ${event.entityType} ${event.entityId}")

        // Show conflict resolution dialog
        _conflictDialogs.emit(
            ConflictDialogData(
                entityType = event.entityType,
                entityId = event.entityId,
                field = event.conflictField,
                yourValue = event.yourValue,
                serverValue = event.serverValue,
                conflictUser = event.conflictUser
            )
        )

        // Also show snackbar notification
        _snackbarMessages.emit(
            SnackbarMessage(
                message = "Data conflict detected with ${event.conflictUser}",
                actionLabel = "Resolve",
                actionData = mapOf(
                    "conflictType" to event.entityType,
                    "entityId" to event.entityId
                )
            )
        )
    }

    /**
     * Handle user status changed event
     */
    private suspend fun handleUserStatusChanged(event: UserStatusEvent) {
        Timber.d("User status changed: ${event.userName} is ${if (event.isOnline) "online" else "offline"}")

        // Update user online status in UI (this would be handled by messaging screens)
        // For now, just log the event
    }

    /**
     * Update specific field in lead entity
     */
    private fun updateLeadField(lead: com.dealervait.data.local.entities.LeadEntity, event: LeadUpdatedEvent): com.dealervait.data.local.entities.LeadEntity {
        return when (event.field) {
            "firstName" -> lead.copy(firstName = event.newValue ?: lead.firstName)
            "lastName" -> lead.copy(lastName = event.newValue ?: lead.lastName)
            "emailAddress" -> lead.copy(emailAddress = event.newValue ?: lead.emailAddress)
            "phoneNumber" -> lead.copy(phoneNumber = event.newValue)
            "statusId" -> lead.copy(statusId = event.newValue?.toIntOrNull())
            "notes" -> lead.copy(notes = event.newValue)
            else -> lead
        }.copy(updatedAt = System.currentTimeMillis())
    }

    /**
     * Clear notification counts
     */
    fun clearUnreadMessageCount() {
        _unreadMessageCount.value = 0
    }

    fun clearPendingLeadCount() {
        _pendingLeadCount.value = 0
    }

    /**
     * Lifecycle callbacks
     */
    override fun onStart(owner: LifecycleOwner) {
        super.onStart(owner)
        isAppInForeground = true
    }

    override fun onStop(owner: LifecycleOwner) {
        super.onStop(owner)
        isAppInForeground = false
    }

    /**
     * Connect WebSocket when events are needed
     */
    suspend fun startRealTimeUpdates() {
        webSocketService.connect()
    }

    /**
     * Disconnect WebSocket
     */
    fun stopRealTimeUpdates() {
        webSocketService.disconnect()
    }

    /**
     * Check if real-time updates are active
     */
    fun isRealTimeActive(): Boolean {
        return webSocketService.isConnected()
    }
}

/**
 * Data classes for UI events
 */
data class SnackbarMessage(
    val message: String,
    val actionLabel: String? = null,
    val actionData: Map<String, Any>? = null,
    val duration: Long = 4000
)

data class ConflictDialogData(
    val entityType: String,
    val entityId: Int,
    val field: String,
    val yourValue: String,
    val serverValue: String,
    val conflictUser: String
)
