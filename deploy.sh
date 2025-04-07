#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default environment to development if not set
ENVIRONMENT=${NODE_ENV:-development}

# Print deployment info
echo "Deploying Vici to $ENVIRONMENT environment"
echo "----------------------------------------"

# Check required environment variables
required_vars=(
  "DATABASE_URL"
  "REDIS_URL"
  "PORT"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run linting
echo "Running linter..."
npm run lint

# Run tests
echo "Running tests..."
npm test

# Build the application
echo "Building application..."
npm run build

# Database migrations
echo "Running database migrations..."
npm run migrate

# Clear Redis cache
echo "Clearing Redis cache..."
redis-cli -u "$REDIS_URL" FLUSHALL

# Start/Restart services
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Restarting PM2 processes..."
  pm2 reload ecosystem.config.js --env production
else
  echo "Starting development server..."
  npm run dev
fi

# Set up logging
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Setting up log aggregation..."
  
  # Create logs directory if it doesn't exist
  mkdir -p logs

  # Configure log rotation
  cat > /etc/logrotate.d/vici << EOF
/var/log/vici/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 644 root root
}
EOF

  # Start Filebeat if installed
  if command -v filebeat &> /dev/null; then
    echo "Starting Filebeat..."
    sudo service filebeat restart
  fi
fi

# Health check
echo "Performing health check..."
for i in {1..30}; do
  if curl -s "http://localhost:${PORT}/health" > /dev/null; then
    echo "Application is healthy!"
    exit 0
  fi
  echo "Waiting for application to start... ($i/30)"
  sleep 1
done

echo "Error: Application failed to start"
exit 1 