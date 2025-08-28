export type RootStackParamList = {
    // Auth Flow
    Splash: undefined;
    Login: undefined;
    
    // Main Navigation
    BottomTab: undefined;
    
    // Chat & Communication
    Chat: undefined;
    ChatDetails: { chatId?: string; userId?: string };
    
    // Profile Management
    EditProfile: undefined;
    ChangePassword: undefined;
    
    // Vehicle Management
    CarModelList: { brandId?: string; modelId?: string };
    VehicleDetails: { vehicleId: number; objectId?: number };
    Images: {
      vehicleId: string;
      imagesData: any[]; 
      watermarkId: string;
    };
    Documents: { vehicleId?: number; objectId?: number };
    Basics: { vehicleId?: number; objectId?: number };
    Marketing: { vehicleId?: number; objectId?: number };
    Options: { vehicleId?: number; objectId?: number };
    Purchase: { vehicleId?: number; objectId?: number };
    UploadImages: { vehicleId?: number; objectId?: number };
    VehicleDocuments: { vehicleId?: number; objectId?: number };
    VehicleRelated: { vehicleId?: number };
    decode: { vin?: string };
    
    // Financial & Payments
    PurchasePayment: { vehicleId?: number; purchaseData?: any };
    CarExpenses: { vehicleId?: number };
    TransactionLog: { vehicleId?: number };
    AddExpense: { vehicleId?: number };
    Cheque: { 
      vehicleId?: number; 
      setSelectedItem?: (item: any) => void;
      selectedItem?: any;
    };
    CreditCard: { 
      setSelectedItem?: (item: any) => void;
      selectedItem?: any;
    };
    PaymentMethodBoilerPlate: { 
      paymentType?: string;
      vehicleId?: number;
      setSelectedItem?: (item: any) => void;
      selectedItem?: any;
    };
    Floorplan: { 
      vehicleId?: number;
      setSelectedItem?: (item: any) => void;
      selectedItem?: any;
    };
    Consignment: { 
      vehicleId?: number;
      setSelectedItem?: (item: any) => void;
      selectedItem?: any;
    };
    CarCost: { vehicleId?: number };
    
    // CRM & Leads
    AddNewLeads: undefined;
    CrmProfile: { customerId?: number; leadId?: number };
    AddCrmProfileTabBoilerPlate: { customerId?: number };
    CrmProfileVehicleBoilerPlate: { customerId?: number; vehicleId?: number };
    TradeIn: { vehicleId?: number };
    
    // Credit & Financial Services
    CreditApplication: { customerId?: number; leadId?: number };
    PullCreditReport: { customerId?: number; leadId?: number };
    
    // Communication & Tasks
    AddEmail: { customerId?: number; leadId?: number };
    ScanDocument: { vehicleId?: number; customerId?: number };
    Notes: { vehicleId?: number; customerId?: number };
    Task: { vehicleId?: number; customerId?: number; taskId?: number };
    Appointment: { customerId?: number; appointmentId?: number };
    Sms: { customerId?: number; phoneNumber?: string };
    
    // Reports & Analytics
    Carfax: { 
      vehicleId?: number; 
      vin?: string;
      vehicleData?: any;
    };
    Log: { vehicleId?: number; objectId?: number; objectTypeId?: number };
  };