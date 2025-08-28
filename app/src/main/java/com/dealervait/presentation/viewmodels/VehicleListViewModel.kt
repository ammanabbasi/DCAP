// File: presentation/viewmodels/VehicleListViewModel.kt
// Purpose: ViewModel for vehicle list screen with pagination, search, and filters
// Dependencies: Use cases, BaseViewModel, Paging

package com.dealervait.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.dealervait.core.base.BaseViewModel
import com.dealervait.domain.model.Vehicle
import com.dealervait.domain.usecases.vehicle.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for vehicle list screen
 * Manages pagination, search, filtering, and sorting
 */
@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class VehicleListViewModel @Inject constructor(
    private val getVehiclesUseCase: GetVehiclesUseCase,
    private val searchVehiclesUseCase: SearchVehiclesUseCase,
    private val deleteVehicleUseCase: DeleteVehicleUseCase
) : BaseViewModel() {

    // UI State
    private val _uiState = MutableStateFlow(VehicleListUiState())
    val uiState: StateFlow<VehicleListUiState> = _uiState.asStateFlow()

    // Search query
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // Filters
    private val _filters = MutableStateFlow(VehicleFilters())
    val filters: StateFlow<VehicleFilters> = _filters.asStateFlow()

    // Current vehicles list for non-paged operations
    private val _vehicles = MutableStateFlow<List<Vehicle>>(emptyList())
    val vehicles: StateFlow<List<Vehicle>> = _vehicles.asStateFlow()

    // Paging data for large lists
    val pagedVehicles: Flow<PagingData<Vehicle>> = combine(
        _searchQuery.debounce(300),
        _filters
    ) { query, filter ->
        Pair(query, filter)
    }.flatMapLatest { (query, filter) ->
        if (query.isNotBlank()) {
            // Use search for query
            flow { 
                searchVehicles(query)
                emit(PagingData.empty<Vehicle>())
            }
        } else {
            // Use paginated data for browsing
            createPager(filter).flow
        }
    }.cachedIn(viewModelScope)

    init {
        loadVehicles()
        observeSearchQuery()
    }

    /**
     * Load vehicles with current filters
     */
    fun loadVehicles(forceRefresh: Boolean = false) {
        val currentFilters = _filters.value
        
        executeWithLoading(
            onSuccess = { vehicleList: List<Vehicle> ->
                _vehicles.value = vehicleList
                _uiState.value = _uiState.value.copy(
                    isEmpty = vehicleList.isEmpty(),
                    totalCount = vehicleList.size
                )
            },
            onError = { errorMessage ->
                _uiState.value = _uiState.value.copy(
                    isEmpty = _vehicles.value.isEmpty(),
                    errorMessage = errorMessage
                )
            }
        ) {
            getVehiclesUseCase(
                page = 1,
                limit = 50, // Load more for initial view
                make = currentFilters.make,
                model = currentFilters.model,
                year = currentFilters.year,
                status = currentFilters.status,
                minPrice = currentFilters.minPrice,
                maxPrice = currentFilters.maxPrice,
                forceRefresh = forceRefresh
            ).first() // Get first emission for initial load
        }
    }

    /**
     * Search vehicles with debouncing
     */
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        _uiState.value = _uiState.value.copy(isSearching = query.isNotBlank())
    }

    /**
     * Clear search query
     */
    fun clearSearch() {
        _searchQuery.value = ""
        _uiState.value = _uiState.value.copy(isSearching = false)
        loadVehicles()
    }

    /**
     * Update filters
     */
    fun updateFilters(newFilters: VehicleFilters) {
        _filters.value = newFilters
        _uiState.value = _uiState.value.copy(hasActiveFilters = newFilters.hasActiveFilters())
        loadVehicles()
    }

    /**
     * Clear all filters
     */
    fun clearFilters() {
        _filters.value = VehicleFilters()
        _uiState.value = _uiState.value.copy(hasActiveFilters = false)
        loadVehicles()
    }

    /**
     * Update sort option
     */
    fun updateSort(sortOption: VehicleSortOption) {
        _uiState.value = _uiState.value.copy(sortOption = sortOption)
        applySorting()
    }

    /**
     * Delete vehicle with confirmation
     */
    fun deleteVehicle(vehicleId: Int) {
        executeWithLoading(
            onSuccess = {
                // Remove from current list
                _vehicles.value = _vehicles.value.filter { it.id != vehicleId }
                _uiState.value = _uiState.value.copy(
                    totalCount = _vehicles.value.size,
                    isEmpty = _vehicles.value.isEmpty()
                )
            },
            onError = { errorMessage ->
                _uiState.value = _uiState.value.copy(errorMessage = errorMessage)
            }
        ) {
            deleteVehicleUseCase(vehicleId)
        }
    }

    /**
     * Refresh data
     */
    fun refresh() {
        loadVehicles(forceRefresh = true)
    }

    /**
     * Handle navigation to add vehicle
     */
    fun onNavigateToAddVehicle() {
        _uiState.value = _uiState.value.copy(shouldNavigateToAddVehicle = true)
    }

    /**
     * Handle navigation to vehicle detail
     */
    fun onNavigateToVehicleDetail(vehicleId: Int) {
        _uiState.value = _uiState.value.copy(shouldNavigateToVehicleDetail = vehicleId)
    }

    /**
     * Clear navigation flags
     */
    fun clearNavigationFlags() {
        _uiState.value = _uiState.value.copy(
            shouldNavigateToAddVehicle = false,
            shouldNavigateToVehicleDetail = null
        )
    }

    /**
     * Show/hide filter bottom sheet
     */
    fun toggleFilterSheet() {
        _uiState.value = _uiState.value.copy(
            showFilterSheet = !_uiState.value.showFilterSheet
        )
    }

    /**
     * Show/hide sort options
     */
    fun toggleSortOptions() {
        _uiState.value = _uiState.value.copy(
            showSortOptions = !_uiState.value.showSortOptions
        )
    }

    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    /**
     * Create pager for infinite scrolling
     */
    private fun createPager(filters: VehicleFilters): Pager<Int, Vehicle> {
        return Pager(
            config = PagingConfig(
                pageSize = 20,
                enablePlaceholders = false,
                prefetchDistance = 5
            ),
            pagingSourceFactory = {
                VehiclePagingSource(
                    getVehiclesUseCase = getVehiclesUseCase,
                    filters = filters
                )
            }
        )
    }

    /**
     * Search vehicles with debouncing
     */
    private fun searchVehicles(query: String) {
        if (query.length < 2) return

        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true)
                
                when (val result = searchVehiclesUseCase(query)) {
                    is com.dealervait.core.error.NetworkResult.Success -> {
                        _vehicles.value = result.data
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isEmpty = result.data.isEmpty(),
                            totalCount = result.data.size
                        )
                    }
                    is com.dealervait.core.error.NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = result.message
                        )
                    }
                    else -> {
                        _uiState.value = _uiState.value.copy(isLoading = false)
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Error searching vehicles")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Search failed"
                )
            }
        }
    }

    /**
     * Observe search query changes
     */
    private fun observeSearchQuery() {
        viewModelScope.launch {
            _searchQuery
                .debounce(300)
                .distinctUntilChanged()
                .collect { query ->
                    if (query.isNotBlank()) {
                        searchVehicles(query)
                    } else {
                        loadVehicles()
                    }
                }
        }
    }

    /**
     * Apply sorting to current vehicle list
     */
    private fun applySorting() {
        val sortOption = _uiState.value.sortOption
        val sortedVehicles = when (sortOption) {
            VehicleSortOption.PRICE_LOW_TO_HIGH -> _vehicles.value.sortedBy { it.price }
            VehicleSortOption.PRICE_HIGH_TO_LOW -> _vehicles.value.sortedByDescending { it.price }
            VehicleSortOption.YEAR_NEW_TO_OLD -> _vehicles.value.sortedByDescending { it.year }
            VehicleSortOption.YEAR_OLD_TO_NEW -> _vehicles.value.sortedBy { it.year }
            VehicleSortOption.MILEAGE_LOW_TO_HIGH -> _vehicles.value.sortedBy { it.mileage ?: Int.MAX_VALUE }
            VehicleSortOption.MILEAGE_HIGH_TO_LOW -> _vehicles.value.sortedByDescending { it.mileage ?: 0 }
            VehicleSortOption.DATE_ADDED_NEWEST -> _vehicles.value.sortedByDescending { it.createdAt }
            VehicleSortOption.DATE_ADDED_OLDEST -> _vehicles.value.sortedBy { it.createdAt }
        }
        _vehicles.value = sortedVehicles
    }
}

