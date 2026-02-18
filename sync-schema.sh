#!/bin/bash
# Sync Prisma schema from app/ (master) to staff-bo/
# Run this script whenever you modify app/prisma/schema.prisma

set -e

echo "📋 Copying schema from app/prisma/ → staff-bo/prisma/..."
cp app/prisma/schema.prisma staff-bo/prisma/schema.prisma

echo "⚙️  Generating Prisma client for app..."
cd app && npx prisma generate
cd ..

echo "⚙️  Generating Prisma client for staff-bo..."
cd staff-bo && npx prisma generate
cd ..

echo "✅ Schema synced and Prisma clients generated successfully!"
