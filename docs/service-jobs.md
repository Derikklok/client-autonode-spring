# Service Job Management API Documentation

## Overview
The Service Job Management system allows fleet managers to create, track, and manage service jobs for vehicles in their department. Jobs can be created from vehicle errors or independently, assigned to mechanics, and tracked through completion.

## Base URL
`/api/fleet-manager/service-jobs`

## Authentication
All endpoints require:
- **Role:** `FLEET_MANAGER`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Create Service Job
**POST** `/api/fleet-manager/service-jobs`

Create a new service job with mechanics assignment and parts requirements.

### Request Body
```json
{
  "title": "Engine Oil Leak Repair",
  "description": "Fix oil leak in engine bay detected by diagnostic system",
  "instructions": "1. Locate oil leak source\n2. Replace damaged gasket\n3. Test for leaks\n4. Update maintenance log",
  "priority": "HIGH",
  "vehicleId": "vehicle-uuid-123",
  "vehicleErrorId": "error-uuid-456",
  "scheduledDate": "2025-02-01T09:00:00",
  "estimatedCost": 250.00,
  "mechanicIds": [10, 15],
  "requiredParts": [
    {
      "partName": "Oil Pan Gasket",
      "partNumber": "OEM-12345",
      "manufacturer": "Toyota",
      "quantity": 1,
      "unitPrice": 45.99,
      "description": "Replacement oil pan gasket",
      "supplier": "AutoParts Co"
    },
    {
      "partName": "Engine Oil",
      "partNumber": "5W30-4L",
      "manufacturer": "Mobil",
      "quantity": 2,
      "unitPrice": 32.99,
      "description": "5W-30 Synthetic Oil 4L",
      "supplier": "Oil Depot"
    }
  ]
}
```

### Response
```json
{
  "id": "job-uuid-789",
  "jobNumber": "SJ-2025-001",
  "title": "Engine Oil Leak Repair",
  "description": "Fix oil leak in engine bay detected by diagnostic system",
  "instructions": "1. Locate oil leak source...",
  "status": "PENDING",
  "priority": "HIGH",
  "vehicleId": "vehicle-uuid-123",
  "vehiclePlateNumber": "ABC-123",
  "vehicleManufacturer": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2020,
  "errorId": "error-uuid-456",
  "errorCode": "P0172",
  "errorTitle": "System Too Rich (Bank 1)",
  "departmentName": "Fleet Operations",
  "createdByName": "John Manager",
  "createdByEmail": "john.manager@company.com",
  "assignedMechanics": [
    {
      "assignmentId": "assign-uuid-1",
      "mechanicId": 10,
      "mechanicName": "Mike Mechanic",
      "mechanicEmail": "mike.mechanic@company.com",
      "assignedAt": "2025-01-30T14:30:00",
      "acceptedAt": null,
      "accepted": false,
      "notes": null
    }
  ],
  "requiredParts": [
    {
      "id": "part-uuid-1",
      "partName": "Oil Pan Gasket",
      "partNumber": "OEM-12345",
      "manufacturer": "Toyota",
      "quantity": 1,
      "unitPrice": 45.99,
      "totalPrice": 45.99,
      "description": "Replacement oil pan gasket",
      "supplier": "AutoParts Co",
      "ordered": false,
      "received": false
    }
  ],
  "createdAt": "2025-01-30T14:30:00",
  "scheduledDate": "2025-02-01T09:00:00",
  "startedAt": null,
  "completedAt": null,
  "estimatedCost": 250.00,
  "actualCost": null,
  "totalPartsCost": 111.97,
  "completionNotes": null,
  "totalMechanics": 2,
  "totalParts": 2,
  "allPartsReceived": false
}
```

---

## 2. Get Service Job by ID
**GET** `/api/fleet-manager/service-jobs/{jobId}`

Retrieve detailed information about a specific service job.

### Response
Same structure as Create Service Job response.

---

## 3. Get All Service Jobs (Paginated)
**GET** `/api/fleet-manager/service-jobs?page=0&size=20`

