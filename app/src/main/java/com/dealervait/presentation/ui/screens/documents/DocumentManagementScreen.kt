// File: presentation/ui/screens/documents/DocumentManagementScreen.kt
// Purpose: Complete document management interface with upload, preview, and organization
// Dependencies: Compose, Material 3, Document models

package com.dealervait.presentation.ui.screens.documents

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import coil.compose.AsyncImage
import com.dealervait.domain.model.*
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

/**
 * Complete document management screen with upload, preview, and organization
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentManagementScreen(
    entityType: DocumentEntityType? = null,
    entityId: Int? = null,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    // For demo, using sample documents - in real implementation this would come from ViewModel
    val sampleDocuments = remember { getSampleDocuments() }
    var selectedCategory by remember { mutableStateOf<DocumentCategory?>(null) }
    var showUploadDialog by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }

    // Document selection launcher
    val documentPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        // Handle selected documents
        if (uris.isNotEmpty()) {
            showUploadDialog = true
        }
    }

    // Camera launcher for document capture
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            // Handle camera result
        }
    }

    Scaffold(
        topBar = {
            DocumentManagementTopBar(
                title = getScreenTitle(entityType, entityId),
                searchQuery = searchQuery,
                onSearchQueryChange = { searchQuery = it },
                onNavigateBack = onNavigateBack,
                onClearSearch = { searchQuery = "" }
            )
        },
        floatingActionButton = {
            DocumentUploadFab(
                onSelectDocuments = { documentPickerLauncher.launch("*/*") },
                onTakePhoto = {
                    // Create temporary file for camera result
                    // cameraLauncher.launch(tempUri)
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Category filter chips
            DocumentCategoryFilter(
                selectedCategory = selectedCategory,
                onCategorySelected = { selectedCategory = if (selectedCategory == it) null else it },
                modifier = Modifier.fillMaxWidth()
            )

            // Document list
            if (sampleDocuments.isEmpty()) {
                DocumentEmptyState(
                    onUploadDocuments = { documentPickerLauncher.launch("*/*") },
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                DocumentList(
                    documents = sampleDocuments.filter { document ->
                        val matchesCategory = selectedCategory == null || document.category == selectedCategory
                        val matchesSearch = searchQuery.isBlank() || 
                                          document.fileName.contains(searchQuery, ignoreCase = true) ||
                                          document.description?.contains(searchQuery, ignoreCase = true) == true
                        matchesCategory && matchesSearch
                    },
                    onDocumentClick = { document ->
                        // Handle document click - preview or download
                    },
                    onDocumentShare = { document ->
                        // Handle document share
                    },
                    onDocumentDelete = { document ->
                        // Handle document delete
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        // Upload dialog
        if (showUploadDialog) {
            DocumentUploadDialog(
                onDismiss = { showUploadDialog = false },
                onConfirmUpload = { category, description ->
                    // Handle document upload
                    showUploadDialog = false
                }
            )
        }
    }
}

/**
 * Top bar with search functionality
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DocumentManagementTopBar(
    title: String,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onNavigateBack: () -> Unit,
    onClearSearch: () -> Unit
) {
    var showSearch by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            if (showSearch) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChange,
                    placeholder = { Text("Search documents...") },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = null)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotBlank()) {
                            IconButton(onClick = onClearSearch) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                Text(title)
            }
        },
        navigationIcon = {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
        },
        actions = {
            if (!showSearch) {
                IconButton(onClick = { showSearch = true }) {
                    Icon(Icons.Default.Search, contentDescription = "Search")
                }
            } else {
                IconButton(onClick = { 
                    showSearch = false
                    onClearSearch()
                }) {
                    Icon(Icons.Default.Close, contentDescription = "Close search")
                }
            }
            
            IconButton(onClick = { /* Sort options */ }) {
                Icon(Icons.Default.Sort, contentDescription = "Sort")
            }
            
            IconButton(onClick = { /* Filter options */ }) {
                Icon(Icons.Default.FilterList, contentDescription = "Filter")
            }
        }
    )
}

/**
 * Category filter chips
 */
