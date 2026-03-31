#!/bin/bash

BASE_DIR="images/collections"
mkdir -p "$BASE_DIR"/kollektionen-2016 "$BASE_DIR"/kollektionen-2015 "$BASE_DIR"/kollektionen-2017
mkdir -p "$BASE_DIR"/memoire-2014 "$BASE_DIR"/signs-of-love "$BASE_DIR"/platin-plus-titan
mkdir -p "$BASE_DIR"/steel-gold-brilliant "$BASE_DIR"/titan-evolution-brilliant
mkdir -p "$BASE_DIR"/vulcano "$BASE_DIR"/trauringe-2007 "$BASE_DIR"/white-style

# Limit downloads
MAX_DOWNLOADS=300
COUNT=0

echo "Fetching image list from Gist..."
URLS=$(curl -sL "https://gist.githubusercontent.com/Outline8684/d54cd104542d2d274a3f965b267fb0ad/raw" | grep -oE 'http://juwelier-glamour\.de/wp-content/gallery/[^\"]+' | sort -u | head -$MAX_DOWNLOADS)

echo "Found $(echo "$URLS" | wc -l) images to download"

for URL in $URLS; do
    COUNT=$((COUNT + 1))
    
    # Skip thumbs for main download (we'll get them separately if needed)
    if echo "$URL" | grep -q "/thumbs/thumbs_"; then
        continue
    fi
    
    # Determine target directory
    if echo "$URL" | grep -q "kollektionen-2016"; then
        DIR="$BASE_DIR/kollektionen-2016"
    elif echo "$URL" | grep -q "kollektionen-2015"; then
        DIR="$BASE_DIR/kollektionen-2015"
    elif echo "$URL" | grep -q "kollektionen-2017"; then
        DIR="$BASE_DIR/kollektionen-2017"
    elif echo "$URL" | grep -q "memoire-2014"; then
        DIR="$BASE_DIR/memoire-2014"
    elif echo "$URL" | grep -q "signs-of-love"; then
        DIR="$BASE_DIR/signs-of-love"
    elif echo "$URL" | grep -q "platin-plus-titan"; then
        DIR="$BASE_DIR/platin-plus-titan"
    elif echo "$URL" | grep -q "steel-gold-brilliant"; then
        DIR="$BASE_DIR/steel-gold-brilliant"
    elif echo "$URL" | grep -q "titan-evolution-brilliant"; then
        DIR="$BASE_DIR/titan-evolution-brilliant"
    elif echo "$URL" | grep -q "vulcano"; then
        DIR="$BASE_DIR/vulcano"
    elif echo "$URL" | grep -q "trauringe-2007"; then
        DIR="$BASE_DIR/trauringe-2007"
    elif echo "$URL" | grep -q "white-style"; then
        DIR="$BASE_DIR/white-style"
    else
        continue
    fi
    
    # Extract and clean filename
    FILENAME=$(basename "$URL" | sed 's/%25//g' | sed 's/%20/-/g' | sed 's/%2B/-/g')
    
    # Download if doesn't exist
    if [ ! -f "$DIR/$FILENAME" ]; then
        if curl -sL -o "$DIR/$FILENAME" "$URL" 2>/dev/null; then
            echo "[$COUNT] Downloaded: $FILENAME"
        else
            echo "[$COUNT] Failed: $URL" >&2
        fi
    fi
    
    # Show progress
    if [ $((COUNT % 50)) -eq 0 ]; then
        echo "--- Progress: $COUNT images processed ---"
    fi
done

echo "Done! Downloaded $COUNT images."
