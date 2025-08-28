// File: domain/model/Document.kt
// Purpose: Domain model for document management
// Dependencies: None

package com.dealervait.domain.model

/**
 * Document domain model
 */
data class Document(
    val id: String,
    val fileName: String,
    val originalFileName: String,
    val fileSize: Long,
    val mimeType: String,
    val category: DocumentCategory,
    val entityType: DocumentEntityType,
    val entityId: Int,
    val description: String?,
    val tags: List<String> = emptyList(),
    val uploadedBy: Int,
    val uploadedByName: String?,
    val downloadUrl: String?,
    val thumbnailUrl: String?,
    val isPublic: Boolean = false,
    val expiryDate: Long? = null,
    val createdAt: Long,
    val updatedAt: Long
) {
    /**
     * Get file extension from filename
     */
    val fileExtension: String
        get() = fileName.substringAfterLast('.', "")

    /**
     * Get human readable file size
     */
    val formattedFileSize: String
        get() = formatFileSize(fileSize)

    /**
     * Check if document is an image
     */
    val isImage: Boolean
        get() = mimeType.startsWith("image/")

    /**
     * Check if document is a PDF
     */
    val isPdf: Boolean
        get() = mimeType == "application/pdf"

    /**
     * Check if document is expired
     */
    val isExpired: Boolean
        get() = expiryDate != null && System.currentTimeMillis() > expiryDate

    /**
     * Check if document can be previewed
     */
    val canPreview: Boolean
        get() = isImage || isPdf || mimeType.startsWith("text/")

    private fun formatFileSize(bytes: Long): String {
        val kb = 1024.0
        val mb = kb * 1024
        val gb = mb * 1024

        return when {
            bytes >= gb -> String.format("%.1f GB", bytes / gb)
            bytes >= mb -> String.format("%.1f MB", bytes / mb)
            bytes >= kb -> String.format("%.1f KB", bytes / kb)
            else -> "$bytes B"
        }
    }
}

/**
 * Document categories for organization
 */
enum class DocumentCategory(val displayName: String, val description: String) {
    VEHICLE_TITLE("Vehicle Title", "Vehicle ownership documents"),
    VEHICLE_REGISTRATION("Registration", "Vehicle registration documents"),
    VEHICLE_INSPECTION("Inspection", "Safety and emissions inspections"),
    VEHICLE_MAINTENANCE("Maintenance", "Service and repair records"),
    VEHICLE_PHOTOS("Vehicle Photos", "Vehicle images and media"),
    
    CUSTOMER_LICENSE("Driver's License", "Customer driver's licenses"),
    CUSTOMER_INSURANCE("Insurance", "Customer insurance documents"),
    CUSTOMER_CREDIT("Credit Application", "Credit applications and reports"),
    CUSTOMER_INCOME("Income Verification", "Pay stubs and income documents"),
    CUSTOMER_ID("Identification", "Customer identification documents"),
    
    DEAL_PURCHASE_AGREEMENT("Purchase Agreement", "Sales contracts and agreements"),
    DEAL_FINANCING("Financing", "Loan and financing documents"),
    DEAL_TRADE_IN("Trade-in", "Trade-in vehicle documents"),
    DEAL_WARRANTY("Warranty", "Warranty and service contract documents"),
    DEAL_DELIVERY("Delivery", "Delivery and pickup documentation"),
    
    BUSINESS_LICENSE("Business License", "Dealership licensing documents"),
    BUSINESS_INSURANCE("Business Insurance", "Dealership insurance documents"),
    BUSINESS_TAX("Tax Documents", "Tax forms and compliance documents"),
    BUSINESS_AUDIT("Audit", "Audit and financial review documents"),
    
    GENERAL("General", "Miscellaneous documents");

    companion object {
        fun getByName(name: String): DocumentCategory? {
            return values().find { it.name == name }
        }

        fun getVehicleCategories(): List<DocumentCategory> {
            return values().filter { it.name.startsWith("VEHICLE_") }
        }

        fun getCustomerCategories(): List<DocumentCategory> {
            return values().filter { it.name.startsWith("CUSTOMER_") }
        }

        fun getDealCategories(): List<DocumentCategory> {
            return values().filter { it.name.startsWith("DEAL_") }
        }

        fun getBusinessCategories(): List<DocumentCategory> {
            return values().filter { it.name.startsWith("BUSINESS_") }
        }
    }
}

/**
 * Entity types that can have documents
 */
enum class DocumentEntityType(val displayName: String) {
    VEHICLE("Vehicle"),
    CUSTOMER("Customer"),
    DEAL("Deal"),
    EMPLOYEE("Employee"),
    BUSINESS("Business");

    companion object {
        fun getByName(name: String): DocumentEntityType? {
            return values().find { it.name == name }
        }
    }
}

/**
 * Document upload progress
 */
data class DocumentUploadProgress(
    val documentId: String,
    val fileName: String,
    val progress: Int, // 0-100
    val status: DocumentUploadStatus,
    val error: String? = null
)

/**
 * Document upload status
 */
enum class DocumentUploadStatus {
    QUEUED,
    UPLOADING,
    PROCESSING,
    SUCCESS,
    FAILED,
    CANCELLED
}

/**
 * Document filter options
 */
data class DocumentFilter(
    val category: DocumentCategory? = null,
    val entityType: DocumentEntityType? = null,
    val entityId: Int? = null,
    val uploadedBy: Int? = null,
    val dateFrom: Long? = null,
    val dateTo: Long? = null,
    val mimeTypes: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val includeExpired: Boolean = false
)

/**
 * Document search result
 */
data class DocumentSearchResult(
    val documents: List<Document>,
    val totalCount: Int,
    val hasMore: Boolean
)

/**
 * Document sharing link
 */
data class DocumentShareLink(
    val documentId: String,
    val shareUrl: String,
    val expiryDate: Long?,
    val isPublic: Boolean,
    val accessCount: Int = 0,
    val createdAt: Long
)
