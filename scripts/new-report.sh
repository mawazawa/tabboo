#!/bin/bash

# scripts/new-report.sh
# Creates a new dated report file in the docs/reports directory

# Ensure directory exists
YEAR=$(date +"%Y")
MONTH=$(date +"%m")
DIR="docs/reports/$YEAR/$MONTH"
mkdir -p "$DIR"

# Generate filename
TIMESTAMP=$(date +"%Y%m%d")
if [ -z "$1" ]; then
  echo "Usage: npm run new-report <report-name-kebab-case>"
  exit 1
fi

FILENAME="${DIR}/${TIMESTAMP}_${1}.md"

# Create file with template
cat > "$FILENAME" <<EOL
# Report: $(echo "$1" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($0,i,1)),$i)}1')

**Date**: $(date +"%B %d, %Y")
**Author**: Claude Code
**Status**: Draft

## Overview

## Findings

## Recommendations

EOL

echo "Created new report: $FILENAME"

