import { createServer, Server, ServerOptions } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';
import { ErrorHandlingService } from './errorHandlingService';
import { ErrorCategory, ErrorSeverity } from '../types/error';

export interface CertificateConfig {
  certPath: string;
  keyPath: string;
  caPath?: string;
  passphrase?: string;
  cert?: string;
  key?: string;
  ca?: string;
}

export interface TLSConfig {
  minVersion: 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';
  maxVersion: 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';
  ciphers: string;
  honorCipherOrder: boolean;
  requestCert: boolean;
  rejectUnauthorized: boolean;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private errorHandlingService: ErrorHandlingService;
  private certificates: Map<string, CertificateConfig> = new Map();
  private tlsConfig: TLSConfig;

  private constructor(errorHandlingService: ErrorHandlingService) {
    this.errorHandlingService = errorHandlingService;
    this.tlsConfig = {
      minVersion: 'TLSv1.3',
      maxVersion: 'TLSv1.3',
      ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256',
      honorCipherOrder: true,
      requestCert: true,
      rejectUnauthorized: true
    };
  }

  public static getInstance(errorHandlingService: ErrorHandlingService): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService(errorHandlingService);
    }
    return EncryptionService.instance;
  }

  public async loadCertificate(name: string, config: CertificateConfig): Promise<void> {
    try {
      const cert = readFileSync(config.certPath);
      const key = readFileSync(config.keyPath);
      const ca = config.caPath ? readFileSync(config.caPath) : undefined;

      this.certificates.set(name, {
        ...config,
        cert: cert.toString(),
        key: key.toString(),
        ca: ca?.toString()
      });

      logger.info(`Certificate ${name} loaded successfully`);
    } catch (error) {
      await this.errorHandlingService.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        context: {
          operation: 'loadCertificate',
          certificateName: name
        }
      });
      throw error;
    }
  }

  public createSecureServer(name: string, app: any): Server {
    const certConfig = this.certificates.get(name);
    if (!certConfig) {
      throw new Error(`Certificate ${name} not found`);
    }

    const options: ServerOptions = {
      cert: certConfig.cert,
      key: certConfig.key,
      ca: certConfig.ca,
      passphrase: certConfig.passphrase,
      minVersion: this.tlsConfig.minVersion,
      maxVersion: this.tlsConfig.maxVersion,
      ciphers: this.tlsConfig.ciphers,
      honorCipherOrder: this.tlsConfig.honorCipherOrder,
      requestCert: this.tlsConfig.requestCert,
      rejectUnauthorized: this.tlsConfig.rejectUnauthorized
    };

    return createServer(options, app);
  }

  public updateTLSConfig(config: Partial<TLSConfig>): void {
    this.tlsConfig = {
      ...this.tlsConfig,
      ...config
    };
    logger.info('TLS configuration updated', { config: this.tlsConfig });
  }

  public getTLSConfig(): TLSConfig {
    return { ...this.tlsConfig };
  }

  public async rotateCertificate(name: string, newConfig: CertificateConfig): Promise<void> {
    try {
      // Load the new certificate
      await this.loadCertificate(`${name}_new`, newConfig);
      
      // Verify the new certificate
      const testServer = this.createSecureServer(`${name}_new`, () => {});
      testServer.close();

      // Replace the old certificate
      this.certificates.delete(name);
      this.certificates.set(name, this.certificates.get(`${name}_new`)!);
      this.certificates.delete(`${name}_new`);

      logger.info(`Certificate ${name} rotated successfully`);
    } catch (error) {
      await this.errorHandlingService.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        context: {
          operation: 'rotateCertificate',
          certificateName: name
        }
      });
      throw error;
    }
  }

  public async verifyConnection(server: Server): Promise<boolean> {
    return new Promise((resolve) => {
      server.on('secureConnection', (tlsSocket) => {
        const cert = tlsSocket.getPeerCertificate();
        const protocol = tlsSocket.getProtocol();
        const cipher = tlsSocket.getCipher();

        logger.info('Secure connection established', {
          protocol,
          cipher: cipher.name,
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.valid_from,
          validTo: cert.valid_to
        });

        resolve(true);
      });

      server.on('error', async (error) => {
        await this.errorHandlingService.handleError(error as Error, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SYSTEM,
          context: {
            operation: 'verifyConnection'
          }
        });
        resolve(false);
      });
    });
  }
} 