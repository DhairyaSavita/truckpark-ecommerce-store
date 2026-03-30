#!/bin/bash

# Git Tagging Script
# Usage: ./scripts/tag-version.sh [version]

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo "Usage: ./scripts/tag-version.sh [version]"
    echo "Example: ./scripts/tag-version.sh v1.0.0"
    exit 1
fi

VERSION=$1

echo -e "${YELLOW}Creating tag: $VERSION${NC}"

# Create tag
git tag -a "$VERSION" -m "Release $VERSION"

# Show tags
echo -e "\n${GREEN}Tags:${NC}"
git tag -l

echo -e "\n${YELLOW}Push tag to remote? (y/N)${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "$VERSION"
    echo -e "${GREEN}✓ Tag pushed to remote${NC}"
fi
