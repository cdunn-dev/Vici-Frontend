#!/bin/bash

# Set variables
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="vici"
REDIS_HOST="redis"
REDIS_PORT="6379"

# Create backup directory
mkdir -p ${BACKUP_DIR}/${DATE}

# Backup Elasticsearch indices
echo "Backing up Elasticsearch indices..."
curl -X PUT "${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_snapshot/backup/snapshot_${DATE}?wait_for_completion=true" -H 'Content-Type: application/json' -d '{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F c -f ${BACKUP_DIR}/${DATE}/postgres_backup.dump

# Backup Redis data
echo "Backing up Redis data..."
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} SAVE
cp /data/redis/dump.rdb ${BACKUP_DIR}/${DATE}/redis_backup.rdb

# Compress backup
echo "Compressing backup..."
tar -czf ${BACKUP_DIR}/${DATE}.tar.gz -C ${BACKUP_DIR} ${DATE}

# Clean up
echo "Cleaning up..."
rm -rf ${BACKUP_DIR}/${DATE}

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed successfully!" 