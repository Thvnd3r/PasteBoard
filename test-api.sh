#!/bin/bash
# test-api.sh - PasteBoard API test script
API="http://localhost:3000/api/content"
IMG_PATH="$HOME/Pictures/sample.jpg"

set -e

echo "Deleting all content..."
curl -s -X DELETE $API

echo "Uploading text..."
curl -s -X POST $API/text -H 'Content-Type: application/json' -d '{"content":"Sample text"}'


if [ -f "$IMG_PATH" ]; then
MULTI_FILE_ARGS="-F file=@/bin/ls -F file=@/bin/bash"
if [ -f "$IMG_PATH" ]; then
  MULTI_FILE_ARGS="$MULTI_FILE_ARGS -F file=@$IMG_PATH"
fi
eval curl -s -X POST $MULTI_FILE_ARGS $API/file
  echo "Uploading image..."
  curl -s -X POST -F "file=@$IMG_PATH" $API/file
else
  echo "No sample image found, skipping image upload."
fi

echo "Getting all items..."
curl -s $API

echo "Filtering text items..."
curl -s "$API?type=text"

echo "Deleting first item..."
FIRST_ID=$(curl -s $API | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -n "$FIRST_ID" ]; then
  curl -s -X DELETE "$API/$FIRST_ID"
  echo "Deleted item $FIRST_ID"
else
  echo "No items to delete."
fi

echo "Deleting all content..."
curl -s -X DELETE $API
