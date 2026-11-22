#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-terraco-a5ff7}"
POLICY_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/artifact-registry-cleanup-policy.json"
REPO_NAME="firebaseapphosting-images"
LOCATIONS=("us-central1" "us-east4")

for LOCATION in "${LOCATIONS[@]}"; do
  echo "Applying Artifact Registry cleanup policy (keepCount: 3) to ${PROJECT_ID}/${LOCATION}/${REPO_NAME}..."
  gcloud artifacts repositories set-cleanup-policies "${REPO_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${LOCATION}" \
    --policy="${POLICY_FILE}" \
    --no-dry-run
done

echo "Done. Verifying cleanup policies:"
gcloud artifacts repositories list \
  --project="${PROJECT_ID}" \
  --format="table(name,cleanupPolicies,cleanupPolicyDryRun)"
