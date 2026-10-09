#!/bin/bash
# Package the UN Sanctions Screening System project as a .zip file
# Usage: ./scripts/package.sh

set -e

PROJECT_NAME="sanctions-screening"
OUTPUT_DIR="$(pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${OUTPUT_DIR}/${PROJECT_NAME}_${TIMESTAMP}.zip"

echo "📦 Packaging ${PROJECT_NAME}..."
echo ""

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
TEMP_PROJECT="${TEMP_DIR}/${PROJECT_NAME}"
mkdir -p "${TEMP_PROJECT}"

# Copy project files (excluding node_modules, dist, .git, etc.)
echo "📁 Copying files..."
rsync -a \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='coverage' \
  --exclude='.env.local' \
  --exclude='.env.*.local' \
  --exclude='target' \
  --exclude='docker/volumes' \
  ./ "${TEMP_PROJECT}/"

# Create the zip file
echo "🗜️  Creating zip archive..."
cd "${TEMP_DIR}"
zip -r "${OUTPUT_FILE}" "${PROJECT_NAME}" -q

# Cleanup
rm -rf "${TEMP_DIR}"

# Get file size
FILE_SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)

echo ""
echo "✅ Package created successfully!"
echo "📄 File: ${OUTPUT_FILE}"
echo "📏 Size: ${FILE_SIZE}"
echo ""
echo "To extract:"
echo "  unzip ${PROJECT_NAME}_${TIMESTAMP}.zip"
echo "  cd ${PROJECT_NAME}"
echo "  cd frontend && npm install && npm run dev"
