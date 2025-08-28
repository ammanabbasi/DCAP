// File: domain/repository/DocumentRepository.kt
// Purpose: Repository interface for document management operations
// Dependencies: Domain models, NetworkResult

package com.dealervait.domain.repository

import android.net.Uri
import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.*
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for document operations
 */
interface DocumentRepository {
    
    /**
     * Get documents by entity with optional filtering
     */
    fun getDocumentsByEntity(
        entityType: DocumentEntityType,
        entityId: Int,
        category: DocumentCategory? = null
    ): Flow<NetworkResult<List<Document>>>
    
    /**
     * Get documents by category
     */
    fun getDocumentsByCategory(
        category: DocumentCategory,
        limit: Int = 50,
        offset: Int = 0
    ): Flow<NetworkResult<List<Document>>>
    
    /**
     * Search documents
     */
    suspend fun searchDocuments(
        query: String,
        filter: DocumentFilter? = null,
        limit: Int = 20,
        offset: Int = 0
    ): NetworkResult<DocumentSearchResult>
    
    /**
     * Get document by ID
     */
    suspend fun getDocumentById(documentId: String): NetworkResult<Document>
    
    /**
     * Upload single document
     */
    suspend fun uploadDocument(
        entityType: DocumentEntityType,
        entityId: Int,
        fileUri: Uri,
        category: DocumentCategory,
        description: String? = null,
        tags: List<String> = emptyList()
    ): Flow<NetworkResult<DocumentUploadProgress>>
    
    /**
     * Upload multiple documents
     */
    suspend fun uploadMultipleDocuments(
        entityType: DocumentEntityType,
        entityId: Int,
        files: List<Pair<Uri, DocumentCategory>>,
        description: String? = null
    ): Flow<NetworkResult<List<DocumentUploadProgress>>>
    
    /**
     * Update document metadata
     */
    suspend fun updateDocument(
        documentId: String,
        category: DocumentCategory? = null,
        description: String? = null,
        tags: List<String>? = null
    ): NetworkResult<Document>
    
    /**
     * Delete document
     */
    suspend fun deleteDocument(documentId: String): NetworkResult<Unit>
    
    /**
     * Download document
     */
    suspend fun downloadDocument(documentId: String): NetworkResult<ByteArray>
    
    /**
     * Get document download URL
     */
    suspend fun getDocumentDownloadUrl(documentId: String): NetworkResult<String>
    
    /**
     * Create shareable link for document
     */
    suspend fun createShareLink(
        documentId: String,
        expiryDays: Int? = null,
        isPublic: Boolean = false
    ): NetworkResult<DocumentShareLink>
    
    /**
     * Revoke document share link
     */
    suspend fun revokeShareLink(documentId: String): NetworkResult<Unit>
    
    /**
     * Get document thumbnail (for images/PDFs)
     */
    suspend fun getDocumentThumbnail(documentId: String): NetworkResult<ByteArray>
    
    /**
     * Get offline document queue for sync
     */
    fun getOfflineDocumentQueue(): Flow<List<Document>>
    
    /**
     * Process offline document queue
     */
    suspend fun processOfflineDocumentQueue(): NetworkResult<Unit>
    
    /**
     * Cancel document upload
     */
    suspend fun cancelUpload(documentId: String): NetworkResult<Unit>
    
    /**
     * Retry failed document upload
     */
    suspend fun retryUpload(documentId: String): Flow<NetworkResult<DocumentUploadProgress>>
}
