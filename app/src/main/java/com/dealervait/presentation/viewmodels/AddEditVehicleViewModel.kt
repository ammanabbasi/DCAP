// File: presentation/viewmodels/AddEditVehicleViewModel.kt
// Purpose: ViewModel for adding and editing vehicles with validation and image upload
// Dependencies: Use cases, BaseViewModel, Image handling

package com.dealervait.presentation.viewmodels

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import com.dealervait.core.base.BaseViewModel
import com.dealervait.domain.model.Vehicle
import com.dealervait.domain.usecases.vehicle.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for adding and editing vehicles
 * Handles form validation, image upload, and vehicle CRUD operations
 */
@HiltViewModel
class AddEditVehicleViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val getVehicleByIdUseCase: GetVehicleByIdUseCase,
    private val addVehicleUseCase: AddVehicleUseCase,
    private val updateVehicleUseCase: UpdateVehicleUseCase,
    private val validateVehicleDataUseCase: ValidateVehicleDataUseCase,
    private val calculateProfitMarginUseCase: CalculateProfitMarginUseCase
) : BaseViewModel() {

    // Vehicle ID from navigation arguments
    private val vehicleId: Int? = savedStateHandle.get<Int>("vehicleId")
    val isEditMode = vehicleId != null

    // UI State
    private val _uiState = MutableStateFlow(AddEditVehicleUiState())
    val uiState: StateFlow<AddEditVehicleUiState> = _uiState.asStateFlow()

    // Form data
    private val _vehicleForm = MutableStateFlow(VehicleFormData())
    val vehicleForm: StateFlow<VehicleFormData> = _vehicleForm.asStateFlow()

    // Validation errors
    private val _validationErrors = MutableStateFlow<Map<String, String>>(emptyMap())
    val validationErrors: StateFlow<Map<String, String>> = _validationErrors.asStateFlow()

    // Image upload state
    private val _imageUploads = MutableStateFlow<List<ImageUploadState>>(emptyList())
    val imageUploads: StateFlow<List<ImageUploadState>> = _imageUploads.asStateFlow()

    init {
        if (isEditMode && vehicleId != null) {
            loadVehicle(vehicleId)
        } else {
            // Set default values for new vehicle
            _vehicleForm.value = _vehicleForm.value.copy(
                status = "Available"
            )
        }
    }

    /**
     * Load existing vehicle for editing
     */
    private fun loadVehicle(vehicleId: Int) {
        viewModelScope.launch {
            getVehicleByIdUseCase(vehicleId).collect { result ->
                when (result) {
                    is com.dealervait.core.error.NetworkResult.Success -> {
                        val vehicle = result.data
                        _vehicleForm.value = VehicleFormData(
                            stockNumber = vehicle.stockNumber,
                            year = vehicle.year.toString(),
                            make = vehicle.make,
                            model = vehicle.model,
                            price = vehicle.price.toString(),
                            cost = vehicle.cost?.toString() ?: "",
                            mileage = vehicle.mileage?.toString() ?: "",
                            vin = vehicle.vin ?: "",
                            color = vehicle.color ?: "",
                            transmission = vehicle.transmission ?: "",
                            fuelType = vehicle.fuelType ?: "",
                            status = vehicle.status,
                            description = vehicle.description ?: "",
                            features = vehicle.features,
                            images = vehicle.images
                        )
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            title = "Edit ${vehicle.year} ${vehicle.make} ${vehicle.model}"
                        )
                    }
                    is com.dealervait.core.error.NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = result.message
                        )
                    }
                    else -> {
                        _uiState.value = _uiState.value.copy(isLoading = true)
                    }
                }
            }
        }
    }

    /**
     * Update form field
     */
    fun updateField(field: String, value: String) {
        val currentForm = _vehicleForm.value
        val updatedForm = when (field) {
            "stockNumber" -> currentForm.copy(stockNumber = value)
            "year" -> currentForm.copy(year = value)
            "make" -> currentForm.copy(make = value)
            "model" -> currentForm.copy(model = value)
            "price" -> currentForm.copy(price = value)
            "cost" -> currentForm.copy(cost = value)
            "mileage" -> currentForm.copy(mileage = value)
            "vin" -> currentForm.copy(vin = value)
            "color" -> currentForm.copy(color = value)
            "transmission" -> currentForm.copy(transmission = value)
            "fuelType" -> currentForm.copy(fuelType = value)
            "status" -> currentForm.copy(status = value)
            "description" -> currentForm.copy(description = value)
            else -> currentForm
        }
        
        _vehicleForm.value = updatedForm
        
        // Clear validation error for this field
        clearFieldError(field)
        
        // Auto-calculate profit margin when price or cost changes
        if (field == "price" || field == "cost") {
            calculateProfitMargin()
        }
        
        // Auto-update title for new vehicles
        if (!isEditMode && (field == "year" || field == "make" || field == "model")) {
            updateTitle()
        }
    }

    /**
     * Update features list
     */
    fun updateFeatures(features: List<String>) {
        _vehicleForm.value = _vehicleForm.value.copy(features = features)
    }

    /**
     * Add feature to list
     */
    fun addFeature(feature: String) {
        if (feature.isNotBlank()) {
            val currentFeatures = _vehicleForm.value.features.toMutableList()
            if (!currentFeatures.contains(feature)) {
                currentFeatures.add(feature)
                _vehicleForm.value = _vehicleForm.value.copy(features = currentFeatures)
            }
        }
    }

    /**
     * Remove feature from list
     */
    fun removeFeature(feature: String) {
        val currentFeatures = _vehicleForm.value.features.toMutableList()
        currentFeatures.remove(feature)
        _vehicleForm.value = _vehicleForm.value.copy(features = currentFeatures)
    }

    /**
     * Add images to upload queue
     */
    fun addImages(imagePaths: List<String>) {
        val currentImages = _vehicleForm.value.images.toMutableList()
        val newImageUploads = _imageUploads.value.toMutableList()
        
        imagePaths.forEach { path ->
            if (!currentImages.contains(path)) {
                currentImages.add(path)
                newImageUploads.add(
                    ImageUploadState(
                        localPath = path,
                        status = UploadStatus.PENDING
                    )
                )
            }
        }
        
        _vehicleForm.value = _vehicleForm.value.copy(images = currentImages)
        _imageUploads.value = newImageUploads
    }

    /**
     * Remove image from list
     */
    fun removeImage(imagePath: String) {
        val currentImages = _vehicleForm.value.images.toMutableList()
        currentImages.remove(imagePath)
        _vehicleForm.value = _vehicleForm.value.copy(images = currentImages)
        
        val currentUploads = _imageUploads.value.toMutableList()
        currentUploads.removeAll { it.localPath == imagePath }
        _imageUploads.value = currentUploads
    }

    /**
     * Reorder images
     */
    fun reorderImages(fromIndex: Int, toIndex: Int) {
        val currentImages = _vehicleForm.value.images.toMutableList()
        if (fromIndex < currentImages.size && toIndex < currentImages.size) {
            val item = currentImages.removeAt(fromIndex)
            currentImages.add(toIndex, item)
            _vehicleForm.value = _vehicleForm.value.copy(images = currentImages)
        }
    }

    /**
     * Validate and save vehicle
     */
    fun saveVehicle() {
        val form = _vehicleForm.value
        val vehicle = createVehicleFromForm(form)
        
        // Validate first
        val validation = validateVehicleDataUseCase(vehicle)
        if (!validation.isValid) {
            _validationErrors.value = validation.fieldErrors
            _uiState.value = _uiState.value.copy(
                errorMessage = validation.errorMessage
            )
            return
        }

        _validationErrors.value = emptyMap()

        if (isEditMode && vehicleId != null) {
            updateExistingVehicle(vehicle.copy(id = vehicleId))
        } else {
            createNewVehicle(vehicle)
        }
    }

    /**
     * Save as draft (local storage only)
     */
    fun saveAsDraft() {
        // Save current form state for later
        _uiState.value = _uiState.value.copy(
            isDraft = true,
            showSaveDialog = true
        )
    }

    /**
     * Scan VIN using camera
     */
    fun scanVin() {
        _uiState.value = _uiState.value.copy(showVinScanner = true)
    }

    /**
     * Handle scanned VIN result
     */
    fun onVinScanned(vin: String) {
        updateField("vin", vin)
        _uiState.value = _uiState.value.copy(showVinScanner = false)
        
        // TODO: Auto-populate vehicle data from VIN decode
        decodeVin(vin)
    }

    /**
     * Clear validation error for specific field
     */
    fun clearFieldError(field: String) {
        val currentErrors = _validationErrors.value.toMutableMap()
        currentErrors.remove(field)
        _validationErrors.value = currentErrors
    }

    /**
     * Clear all errors
     */
    fun clearErrors() {
        _validationErrors.value = emptyMap()
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    /**
     * Handle back navigation
     */
    fun onBackPressed() {
        if (hasUnsavedChanges()) {
            _uiState.value = _uiState.value.copy(showExitDialog = true)
        } else {
            _uiState.value = _uiState.value.copy(shouldNavigateBack = true)
        }
    }

    /**
     * Handle dialog actions
     */
    fun onDialogDismissed() {
        _uiState.value = _uiState.value.copy(
            showExitDialog = false,
            showSaveDialog = false,
            showVinScanner = false
        )
    }

    /**
     * Confirm exit without saving
     */
    fun confirmExit() {
        _uiState.value = _uiState.value.copy(
            showExitDialog = false,
            shouldNavigateBack = true
        )
    }

    /**
     * Clear navigation flags
     */
    fun clearNavigationFlags() {
        _uiState.value = _uiState.value.copy(
            shouldNavigateBack = false,
            shouldNavigateToList = false
        )
    }

    /**
     * Create new vehicle
     */
    private fun createNewVehicle(vehicle: Vehicle) {
        executeWithLoading(
            onStart = {
                _uiState.value = _uiState.value.copy(isSaving = true)
            },
            onComplete = {
                _uiState.value = _uiState.value.copy(isSaving = false)
            },
            onSuccess = { savedVehicle: Vehicle ->
                _uiState.value = _uiState.value.copy(
                    shouldNavigateToList = true,
                    successMessage = "Vehicle added successfully"
                )
                Timber.i("Vehicle created successfully: ${savedVehicle.id}")
            },
            onError = { errorMessage ->
                _uiState.value = _uiState.value.copy(
                    errorMessage = errorMessage
                )
            }
        ) {
            addVehicleUseCase(vehicle)
        }
    }

    /**
     * Update existing vehicle
     */
    private fun updateExistingVehicle(vehicle: Vehicle) {
        executeWithLoading(
            onStart = {
                _uiState.value = _uiState.value.copy(isSaving = true)
            },
            onComplete = {
                _uiState.value = _uiState.value.copy(isSaving = false)
            },
            onSuccess = { savedVehicle: Vehicle ->
                _uiState.value = _uiState.value.copy(
                    shouldNavigateToList = true,
                    successMessage = "Vehicle updated successfully"
                )
                Timber.i("Vehicle updated successfully: ${savedVehicle.id}")
            },
            onError = { errorMessage ->
                _uiState.value = _uiState.value.copy(
                    errorMessage = errorMessage
                )
            }
        ) {
            updateVehicleUseCase(vehicle)
        }
    }

    /**
     * Create vehicle object from form data
     */
    private fun createVehicleFromForm(form: VehicleFormData): Vehicle {
        return Vehicle(
            id = vehicleId ?: 0,
            stockNumber = form.stockNumber,
            year = form.year.toIntOrNull() ?: 0,
            make = form.make,
            model = form.model,
            price = form.price.toDoubleOrNull() ?: 0.0,
            cost = form.cost.toDoubleOrNull(),
            mileage = form.mileage.toIntOrNull(),
            vin = form.vin.ifBlank { null },
            color = form.color.ifBlank { null },
            transmission = form.transmission.ifBlank { null },
            fuelType = form.fuelType.ifBlank { null },
            status = form.status,
            description = form.description.ifBlank { null },
            features = form.features,
            images = form.images,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
    }

    /**
     * Calculate profit margin
     */
    private fun calculateProfitMargin() {
        val form = _vehicleForm.value
        val price = form.price.toDoubleOrNull()
        val cost = form.cost.toDoubleOrNull()
        
        if (price != null && cost != null && price > 0 && cost > 0) {
            val profitInfo = calculateProfitMarginUseCase(cost, price)
            _uiState.value = _uiState.value.copy(profitInfo = profitInfo)
        } else {
            _uiState.value = _uiState.value.copy(profitInfo = null)
        }
    }

    /**
     * Update title based on form data
     */
    private fun updateTitle() {
        val form = _vehicleForm.value
        val title = if (form.year.isNotBlank() || form.make.isNotBlank() || form.model.isNotBlank()) {
            "Add ${form.year} ${form.make} ${form.model}".trim()
        } else {
            "Add New Vehicle"
        }
        _uiState.value = _uiState.value.copy(title = title)
    }

    /**
     * Check if there are unsaved changes
     */
    private fun hasUnsavedChanges(): Boolean {
        val form = _vehicleForm.value
        return form.stockNumber.isNotBlank() || 
               form.year.isNotBlank() || 
               form.make.isNotBlank() || 
               form.model.isNotBlank() ||
               form.description.isNotBlank()
    }

    /**
     * Decode VIN to get vehicle information
     */
    private fun decodeVin(vin: String) {
        // TODO: Implement VIN decoding service
        // This would call a VIN decode API to auto-populate vehicle data
        Timber.d("VIN decode requested for: $vin")
    }
}

/**
 * UI state for add/edit vehicle screen
 */
data class AddEditVehicleUiState(
    // Screen state
    val title: String = "Add New Vehicle",
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val isDraft: Boolean = false,
    
    // Messages
    val errorMessage: String? = null,
    val successMessage: String? = null,
    
    // Dialogs
    val showExitDialog: Boolean = false,
    val showSaveDialog: Boolean = false,
    val showVinScanner: Boolean = false,
    
    // Navigation
    val shouldNavigateBack: Boolean = false,
    val shouldNavigateToList: Boolean = false,
    
    // Profit calculation
    val profitInfo: CalculateProfitMarginUseCase.ProfitInfo? = null
)

/**
 * Form data for vehicle
 */
data class VehicleFormData(
    val stockNumber: String = "",
    val year: String = "",
    val make: String = "",
    val model: String = "",
    val price: String = "",
    val cost: String = "",
    val mileage: String = "",
    val vin: String = "",
    val color: String = "",
    val transmission: String = "",
    val fuelType: String = "",
    val status: String = "",
    val description: String = "",
    val features: List<String> = emptyList(),
    val images: List<String> = emptyList()
)

/**
 * Image upload state
 */
data class ImageUploadState(
    val localPath: String,
    val remotePath: String? = null,
    val status: UploadStatus = UploadStatus.PENDING,
    val progress: Int = 0,
    val error: String? = null
)

/**
 * Upload status enum
 */
enum class UploadStatus {
    PENDING,
    UPLOADING,
    SUCCESS,
    FAILED
}
