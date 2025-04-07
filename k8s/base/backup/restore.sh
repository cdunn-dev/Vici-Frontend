#!/bin/bash

# Set variables
BACKUP_DIR="/backup"
BACKUP_FILE=$1
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="vici"
REDIS_HOST="redis"
REDIS_PORT="6379"

if [ -z "$BACKUP_FILE" ]; then
    echo "Please provide the backup file name"
    exit 1
fi

# Extract backup
echo "Extracting backup..."
mkdir -p ${BACKUP_DIR}/restore
tar -xzf ${BACKUP_DIR}/${BACKUP_FILE} -C ${BACKUP_DIR}/restore
RESTORE_DIR=$(ls ${BACKUP_DIR}/restore)

# Restore Elasticsearch indices
echo "Restoring Elasticsearch indices..."
curl -X POST "${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_snapshot/backup/snapshot_${RESTORE_DIR}/_restore?wait_for_completion=true" -H 'Content-Type: application/json' -d '{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'

# Restore PostgreSQL database
echo "Restoring PostgreSQL database..."
PGPASSWORD=${POSTGRES_PASSWORD} pg_restore -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c ${BACKUP_DIR}/restore/${RESTORE_DIR}/postgres_backup.dump

# Restore Redis data
echo "Restoring Redis data..."
cp ${BACKUP_DIR}/restore/${RESTORE_DIR}/redis_backup.rdb /data/redis/dump.rdb
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} DEBUG RELOAD

# Clean up
echo "Cleaning up..."
rm -rf ${BACKUP_DIR}/restore

echo "Restore completed successfully!" 