// File: domain/usecases/vehicle/VehicleUseCases.kt
// Purpose: Business logic use cases for vehicle management
// Dependencies: VehicleRepository, validation logic

package com.dealervait.domain.usecases.vehicle

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.Vehicle
import com.dealervait.domain.repository.VehicleRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

/**
 * Use case for getting vehicles with pagination and filtering
 */
class GetVehiclesUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository
) {
    /**
     * Get vehicles with advanced filtering options
     */
    operator fun invoke(
        page: Int = 1,
        limit: Int = 20,
        make: String? = null,
        model: String? = null,
        year: Int? = null,
        status: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null,
        forceRefresh: Boolean = false
    ): Flow<NetworkResult<List<Vehicle>>> {
        return vehicleRepository.getVehicles(
            page = page,
            limit = limit,
            make = make,
            model = model,
            year = year,
            status = status,
            minPrice = minPrice,
            maxPrice = maxPrice,
            forceRefresh = forceRefresh
        )
    }
}

/**
 * Use case for getting vehicle by ID
 */
class GetVehicleByIdUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository
) {
    operator fun invoke(vehicleId: Int): Flow<NetworkResult<Vehicle>> {
        return vehicleRepository.getVehicleById(vehicleId)
    }
}

/**
 * Use case for adding new vehicle with validation
 */
class AddVehicleUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository,
    private val validateVehicleDataUseCase: ValidateVehicleDataUseCase
) {
    suspend operator fun invoke(vehicle: Vehicle): NetworkResult<Vehicle> {
        // Validate vehicle data first
        val validation = validateVehicleDataUseCase(vehicle)
        if (!validation.isValid) {
            return NetworkResult.Error(validation.errorMessage ?: "Invalid vehicle data")
        }

        return vehicleRepository.addVehicle(vehicle)
    }
}

/**
 * Use case for updating vehicle with validation
 */
class UpdateVehicleUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository,
    private val validateVehicleDataUseCase: ValidateVehicleDataUseCase
) {
    suspend operator fun invoke(vehicle: Vehicle): NetworkResult<Vehicle> {
        // Validate vehicle data first
        val validation = validateVehicleDataUseCase(vehicle)
        if (!validation.isValid) {
            return NetworkResult.Error(validation.errorMessage ?: "Invalid vehicle data")
        }

        return vehicleRepository.updateVehicle(vehicle)
    }
}

/**
 * Use case for deleting vehicle
 */
class DeleteVehicleUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository
) {
    suspend operator fun invoke(vehicleId: Int): NetworkResult<Unit> {
        return vehicleRepository.deleteVehicle(vehicleId)
    }
}

/**
 * Use case for searching vehicles
 */
class SearchVehiclesUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository
) {
    suspend operator fun invoke(query: String): NetworkResult<List<Vehicle>> {
        if (query.trim().length < 2) {
            return NetworkResult.Error("Search query must be at least 2 characters")
        }
        return vehicleRepository.searchVehicles(query.trim())
    }
}

/**
 * Use case for validating vehicle data
 */
class ValidateVehicleDataUseCase @Inject constructor() {
    
    data class ValidationResult(
        val isValid: Boolean,
        val errorMessage: String? = null,
        val fieldErrors: Map<String, String> = emptyMap()
    )

    operator fun invoke(vehicle: Vehicle): ValidationResult {
        val errors = mutableMapOf<String, String>()

        // Stock number validation
        if (vehicle.stockNumber.isBlank()) {
            errors["stockNumber"] = "Stock number is required"
        } else if (vehicle.stockNumber.length < 3) {
            errors["stockNumber"] = "Stock number must be at least 3 characters"
        }

        // Year validation
        val currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)
        if (vehicle.year < 1900 || vehicle.year > currentYear + 2) {
            errors["year"] = "Year must be between 1900 and ${currentYear + 2}"
        }

        // Make validation
        if (vehicle.make.isBlank()) {
            errors["make"] = "Make is required"
        }

        // Model validation
        if (vehicle.model.isBlank()) {
            errors["model"] = "Model is required"
        }

        // Price validation
        if (vehicle.price <= 0) {
            errors["price"] = "Price must be greater than 0"
        }

        // Cost validation (if provided, should be less than price)
        vehicle.cost?.let { cost ->
            if (cost < 0) {
                errors["cost"] = "Cost cannot be negative"
            } else if (cost > vehicle.price) {
                errors["cost"] = "Cost should not exceed selling price"
            }
        }

