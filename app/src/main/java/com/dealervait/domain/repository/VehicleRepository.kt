// File: domain/repository/VehicleRepository.kt
// Purpose: Vehicle repository interface for domain layer
// Dependencies: NetworkResult, Vehicle domain model

package com.dealervait.domain.repository

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.Vehicle
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for vehicle operations
 * Defines the contract for vehicle-related data operations
 */
interface VehicleRepository {

    /**
     * Get vehicles with pagination and filtering
     * @param page Page number (1-based)
     * @param limit Items per page
     * @param make Filter by make
     * @param model Filter by model
     * @param year Filter by year
     * @param status Filter by status
     * @param minPrice Minimum price filter
     * @param maxPrice Maximum price filter
     * @param forceRefresh Whether to force refresh from API
     * @return Flow of vehicle list with caching strategy
     */
    fun getVehicles(
        page: Int = 1,
        limit: Int = 50,
        make: String? = null,
        model: String? = null,
        year: Int? = null,
        status: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null,
        forceRefresh: Boolean = false
    ): Flow<NetworkResult<List<Vehicle>>>

    /**
     * Get vehicle by ID
     * @param vehicleId Vehicle ID
     * @return Flow of vehicle or null if not found
     */
    fun getVehicleById(vehicleId: Int): Flow<NetworkResult<Vehicle>>

    /**
     * Add new vehicle
     * @param vehicle Vehicle to add
     * @return NetworkResult with created vehicle
     */
    suspend fun addVehicle(vehicle: Vehicle): NetworkResult<Vehicle>

    /**
     * Update existing vehicle
     * @param vehicle Vehicle to update
     * @return NetworkResult with updated vehicle
     */
    suspend fun updateVehicle(vehicle: Vehicle): NetworkResult<Vehicle>

    /**
     * Delete vehicle by ID
     * @param vehicleId Vehicle ID to delete
     * @return NetworkResult indicating success or failure
     */
    suspend fun deleteVehicle(vehicleId: Int): NetworkResult<Unit>

    /**
     * Search vehicles by description
     * @param query Search query
     * @return NetworkResult with matching vehicles
     */
    suspend fun searchVehicles(query: String): NetworkResult<List<Vehicle>>
}
