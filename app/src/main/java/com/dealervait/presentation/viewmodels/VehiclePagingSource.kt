// File: presentation/viewmodels/VehiclePagingSource.kt
// Purpose: Paging source for vehicle list with infinite scrolling
// Dependencies: Paging 3, Vehicle use cases

package com.dealervait.presentation.viewmodels

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.Vehicle
import com.dealervait.domain.usecases.vehicle.GetVehiclesUseCase
import kotlinx.coroutines.flow.first
import timber.log.Timber

/**
 * Paging source for vehicle list with infinite scrolling
 */
class VehiclePagingSource(
    private val getVehiclesUseCase: GetVehiclesUseCase,
    private val filters: VehicleFilters
) : PagingSource<Int, Vehicle>() {

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Vehicle> {
        return try {
            val currentPage = params.key ?: 1
            val pageSize = params.loadSize

            val result = getVehiclesUseCase(
                page = currentPage,
                limit = pageSize,
                make = filters.make,
                model = filters.model,
                year = filters.year,
                status = filters.status,
                minPrice = filters.minPrice,
                maxPrice = filters.maxPrice,
                forceRefresh = false
            ).first()

            when (result) {
                is NetworkResult.Success -> {
                    val vehicles = result.data
                    val nextKey = if (vehicles.size < pageSize) null else currentPage + 1
                    val prevKey = if (currentPage == 1) null else currentPage - 1

                    LoadResult.Page(
                        data = vehicles,
                        prevKey = prevKey,
                        nextKey = nextKey
                    )
                }
                is NetworkResult.Error -> {
                    Timber.e("Paging error: ${result.message}")
                    LoadResult.Error(Exception(result.message))
                }
                is NetworkResult.NetworkError -> {
                    Timber.e("Network error: ${result.message}")
                    LoadResult.Error(Exception(result.message))
                }
                else -> {
                    LoadResult.Error(Exception("Unknown error"))
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Error loading page")
            LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, Vehicle>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }
}
