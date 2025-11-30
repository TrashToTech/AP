#!/bin/bash

echo "📥 Downloading Swagger JSON..."
curl -s http://localhost:8080/v3/api-docs > ./lib/backend/type/apiV1.json

echo "🔧 Generating TypeScript types..."
npx openapi-typescript ./lib/backend/type/apiV1.json -o ./lib/backend/type/schema.d.ts

echo "✅ Done!"
