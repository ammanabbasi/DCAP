// File: di/modules/NetworkModule.kt
// Purpose: Hilt dependency injection module for network components
// Dependencies: Hilt, Retrofit, OkHttp, Moshi

package com.dealervait.di.modules

import android.content.Context
import com.dealervait.BuildConfig
import com.dealervait.core.storage.TokenManager
import com.dealervait.data.api.ApiInterceptor
import com.dealervait.data.api.DealersCloudApiService
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.Cache
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import timber.log.Timber
import java.io.File
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

/**
 * Hilt module for network-related dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "https://dcgptrnapi.azurewebsites.net/api/"
    private const val CONNECT_TIMEOUT = 30L
    private const val READ_TIMEOUT = 30L
    private const val WRITE_TIMEOUT = 30L
    private const val CACHE_SIZE = 10 * 1024 * 1024L // 10 MB

    /**
     * Provide Moshi JSON converter
     */
    @Provides
    @Singleton
    fun provideMoshi(): Moshi {
        return Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()
    }

    /**
     * Provide HTTP cache
     */
    @Provides
    @Singleton
    fun provideHttpCache(@ApplicationContext context: Context): Cache {
        val cacheDir = File(context.cacheDir, "http_cache")
        return Cache(cacheDir, CACHE_SIZE)
    }

    /**
     * Provide HTTP logging interceptor
     */
    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor { message ->
            Timber.tag("HTTP").d(message)
        }.apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }

    /**
     * Provide authentication interceptor
     */
    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): ApiInterceptor.AuthInterceptor {
        return ApiInterceptor.AuthInterceptor(tokenManager)
    }

    /**
     * Provide network interceptor
     */
    @Provides
    @Singleton
    fun provideNetworkInterceptor(): ApiInterceptor.NetworkInterceptor {
        return ApiInterceptor.NetworkInterceptor()
    }

    /**
     * Provide header interceptor
     */
    @Provides
    @Singleton
    fun provideHeaderInterceptor(): ApiInterceptor.HeaderInterceptor {
        return ApiInterceptor.HeaderInterceptor()
    }

    /**
     * Provide OkHttp client
     */
    @Provides
    @Singleton
    fun provideOkHttpClient(
        cache: Cache,
        loggingInterceptor: HttpLoggingInterceptor,
        authInterceptor: ApiInterceptor.AuthInterceptor,
        networkInterceptor: ApiInterceptor.NetworkInterceptor,
        headerInterceptor: ApiInterceptor.HeaderInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .cache(cache)
            .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            // Add interceptors in order of execution
            .addInterceptor(headerInterceptor)
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .addNetworkInterceptor(networkInterceptor)
            .build()
    }

    /**
     * Provide Retrofit instance
     */
    @Provides
    @Singleton
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        moshi: Moshi
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
    }

    /**
     * Provide API service
     */
    @Provides
    @Singleton
    fun provideDealersCloudApiService(retrofit: Retrofit): DealersCloudApiService {
        return retrofit.create(DealersCloudApiService::class.java)
    }
}
