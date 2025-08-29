import { BlobServiceClient, ContainerClient, BlockBlobClient, BlobUploadCommonResponse } from '@azure/storage-blob';
import { config } from '../config/env';
import logger from '../utils/logger';
import crypto from 'crypto';
import path from 'path';

export interface UploadResult {
  url: string;
  blobName: string;
  container: string;
  size: number;
  contentType: string;
  etag?: string;
}

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containers: Map<string, ContainerClient> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Use connection string or account name/key
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      
      if (connectionString) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        logger.info('Azure Storage Service initialized with connection string');
      } else {
        // Fallback to emulator or throw error
        const accountName = process.env.AZURE_STORAGE_ACCOUNT || 'devstoreaccount1';
        const accountKey = process.env.AZURE_STORAGE_KEY;
        
        if (accountName && accountKey) {
          const storageUrl = accountName === 'devstoreaccount1' 
            ? 'http://127.0.0.1:10000/devstoreaccount1'
            : `https://${accountName}.blob.core.windows.net`;
            
          this.blobServiceClient = new BlobServiceClient(
            storageUrl,
            {
              getToken: async () => {
                return { token: accountKey, expiresOnTimestamp: Date.now() + 3600000 };
              }
            }
          );
          logger.info('Azure Storage Service initialized with account credentials');
        } else {
          logger.warn('Azure Storage credentials not configured. File upload will be disabled.');
        }
      }
    } catch (error) {
      logger.error('Failed to initialize Azure Storage Service:', error);
    }
  }

  private async getContainerClient(containerName: string): Promise<ContainerClient | null> {
    if (!this.blobServiceClient) {
      logger.error('Azure Storage Service not initialized');
      return null;
    }

    try {
      // Check cache
      if (this.containers.has(containerName)) {
        return this.containers.get(containerName)!;
      }

      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      
      // Create container if it doesn't exist
      const exists = await containerClient.exists();
      if (!exists) {
        await containerClient.create({ access: 'blob' });
        logger.info(`Created container: ${containerName}`);
      }

      // Cache the client
      this.containers.set(containerName, containerClient);
      
      return containerClient;
    } catch (error) {
      logger.error(`Failed to get container client for ${containerName}:`, error);
      return null;
    }
  }

  private generateBlobName(originalName: string, folder?: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 50);
    
    const blobName = `${timestamp}-${randomString}-${baseName}${extension}`;
    
    return folder ? `${folder}/${blobName}` : blobName;
  }

  async uploadFile(
    file: Express.Multer.File,
    container: string,
    folder?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult | null> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blobName = this.generateBlobName(file.originalname, folder);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload file
      const uploadResponse = await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
        metadata: {
          ...metadata,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      logger.info(`File uploaded successfully: ${blobName}`);

      return {
        url: blockBlobClient.url,
        blobName,
        container,
        size: file.size,
        contentType: file.mimetype,
        etag: uploadResponse.etag,
      };
    } catch (error) {
      logger.error('Failed to upload file to Azure Storage:', error);
      return null;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    container: string,
    folder?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, container, folder, metadata)
    );

    const results = await Promise.all(uploadPromises);
    
    return results.filter((result): result is UploadResult => result !== null);
  }

  async deleteFile(container: string, blobName: string): Promise<boolean> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
      
      logger.info(`File deleted: ${blobName}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete file from Azure Storage:', error);
      return false;
    }
  }

  async generateSasUrl(
    container: string,
    blobName: string,
    expiresInMinutes: number = 60
  ): Promise<string | null> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      // Generate SAS token
      const startsOn = new Date();
      const expiresOn = new Date(startsOn.getTime() + expiresInMinutes * 60 * 1000);
      
      // Note: In production, you would use generateBlobSASQueryParameters
      // For now, returning the blob URL
      return blockBlobClient.url;
    } catch (error) {
      logger.error('Failed to generate SAS URL:', error);
      return null;
    }
  }

  async downloadFile(container: string, blobName: string): Promise<Buffer | null> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const downloadResponse = await blockBlobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error('No readable stream in download response');
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.from(chunk));
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Failed to download file from Azure Storage:', error);
      return null;
    }
  }

  async fileExists(container: string, blobName: string): Promise<boolean> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        return false;
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return await blockBlobClient.exists();
    } catch (error) {
      logger.error('Failed to check file existence:', error);
      return false;
    }
  }

  async getFileMetadata(container: string, blobName: string): Promise<any | null> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        return null;
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const properties = await blockBlobClient.getProperties();
      
      return {
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        lastModified: properties.lastModified,
        etag: properties.etag,
        metadata: properties.metadata,
      };
    } catch (error) {
      logger.error('Failed to get file metadata:', error);
      return null;
    }
  }

  async listFiles(
    container: string,
    prefix?: string,
    maxResults: number = 100
  ): Promise<Array<{ name: string; url: string; size: number; lastModified: Date }>> {
    try {
      const containerClient = await this.getContainerClient(container);
      if (!containerClient) {
        return [];
      }

      const files: Array<{ name: string; url: string; size: number; lastModified: Date }> = [];
      
      const iterator = containerClient.listBlobsFlat({
        prefix,
      });
      
      let count = 0;
      for await (const blob of iterator) {
        if (count >= maxResults) break;
        
        files.push({
          name: blob.name,
          url: `${containerClient.url}/${blob.name}`,
          size: blob.properties.contentLength || 0,
          lastModified: blob.properties.lastModified || new Date(),
        });
        
        count++;
      }
      
      return files;
    } catch (error) {
      logger.error('Failed to list files from Azure Storage:', error);
      return [];
    }
  }

  // Container names for different file types
  static CONTAINERS = {
    VEHICLE_IMAGES: 'vehicle-images',
    DOCUMENTS: 'documents',
    AVATARS: 'avatars',
    INSPECTION_REPORTS: 'inspection-reports',
    TEMP: 'temp-uploads',
  };
}

// Export singleton instance
export const azureStorage = new AzureStorageService();