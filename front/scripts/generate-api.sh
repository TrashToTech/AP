#!/bin/bash

set -e  # 스크립트 중간에 실패하면 즉시 종료

SWAGGER_URL="http://localhost:8080/v3/api-docs"
SWAGGER_PATH="./lib/backend/type/swagger.json"

echo "📥 Downloading Swagger JSON from $SWAGGER_URL ..."

# -f : 실패 시 exit 22
# -s : silent
# -S : error 시 메시지 출력
if ! curl -f -s -S "$SWAGGER_URL" > "$SWAGGER_PATH"; then
  echo "❌ Failed to download swagger.json"
  exit 1
fi

echo "📄 Saved to $SWAGGER_PATH"

echo "🔧 Generating orval types..."
npx orval

echo "✅ Done!"