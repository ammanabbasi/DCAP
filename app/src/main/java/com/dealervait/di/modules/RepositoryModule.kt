// File: di/modules/RepositoryModule.kt
// Purpose: Hilt dependency injection module for repository bindings
// Dependencies: Hilt, Repository interfaces and implementations

package com.dealervait.di.modules

import com.dealervait.data.repository.*
import com.dealervait.domain.repository.*
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for repository bindings
 * Binds repository implementations to their interfaces
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    /**
     * Bind AuthRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    /**
     * Bind DashboardRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindDashboardRepository(
        dashboardRepositoryImpl: DashboardRepositoryImpl
    ): DashboardRepository

    /**
     * Bind VehicleRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindVehicleRepository(
        vehicleRepositoryImpl: VehicleRepositoryImpl
    ): VehicleRepository

    /**
     * Bind CrmRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindCrmRepository(
        crmRepositoryImpl: CrmRepositoryImpl
    ): CrmRepository

    /**
     * Bind MessageRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindMessageRepository(
        messageRepositoryImpl: MessageRepositoryImpl
    ): MessageRepository

    /**
     * Bind DocumentRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindDocumentRepository(
        documentRepositoryImpl: DocumentRepositoryImpl
    ): DocumentRepository

    /**
     * Bind AnalyticsRepository implementation
     */
    @Binds
    @Singleton
    abstract fun bindAnalyticsRepository(
        analyticsRepositoryImpl: AnalyticsRepositoryImpl
    ): AnalyticsRepository
