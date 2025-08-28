// File: presentation/ui/screens/crm/LeadListScreen.kt
// Purpose: Complete CRM lead list screen with customer management
// Dependencies: Compose, Material 3, ViewModel

package com.dealervait.presentation.ui.screens.crm

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.dealervait.domain.model.Lead
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import java.text.SimpleDateFormat
import java.util.*

/**
 * Complete CRM lead list screen with customer management
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeadListScreen(
    onNavigateToAddLead: () -> Unit,
    onNavigateToLeadDetail: (Int) -> Unit,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    // For now, using dummy data - in real implementation this would come from ViewModel
    val sampleLeads = remember { getSampleLeads() }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("CRM - Leads")
                        Text(
                            text = "${sampleLeads.size} customers",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* Search */ }) {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    }
                    IconButton(onClick = { /* Filter */ }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filter")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToAddLead
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add Lead"
                )
            }
        }
    ) { paddingValues ->
        if (sampleLeads.isEmpty()) {
            // Empty state
            LeadListEmptyContent(
                onAddLead = onNavigateToAddLead,
                modifier = modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            )
        } else {
            // Lead list content
            LeadListContent(
                leads = sampleLeads,
                onLeadClick = onNavigateToLeadDetail,
                modifier = modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            )
        }
    }
}

/**
 * Lead list content with customer cards
 */
@Composable
private fun LeadListContent(
    leads: List<Lead>,
    onLeadClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(
            items = leads,
            key = { it.id }
        ) { lead ->
            LeadCard(
                lead = lead,
                onClick = { onLeadClick(lead.id) }
            )
        }
    }
}

/**
 * Individual lead card with customer information and quick actions
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LeadCard(
    lead: Lead,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    val dateFormatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())

    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header with avatar and name
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Customer avatar with initials
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = lead.initials,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = lead.fullName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = dateFormatter.format(Date(lead.createdAt)),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Status badge
                Surface(
                    color = getStatusColor(lead.statusId),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = getStatusText(lead.statusId),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Contact information
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Phone
                if (lead.phoneNumber != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Phone,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = formatPhoneNumber(lead.phoneNumber),
                            style = MaterialTheme.typography.bodyMedium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                // Email
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Email,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = lead.emailAddress,
                        style = MaterialTheme.typography.bodyMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Address if available
            lead.formattedAddress?.let { address ->
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = address,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Quick action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Call button
                if (lead.phoneNumber != null) {
                    OutlinedButton(
                        onClick = {
                            val callIntent = Intent(Intent.ACTION_DIAL).apply {
                                data = Uri.parse("tel:${lead.phoneNumber}")
                            }
                            context.startActivity(callIntent)
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            Icons.Default.Call,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Call")
                    }
                }

                // Text button
                if (lead.phoneNumber != null) {
                    OutlinedButton(
                        onClick = {
                            val smsIntent = Intent(Intent.ACTION_VIEW).apply {
                                data = Uri.parse("sms:${lead.phoneNumber}")
                            }
                            context.startActivity(smsIntent)
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            Icons.Default.Message,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Text")
                    }
                }

                // Email button
                OutlinedButton(
                    onClick = {
                        val emailIntent = Intent(Intent.ACTION_SENDTO).apply {
                            data = Uri.parse("mailto:${lead.emailAddress}")
                        }
                        context.startActivity(emailIntent)
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        Icons.Default.Email,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Email")
                }
            }

            // Co-buyer information if available
            if (lead.hasCoBuyer) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Co-buyer: ${lead.coBuyerFullName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * Empty state when no leads are found
 */
@Composable
private fun LeadListEmptyContent(
    onAddLead: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                imageVector = Icons.Default.People,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "No customers yet",
                style = MaterialTheme.typography.headlineSmall
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Start building your customer database by adding your first lead",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(onClick = onAddLead) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Add First Customer")
            }
        }
    }
}

/**
 * Helper functions
 */
private fun formatPhoneNumber(phoneNumber: String): String {
    // Simple phone number formatting - can be enhanced
    return if (phoneNumber.length == 10) {
        "(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6)}"
    } else {
        phoneNumber
    }
}

private fun getStatusColor(statusId: Int?): Color {
    return when (statusId) {
        1 -> Color(0xFF4CAF50) // New - Green
        2 -> Color(0xFF2196F3) // Contacted - Blue
        3 -> Color(0xFFFF9800) // Qualified - Orange
        4 -> Color(0xFFF44336) // Lost - Red
        else -> Color(0xFF9E9E9E) // Unknown - Gray
    }
}

private fun getStatusText(statusId: Int?): String {
    return when (statusId) {
        1 -> "New"
        2 -> "Contacted"
        3 -> "Qualified"
        4 -> "Lost"
        else -> "Unknown"
    }
}

/**
 * Sample data for demonstration
 */
private fun getSampleLeads(): List<Lead> {
    return listOf(
        Lead(
            id = 1,
            firstName = "John",
            lastName = "Smith",
            emailAddress = "john.smith@email.com",
            phoneNumber = "5551234567",
            statusId = 1,
            street = "123 Main St",
            city = "Springfield",
            state = "IL",
            createdAt = System.currentTimeMillis() - 86400000, // 1 day ago
            updatedAt = System.currentTimeMillis()
        ),
        Lead(
            id = 2,
            firstName = "Sarah",
            lastName = "Johnson",
            emailAddress = "sarah.johnson@email.com",
            phoneNumber = "5559876543",
            statusId = 2,
            coBuyerFirstName = "Mike",
            coBuyerLastName = "Johnson",
            createdAt = System.currentTimeMillis() - 172800000, // 2 days ago
            updatedAt = System.currentTimeMillis()
        ),
        Lead(
            id = 3,
            firstName = "David",
            lastName = "Williams",
            emailAddress = "david.williams@email.com",
            phoneNumber = "5551111111",
            statusId = 3,
            street = "456 Oak Ave",
            city = "Chicago",
            state = "IL",
            createdAt = System.currentTimeMillis() - 259200000, // 3 days ago
            updatedAt = System.currentTimeMillis()
        ),
        Lead(
            id = 4,
            firstName = "Emily",
            lastName = "Brown",
            emailAddress = "emily.brown@email.com",
            phoneNumber = "5552222222",
            statusId = 1,
            createdAt = System.currentTimeMillis() - 345600000, // 4 days ago
            updatedAt = System.currentTimeMillis()
        )
    )
}

/**
 * Add/Edit lead screen - placeholder implementation
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditLeadScreen(
    leadId: Int?,
    onNavigateBack: () -> Unit,
    onLeadSaved: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isEditing = leadId != null
    val title = if (isEditing) "Edit Lead" else "Add Lead"
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(32.dp)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineMedium
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Lead/customer form will be implemented here with all CRM fields",
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(onClick = onLeadSaved) {
                    Text("Save Lead")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun LeadListScreenPreview() {
    DealerVaitTheme {
        LeadListScreen(
            onNavigateToAddLead = {},
            onNavigateToLeadDetail = {},
            onNavigateBack = {}
        )
    }
}
