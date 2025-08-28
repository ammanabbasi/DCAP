# DealerVait Android Architecture

## 🏗️ Clean Architecture + MVVM

DealerVait follows Clean Architecture principles with MVVM pattern for maintainable, testable code.

### **Architecture Layers**
```
┌─────────────────────────────────┐
│      Presentation Layer         │ ← UI, ViewModels, Navigation
├─────────────────────────────────┤
│        Domain Layer             │ ← Business Logic, Use Cases
├─────────────────────────────────┤
│         Data Layer              │ ← API, Database, WebSocket
└─────────────────────────────────┘
```

## 📁 Package Structure

```
com.dealervait/
├── core/                 # Base classes & utilities
├── data/                 # Data sources & repositories
├── di/                   # Dependency injection
├── domain/               # Business logic & models
└── presentation/         # UI & ViewModels
```

## 🔄 Data Flow

**UI → ViewModel → UseCase → Repository → Data Source**

### Example Implementation
```kotlin
// 1. UI Screen (Compose)
@Composable
fun VehicleListScreen(viewModel: VehicleListViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    LazyColumn {
        items(uiState.vehicles) { vehicle ->
            VehicleCard(vehicle = vehicle)
        }
    }
}

// 2. ViewModel (State Management)
@HiltViewModel  
class VehicleListViewModel @Inject constructor(
    private val getVehiclesUseCase: GetVehiclesUseCase
) : BaseViewModel() {
    fun loadVehicles() {
        viewModelScope.launch {
            getVehiclesUseCase().collect { vehicles ->
                _uiState.value = _uiState.value.copy(vehicles = vehicles)
            }
        }
    }
}

// 3. Repository (Data Access)
class VehicleRepositoryImpl @Inject constructor(
    private val apiService: DealersCloudApiService,
    private val vehicleDao: VehicleDao
) : VehicleRepository {
    override suspend fun getVehicles(): Flow<List<Vehicle>> {
        // Offline-first: Cache then network
        return networkBoundResource(
            loadFromDb = { vehicleDao.getAllVehicles() },
            createCall = { apiService.getVehicles() },
            saveCallResult = { vehicleDao.insertAll(it) }
        )
    }
}
```

## 💾 Offline-First Architecture

### **NetworkBoundResource Pattern**
1. **Load from cache** immediately
2. **Check if refresh needed** (cache expiry)
3. **Fetch from network** in background
4. **Save to cache** and update UI
5. **Handle errors** gracefully

## 🔌 Dependency Injection (Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides @Singleton
    fun provideApiService(): DealersCloudApiService = /* ... */
    
    @Provides @Singleton  
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase = /* ... */
}
```

## 🎨 UI Architecture (Jetpack Compose)

### **Material Design 3**
- Dynamic theming with system colors
- Dark mode support
- Accessibility compliance
- Smooth animations

### **State Management**
- **StateFlow** for UI state
- **Flow** for data streams  
- **Compose State** for local UI state

## 🔄 Real-Time Features

### **WebSocket Integration**
```kotlin
@Singleton
class WebSocketService @Inject constructor() {
    fun observeMessages(): Flow<Message> = messageFlow
    fun sendMessage(message: String) = webSocket.send(message)
}
```

### **Push Notifications**
- Firebase Cloud Messaging
- In-app notification center
- Customizable preferences

## 🧪 Testing Strategy

### **Unit Tests**
- Repository layer with mock data
- ViewModel with test coroutines
- Use case business logic

### **UI Tests**  
- Compose testing with test rules
- User interaction testing
- Navigation testing

## 🔒 Security Features

- **JWT Authentication** with auto-refresh
- **Encrypted Storage** for sensitive data
- **Certificate Pinning** for API calls
- **Input Validation** throughout app

## ⚡ Performance Optimizations

- **Lazy Loading** with Paging 3
- **Image Caching** with Coil
- **Database Indexing** for fast queries
- **Memory Leak Prevention** with lifecycle awareness
- **Network Caching** with OkHttp

## 📊 Key Technologies

| Layer | Technologies |
|-------|-------------|
| **UI** | Jetpack Compose, Material 3, Navigation |
| **State** | ViewModel, StateFlow, LiveData |
| **DI** | Hilt (Dagger) |
| **Network** | Retrofit, OkHttp, WebSocket |
| **Database** | Room, SQLite |
| **Async** | Kotlin Coroutines, Flow |
| **Image** | Coil |
| **Testing** | JUnit, Mockito, Compose Testing |

## 🎯 Architecture Benefits

✅ **Maintainable**: Clear separation of concerns  
✅ **Testable**: Pure business logic, mockable interfaces  
✅ **Scalable**: Easy to add features and team members  
✅ **Performant**: Offline-first with smart caching  
✅ **Reliable**: Comprehensive error handling  
✅ **Secure**: Multiple security layers  

This architecture ensures DealerVait is production-ready and future-proof.
