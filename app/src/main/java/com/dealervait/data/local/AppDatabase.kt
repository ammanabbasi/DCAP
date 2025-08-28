// File: data/local/AppDatabase.kt
// Purpose: Main Room database configuration with entities and DAOs
// Dependencies: Room, Migration strategies

package com.dealervait.data.local

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import android.content.Context
import com.dealervait.data.local.dao.*
import com.dealervait.data.local.entities.*

/**
 * Main Room database for DealerVait application
 */
@Database(
    entities = [
        UserEntity::class,
        VehicleEntity::class, 
        LeadEntity::class,
        DashboardCacheEntity::class,
        MessageEntity::class,
        ConversationEntity::class,
        DocumentEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    
    abstract fun userDao(): UserDao
    abstract fun vehicleDao(): VehicleDao
    abstract fun leadDao(): LeadDao
    abstract fun dashboardCacheDao(): DashboardCacheDao
    abstract fun messageDao(): MessageDao
    abstract fun conversationDao(): ConversationDao
    abstract fun documentDao(): DocumentDao

    companion object {
        const val DATABASE_NAME = "dealervait_database"
        
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    DATABASE_NAME
                )
                .addCallback(DatabaseCallback())
                .fallbackToDestructiveMigration() // For development - remove in production
                .build()
                
                INSTANCE = instance
                instance
            }
        }

        /**
         * Database callback for initialization
         */
        private class DatabaseCallback : Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // Initialize database with default data if needed
            }
        }

        /**
         * Migration from version 1 to 2 (example)
         * Add migrations as app evolves
         */
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Example migration - add new column
                // database.execSQL("ALTER TABLE vehicles ADD COLUMN new_column TEXT")
            }
        }
    }
}
