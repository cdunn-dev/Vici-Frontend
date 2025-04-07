# Data Validation and Sanitization Guide

## Overview

The validation system provides a comprehensive solution for validating and sanitizing data in your application. It includes:

- Input validation for all API endpoints
- Output encoding for sensitive data
- Parameterized queries for database operations
- Schema validation for JSON payloads

## Validation Service

The `ValidationService` is a singleton service that provides methods for validating and sanitizing data.

### Basic Usage

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

### Sanitizing Data

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

### Validating Against JSON Schemas

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

## Validation Middleware

The validation middleware provides a way to validate and sanitize incoming requests.

### Basic Usage

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

### Custom Configuration

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

### Schema Validation Middleware

The schema validation middleware validates request data against a JSON schema:

```typescript
import { createSchemaValidationMiddleware } from '../middleware/validationMiddleware';
import { ValidationService } from '../services/validationService';
import { ErrorHandlingService } from '../services/errorHandlingService';

// Get the services
const validationService = ValidationService.getInstance(errorHandlingService);

// Define a JSON schema
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0 }
  },
  required: ['name', 'email']
};

// Create the middleware
const schemaValidationMiddleware = createSchemaValidationMiddleware(
  validationService,
  errorHandlingService,
  schema
);

// Use the middleware in your Express app
app.use('/api/users', schemaValidationMiddleware);
```

## Best Practices

### Input Validation

1. **Validate All Input**
   - Always validate user input, even if it comes from trusted sources
   - Validate both request body and query parameters
   - Use schema validation for complex data structures

2. **Use Appropriate Validation Rules**
   - Use strict validation rules for sensitive operations
   - Consider using different validation rules for different user roles
   - Validate data types, ranges, and formats

3. **Handle Validation Errors Gracefully**
   - Return clear error messages
   - Include validation error details in the response
   - Log validation errors for debugging

### Data Sanitization

1. **Sanitize All Output**
   - Always sanitize data before sending it to the client
   - Use appropriate sanitization methods for different data types
   - Consider the context where the data will be used

2. **Prevent Common Attacks**
   - Use HTML escaping to prevent XSS attacks
   - Use parameterized queries to prevent SQL injection
   - Sanitize file paths to prevent directory traversal attacks
   - Sanitize object keys to prevent prototype pollution

3. **Use Whitelisting Instead of Blacklisting**
   - Define allowed values instead of blocking specific values
   - Use strict validation rules
   - Consider using a security library for complex sanitization

### Performance Considerations

1. **Cache Validation Results**
   - Enable caching for frequently used validation rules
   - Use Redis for distributed caching in multi-server environments
   - Monitor cache hit rates and adjust cache settings

2. **Optimize Validation Rules**
   - Use simple validation rules for frequently accessed endpoints
   - Consider using different validation rules for different environments
   - Profile validation performance and optimize as needed

## Testing

The validation system includes comprehensive tests for both the service and middleware. Run the tests using:

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Validation Errors**
   - Check the validation rules
   - Verify the data format
   - Check for missing required fields

2. **Sanitization Issues**
   - Check the sanitization options
   - Verify the data type
   - Check for unexpected data formats

3. **Performance Issues**
   - Check cache settings
   - Monitor validation performance
   - Consider optimizing validation rules

### Debugging

Enable debug logging to see detailed validation information:

```typescript
// Set the log level to debug
logger.level = 'debug';
```

## Contributing

When contributing to the validation system:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Consider backward compatibility
5. Test with different data types and formats 