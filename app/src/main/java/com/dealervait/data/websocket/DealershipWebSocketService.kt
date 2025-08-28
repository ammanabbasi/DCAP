// File: data/websocket/DealershipWebSocketService.kt
// Purpose: Complete WebSocket implementation with automatic reconnection and event handling
// Dependencies: OkHttp WebSocket, TokenManager, Moshi

package com.dealervait.data.websocket

import android.content.Context
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.dealervait.BuildConfig
import com.dealervait.core.storage.TokenManager
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import okhttp3.*
import okio.ByteString
import timber.log.Timber
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * WebSocket service for real-time dealership updates
 * Handles connection management, automatic reconnection, and event broadcasting
 */
@Singleton
class DealershipWebSocketService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val tokenManager: TokenManager,
    private val moshi: Moshi,
    private val okHttpClient: OkHttpClient
) : DefaultLifecycleObserver {

    companion object {
        private const val WEBSOCKET_URL = BuildConfig.SOCKET_URL.replace("http", "ws") + "/ws"
        private const val HEARTBEAT_INTERVAL_MS = 30000L // 30 seconds
        private const val CONNECTION_TIMEOUT_MS = 10000L // 10 seconds
    }

    private var webSocket: WebSocket? = null
    private var reconnectionJob: Job? = null
    private var heartbeatJob: Job? = null
    private var currentRetryCount = 0
    
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val messageAdapter: JsonAdapter<WebSocketMessage> = moshi.adapter(WebSocketMessage::class.java)
    
    private val reconnectionPolicy = ReconnectionPolicy()

    // Connection state flow
    private val _connectionState = MutableStateFlow(WebSocketConnectionState.DISCONNECTED)
    val connectionState: StateFlow<WebSocketConnectionState> = _connectionState.asStateFlow()

    // Event flows for different types of updates
    private val _newLeadEvents = MutableSharedFlow<NewLeadEvent>()
    val newLeadEvents: SharedFlow<NewLeadEvent> = _newLeadEvents.asSharedFlow()

    private val _leadUpdatedEvents = MutableSharedFlow<LeadUpdatedEvent>()
    val leadUpdatedEvents: SharedFlow<LeadUpdatedEvent> = _leadUpdatedEvents.asSharedFlow()

    private val _vehicleSoldEvents = MutableSharedFlow<VehicleSoldEvent>()
    val vehicleSoldEvents: SharedFlow<VehicleSoldEvent> = _vehicleSoldEvents.asSharedFlow()

    private val _vehiclePriceChangedEvents = MutableSharedFlow<VehiclePriceChangedEvent>()
    val vehiclePriceChangedEvents: SharedFlow<VehiclePriceChangedEvent> = _vehiclePriceChangedEvents.asSharedFlow()

    private val _newMessageEvents = MutableSharedFlow<NewMessageEvent>()
    val newMessageEvents: SharedFlow<NewMessageEvent> = _newMessageEvents.asSharedFlow()

    private val _dashboardUpdateEvents = MutableSharedFlow<DashboardUpdateEvent>()
    val dashboardUpdateEvents: SharedFlow<DashboardUpdateEvent> = _dashboardUpdateEvents.asSharedFlow()

    private val _userTypingEvents = MutableSharedFlow<UserTypingEvent>()
    val userTypingEvents: SharedFlow<UserTypingEvent> = _userTypingEvents.asSharedFlow()

    private val _documentUploadedEvents = MutableSharedFlow<DocumentUploadedEvent>()
    val documentUploadedEvents: SharedFlow<DocumentUploadedEvent> = _documentUploadedEvents.asSharedFlow()

    private val _conflictDetectedEvents = MutableSharedFlow<ConflictDetectedEvent>()
    val conflictDetectedEvents: SharedFlow<ConflictDetectedEvent> = _conflictDetectedEvents.asSharedFlow()

    private val _userStatusEvents = MutableSharedFlow<UserStatusEvent>()
    val userStatusEvents: SharedFlow<UserStatusEvent> = _userStatusEvents.asSharedFlow()

    // Network state monitoring
    private var isAppInForeground = true

    init {
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)
    }

    /**
     * Connect to WebSocket server
     */
    suspend fun connect() {
        if (_connectionState.value == WebSocketConnectionState.CONNECTED || 
            _connectionState.value == WebSocketConnectionState.CONNECTING) {
            return
        }

        val token = tokenManager.getAccessToken()
        if (token.isNullOrBlank()) {
            Timber.w("Cannot connect WebSocket: No access token available")
            return
        }

        _connectionState.value = WebSocketConnectionState.CONNECTING
        
        val request = Request.Builder()
            .url(WEBSOCKET_URL)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("User-Agent", "DealerVait-Android/${BuildConfig.VERSION_NAME}")
            .build()

        webSocket = okHttpClient.newWebSocket(request, createWebSocketListener())
    }

    /**
     * Disconnect from WebSocket server
     */
    fun disconnect() {
        Timber.d("Disconnecting WebSocket")
        reconnectionJob?.cancel()
        heartbeatJob?.cancel()
        webSocket?.close(1000, "Client disconnect")
        webSocket = null
        _connectionState.value = WebSocketConnectionState.DISCONNECTED
        currentRetryCount = 0
    }

    /**
     * Send message to WebSocket server
     */
    fun sendMessage(type: String, data: Any? = null) {
        val message = WebSocketMessage(
            type = type,
            data = data,
            timestamp = System.currentTimeMillis()
        )

        try {
            val json = messageAdapter.toJson(message)
            val success = webSocket?.send(json) ?: false
            
            if (!success) {
                Timber.w("Failed to send WebSocket message: $type")
            }
        } catch (e: Exception) {
            Timber.e(e, "Error sending WebSocket message: $type")
        }
    }

    /**
     * Send typing indicator
     */
    fun sendTypingIndicator(conversationId: String, isTyping: Boolean) {
        sendMessage(WebSocketEventType.USER_TYPING, mapOf(
            "conversationId" to conversationId,
            "isTyping" to isTyping
        ))
    }

    /**
     * Create WebSocket listener with event handling
     */
    private fun createWebSocketListener(): WebSocketListener {
        return object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Timber.d("WebSocket connected successfully")
                _connectionState.value = WebSocketConnectionState.CONNECTED
                currentRetryCount = 0
                reconnectionJob?.cancel()
                
                // Start heartbeat
                startHeartbeat()
                
                // Send connection established event
                sendMessage(WebSocketEventType.CONNECTION_ESTABLISHED)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                handleIncomingMessage(text)
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                handleIncomingMessage(bytes.utf8())
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Timber.d("WebSocket closing: $code - $reason")
                heartbeatJob?.cancel()
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Timber.d("WebSocket closed: $code - $reason")
                _connectionState.value = WebSocketConnectionState.DISCONNECTED
                heartbeatJob?.cancel()
                
                // Attempt reconnection if not a clean disconnect
                if (code != 1000 && isAppInForeground) {
                    scheduleReconnection()
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Timber.e(t, "WebSocket connection failed: ${response?.message}")
                _connectionState.value = WebSocketConnectionState.FAILED
                heartbeatJob?.cancel()
                
                if (isAppInForeground) {
                    scheduleReconnection()
                }
            }
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    private fun handleIncomingMessage(text: String) {
        try {
            val message = messageAdapter.fromJson(text)
            if (message == null) {
                Timber.w("Received null WebSocket message")
                return
            }

            Timber.d("Received WebSocket event: ${message.type}")

            when (message.type) {
                WebSocketEventType.HEARTBEAT -> {
                    // Respond to server heartbeat
                    sendMessage(WebSocketEventType.HEARTBEAT)
                }
                
                WebSocketEventType.NEW_LEAD -> {
                    parseAndEmit(message.data, _newLeadEvents, NewLeadEvent::class.java)
                }
                
                WebSocketEventType.LEAD_UPDATED -> {
                    parseAndEmit(message.data, _leadUpdatedEvents, LeadUpdatedEvent::class.java)
                }
                
                WebSocketEventType.VEHICLE_SOLD -> {
                    parseAndEmit(message.data, _vehicleSoldEvents, VehicleSoldEvent::class.java)
                }
                
                WebSocketEventType.VEHICLE_PRICE_CHANGED -> {
                    parseAndEmit(message.data, _vehiclePriceChangedEvents, VehiclePriceChangedEvent::class.java)
                }
                
                WebSocketEventType.NEW_MESSAGE -> {
                    parseAndEmit(message.data, _newMessageEvents, NewMessageEvent::class.java)
                }
                
                WebSocketEventType.DASHBOARD_UPDATE -> {
                    parseAndEmit(message.data, _dashboardUpdateEvents, DashboardUpdateEvent::class.java)
                }
                
                WebSocketEventType.USER_TYPING -> {
                    parseAndEmit(message.data, _userTypingEvents, UserTypingEvent::class.java)
                }
                
                WebSocketEventType.DOCUMENT_UPLOADED -> {
                    parseAndEmit(message.data, _documentUploadedEvents, DocumentUploadedEvent::class.java)
                }
                
                WebSocketEventType.CONFLICT_DETECTED -> {
                    parseAndEmit(message.data, _conflictDetectedEvents, ConflictDetectedEvent::class.java)
                }
                
                WebSocketEventType.USER_ONLINE, WebSocketEventType.USER_OFFLINE -> {
                    parseAndEmit(message.data, _userStatusEvents, UserStatusEvent::class.java)
                }
                
                else -> {
                    Timber.d("Unhandled WebSocket event type: ${message.type}")
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Error parsing WebSocket message: $text")
        }
    }

    /**
     * Parse event data and emit to appropriate flow
     */
    private fun <T> parseAndEmit(data: Any?, flow: MutableSharedFlow<T>, clazz: Class<T>) {
        try {
            if (data != null) {
                val adapter = moshi.adapter(clazz)
                val json = moshi.adapter(Any::class.java).toJson(data)
                val event = adapter.fromJson(json)
                if (event != null) {
                    scope.launch {
                        flow.emit(event)
                    }
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Error parsing WebSocket event data for ${clazz.simpleName}")
        }
    }

    /**
     * Start heartbeat to keep connection alive
     */
    private fun startHeartbeat() {
        heartbeatJob?.cancel()
        heartbeatJob = scope.launch {
            while (isActive && _connectionState.value == WebSocketConnectionState.CONNECTED) {
                delay(HEARTBEAT_INTERVAL_MS)
                sendMessage(WebSocketEventType.HEARTBEAT)
            }
        }
    }

    /**
     * Schedule reconnection with exponential backoff
     */
    private fun scheduleReconnection() {
        if (currentRetryCount >= reconnectionPolicy.maxRetries) {
            Timber.w("Max reconnection attempts reached")
            _connectionState.value = WebSocketConnectionState.FAILED
            return
        }

        val delay = calculateBackoffDelay()
        Timber.d("Scheduling WebSocket reconnection in ${delay}ms (attempt ${currentRetryCount + 1})")
        
        _connectionState.value = WebSocketConnectionState.RECONNECTING
        
        reconnectionJob?.cancel()
        reconnectionJob = scope.launch {
            delay(delay)
            currentRetryCount++
            connect()
        }
    }

    /**
     * Calculate exponential backoff delay
     */
    private fun calculateBackoffDelay(): Long {
        val delay = (reconnectionPolicy.initialDelayMs * 
                    Math.pow(reconnectionPolicy.multiplier, currentRetryCount.toDouble())).toLong()
        return minOf(delay, reconnectionPolicy.maxDelayMs)
    }

    /**
     * Lifecycle callbacks
     */
    override fun onStart(owner: LifecycleOwner) {
        super.onStart(owner)
        isAppInForeground = true
        
        // Reconnect if we were connected before going to background
        scope.launch {
            if (_connectionState.value == WebSocketConnectionState.DISCONNECTED) {
                connect()
            }
        }
    }

    override fun onStop(owner: LifecycleOwner) {
        super.onStop(owner)
        isAppInForeground = false
        
        // Keep connection alive but stop reconnection attempts in background
        reconnectionJob?.cancel()
    }

    override fun onDestroy(owner: LifecycleOwner) {
        super.onDestroy(owner)
        disconnect()
        scope.cancel()
    }

    /**
     * Get connection status
     */
    fun isConnected(): Boolean {
        return _connectionState.value == WebSocketConnectionState.CONNECTED
    }

    /**
     * Force reconnect
     */
    suspend fun forceReconnect() {
        disconnect()
        delay(1000) // Brief pause before reconnecting
        connect()
    }
}
