// File: presentation/ui/screens/inventory/AddEditVehicleScreen.kt
// Purpose: Complete add/edit vehicle screen with form validation and image upload
// Dependencies: Compose, Material 3, ViewModel, Camera, Image picker

package com.dealervait.presentation.ui.screens.inventory

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.dealervait.presentation.viewmodels.AddEditVehicleViewModel
import com.dealervait.presentation.viewmodels.ImageUploadState
import com.dealervait.presentation.viewmodels.UploadStatus
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import java.text.NumberFormat
import java.util.*

/**
 * Complete add/edit vehicle screen with comprehensive form
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditVehicleScreen(
    vehicleId: Int?,
    onNavigateBack: () -> Unit,
    onVehicleSaved: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AddEditVehicleViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val vehicleForm by viewModel.vehicleForm.collectAsStateWithLifecycle()
    val validationErrors by viewModel.validationErrors.collectAsStateWithLifecycle()
    val imageUploads by viewModel.imageUploads.collectAsStateWithLifecycle()
    val context = LocalContext.current

    // Image picker launcher
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        val imagePaths = uris.map { it.toString() }
        viewModel.addImages(imagePaths)
    }

    // Camera launcher for single photo
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        // Handle camera result - would need to save bitmap to file
        // This is simplified - in production you'd save to cache dir
    }

    // Handle navigation effects
    LaunchedEffect(uiState.shouldNavigateBack) {
        if (uiState.shouldNavigateBack) {
            viewModel.clearNavigationFlags()
            onNavigateBack()
        }
    }

    LaunchedEffect(uiState.shouldNavigateToList) {
        if (uiState.shouldNavigateToList) {
            viewModel.clearNavigationFlags()
            onVehicleSaved()
        }
    }

    // Back press handling
    LaunchedEffect(Unit) {
        // Handle system back press if needed
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.title) },
                navigationIcon = {
                    IconButton(onClick = viewModel::onBackPressed) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (!uiState.isLoading) {
                        // VIN Scanner
                        IconButton(onClick = viewModel::scanVin) {
                            Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan VIN")
                        }
                        
                        // Save as draft
                        if (!viewModel.isEditMode) {
                            IconButton(onClick = viewModel::saveAsDraft) {
                                Icon(Icons.Default.Save, contentDescription = "Save Draft")
                            }
                        }
                    }
                }
            )
        },
        bottomBar = {
            Surface(
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (viewModel.isEditMode) {
                        OutlinedButton(
                            onClick = viewModel::onBackPressed,
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel")
                        }
                    }

                    Button(
                        onClick = viewModel::saveVehicle,
                        enabled = !uiState.isSaving,
                        modifier = Modifier.weight(1f)
                    ) {
                        if (uiState.isSaving) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                        Text(if (viewModel.isEditMode) "Update Vehicle" else "Add Vehicle")
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = modifier.fillMaxSize()) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Images section
                item {
                    ImageUploadSection(
                        images = vehicleForm.images,
                        imageUploads = imageUploads,
                        onAddImages = { imagePickerLauncher.launch("image/*") },
                        onTakePhoto = { 
                            // Launch camera
                            cameraLauncher.launch(null)
                        },
                        onRemoveImage = viewModel::removeImage,
                        onReorderImages = viewModel::reorderImages
                    )
                }

                // Basic Information section
                item {
                    BasicInformationSection(
                        form = vehicleForm,
                        validationErrors = validationErrors,
                        onFieldUpdate = viewModel::updateField
                    )
                }

                // Pricing section
                item {
                    PricingSection(
                        form = vehicleForm,
                        validationErrors = validationErrors,
                        profitInfo = uiState.profitInfo,
                        onFieldUpdate = viewModel::updateField
                    )
                }

                // Vehicle Specifications section
                item {
                    SpecificationsSection(
                        form = vehicleForm,
                        validationErrors = validationErrors,
                        onFieldUpdate = viewModel::updateField
                    )
                }

                // Features section
                item {
                    FeaturesSection(
                        features = vehicleForm.features,
                        onAddFeature = viewModel::addFeature,
                        onRemoveFeature = viewModel::removeFeature
                    )
                }

                // Description section
                item {
                    DescriptionSection(
                        description = vehicleForm.description,
                        onDescriptionUpdate = { viewModel.updateField("description", it) }
                    )
                }

                // Bottom spacing
                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }

            // Loading overlay
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    Card {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator()
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Loading vehicle data...")
                        }
                    }
                }
            }

            // Dialogs
            if (uiState.showExitDialog) {
                ExitConfirmationDialog(
                    onConfirmExit = viewModel::confirmExit,
                    onDismiss = viewModel::onDialogDismissed
                )
            }

            if (uiState.showSaveDialog) {
                SaveDraftDialog(
                    onSave = viewModel::saveVehicle,
                    onDismiss = viewModel::onDialogDismissed
                )
            }

            // Error/Success messages
            uiState.errorMessage?.let { error ->
                LaunchedEffect(error) {
                    // Show snackbar
                    viewModel.clearErrors()
                }
            }

            uiState.successMessage?.let { message ->
                LaunchedEffect(message) {
                    // Show success snackbar
                }
            }
        }
    }
}

/**
 * Image upload section with gallery and camera options
 */
