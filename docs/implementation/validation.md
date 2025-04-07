# Data Validation Implementation

## Overview

The validation system provides a comprehensive solution for validating and sanitizing data in the application. It includes:

- Input validation for all API endpoints
- Output encoding for sensitive data
- Parameterized queries for database operations
- Schema validation for JSON payloads

## Implementation Details

### Validation Service

The `ValidationService` is a singleton service that provides methods for validating and sanitizing data.

#### Basic Usage

```typescript
import { ValidationService } from '../services/validationService';
import { ErrorHandlingService } from '../services/errorHandlingService';

// Get the validation service instance
const validationService = ValidationService.getInstance(errorHandlingService);

// Validate data against a Zod schema
const result = await validationService.validate(schema, data);

if (result.success) {
  // Use the validated data
  const validatedData = result.data;
} else {
  // Handle validation errors
  const errors = result.errors;
}
```

#### Sanitization Methods

The validation service provides several methods for sanitizing different types of data:

```typescript
// Sanitize HTML content
const sanitizedHtml = validationService.sanitizeHtml(html, options);

// Escape HTML content
const escapedHtml = validationService.escapeHtml(text);

// Sanitize SQL input
const sanitizedSql = validationService.sanitizeSql(input);

// Sanitize file path
const sanitizedPath = validationService.sanitizeFilePath(path);

// Sanitize email address
const sanitizedEmail = validationService.sanitizeEmail(email);

// Sanitize phone number
const sanitizedPhone = validationService.sanitizePhone(phone);

// Sanitize URL
const sanitizedUrl = validationService.sanitizeUrl(url);

// Sanitize object keys to prevent prototype pollution
const sanitizedObject = validationService.sanitizeObjectKeys(obj);
```

### Validation Middleware

The validation middleware provides a way to validate and sanitize incoming requests.

#### Basic Usage

```typescript
import { createValidationMiddleware } from '../middleware/validationMiddleware';
import { ValidationService } from '../services/validationService';
import { ErrorHandlingService } from '../services/errorHandlingService';

// Get the services
const validationService = ValidationService.getInstance(errorHandlingService);

// Create the middleware with default configuration
const validationMiddleware = createValidationMiddleware(
  validationService,
  errorHandlingService
);

// Use the middleware in your Express app
app.use(validationMiddleware);
```

#### Custom Configuration

You can customize the validation middleware with various options:

```typescript
const customValidationMiddleware = createValidationMiddleware(
  validationService,
  errorHandlingService,
  {
    sanitizeBody: true,
    sanitizeQuery: true,
    sanitizeParams: true,
    sanitizeHeaders: false,
    validate: async (req) => {
      // Custom validation logic
      return true;
    },
    errorMessage: 'Custom validation error message',
    stripUnknown: true,
    abortEarly: false,
    cache: true
  }
);

app.use('/api', customValidationMiddleware);
```

### Schema Validation

The validation service can validate data against JSON schemas:

```typescript
// Validate data against a JSON schema
const result = await validationService.validateAgainstSchema(data, schema, {
  stripUnknown: true,
  abortEarly: false
});

if (result.isValid) {
  // Use the validated data
  const validatedData = result.data;
} else {
  // Handle validation errors
  const errors = result.errors;
}
```

## Security Considerations

### Input Validation
1. Always validate user input, even if it comes from trusted sources
2. Validate both request body and query parameters
3. Use schema validation for complex data structures

### Data Sanitization
1. Always sanitize data before sending it to the client
2. Use appropriate sanitization methods for different data types
3. Consider the context where the data will be used

### Attack Prevention
1. Use HTML escaping to prevent XSS attacks
2. Use parameterized queries to prevent SQL injection
3. Sanitize file paths to prevent directory traversal attacks
4. Sanitize object keys to prevent prototype pollution

## Performance Optimization

### Caching
1. Enable caching for frequently used validation rules
2. Use Redis for distributed caching in multi-server environments
3. Monitor cache hit rates and adjust cache settings

### Validation Rules
1. Use simple validation rules for frequently accessed endpoints
2. Consider using different validation rules for different environments
3. Profile validation performance and optimize as needed

## Testing

The validation system includes comprehensive tests for both the service and middleware. Run the tests using:

```bash
npm test
```

## Troubleshooting

### Common Issues
1. Validation Errors
   - Check the validation rules
   - Verify the data format
   - Check for missing required fields

2. Sanitization Issues
   - Check the sanitization options
   - Verify the data type
   - Check for unexpected data formats

3. Performance Issues
   - Check cache settings
   - Monitor validation performance
   - Consider optimizing validation rules

### Debugging

Enable debug logging to see detailed validation information:

```typescript
// Set the log level to debug
logger.level = 'debug';
``` 