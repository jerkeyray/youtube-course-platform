#!/bin/bash

# Find all API routes that use Clerk and update them
find app/api -type f -name "route.ts" -exec grep -l "@clerk/nextjs/server" {} \; | while read -r file; do
  echo "Updating: $file"
  sed -i '' 's/import { auth } from "@clerk\/nextjs\/server";/import { auth } from "@\/lib\/auth-compat";/g' "$file"
  sed -i '' 's/import { auth, currentUser } from "@clerk\/nextjs\/server";/import { auth, currentUser } from "@\/lib\/auth-compat";/g' "$file"
done

# Find all pages that use Clerk auth and update them
find app/dashboard -type f -name "*.tsx" -exec grep -l "@clerk/nextjs/server" {} \; | while read -r file; do
  echo "Updating: $file"
  sed -i '' 's/import { auth } from "@clerk\/nextjs\/server";/import { auth } from "@\/lib\/auth-compat";/g' "$file"
done

echo "Auth migration complete!"
