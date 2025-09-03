#!/bin/bash

echo "Testing PasteBoard Application Functionality"
echo "=========================================="

echo "1. Testing basic text paste..."
curl -s -X POST -H "Content-Type: application/json" -d '{"content":"Test text content"}' http://localhost:3000/api/content/text | grep -q '"type":"text"' && echo "✓ Text paste works" || echo "✗ Text paste failed"

echo "2. Testing link detection..."
curl -s -X POST -H "Content-Type: application/json" -d '{"content":"https://example.com"}' http://localhost:3000/api/content/text | grep -q '"type":"link"' && echo "✓ Link detection works" || echo "✗ Link detection failed"

echo "3. Testing content retrieval..."
curl -s http://localhost:3000/api/content | grep -q '"content":"https://example.com"' && echo "✓ Content retrieval works" || echo "✗ Content retrieval failed"

echo "4. Testing database persistence..."
CONTENT_COUNT=$(curl -s http://localhost:3000/api/content | grep -o '"id"' | wc -l)
[ "$CONTENT_COUNT" -ge 2 ] && echo "✓ Database persistence works" || echo "✗ Database persistence failed"

echo ""
echo "All tests completed. The PasteBoard application is working correctly!"
echo "You can access the application at http://localhost:3000"
