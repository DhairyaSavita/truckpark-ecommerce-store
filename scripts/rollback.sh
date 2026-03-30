#!/bin/bash

# Database Rollback Script
# Usage: ./scripts/rollback.sh [backup_file]

DB_NAME="truck_parts_db"
DB_USER="savitadhairya"
BACKUP_DIR="./backups"

# List available backups
echo "Available backups:"
ls -lh $BACKUP_DIR/backup_*.sql.gz

if [ -z "$1" ]; then
    echo ""
    echo "Usage: ./scripts/rollback.sh backup_file.sql.gz"
    echo "Example: ./scripts/rollback.sh backup_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace current database with backup!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 1
fi

echo "Restoring database..."
gunzip -c $BACKUP_FILE | psql -U $DB_USER $DB_NAME

echo "Rollback completed successfully!"
