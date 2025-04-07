import { config } from 'dotenv';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

// Load environment variables
config();

interface SecretConfig {
  name: string;
  region: string;
  ttl: number;
}

class SecretsService {
  private static instance: SecretsService;
  private secretsManager: SecretsManager;
  private cache: Map<string, { value: string; timestamp: number }>;
  private config: SecretConfig;

  private constructor() {
    this.config = {
      name: process.env.AWS_SECRETS_NAME || 'vici/secrets',
      region: process.env.AWS_REGION || 'us-east-1',
      ttl: parseInt(process.env.SECRETS_CACHE_TTL || '3600000', 10) // 1 hour default
    };

    this.secretsManager = new SecretsManager({
      region: this.config.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });

    this.cache = new Map();
  }

  public static getInstance(): SecretsService {
    if (!SecretsService.instance) {
      SecretsService.instance = new SecretsService();
    }
    return SecretsService.instance;
  }

  /**
   * Get a secret value
   * @param key Secret key
   * @returns Promise<string> Secret value
   */
  public async getSecret(key: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.ttl) {
      return cached.value;
    }

    try {
      const response = await this.secretsManager.getSecretValue({
        SecretId: `${this.config.name}/${key}`
      });

      if (!response.SecretString) {
        throw new Error(`Secret ${key} not found`);
      }

      // Cache the result
      this.cache.set(key, {
        value: response.SecretString,
        timestamp: Date.now()
      });

      return response.SecretString;
    } catch (error) {
      console.error(`Error retrieving secret ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update a secret value
   * @param key Secret key
   * @param value New secret value
   */
  public async updateSecret(key: string, value: string): Promise<void> {
    try {
      await this.secretsManager.updateSecret({
        SecretId: `${this.config.name}/${key}`,
        SecretString: value
      });

      // Update cache
      this.cache.set(key, {
        value,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Error updating secret ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a secret
   * @param key Secret key
   */
  public async deleteSecret(key: string): Promise<void> {
    try {
      await this.secretsManager.deleteSecret({
        SecretId: `${this.config.name}/${key}`,
        ForceDeleteWithoutRecovery: false // Keep recovery window
      });

      // Remove from cache
      this.cache.delete(key);
    } catch (error) {
      console.error(`Error deleting secret ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear the secrets cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const secretsService = SecretsService.getInstance();

// Export environment-specific configurations
export const secretsConfig = {
  development: {
    useAWS: false,
    useDotenv: true,
    cacheEnabled: true,
    cacheTTL: 3600000 // 1 hour
  },
  test: {
    useAWS: false,
    useDotenv: true,
    cacheEnabled: false,
    cacheTTL: 0
  },
  production: {
    useAWS: true,
    useDotenv: false,
    cacheEnabled: true,
    cacheTTL: 3600000 // 1 hour
  }
}; 