#!/bin/bash

API_URL="http://localhost:3000/accounts"
ACCOUNTS=(
  "dev_aws"
  "dt_az"
  "dt_aws"
  "e2e_az"
  "e2e_aws"
  "dev_az"
  "poc"
  "ychopra-dev-aws"
  "ychopra-dt-az"
  "ychopra-dt-aws"
  "ychopra-e2e-az"
  "ychopra-e2e-aws"
  "ychopra-dev-az"
)

for account in "${ACCOUNTS[@]}"; do
  echo "Deleting account: $account"
  curl -s -X DELETE "$API_URL/$account" -H "Content-Type: application/json"
done

echo "✅ All deletions attempted"
