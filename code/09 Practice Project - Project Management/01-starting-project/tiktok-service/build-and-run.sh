#!/bin/bash

# Script to build and run the TikTok service

echo "Building TikTok service..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
  echo "Build successful! Starting service..."
  java -jar target/tiktok-service-1.0-SNAPSHOT.jar
else
  echo "Build failed. Please check the errors above."
  exit 1
fi 