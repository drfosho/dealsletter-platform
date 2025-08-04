#!/bin/bash

# Ensure port 3000 is available for Next.js development

PORT=3000

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Port $PORT is in use. Killing the process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 1
    echo "Port $PORT is now free."
else
    echo "Port $PORT is available."
fi

# Start Next.js dev server
echo "Starting Next.js development server on port $PORT..."
exec npm run dev