/**
 * UI state for vehicle list screen
 */
data class VehicleListUiState(
    // Data state
    val isEmpty: Boolean = false,
    val totalCount: Int = 0,
    val errorMessage: String? = null,

    // UI state
    val isSearching: Boolean = false,
    val hasActiveFilters: Boolean = false,
    val showFilterSheet: Boolean = false,
    val showSortOptions: Boolean = false,
    val sortOption: VehicleSortOption = VehicleSortOption.DATE_ADDED_NEWEST,

    // Navigation
    val shouldNavigateToAddVehicle: Boolean = false,
    val shouldNavigateToVehicleDetail: Int? = null
)

/**
 * Vehicle filters data class
 */
data class VehicleFilters(
    val make: String? = null,
    val model: String? = null,
    val year: Int? = null,
    val status: String? = null,
    val minPrice: Double? = null,
    val maxPrice: Double? = null,
    val minYear: Int? = null,
    val maxYear: Int? = null,
    val maxMileage: Int? = null,
    val colors: List<String> = emptyList()
) {
    fun hasActiveFilters(): Boolean {
        return make != null || model != null || year != null || 
               status != null || minPrice != null || maxPrice != null ||
               minYear != null || maxYear != null || maxMileage != null ||
               colors.isNotEmpty()
    }

    fun getActiveFilterCount(): Int {
        var count = 0
        if (make != null) count++
        if (model != null) count++
        if (year != null) count++
        if (status != null) count++
        if (minPrice != null || maxPrice != null) count++
        if (minYear != null || maxYear != null) count++
        if (maxMileage != null) count++
        if (colors.isNotEmpty()) count++
        return count
    }
}

/**
 * Vehicle sort options
 */
enum class VehicleSortOption(val displayName: String) {
    PRICE_LOW_TO_HIGH("Price: Low to High"),
    PRICE_HIGH_TO_LOW("Price: High to Low"),
    YEAR_NEW_TO_OLD("Year: Newest First"),
    YEAR_OLD_TO_NEW("Year: Oldest First"),
    MILEAGE_LOW_TO_HIGH("Mileage: Low to High"),
    MILEAGE_HIGH_TO_LOW("Mileage: High to Low"),
    DATE_ADDED_NEWEST("Recently Added"),
    DATE_ADDED_OLDEST("Oldest First")
}
