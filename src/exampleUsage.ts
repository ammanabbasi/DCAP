// src/exampleUsage.ts

import { DealersCloudClient } from './apiClient';

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  const token = process.env.AUTH_TOKEN;
  
  if (!token) {
    console.error('AUTH_TOKEN environment variable is required');
    process.exit(1);
  }

  const client = new DealersCloudClient({ baseUrl, token });

  try {
    // Health check
    const health = await client.health.get();
    console.log('Health:', health.status);

    // Get profile
    const profile = await client.auth.getProfile();
    if (profile.success) {
      console.log('Profile loaded:', profile.data.user?.id);
    }

    // List vehicles
    const vehicles = await client.vehicles.list({ page: 1, limit: 5 });
    if (vehicles.success) {
      console.log('Vehicles:', vehicles.data.vehicles.length);
    }

    // Create lead
    const lead = await client.crm.createLead({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-0123',
      status: 'new'
    });
    if (lead.success) {
      console.log('Lead created:', lead.data.lead.id);
    }

    // List conversations
    const conversations = await client.messaging.listConversations();
    if (conversations.success) {
      console.log('Conversations:', conversations.data.conversations.length);
    }

    // Upload document
    const file = Buffer.from('hello');
    const upload = await client.documents.upload(file, { category: 'general' });
    if (upload.success) {
      console.log('Document uploaded:', upload.data.document.id);
    }

    // List documents
    const docs = await client.documents.list();
    if (docs.success) {
      console.log('Documents:', docs.data.documents.length);
    }

  } catch (error: any) {
    console.error('Error:', error.message || 'Unknown error');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}