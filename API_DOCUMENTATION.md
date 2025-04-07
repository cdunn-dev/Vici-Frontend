# API Documentation

## Overview

This document provides comprehensive documentation for the Vici API, including endpoints, request/response formats, validation rules, and error handling.

## Table of Contents

1. [Authentication](#authentication)
2. [Validation System](#validation-system)
3. [Error Handling](#error-handling)
4. [API Endpoints](#api-endpoints)
5. [Rate Limiting](#rate-limiting)
6. [Best Practices](#best-practices)

## Authentication

Authentication is handled via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Validation System

The API uses a comprehensive validation system based on Zod schemas. All incoming requests are validated against predefined schemas before processing.

### Using Validation in Routes

```typescript
import { validateRequest } from '../middleware/validateRequest';
import { createUserRequestSchema } from '../schemas/apiValidationSchemas';

// Apply validation middleware to a route
router.post('/users', validateRequest(createUserRequestSchema), async (req, res) => {
  // Route handler
});
```

### Available Validation Schemas

The following validation schemas are available:

#### User Schemas
- `userSchema`: Validates user creation data
- `userUpdateSchema`: Validates user update data

#### Content Schemas
- `contentSchema`: Validates content creation data
- `contentUpdateSchema`: Validates content update data

#### Common Schemas
- `paginationSchema`: Validates pagination parameters
- `idParamSchema`: Validates ID parameters
- `searchSchema`: Validates search parameters
- `fileUploadSchema`: Validates file upload data

### Validation Response Format

When validation fails, the API returns a 400 Bad Request with the following format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.email",
      "message": "Invalid email format"
    }
  ]
}
```

## Error Handling

The API uses a centralized error handling system. All errors are logged and processed according to their severity and category.

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "additional": "information"
  }
}
```

### Error Categories

- `VALIDATION`: Input validation errors
- `AUTHENTICATION`: Authentication and authorization errors
- `DATABASE`: Database operation errors
- `EXTERNAL`: Errors from external services
- `SYSTEM`: System-level errors

### Error Severity Levels

- `LOW`: Minor issues that don't affect functionality
- `MEDIUM`: Issues that may affect some functionality
- `HIGH`: Critical issues that require immediate attention

## API Endpoints

### Users

#### Create User
- **URL**: `/api/users`
- **Method**: `POST`
- **Validation Schema**: `createUserRequestSchema`
- **Description**: Creates a new user

#### Update User
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Validation Schema**: `updateUserRequestSchema`
- **Description**: Updates an existing user

### Content

#### Create Content
- **URL**: `/api/content`
- **Method**: `POST`
- **Validation Schema**: `createContentRequestSchema`
- **Description**: Creates new content

#### Update Content
- **URL**: `/api/content/:id`
- **Method**: `PUT`
- **Validation Schema**: `updateContentRequestSchema`
- **Description**: Updates existing content

### Search

#### Search
- **URL**: `/api/search`
- **Method**: `GET`
- **Validation Schema**: `searchRequestSchema`
- **Description**: Searches for content

### File Upload

#### Upload File
- **URL**: `/api/files`
- **Method**: `POST`
- **Validation Schema**: `fileUploadRequestSchema`
- **Description**: Uploads a file

## Rate Limiting

The API implements rate limiting to prevent abuse. Rate limits are applied per IP address and per user.

### Rate Limit Headers

The API includes the following headers in responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current time window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Best Practices

### Input Validation

1. Always use the validation middleware for all routes
2. Use the appropriate schema for each endpoint
3. Sanitize all user input to prevent XSS and injection attacks

### Error Handling

1. Use the centralized error handling service
2. Provide meaningful error messages
3. Log errors with appropriate severity levels

### Security

1. Always validate and sanitize user input
2. Use parameterized queries for database operations
3. Implement proper authentication and authorization
4. Follow the principle of least privilege

### Performance

1. Use pagination for large data sets
2. Implement caching where appropriate
3. Optimize database queries
4. Use compression for large responses 