Retrieve all service jobs for the fleet manager's department with pagination.

### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

### Response
```json
{
  "content": [
    {
      // ServiceJobResponse objects
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 45,
  "totalPages": 3,
  "last": false,
  "first": true
}
```

---

## 4. Get Ongoing Service Jobs
**GET** `/api/fleet-manager/service-jobs/ongoing`

Retrieve all ongoing service jobs (PENDING and IN_PROGRESS status).

### Response
```json
[
  {
    // Array of ServiceJobResponse objects with status PENDING or IN_PROGRESS
  }
]
```

---

## 5. Get Completed Service Jobs
**GET** `/api/fleet-manager/service-jobs/completed`

Retrieve all completed service jobs.

### Response
```json
[
  {
    // Array of ServiceJobResponse objects with status COMPLETED
  }
]
```

---

## 6. Get Service Jobs by Status
**GET** `/api/fleet-manager/service-jobs/status/{status}?page=0&size=20`

Retrieve service jobs filtered by status.

### Path Parameters
- `status`: One of `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

---

## 7. Get Service Jobs by Vehicle
**GET** `/api/fleet-manager/service-jobs/vehicle/{vehicleId}?page=0&size=20`

Retrieve all service jobs for a specific vehicle.

### Path Parameters
- `vehicleId`: UUID of the vehicle

---

## 8. Update Service Job
**PUT** `/api/fleet-manager/service-jobs/{jobId}`

Update service job details. Only provided fields will be updated.

### Request Body
```json
{
  "title": "Updated Engine Repair",
  "status": "IN_PROGRESS",
  "actualCost": 280.50,
  "completionNotes": "Additional work required on timing chain"
}
```

### Response
Updated ServiceJobResponse object.

---

## 9. Assign Additional Mechanics
**POST** `/api/fleet-manager/service-jobs/{jobId}/mechanics`

Assign additional mechanics to an existing service job.

### Request Body
```json
[12, 18, 22]
```

### Response
Updated ServiceJobResponse object with new mechanic assignments.

---

## 10. Add Parts to Job
**POST** `/api/fleet-manager/service-jobs/{jobId}/parts`

Add additional parts to an existing service job.

### Request Body
```json
[
  {
    "partName": "Air Filter",
    "partNumber": "AF-789",
    "manufacturer": "OEM",
    "quantity": 1,
    "unitPrice": 25.99,
    "description": "Engine air filter",
    "supplier": "Parts Depot"
  }
]
```

### Response
Updated ServiceJobResponse object with new parts.

---

## 11. Get Service Job Summary
**GET** `/api/fleet-manager/service-jobs/summary`

Get statistical summary of service jobs in the department.

### Response
```json
{
  "totalJobs": 156,
  "pendingJobs": 12,
  "inProgressJobs": 8,
  "completedJobs": 134,
  "cancelledJobs": 2,
  "totalMechanicsAssigned": 45,
  "totalPartsOrdered": 280,
  "totalEstimatedCost": 45600.00,
  "totalActualCost": 47800.00
}
```

---

## Service Job Status Workflow

1. **PENDING**: Job created, waiting to start
2. **IN_PROGRESS**: Job has been started by mechanic
3. **COMPLETED**: Job finished successfully
4. **CANCELLED**: Job cancelled before completion

## Priority Levels
- **LOW**: Non-urgent maintenance
- **MEDIUM**: Regular scheduled maintenance
- **HIGH**: Important repair needed soon
- **URGENT**: Critical issue requiring immediate attention

## Integration with Error Monitoring

Service jobs can be created directly from vehicle errors using the monitoring system:

**POST** `/api/fleet-manager/monitoring/errors/{errorId}/create-service-job`

This endpoint provides the necessary information to create a service job from a detected error.

## Error Responses

All endpoints return standard error responses:

```json
{
  "status": 400,
  "message": "Validation error message",
  "timestamp": "2025-01-30T14:30:00"
}
```

Common error codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error