@Composable
private fun DocumentCategoryFilter(
    selectedCategory: DocumentCategory?,
    onCategorySelected: (DocumentCategory) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyRow(
        modifier = modifier,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(DocumentCategory.values()) { category ->
            FilterChip(
                onClick = { onCategorySelected(category) },
                label = { Text(category.displayName) },
                selected = selectedCategory == category,
                leadingIcon = if (selectedCategory == category) {
                    { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                } else null
            )
        }
    }
}

/**
 * Document list with cards
 */
@Composable
private fun DocumentList(
    documents: List<Document>,
    onDocumentClick: (Document) -> Unit,
    onDocumentShare: (Document) -> Unit,
    onDocumentDelete: (Document) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(
            items = documents,
            key = { it.id }
        ) { document ->
            DocumentCard(
                document = document,
                onClick = { onDocumentClick(document) },
                onShare = { onDocumentShare(document) },
                onDelete = { onDocumentDelete(document) }
            )
        }
    }
}

/**
 * Individual document card
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DocumentCard(
    document: Document,
    onClick: () -> Unit,
    onShare: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    val dateFormatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    var showMenu by remember { mutableStateOf(false) }

    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header with file info and menu
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // File type icon/thumbnail
                    if (document.isImage && document.thumbnailUrl != null) {
                        AsyncImage(
                            model = document.thumbnailUrl,
                            contentDescription = "Document thumbnail",
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(getFileTypeColor(document)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = getFileTypeIcon(document),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }

                    // File details
                    Column(
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = document.fileName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = document.formattedFileSize,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        document.description?.let { description ->
                            Text(
                                text = description,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }

                // Menu button
                Box {
                    IconButton(onClick = { showMenu = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More options")
                    }

                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Download") },
                            leadingIcon = { Icon(Icons.Default.Download, contentDescription = null) },
                            onClick = {
                                showMenu = false
                                // Handle download
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Share") },
                            leadingIcon = { Icon(Icons.Default.Share, contentDescription = null) },
                            onClick = {
                                showMenu = false
                                onShare()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Rename") },
                            leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null) },
                            onClick = {
                                showMenu = false
                                // Handle rename
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Delete", color = MaterialTheme.colorScheme.error) },
                            leadingIcon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                            onClick = {
                                showMenu = false
                                onDelete()
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Category and metadata
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Category chip
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = document.category.displayName,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }

                // Upload date and user
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = dateFormatter.format(Date(document.createdAt)),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    document.uploadedByName?.let { uploader ->
                        Text(
                            text = "by $uploader",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Tags if available
            if (document.tags.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(document.tags) { tag ->
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "#$tag",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // Expiry warning if applicable
            if (document.isExpired) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Document expired",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

/**
 * Floating action button for document upload
 */
@Composable
private fun DocumentUploadFab(
    onSelectDocuments: () -> Unit,
    onTakePhoto: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Column(
        horizontalAlignment = Alignment.End
    ) {
        // Extended options
        AnimatedVisibility(visible = expanded) {
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Camera option
                SmallFloatingActionButton(
                    onClick = {
                        expanded = false
                        onTakePhoto()
                    }
                ) {
                    Icon(Icons.Default.CameraAlt, contentDescription = "Take Photo")
                }

                // File picker option
                SmallFloatingActionButton(
                    onClick = {
                        expanded = false
                        onSelectDocuments()
                    }
                ) {
                    Icon(Icons.Default.AttachFile, contentDescription = "Select Files")
                }

                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        // Main FAB
        FloatingActionButton(
            onClick = { expanded = !expanded }
        ) {
            Icon(
                imageVector = if (expanded) Icons.Default.Close else Icons.Default.Add,
                contentDescription = if (expanded) "Close menu" else "Upload documents"
            )
        }
    }
}

/**
 * Empty state when no documents
 */
@Composable
private fun DocumentEmptyState(
    onUploadDocuments: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Description,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "No documents yet",
                style = MaterialTheme.typography.headlineSmall
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Upload documents to organize and access them easily",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(onClick = onUploadDocuments) {
                Icon(Icons.Default.CloudUpload, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Upload Documents")
            }
        }
    }
}

/**
 * Upload dialog for document categorization
 */
