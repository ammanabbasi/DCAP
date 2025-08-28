// File: di/modules/UseCaseModule.kt
// Purpose: Hilt dependency injection module for use case bindings
// Dependencies: Hilt, Use cases

package com.dealervait.di.modules

import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent

/**
 * Hilt module for use case dependencies
 * All use cases are provided by constructor injection automatically
 * This module exists for future custom use case bindings if needed
 */
@Module
@InstallIn(ViewModelComponent::class)
object UseCaseModule {
    
    // All use cases are automatically provided by Hilt through constructor injection
    // Add custom bindings here if needed in the future
    
    /*
    @Provides
    fun provideCustomUseCase(
        repository: SomeRepository
    ): CustomUseCase {
        return CustomUseCase(repository)
    }
    */
}