        // Mileage validation
        vehicle.mileage?.let { mileage ->
            if (mileage < 0) {
                errors["mileage"] = "Mileage cannot be negative"
            } else if (mileage > 1_000_000) {
                errors["mileage"] = "Mileage seems unrealistic"
            }
        }

        // VIN validation
        vehicle.vin?.let { vin ->
            if (vin.isNotBlank() && !isValidVin(vin)) {
                errors["vin"] = "Invalid VIN format"
            }
        }

        return ValidationResult(
            isValid = errors.isEmpty(),
            errorMessage = if (errors.isNotEmpty()) {
                "Please fix the following errors: ${errors.values.first()}"
            } else null,
            fieldErrors = errors
        )
    }

    /**
     * Basic VIN validation (17 characters, alphanumeric)
     */
    private fun isValidVin(vin: String): Boolean {
        return vin.length == 17 && 
               vin.all { it.isLetterOrDigit() } &&
               !vin.contains('I') && 
               !vin.contains('O') && 
               !vin.contains('Q')
    }
}

/**
 * Use case for calculating profit margin
 */
class CalculateProfitMarginUseCase @Inject constructor() {
    
    data class ProfitInfo(
        val profit: Double,
        val margin: Double,
        val markupPercentage: Double
    )

    operator fun invoke(cost: Double?, price: Double): ProfitInfo? {
        return cost?.let { c ->
            if (c > 0 && price > 0) {
                val profit = price - c
                val margin = (profit / price) * 100
                val markup = (profit / c) * 100
                
                ProfitInfo(
                    profit = profit,
                    margin = margin,
                    markupPercentage = markup
                )
            } else null
        }
    }
}

/**
 * Use case for generating vehicle recommendations based on inventory
 */
class GetVehicleRecommendationsUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository
) {
    /**
     * Get vehicle recommendations based on search patterns, popularity, etc.
     */
    suspend operator fun invoke(
        baseVehicle: Vehicle? = null,
        limit: Int = 5
    ): NetworkResult<List<Vehicle>> {
        // For now, return search results based on similar criteria
        return if (baseVehicle != null) {
            vehicleRepository.getVehicles(
                make = baseVehicle.make,
                limit = limit,
                forceRefresh = false
            ).let { flow ->
                // Convert Flow to single result for recommendations
                try {
                    // This is a simplified approach - in real implementation,
                    // you'd collect the flow and return the data
                    NetworkResult.Success(emptyList<Vehicle>())
                } catch (e: Exception) {
                    NetworkResult.Error("Failed to get recommendations")
                }
            }
        } else {
            // Return popular or recently added vehicles
            vehicleRepository.getVehicles(
                limit = limit,
                forceRefresh = false
            ).let { flow ->
                try {
                    NetworkResult.Success(emptyList<Vehicle>())
                } catch (e: Exception) {
                    NetworkResult.Error("Failed to get recommendations")
                }
            }
        }
    }
}

/**
 * Use case for generating vehicle analytics report
 */
class GenerateVehicleReportUseCase @Inject constructor() {
    
    data class VehicleReport(
        val totalVehicles: Int,
        val averagePrice: Double,
        val averageDaysInInventory: Int,
        val topMakes: List<String>,
        val slowMovingVehicles: List<Vehicle>,
        val profitableVehicles: List<Vehicle>
    )

    operator fun invoke(vehicles: List<Vehicle>): VehicleReport {
        val currentTime = System.currentTimeMillis()
        
        return VehicleReport(
            totalVehicles = vehicles.size,
            averagePrice = vehicles.map { it.price }.average(),
            averageDaysInInventory = vehicles.map { vehicle ->
                ((currentTime - vehicle.createdAt) / (24 * 60 * 60 * 1000)).toInt()
            }.average().toInt(),
            topMakes = vehicles.groupBy { it.make }
                .toList()
                .sortedByDescending { it.second.size }
                .take(5)
                .map { it.first },
            slowMovingVehicles = vehicles
                .filter { (currentTime - it.createdAt) > (90 * 24 * 60 * 60 * 1000) } // 90+ days
                .sortedByDescending { currentTime - it.createdAt }
                .take(10),
            profitableVehicles = vehicles
                .filter { it.cost != null && it.price > it.cost!! }
                .sortedByDescending { it.price - (it.cost ?: 0.0) }
                .take(10)
        )
    }
}
