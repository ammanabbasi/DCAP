// File: domain/repository/CrmRepository.kt
// Purpose: CRM repository interface for domain layer
// Dependencies: NetworkResult, Lead domain model

package com.dealervait.domain.repository

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.Lead
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for CRM operations
 * Defines the contract for CRM-related data operations
 */
interface CrmRepository {

    /**
     * Get leads with pagination and filtering
     * @param page Page number (1-based)
     * @param limit Items per page
     * @param status Filter by status
     * @param source Filter by lead source
     * @param dateFrom Filter by date from
     * @param dateTo Filter by date to
     * @param forceRefresh Whether to force refresh from API
     * @return Flow of lead list with caching strategy
     */
    fun getLeads(
        page: Int = 1,
        limit: Int = 50,
        status: String? = null,
        source: String? = null,
        dateFrom: String? = null,
        dateTo: String? = null,
        forceRefresh: Boolean = false
    ): Flow<NetworkResult<List<Lead>>>

    /**
     * Get lead by ID
     * @param leadId Lead ID
     * @return Flow of lead or null if not found
     */
    fun getLeadById(leadId: Int): Flow<NetworkResult<Lead>>

    /**
     * Add new lead
     * @param lead Lead to add
     * @return NetworkResult with created lead
     */
    suspend fun addLead(lead: Lead): NetworkResult<Lead>

    /**
     * Update existing lead
     * @param lead Lead to update
     * @return NetworkResult with updated lead
     */
    suspend fun updateLead(lead: Lead): NetworkResult<Lead>

    /**
     * Delete lead by ID
     * @param leadId Lead ID to delete
     * @return NetworkResult indicating success or failure
     */
    suspend fun deleteLead(leadId: Int): NetworkResult<Unit>

    /**
     * Send email to lead/customer
     * @param leadId Lead ID
     * @param subject Email subject
     * @param body Email body
     * @param attachments File attachments (optional)
     * @return NetworkResult indicating success or failure
     */
    suspend fun sendEmail(
        leadId: Int,
        subject: String,
        body: String,
        attachments: List<String>? = null
    ): NetworkResult<Unit>
}