@Composable
private fun ImageUploadSection(
    images: List<String>,
    imageUploads: List<ImageUploadState>,
    onAddImages: () -> Unit,
    onTakePhoto: () -> Unit,
    onRemoveImage: (String) -> Unit,
    onReorderImages: (Int, Int) -> Unit
) {
    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Photos",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Camera button
                    IconButton(
                        onClick = onTakePhoto,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = "Take Photo",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Gallery button
                    IconButton(
                        onClick = onAddImages,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            Icons.Default.PhotoLibrary,
                            contentDescription = "Choose from Gallery",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            if (images.isEmpty()) {
                // Empty state
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .clickable { onAddImages() },
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.AddPhotoAlternate,
                            contentDescription = null,
                            modifier = Modifier.size(32.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Add vehicle photos",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                // Image grid
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(images) { index, imagePath ->
                        VehicleImageCard(
                            imagePath = imagePath,
                            isPrimary = index == 0,
                            uploadState = imageUploads.find { it.localPath == imagePath },
                            onRemove = { onRemoveImage(imagePath) }
                        )
                    }

                    // Add more button
                    item {
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { onAddImages() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Add,
                                contentDescription = "Add more photos",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                if (images.isNotEmpty()) {
                    Text(
                        text = "First photo will be used as primary image",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

/**
 * Individual vehicle image card
 */
@Composable
private fun VehicleImageCard(
    imagePath: String,
    isPrimary: Boolean,
    uploadState: ImageUploadState?,
    onRemove: () -> Unit
) {
    Box(
        modifier = Modifier.size(100.dp)
    ) {
        AsyncImage(
            model = imagePath,
            contentDescription = if (isPrimary) "Primary vehicle image" else "Vehicle image",
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(8.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentScale = ContentScale.Crop
        )

        // Primary badge
        if (isPrimary) {
            Surface(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(4.dp),
                color = MaterialTheme.colorScheme.primary,
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = "PRIMARY",
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            }
        }

        // Remove button
        IconButton(
            onClick = onRemove,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(4.dp)
                .size(24.dp)
        ) {
            Surface(
                color = Color.Black.copy(alpha = 0.6f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    Icons.Default.Close,
                    contentDescription = "Remove",
                    modifier = Modifier
                        .padding(4.dp)
                        .size(16.dp),
                    tint = Color.White
                )
            }
        }

        // Upload progress
        uploadState?.let { state ->
            when (state.status) {
                UploadStatus.UPLOADING -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.5f)),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp,
                            color = Color.White
                        )
                    }
                }
                UploadStatus.FAILED -> {
                    Icon(
                        Icons.Default.Error,
                        contentDescription = "Upload failed",
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(4.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                }
                UploadStatus.SUCCESS -> {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = "Uploaded",
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(4.dp),
                        tint = Color.Green
                    )
                }
                else -> { /* PENDING - no indicator */ }
            }
        }
    }
}

/**
 * Basic information section
 */
@Composable
private fun BasicInformationSection(
    form: com.dealervait.presentation.viewmodels.VehicleFormData,
    validationErrors: Map<String, String>,
    onFieldUpdate: (String, String) -> Unit
) {
    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Basic Information",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            // Stock Number
            OutlinedTextField(
                value = form.stockNumber,
                onValueChange = { onFieldUpdate("stockNumber", it) },
                label = { Text("Stock Number *") },
                isError = validationErrors.containsKey("stockNumber"),
                supportingText = validationErrors["stockNumber"]?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Year
                OutlinedTextField(
                    value = form.year,
                    onValueChange = { onFieldUpdate("year", it) },
                    label = { Text("Year *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = validationErrors.containsKey("year"),
                    supportingText = validationErrors["year"]?.let { { Text(it) } },
                    modifier = Modifier.weight(1f)
                )

                // Make
                OutlinedTextField(
                    value = form.make,
                    onValueChange = { onFieldUpdate("make", it) },
                    label = { Text("Make *") },
                    isError = validationErrors.containsKey("make"),
                    supportingText = validationErrors["make"]?.let { { Text(it) } },
                    modifier = Modifier.weight(1f)
                )
            }

            // Model
            OutlinedTextField(
                value = form.model,
                onValueChange = { onFieldUpdate("model", it) },
                label = { Text("Model *") },
                isError = validationErrors.containsKey("model"),
                supportingText = validationErrors["model"]?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )

            // VIN
            OutlinedTextField(
                value = form.vin,
                onValueChange = { onFieldUpdate("vin", it) },
                label = { Text("VIN") },
                placeholder = { Text("17-character VIN") },
                isError = validationErrors.containsKey("vin"),
                supportingText = validationErrors["vin"]?.let { { Text(it) } },
                trailingIcon = {
                    IconButton(onClick = { /* Scan VIN */ }) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan VIN")
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

/**
 * Pricing section with profit calculation
 */
@Composable
private fun PricingSection(
    form: com.dealervait.presentation.viewmodels.VehicleFormData,
    validationErrors: Map<String, String>,
    profitInfo: com.dealervait.domain.usecases.vehicle.CalculateProfitMarginUseCase.ProfitInfo?,
    onFieldUpdate: (String, String) -> Unit
) {
    val currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US)

    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Pricing",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Cost
                OutlinedTextField(
                    value = form.cost,
                    onValueChange = { onFieldUpdate("cost", it) },
                    label = { Text("Cost") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    isError = validationErrors.containsKey("cost"),
                    supportingText = validationErrors["cost"]?.let { { Text(it) } },
                    leadingIcon = { Text("$") },
                    modifier = Modifier.weight(1f)
                )

                // List Price
                OutlinedTextField(
                    value = form.price,
                    onValueChange = { onFieldUpdate("price", it) },
                    label = { Text("List Price *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    isError = validationErrors.containsKey("price"),
                    supportingText = validationErrors["price"]?.let { { Text(it) } },
                    leadingIcon = { Text("$") },
                    modifier = Modifier.weight(1f)
                )
            }

            // Profit information
            profitInfo?.let { profit ->
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp)
                    ) {
                        Text(
                            text = "Profit Analysis",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Profit",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Text(
                                    text = currencyFormatter.format(profit.profit),
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                            Column {
                                Text(
                                    text = "Margin",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Text(
                                    text = "${String.format("%.1f", profit.margin)}%",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Vehicle specifications section
 */
@Composable
private fun SpecificationsSection(
    form: com.dealervait.presentation.viewmodels.VehicleFormData,
    validationErrors: Map<String, String>,
    onFieldUpdate: (String, String) -> Unit
) {
    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Specifications",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Mileage
                OutlinedTextField(
                    value = form.mileage,
                    onValueChange = { onFieldUpdate("mileage", it) },
                    label = { Text("Mileage") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = validationErrors.containsKey("mileage"),
                    supportingText = validationErrors["mileage"]?.let { { Text(it) } },
                    trailingIcon = { Text("miles") },
                    modifier = Modifier.weight(1f)
                )

                // Color
                OutlinedTextField(
                    value = form.color,
                    onValueChange = { onFieldUpdate("color", it) },
                    label = { Text("Color") },
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Transmission
                OutlinedTextField(
                    value = form.transmission,
                    onValueChange = { onFieldUpdate("transmission", it) },
                    label = { Text("Transmission") },
                    modifier = Modifier.weight(1f)
                )

                // Fuel Type
                OutlinedTextField(
                    value = form.fuelType,
                    onValueChange = { onFieldUpdate("fuelType", it) },
                    label = { Text("Fuel Type") },
                    modifier = Modifier.weight(1f)
                )
            }

            // Status
            OutlinedTextField(
                value = form.status,
                onValueChange = { onFieldUpdate("status", it) },
                label = { Text("Status") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

/**
 * Features section with dynamic list
 */
@Composable
private fun FeaturesSection(
    features: List<String>,
    onAddFeature: (String) -> Unit,
    onRemoveFeature: (String) -> Unit
) {
    var newFeature by remember { mutableStateOf("") }

    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Features",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            // Add new feature
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = newFeature,
                    onValueChange = { newFeature = it },
                    label = { Text("Add feature") },
                    modifier = Modifier.weight(1f)
                )

                IconButton(
                    onClick = {
                        if (newFeature.isNotBlank()) {
                            onAddFeature(newFeature)
                            newFeature = ""
                        }
                    },
                    enabled = newFeature.isNotBlank()
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add feature")
                }
            }

            // Feature chips
            if (features.isNotEmpty()) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(features) { feature ->
                        InputChip(
                            onClick = { onRemoveFeature(feature) },
                            label = { Text(feature) },
                            trailingIcon = {
                                Icon(
                                    Icons.Default.Close,
                                    contentDescription = "Remove $feature",
                                    modifier = Modifier.size(16.dp)
                                )
                            },
                            selected = false
                        )
                    }
                }
            }
        }
    }
}

/**
 * Description section
 */
@Composable
private fun DescriptionSection(
    description: String,
    onDescriptionUpdate: (String) -> Unit
) {
    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Description",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            OutlinedTextField(
                value = description,
                onValueChange = onDescriptionUpdate,
                label = { Text("Vehicle description") },
                placeholder = { Text("Enter detailed description of the vehicle condition, history, and special features...") },
                minLines = 4,
                maxLines = 8,
                modifier = Modifier.fillMaxWidth()
            )

            Text(
                text = "${description.length} characters",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.End,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

/**
 * Exit confirmation dialog
 */
@Composable
private fun ExitConfirmationDialog(
    onConfirmExit: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                Icons.Default.Warning,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error
            )
        },
        title = { Text("Discard changes?") },
        text = { Text("You have unsaved changes that will be lost if you exit now.") },
        confirmButton = {
            TextButton(
                onClick = onConfirmExit,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text("Discard")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Keep editing")
            }
        }
    )
}

/**
 * Save draft dialog
 */
@Composable
private fun SaveDraftDialog(
    onSave: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Save as draft?") },
        text = { Text("Save your current progress as a draft to continue later.") },
        confirmButton = {
            TextButton(onClick = onSave) {
                Text("Save Draft")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Preview(showBackground = true)
@Composable
private fun AddEditVehicleScreenPreview() {
    DealerVaitTheme {
        AddEditVehicleScreen(
            vehicleId = null,
            onNavigateBack = {},
            onVehicleSaved = {}
        )
    }
}
