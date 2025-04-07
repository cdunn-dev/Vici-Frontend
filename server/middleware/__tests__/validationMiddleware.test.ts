import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../../services/validationService';
import { ErrorHandlingService } from '../../services/errorHandlingService';
import { createValidationMiddleware, createSchemaValidationMiddleware } from '../validationMiddleware';

// Mock the services
jest.mock('../../services/validationService');
jest.mock('../../services/errorHandlingService');
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Extend the Request type to include our custom properties
interface CustomRequest extends Request {
  id?: string;
  user?: {
    id: string;
  };
}

describe('Validation Middleware', () => {
  let mockValidationService: jest.Mocked<ValidationService>;
  let mockErrorHandlingService: jest.Mocked<ErrorHandlingService>;
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock services
    mockValidationService = {
      getInstance: jest.fn(),
      sanitizeData: jest.fn().mockImplementation(data => data),
      getCachedValidation: jest.fn().mockResolvedValue(null),
      cacheValidationResult: jest.fn().mockResolvedValue(undefined),
      validateAgainstSchema: jest.fn().mockResolvedValue({ isValid: true, data: {} }),
      validate: jest.fn().mockResolvedValue({ success: true, data: {} }),
      validateRequest: jest.fn().mockResolvedValue({ success: true, data: {} }),
      sanitizeHtml: jest.fn().mockReturnValue(''),
      escapeHtml: jest.fn().mockReturnValue(''),
      sanitizeSql: jest.fn().mockReturnValue(''),
      sanitizeFilePath: jest.fn().mockReturnValue(''),
      sanitizeEmail: jest.fn().mockReturnValue(''),
      sanitizePhone: jest.fn().mockReturnValue(''),
      sanitizeUrl: jest.fn().mockReturnValue(''),
      sanitizeObjectKeys: jest.fn().mockReturnValue({}),
      getSchema: jest.fn().mockReturnValue({} as any),
      initRedis: jest.fn(),
      jsonSchemaToZod: jest.fn().mockReturnValue({} as any)
    } as unknown as jest.Mocked<ValidationService>;

    mockErrorHandlingService = {
      handleError: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<ErrorHandlingService>;

    // Setup mock request and response
    mockRequest = {
      body: { test: 'data' },
      query: { param: 'value' },
      params: { id: '123' },
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      path: '/api/test',
      id: 'req-123',
      user: { id: 'user-123' }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('createValidationMiddleware', () => {
    it('should call next() when validation passes', async () => {
      // Arrange
      const middleware = createValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockValidationService.sanitizeData).toHaveBeenCalledTimes(3); // body, query, params
    });

    it('should return 400 when validation fails', async () => {
      // Arrange
      const middleware = createValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService,
        {
          validate: jest.fn().mockResolvedValue(false)
        }
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR'
        }
      });
    });

    it('should use cached validation result when available', async () => {
      // Arrange
      mockValidationService.getCachedValidation.mockResolvedValue(true);
      
      const middleware = createValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockValidationService.sanitizeData).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      // Arrange
      const error = new Error('Test error');
      mockValidationService.sanitizeData.mockImplementation(() => {
        throw error;
      });
      
      const middleware = createValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockErrorHandlingService.handleError).toHaveBeenCalledWith(error, {
        source: 'validationMiddleware',
        requestId: 'req-123',
        userId: 'user-123'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });

  describe('createSchemaValidationMiddleware', () => {
    it('should call next() when schema validation passes', async () => {
      // Arrange
      const schema = { type: 'object', properties: {} };
      const middleware = createSchemaValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService,
        schema
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockValidationService.validateAgainstSchema).toHaveBeenCalledWith(
        mockRequest.body,
        schema,
        { stripUnknown: true, abortEarly: false }
      );
    });

    it('should return 400 when schema validation fails', async () => {
      // Arrange
      const schema = { type: 'object', properties: {} };
      mockValidationService.validateAgainstSchema.mockResolvedValue({
        isValid: false,
        errors: [{ message: 'Invalid data' }]
      });
      
      const middleware = createSchemaValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService,
        schema
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Schema validation failed',
          code: 'SCHEMA_VALIDATION_ERROR',
          details: [{ message: 'Invalid data' }]
        }
      });
    });

    it('should use cached validation result when available', async () => {
      // Arrange
      const schema = { type: 'object', properties: {} };
      mockValidationService.getCachedValidation.mockResolvedValue(true);
      
      const middleware = createSchemaValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService,
        schema
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockValidationService.validateAgainstSchema).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      // Arrange
      const schema = { type: 'object', properties: {} };
      const error = new Error('Test error');
      mockValidationService.validateAgainstSchema.mockRejectedValue(error);
      
      const middleware = createSchemaValidationMiddleware(
        mockValidationService,
        mockErrorHandlingService,
        schema
      );

      // Act
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockErrorHandlingService.handleError).toHaveBeenCalledWith(error, {
        source: 'schemaValidationMiddleware',
        requestId: 'req-123',
        userId: 'user-123'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Schema validation error',
          code: 'SCHEMA_VALIDATION_ERROR'
        }
      });
    });
  });
}); 