#!/bin/bash

# Git Commit Helper Script
# Usage: ./scripts/git-commit.sh "commit message"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a commit message${NC}"
    echo "Usage: ./scripts/git-commit.sh \"commit message\""
    exit 1
fi

echo -e "${YELLOW}Checking git status...${NC}"
git status

echo -e "\n${YELLOW}Files to be committed:${NC}"
git status --short

echo -e "\n${YELLOW}Proceed with commit? (y/N)${NC}"
read -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Commit cancelled${NC}"
    exit 1
fi

# Add all changes
git add .

# Commit with message
git commit -m "$1"

echo -e "${GREEN}✓ Commit successful!${NC}"
echo -e "${YELLOW}Commit message: $1${NC}"

# Show recent commits
echo -e "\n${GREEN}Recent commits:${NC}"
git log --oneline -5