@Composable
private fun DocumentUploadDialog(
    onDismiss: () -> Unit,
    onConfirmUpload: (DocumentCategory, String) -> Unit
) {
    var selectedCategory by remember { mutableStateOf(DocumentCategory.GENERAL) }
    var description by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Upload Documents") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Category selection
                Text(
                    text = "Category",
                    style = MaterialTheme.typography.titleSmall
                )

                LazyColumn(
                    modifier = Modifier.height(200.dp)
                ) {
                    items(DocumentCategory.values()) { category ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedCategory = category }
                                .padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedCategory == category,
                                onClick = { selectedCategory = category }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = category.displayName,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Text(
                                    text = category.description,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                // Description field
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description (Optional)") },
                    placeholder = { Text("Add a description...") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirmUpload(selectedCategory, description) }
            ) {
                Text("Upload")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

/**
 * Helper functions
 */
private fun getScreenTitle(entityType: DocumentEntityType?, entityId: Int?): String {
    return when (entityType) {
        DocumentEntityType.VEHICLE -> "Vehicle Documents"
        DocumentEntityType.CUSTOMER -> "Customer Documents"
        DocumentEntityType.DEAL -> "Deal Documents"
        DocumentEntityType.EMPLOYEE -> "Employee Documents"
        DocumentEntityType.BUSINESS -> "Business Documents"
        null -> "Document Management"
    }
}

private fun getFileTypeIcon(document: Document): androidx.compose.ui.graphics.vector.ImageVector {
    return when {
        document.isPdf -> Icons.Default.PictureAsPdf
        document.isImage -> Icons.Default.Image
        document.mimeType.startsWith("text/") -> Icons.Default.TextSnippet
        document.mimeType.contains("spreadsheet") || document.fileExtension in listOf("xls", "xlsx") -> Icons.Default.TableChart
        document.mimeType.contains("presentation") -> Icons.Default.Slideshow
        document.mimeType.startsWith("video/") -> Icons.Default.VideoFile
        document.mimeType.startsWith("audio/") -> Icons.Default.AudioFile
        else -> Icons.Default.Description
    }
}

private fun getFileTypeColor(document: Document): Color {
    return when {
        document.isPdf -> Color(0xFFE57373)
        document.isImage -> Color(0xFF81C784)
        document.mimeType.startsWith("text/") -> Color(0xFF64B5F6)
        document.mimeType.contains("spreadsheet") -> Color(0xFFFFB74D)
        document.mimeType.contains("presentation") -> Color(0xFFBA68C8)
        document.mimeType.startsWith("video/") -> Color(0xFFFF8A65)
        document.mimeType.startsWith("audio/") -> Color(0xFFA1C181)
        else -> Color(0xFF9E9E9E)
    }
}

/**
 * Sample data for demonstration
 */
private fun getSampleDocuments(): List<Document> {
    return listOf(
        Document(
            id = "1",
            fileName = "2023_honda_civic_title.pdf",
            originalFileName = "Honda_Civic_Title_Document.pdf",
            fileSize = 2457600, // 2.4 MB
            mimeType = "application/pdf",
            category = DocumentCategory.VEHICLE_TITLE,
            entityType = DocumentEntityType.VEHICLE,
            entityId = 101,
            description = "Vehicle title for 2023 Honda Civic",
            tags = listOf("title", "ownership"),
            uploadedBy = 1,
            uploadedByName = "John Smith",
            downloadUrl = "https://example.com/docs/1",
            thumbnailUrl = null,
            createdAt = System.currentTimeMillis() - 86400000,
            updatedAt = System.currentTimeMillis() - 86400000
        ),
        Document(
            id = "2",
            fileName = "customer_license_scan.jpg",
            originalFileName = "Drivers_License_Copy.jpg",
            fileSize = 1048576, // 1 MB
            mimeType = "image/jpeg",
            category = DocumentCategory.CUSTOMER_LICENSE,
            entityType = DocumentEntityType.CUSTOMER,
            entityId = 201,
            description = "Driver's license copy for verification",
            uploadedBy = 2,
            uploadedByName = "Sarah Johnson",
            downloadUrl = "https://example.com/docs/2",
            thumbnailUrl = "https://example.com/thumbs/2",
            createdAt = System.currentTimeMillis() - 172800000,
            updatedAt = System.currentTimeMillis() - 172800000
        ),
        Document(
            id = "3",
            fileName = "purchase_agreement_2023_001.pdf",
            originalFileName = "Purchase_Agreement_Final.pdf",
            fileSize = 512000, // 500 KB
            mimeType = "application/pdf",
            category = DocumentCategory.DEAL_PURCHASE_AGREEMENT,
            entityType = DocumentEntityType.DEAL,
            entityId = 301,
            description = "Signed purchase agreement",
            tags = listOf("contract", "signed", "final"),
            uploadedBy = 1,
            uploadedByName = "John Smith",
            downloadUrl = "https://example.com/docs/3",
            thumbnailUrl = null,
            createdAt = System.currentTimeMillis() - 259200000,
            updatedAt = System.currentTimeMillis() - 259200000
        )
    )
}

@Preview(showBackground = true)
@Composable
private fun DocumentManagementScreenPreview() {
    DealerVaitTheme {
        DocumentManagementScreen(
            onNavigateBack = {}
        )
    }
}
