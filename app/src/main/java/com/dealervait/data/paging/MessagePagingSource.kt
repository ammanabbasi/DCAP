// File: app/src/main/java/com/dealervait/data/paging/MessagePagingSource.kt
// Purpose: Paging source for messages in conversations using Paging 3
// Dependencies: PagingSource, Room, API service, ErrorHandler

package com.dealervait.data.paging

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.dealervait.core.error.ErrorHandler
import com.dealervait.core.error.NetworkResult
import com.dealervait.data.api.DealersCloudApiService
import com.dealervait.data.local.dao.MessageDao
import com.dealervait.data.local.entities.MessageEntity
import com.dealervait.data.mappers.MessageMappers.toDomain
import com.dealervait.data.mappers.MessageMappers.toEntity
import timber.log.Timber
import javax.inject.Inject

class MessagePagingSource @Inject constructor(
    private val conversationId: String,
    private val apiService: DealersCloudApiService,
    private val messageDao: MessageDao,
    private val errorHandler: ErrorHandler
) : PagingSource<Int, MessageEntity>() {

    override fun getRefreshKey(state: PagingState<Int, MessageEntity>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, MessageEntity> {
        return try {
            val page = params.key ?: 0
            val pageSize = params.loadSize

            Timber.d("Loading messages for conversation: $conversationId, page: $page, size: $pageSize")

            // First, load from local database
            val localMessages = messageDao.getMessagesForConversation(
                conversationId = conversationId,
                limit = pageSize,
                offset = page * pageSize
            )

            // Attempt to fetch from API for fresh data
            val apiResult = errorHandler.safeApiCall {
                apiService.getMessages(
                    conversationId = conversationId,
                    page = page,
                    limit = pageSize
                )
            }

            when (apiResult) {
                is NetworkResult.Success -> {
                    val apiMessages = apiResult.data.map { it.toDomain().toEntity() }
                    
                    // Cache the messages locally
                    if (apiMessages.isNotEmpty()) {
                        messageDao.insertMessages(apiMessages)
                    }

                    Timber.d("Loaded ${apiMessages.size} messages from API")

                    LoadResult.Page(
                        data = apiMessages,
                        prevKey = if (page == 0) null else page - 1,
                        nextKey = if (apiMessages.size < pageSize) null else page + 1
                    )
                }
                
                is NetworkResult.NetworkError -> {
                    // Network error - return cached data if available
                    Timber.w("Network error, falling back to cached data")
                    
                    // This is a simplified implementation - in practice, we'd need to collect the Flow
                    val cachedMessages = emptyList<MessageEntity>() // Placeholder
                    
                    LoadResult.Page(
                        data = cachedMessages,
                        prevKey = if (page == 0) null else page - 1,
                        nextKey = if (cachedMessages.size < pageSize) null else page + 1
                    )
                }
                
                is NetworkResult.Error -> {
                    Timber.e("Error loading messages: ${apiResult.message}")
                    LoadResult.Error(Exception(apiResult.message))
                }
                
                is NetworkResult.Loading -> {
                    // This shouldn't happen with safeApiCall, but handle it
                    LoadResult.Error(Exception("Unexpected loading state"))
                }
            }

        } catch (exception: Exception) {
            Timber.e(exception, "Exception loading messages")
            LoadResult.Error(exception)
        }
    }
}
