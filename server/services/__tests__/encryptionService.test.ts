import { EncryptionService } from '../encryptionService';
import { ErrorHandlingService } from '../errorHandlingService';
import { Server } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('../errorHandlingService');
jest.mock('fs');
jest.mock('https', () => ({
  createServer: jest.fn(),
  Server: jest.fn()
}));

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  let errorHandlingService: jest.Mocked<ErrorHandlingService>;
  const mockCert = 'mock-cert';
  const mockKey = 'mock-key';
  const mockCa = 'mock-ca';

  beforeEach(() => {
    jest.clearAllMocks();
    errorHandlingService = {
      handleError: jest.fn()
    } as unknown as jest.Mocked<ErrorHandlingService>;
    encryptionService = EncryptionService.getInstance(errorHandlingService);
    (readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('cert')) return mockCert;
      if (path.includes('key')) return mockKey;
      if (path.includes('ca')) return mockCa;
      return '';
    });
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = EncryptionService.getInstance(errorHandlingService);
      const instance2 = EncryptionService.getInstance(errorHandlingService);
      expect(instance1).toBe(instance2);
    });
  });

  describe('loadCertificate', () => {
    it('should load a certificate successfully', async () => {
      const config = {
        certPath: '/path/to/cert.pem',
        keyPath: '/path/to/key.pem',
        caPath: '/path/to/ca.pem'
      };

      await encryptionService.loadCertificate('test', config);

      expect(readFileSync).toHaveBeenCalledWith(config.certPath);
      expect(readFileSync).toHaveBeenCalledWith(config.keyPath);
      expect(readFileSync).toHaveBeenCalledWith(config.caPath);
    });

    it('should handle errors when loading certificate', async () => {
      const error = new Error('Failed to read file');
      (readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      const config = {
        certPath: '/path/to/cert.pem',
        keyPath: '/path/to/key.pem'
      };

      await expect(encryptionService.loadCertificate('test', config)).rejects.toThrow(error);
      expect(errorHandlingService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });

  describe('createSecureServer', () => {
    it('should create a secure server with correct options', () => {
      const mockServer = {} as Server;
      const { createServer } = require('https');
      (createServer as jest.Mock).mockReturnValue(mockServer);

      const config = {
        certPath: '/path/to/cert.pem',
        keyPath: '/path/to/key.pem'
      };

      encryptionService.loadCertificate('test', config);
      const app = {};
      const server = encryptionService.createSecureServer('test', app);

      expect(server).toBeDefined();
      expect(createServer).toHaveBeenCalledWith(expect.objectContaining({
        cert: mockCert,
        key: mockKey,
        minVersion: 'TLSv1.3',
        maxVersion: 'TLSv1.3'
      }), app);
    });

    it('should throw error if certificate not found', () => {
      expect(() => {
        encryptionService.createSecureServer('nonexistent', {});
      }).toThrow('Certificate nonexistent not found');
    });
  });

  describe('updateTLSConfig', () => {
    it('should update TLS configuration', () => {
      const newConfig = {
        minVersion: 'TLSv1.2' as const,
        maxVersion: 'TLSv1.3' as const
      };

      encryptionService.updateTLSConfig(newConfig);
      const config = encryptionService.getTLSConfig();

      expect(config.minVersion).toBe(newConfig.minVersion);
      expect(config.maxVersion).toBe(newConfig.maxVersion);
    });
  });

  describe('rotateCertificate', () => {
    it('should rotate certificate successfully', async () => {
      const oldConfig = {
        certPath: '/path/to/old/cert.pem',
        keyPath: '/path/to/old/key.pem'
      };

      const newConfig = {
        certPath: '/path/to/new/cert.pem',
        keyPath: '/path/to/new/key.pem'
      };

      await encryptionService.loadCertificate('test', oldConfig);
      await encryptionService.rotateCertificate('test', newConfig);

      expect(readFileSync).toHaveBeenCalledWith(newConfig.certPath);
      expect(readFileSync).toHaveBeenCalledWith(newConfig.keyPath);
    });

    it('should handle errors during certificate rotation', async () => {
      const error = new Error('Failed to rotate certificate');
      (readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      const config = {
        certPath: '/path/to/cert.pem',
        keyPath: '/path/to/key.pem'
      };

      await expect(encryptionService.rotateCertificate('test', config)).rejects.toThrow(error);
      expect(errorHandlingService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });

  describe('verifyConnection', () => {
    it('should verify secure connection successfully', async () => {
      const mockServer = {
        on: jest.fn((event, callback) => {
          if (event === 'secureConnection') {
            callback({
              getPeerCertificate: () => ({
                subject: 'test-subject',
                issuer: 'test-issuer',
                valid_from: '2024-01-01',
                valid_to: '2025-01-01'
              }),
              getProtocol: () => 'TLSv1.3',
              getCipher: () => ({ name: 'TLS_AES_256_GCM_SHA384' })
            });
          }
        })
      } as unknown as Server;

      const result = await encryptionService.verifyConnection(mockServer);
      expect(result).toBe(true);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      const mockServer = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(error);
          }
        })
      } as unknown as Server;

      const result = await encryptionService.verifyConnection(mockServer);
      expect(result).toBe(false);
      expect(errorHandlingService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });
}); 