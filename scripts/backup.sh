#!/bin/sh
set -e

BACKUP_DIR="/opt/moodpulse/backups"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"

echo "Starting backup..."
docker compose -f /opt/moodpulse/docker-compose.yml exec -T postgres \
    pg_dump -U "${POSTGRES_USER:-moodpulse}" "${POSTGRES_DB:-moodpulse}" \
    | gzip > "$BACKUP_DIR/moodpulse_${DATE}.sql.gz"

echo "Backup saved to $BACKUP_DIR/moodpulse_${DATE}.sql.gz"

echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "moodpulse_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup complete."
