// File: data/local/dao/LeadDao.kt
// Purpose: DAO for LeadEntity, providing CRUD operations for local lead data
// Dependencies: Room, Flow, LeadEntity

package com.dealervait.data.local.dao

import androidx.room.*
import com.dealervait.data.local.entities.LeadEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Lead operations
 * Provides methods to interact with the leads table
 */
@Dao
interface LeadDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLeads(leads: List<LeadEntity>)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLead(lead: LeadEntity)
    
    @Query("SELECT * FROM leads WHERE id = :leadId")
    suspend fun getLeadById(leadId: Int): LeadEntity?
    
    @Query("SELECT * FROM leads ORDER BY created_at DESC")
    fun getAllLeads(): Flow<List<LeadEntity>>
    
    @Update
    suspend fun updateLead(lead: LeadEntity)
    
    @Delete
    suspend fun deleteLead(lead: LeadEntity)
    
    @Query("DELETE FROM leads WHERE id = :leadId")
    suspend fun deleteLeadById(leadId: Int)
    
    @Query("DELETE FROM leads")
    suspend fun deleteAllLeads()

    @Query("SELECT COUNT(*) FROM leads")
    suspend fun getLeadCount(): Int

    @Query("SELECT * FROM leads WHERE synced_at IS NULL OR synced_at < updated_at")
    suspend fun getUnsyncedLeads(): List<LeadEntity>

    @Query("""
        SELECT * FROM leads 
        WHERE (:status IS NULL OR statusId = :status)
        AND (:dateFrom IS NULL OR created_at >= :dateFrom)
        AND (:dateTo IS NULL OR created_at <= :dateTo)
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    fun getFilteredLeads(
        status: String?,
        dateFrom: String?,
        dateTo: String?,
        limit: Int,
        offset: Int
    ): Flow<List<LeadEntity>>

    @Query("UPDATE leads SET synced_at = :syncedAt WHERE id = :leadId")
    suspend fun markLeadSynced(leadId: Int, syncedAt: Long = System.currentTimeMillis())
}
