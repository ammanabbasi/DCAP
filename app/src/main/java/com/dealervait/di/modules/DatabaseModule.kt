// File: di/modules/DatabaseModule.kt
// Purpose: Hilt dependency injection module for database components
// Dependencies: Hilt, Room

package com.dealervait.di.modules

import android.content.Context
import androidx.room.Room
import com.dealervait.data.local.AppDatabase
import com.dealervait.data.local.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for database-related dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    /**
     * Provide Room database instance
     */
    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context.applicationContext,
            AppDatabase::class.java,
            AppDatabase.DATABASE_NAME
        )
        .addCallback(object : AppDatabase.Callback() {
            override fun onCreate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                super.onCreate(db)
                // Initialize database with default data if needed
            }
        })
        // For production, add proper migrations instead of fallback
        .fallbackToDestructiveMigration()
        .build()
    }

    /**
     * Provide UserDao
     */
    @Provides
    fun provideUserDao(database: AppDatabase): UserDao {
        return database.userDao()
    }

    /**
     * Provide VehicleDao
     */
    @Provides
    fun provideVehicleDao(database: AppDatabase): VehicleDao {
        return database.vehicleDao()
    }

    /**
     * Provide LeadDao
     */
    @Provides
    fun provideLeadDao(database: AppDatabase): LeadDao {
        return database.leadDao()
    }

    /**
     * Provide DashboardCacheDao
     */
    @Provides
    fun provideDashboardCacheDao(database: AppDatabase): DashboardCacheDao {
        return database.dashboardCacheDao()
    }

    /**
     * Provide MessageDao
     */
    @Provides
    fun provideMessageDao(database: AppDatabase): MessageDao {
        return database.messageDao()
    }

    /**
     * Provide DocumentDao
     */
    @Provides
    fun provideDocumentDao(database: AppDatabase): DocumentDao {
        return database.documentDao()
    }
}
