// File: data/api/DealersCloudApiService.kt
// Purpose: Complete Retrofit API service interface for DealersCloud API
// Dependencies: Retrofit, Coroutines, Multipart for file uploads

package com.dealervait.data.api

import com.dealervait.data.models.request.*
import com.dealervait.data.models.response.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

/**
 * Complete API service interface for DealersCloud platform
 * Base URL: https://dcgptrnapi.azurewebsites.net/api/
 */
interface DealersCloudApiService {

    // =====================================
    // AUTHENTICATION ENDPOINTS
    // =====================================

    /**
     * User login
     * POST /api/login
     */
    @POST("login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<LoginResponse>

    /**
     * User logout (if endpoint exists)
     * POST /api/logout  
     */
    @POST("logout")
    suspend fun logout(): Response<SuccessResponse>

    /**
     * Refresh authentication token
     * POST /api/refresh-token
     */
    @POST("refresh-token")
    suspend fun refreshToken(@Body refreshRequest: Map<String, String>): Response<LoginResponse>

    // =====================================
    // DASHBOARD ENDPOINTS
    // =====================================

    /**
     * Get dashboard statistics and metrics
     * GET /api/dashboard
     */
    @GET("dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>

    // =====================================
    // CRM MANAGEMENT ENDPOINTS
    // =====================================

    /**
     * Add new customer lead
     * POST /api/add-lead
     */
    @POST("add-lead")
    suspend fun addLead(@Body addLeadRequest: AddLeadRequest): Response<ApiResponse<LeadResponse>>

    /**
     * Get customer profile
     * GET /api/crm/profiles/{id}
     */
    @GET("crm/profiles/{id}")
    suspend fun getCustomerProfile(@Path("id") customerId: Int): Response<LeadDetails>

    /**
     * Update customer profile
     * PUT /api/crm/profiles/{id}
     */
    @PUT("crm/profiles/{id}")
    suspend fun updateCustomerProfile(
        @Path("id") customerId: Int,
        @Body updateRequest: Map<String, Any>
    ): Response<SuccessResponse>

    /**
     * Delete customer profile
     * DELETE /api/crm/profiles/{id}
     */
    @DELETE("crm/profiles/{id}")
    suspend fun deleteCustomerProfile(@Path("id") customerId: Int): Response<SuccessResponse>

    /**
     * Get all leads with filtering
     * GET /api/crm/leads
     */
    @GET("crm/leads")
    suspend fun getLeads(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("status") status: String? = null,
        @Query("source") source: String? = null,
        @Query("dateFrom") dateFrom: String? = null,
        @Query("dateTo") dateTo: String? = null
    ): Response<ApiResponse<List<LeadDetails>>>

    /**
     * Create credit application
     * POST /api/crm/credit-applications
     */
    @POST("crm/credit-applications")
    suspend fun createCreditApplication(@Body application: Map<String, Any>): Response<SuccessResponse>

    /**
     * Get credit application
     * GET /api/crm/credit-applications/{id}
     */
    @GET("crm/credit-applications/{id}")
    suspend fun getCreditApplication(@Path("id") applicationId: Int): Response<Map<String, Any>>

    /**
     * Send email with attachments
     * POST /api/send-email
     */
    @Multipart
    @POST("send-email")
    suspend fun sendEmail(
        @Part("to") to: RequestBody,
        @Part("subject") subject: RequestBody,
        @Part("text") text: RequestBody,
        @Part("customerID") customerId: RequestBody,
        @Part files: List<MultipartBody.Part>? = null
    ): Response<SuccessResponse>

    // =====================================
    // INVENTORY MANAGEMENT ENDPOINTS
    // =====================================

    /**
     * Get vehicle inventory with pagination and filtering
     * GET /api/inventory/vehicles
     */
    @GET("inventory/vehicles")
    suspend fun getVehicles(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("make") make: String? = null,
        @Query("model") model: String? = null,
        @Query("year") year: Int? = null,
        @Query("status") status: String? = null,
        @Query("minPrice") minPrice: Double? = null,
        @Query("maxPrice") maxPrice: Double? = null
    ): Response<VehicleResponse>

    /**
     * Add new vehicle
     * POST /api/inventory/vehicles
     */
    @POST("inventory/vehicles")
    suspend fun addVehicle(@Body addVehicleRequest: AddVehicleRequest): Response<ApiResponse<Vehicle>>

    /**
     * Update vehicle details
     * PUT /api/inventory/vehicles/{id}
     */
    @PUT("inventory/vehicles/{id}")
    suspend fun updateVehicle(
        @Path("id") vehicleId: Int,
        @Body updateVehicleRequest: UpdateVehicleRequest
    ): Response<ApiResponse<Vehicle>>

    /**
     * Delete vehicle
     * DELETE /api/inventory/vehicles/{id}
     */
    @DELETE("inventory/vehicles/{id}")
    suspend fun deleteVehicle(@Path("id") vehicleId: Int): Response<SuccessResponse>

    /**
     * Get vehicle details by ID
     * GET /api/inventory/vehicles/{id}
     */
    @GET("inventory/vehicles/{id}")
    suspend fun getVehicleDetails(@Path("id") vehicleId: Int): Response<Vehicle>

    /**
     * Add vehicle expense
     * POST /api/inventory/expenses
     */
    @POST("inventory/expenses")
    suspend fun addVehicleExpense(@Body expense: Map<String, Any>): Response<SuccessResponse>

    /**
     * Get vehicle expenses
     * GET /api/inventory/expenses/{vehicleId}
     */
    @GET("inventory/expenses/{vehicleId}")
    suspend fun getVehicleExpenses(@Path("vehicleId") vehicleId: Int): Response<List<Map<String, Any>>>

    // =====================================
    // MESSAGING ENDPOINTS
    // =====================================

    /**
     * Send message
     * POST /api/messages
     */
    @POST("messages")
    suspend fun sendMessage(@Body sendMessageRequest: SendMessageRequest): Response<MessageResponse>

    /**
     * Get chat list
     * POST /api/chats
     */
    @POST("chats")
    suspend fun getChatList(): Response<List<Chat>>

    /**
     * Get conversation history
     * GET /api/conversations/{userId}
     */
    @GET("conversations/{userId}")
    suspend fun getConversation(
        @Path("userId") userId: Int,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): Response<ConversationResponse>

    /**
     * Delete message
     * DELETE /api/messages/{messageId}
     */
    @DELETE("messages/{messageId}")
    suspend fun deleteMessage(@Path("messageId") messageId: Int): Response<SuccessResponse>

    /**
     * Mark message as read
     * PUT /api/messages/{messageId}/read
     */
    @PUT("messages/{messageId}/read")
    suspend fun markMessageAsRead(@Path("messageId") messageId: Int): Response<SuccessResponse>

    // =====================================
    // DOCUMENT & FILE MANAGEMENT ENDPOINTS
    // =====================================

    /**
     * Upload documents (multipart)
     * POST /api/upload
     */
    @Multipart
    @POST("upload")
    suspend fun uploadDocuments(
        @Part files: List<MultipartBody.Part>,
        @Part("vehicleId") vehicleId: RequestBody? = null,
        @Part("customerId") customerId: RequestBody? = null,
        @Part("documentType") documentType: RequestBody? = null
    ): Response<List<DocumentResponse>>

    /**
     * Get document
     * GET /api/documents/{id}
     */
    @GET("documents/{id}")
    suspend fun getDocument(@Path("id") documentId: String): Response<DocumentResponse>

    /**
     * Delete document
     * DELETE /api/documents/{id}
     */
    @DELETE("documents/{id}")
    suspend fun deleteDocument(@Path("id") documentId: String): Response<SuccessResponse>

    // =====================================
    // ADDITIONAL UTILITY ENDPOINTS
    // =====================================

    /**
     * Get dropdown options for forms
     * GET /api/dropdown/{type}
     */
    @GET("dropdown/{type}")
    suspend fun getDropdownOptions(@Path("type") type: String): Response<List<Map<String, Any>>>

    /**
     * Search vehicles by description
     * POST /api/search/vehicles
     */
    @POST("search/vehicles")
    suspend fun searchVehicles(@Body searchQuery: Map<String, String>): Response<VehicleResponse>

    /**
     * Get user profile/settings
     * GET /api/profile
     */
    @GET("profile")
    suspend fun getUserProfile(): Response<Map<String, Any>>

    /**
     * Update user profile
     * PUT /api/profile
     */
    @PUT("profile")
    suspend fun updateUserProfile(@Body profileData: Map<String, Any>): Response<SuccessResponse>

    /**
     * Get system notifications
     * GET /api/notifications
     */
    @GET("notifications")
    suspend fun getNotifications(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<List<Map<String, Any>>>

    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    @PUT("notifications/{id}/read")
    suspend fun markNotificationAsRead(@Path("id") notificationId: Int): Response<SuccessResponse>

    // =====================================
    // MESSAGING ENDPOINTS
    // =====================================

    /**
     * Get all conversations for current user
     * GET /api/conversations
     */
    @GET("conversations")
    suspend fun getConversations(): Response<List<Map<String, Any?>>>

    /**
     * Get specific conversation
     * GET /api/conversations/{id}
     */
    @GET("conversations/{id}")
    suspend fun getConversation(@Path("id") conversationId: String): Response<Map<String, Any?>>

    /**
     * Create new conversation
     * POST /api/conversations
     */
    @POST("conversations")
    suspend fun createConversation(@Body request: Map<String, Any?>): Response<Map<String, Any?>>

    /**
     * Update conversation
     * PUT /api/conversations/{id}
     */
    @PUT("conversations/{id}")
    suspend fun updateConversation(
        @Path("id") conversationId: String,
        @Body conversation: Any
    ): Response<Map<String, Any?>>

    /**
     * Delete conversation
     * DELETE /api/conversations/{id}
     */
    @DELETE("conversations/{id}")
    suspend fun deleteConversation(@Path("id") conversationId: String): Response<SuccessResponse>

    /**
     * Archive/unarchive conversation
     * PUT /api/conversations/{id}/archive
     */
    @PUT("conversations/{id}/archive")
    suspend fun archiveConversation(
        @Path("id") conversationId: String,
        @Body request: Map<String, Boolean>
    ): Response<SuccessResponse>

    /**
     * Mute/unmute conversation
     * PUT /api/conversations/{id}/mute
     */
    @PUT("conversations/{id}/mute")
    suspend fun muteConversation(
        @Path("id") conversationId: String,
        @Body request: Map<String, Boolean>
    ): Response<SuccessResponse>

    /**
     * Get messages for conversation
     * GET /api/conversations/{id}/messages
     */
    @GET("conversations/{id}/messages")
    suspend fun getMessages(
        @Path("id") conversationId: String,
        @Query("page") page: Int = 0,
        @Query("limit") limit: Int = 50
    ): Response<List<Map<String, Any?>>>

    /**
     * Send message
     * POST /api/conversations/{id}/messages
     */
    @POST("conversations/{id}/messages")
    suspend fun sendMessage(
        @Path("id") conversationId: String,
        @Body message: Map<String, Any?>
    ): Response<Map<String, Any?>>

    /**
     * Edit message
     * PUT /api/messages/{id}
     */
    @PUT("messages/{id}")
    suspend fun editMessage(
        @Path("id") messageId: String,
        @Body request: Map<String, String>
    ): Response<Map<String, Any?>>

    /**
     * Delete message
     * DELETE /api/messages/{id}
     */
    @DELETE("messages/{id}")
    suspend fun deleteMessage(@Path("id") messageId: String): Response<SuccessResponse>

    /**
     * Mark message as read
     * PUT /api/messages/{id}/read
     */
    @PUT("messages/{id}/read")
    suspend fun markMessageAsRead(@Path("id") messageId: String): Response<SuccessResponse>

    /**
     * Mark conversation as read
     * PUT /api/conversations/{id}/read
     */
    @PUT("conversations/{id}/read")
    suspend fun markConversationAsRead(@Path("id") conversationId: String): Response<SuccessResponse>

    /**
     * Search messages
     * GET /api/messages/search
     */
    @GET("messages/search")
    suspend fun searchMessages(
        @Query("q") query: String,
        @Query("conversationId") conversationId: String? = null
    ): Response<List<Map<String, Any?>>>

    /**
     * Search conversations
     * GET /api/conversations/search
     */
    @GET("conversations/search")
    suspend fun searchConversations(@Query("q") query: String): Response<List<Map<String, Any?>>>

    /**
     * Upload message attachment
     * POST /api/conversations/{id}/attachments
     */
    @Multipart
    @POST("conversations/{id}/attachments")
    suspend fun uploadMessageAttachment(
        @Path("id") conversationId: RequestBody,
        @Part file: MultipartBody.Part
    ): Response<Map<String, Any?>>

    /**
     * Add participant to conversation
     * POST /api/conversations/{id}/participants
     */
    @POST("conversations/{id}/participants")
    suspend fun addParticipant(
        @Path("id") conversationId: String,
        @Body request: Map<String, Int>
    ): Response<SuccessResponse>

    /**
     * Remove participant from conversation
     * DELETE /api/conversations/{id}/participants/{userId}
     */
    @DELETE("conversations/{id}/participants/{userId}")
    suspend fun removeParticipant(
        @Path("id") conversationId: String,
        @Path("userId") userId: Int
    ): Response<SuccessResponse>

    /**
     * Update participant role
     * PUT /api/conversations/{id}/participants/{userId}/role
     */
    @PUT("conversations/{id}/participants/{userId}/role")
    suspend fun updateParticipantRole(
        @Path("id") conversationId: String,
        @Path("userId") userId: Int,
        @Body request: Map<String, String>
    ): Response<SuccessResponse>

    /**
     * Get conversations for entity (vehicle, lead, etc.)
     * GET /api/{entityType}/{entityId}/conversations
     */
    @GET("{entityType}/{entityId}/conversations")
    suspend fun getConversationsForEntity(
        @Path("entityType") entityType: String,
        @Path("entityId") entityId: String
    ): Response<List<Map<String, Any?>>>

    /**
     * Clear conversation history
     * DELETE /api/conversations/{id}/messages
     */
    @DELETE("conversations/{id}/messages")
    suspend fun clearConversationHistory(@Path("id") conversationId: String): Response<SuccessResponse>

    // =====================================
    // ANALYTICS & REPORTING ENDPOINTS
    // =====================================

    /**
     * Get dashboard analytics
     * GET /api/analytics/dashboard
     */
    @GET("analytics/dashboard")
    suspend fun getDashboardAnalytics(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Any?>>

    /**
     * Get summary metrics
     * GET /api/analytics/summary
     */
    @GET("analytics/summary")
    suspend fun getSummaryMetrics(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Any?>>

    /**
     * Get sales trends
     * GET /api/analytics/sales/trends
     */
    @GET("analytics/sales/trends")
    suspend fun getSalesTrends(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Any?>>

    /**
     * Get sales by period
     * GET /api/analytics/sales/period
     */
    @GET("analytics/sales/period")
    suspend fun getSalesByPeriod(
        @Query("period") period: String,
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<List<Map<String, Any?>>>

    /**
     * Get sales by category
     * GET /api/analytics/sales/category
     */
    @GET("analytics/sales/category")
    suspend fun getSalesByCategory(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<List<Map<String, Any?>>>

    /**
     * Get inventory analytics
     * GET /api/analytics/inventory
     */
    @GET("analytics/inventory")
    suspend fun getInventoryAnalytics(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Any?>>

    /**
     * Get inventory turnover
     * GET /api/analytics/inventory/turnover
     */
    @GET("analytics/inventory/turnover")
    suspend fun getInventoryTurnover(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Double>>

    /**
     * Get inventory by make
     * GET /api/analytics/inventory/make
     */
    @GET("analytics/inventory/make")
    suspend fun getInventoryByMake(): Response<List<Map<String, Any?>>>

    /**
     * Get inventory aging
     * GET /api/analytics/inventory/aging
     */
    @GET("analytics/inventory/aging")
    suspend fun getInventoryAging(): Response<List<Map<String, Any?>>>

    /**
     * Get lead analytics
     * GET /api/analytics/leads
     */
    @GET("analytics/leads")
    suspend fun getLeadAnalytics(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Any?>>

    /**
     * Get lead conversion funnel
     * GET /api/analytics/leads/funnel
     */
    @GET("analytics/leads/funnel")
    suspend fun getLeadConversionFunnel(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<List<Map<String, Any?>>>

    /**
     * Get performance metrics
     * GET /api/analytics/performance
     */
    @GET("analytics/performance")
    suspend fun getPerformanceMetrics(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<Map<String, Any?>>

    /**
     * Get sales team performance
     * GET /api/analytics/performance/team
     */
    @GET("analytics/performance/team")
    suspend fun getSalesTeamPerformance(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<List<Map<String, Any?>>>

    /**
     * Get KPI metrics
     * GET /api/analytics/kpi
     */
    @GET("analytics/kpi")
    suspend fun getKpiMetrics(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<List<Map<String, Any?>>>

    /**
     * Generate custom report
     * POST /api/reports/generate
     */
    @POST("reports/generate")
    suspend fun generateCustomReport(@Body config: Map<String, Any?>): Response<Map<String, String>>

    /**
     * Get real-time metrics
     * GET /api/analytics/realtime
     */
    @GET("analytics/realtime")
    suspend fun getRealTimeMetrics(): Response<Map<String, Double>>

    /**
     * Export analytics data
     * POST /api/analytics/export
     */
    @POST("analytics/export")
    suspend fun exportAnalyticsData(@Body request: Map<String, Any?>): Response<Map<String, String>>

    /**
     * Get benchmark data
     * GET /api/analytics/benchmark
     */
    @GET("analytics/benchmark")
    suspend fun getBenchmarkData(
        @Query("metric") metric: String,
        @Query("dealershipType") dealershipType: String,
        @Query("region") region: String? = null
    ): Response<Map<String, Any?>>

    /**
     * Get sales forecast
     * GET /api/analytics/forecast/sales
     */
    @GET("analytics/forecast/sales")
    suspend fun getSalesForecast(
        @Query("period") period: String,
        @Query("periodsAhead") periodsAhead: Int
    ): Response<List<Map<String, Any?>>>

    /**
     * Get goals and targets
     * GET /api/analytics/goals
     */
    @GET("analytics/goals")
    suspend fun getGoals(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): Response<List<Map<String, Any?>>>

    /**
     * Update goal target
     * PUT /api/analytics/goals/{metric}
     */
    @PUT("analytics/goals/{metric}")
    suspend fun updateGoal(
        @Path("metric") metric: String,
        @Body request: Map<String, Double>
    ): Response<SuccessResponse>
}
