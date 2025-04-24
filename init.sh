#!/bin/sh

echo "Waiting for backend to be ready..."
until curl --silent http://dash-be:3000/regions/test-connection; do
  sleep 2
done

echo "Backend ready. Adding accounts..."

curl -X POST http://dash-be:3000/accounts -H "Content-Type: application/json" -d '{"token": "32da3b93e50d61c4613e6d53e26e24c540f53ebc0b80dc5c8d57423b353558e5"}'
curl -X POST http://dash-be:3000/accounts -H "Content-Type: application/json" -d '{"token": "1e509cf9ed47f3817cc8d4b07d17131a9e02b50f049fd2b957af90158d4f930c"}'
curl -X POST http://dash-be:3000/accounts -H "Content-Type: application/json" -d '{"token": "b643cc60d45e2b813a47a72a7578e8de8a651c0ee4509a1ece6cce4c9909b54a"}'
curl -X POST http://dash-be:3000/accounts -H "Content-Type: application/json" -d '{"token": "cbd115b16ad458ff3e2dc87038ec1f84ea2fef19a155b5c05acfe4d4673b40bb"}'
curl -X POST http://dash-be:3000/accounts -H "Content-Type: application/json" -d '{"token": "0a5fe0f81598673553e57be2e824031d1b834021e3510df88b3fbb8eb0adae05"}'
curl -X POST http://dash-be:3000/accounts -H "Content-Type: application/json" -d '{"token": "13ca075b3ee76d264c11a500fa5792bc23665a591feb4b4bec45dd10d821bb0a"}'

echo "Accounts added. Syncing regions..."
curl -X POST http://dash-be:3000/regions/sync

echo "Sync complete."
