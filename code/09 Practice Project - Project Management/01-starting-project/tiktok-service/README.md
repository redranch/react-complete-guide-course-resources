# TikTok Service

This is a Java-based backend service that provides API endpoints for:
1. Resolving TikTok share URLs to extract metadata
2. Downloading TikTok videos
3. Processing lists of TikTok favorites from text files

## Features

- **URL Resolution**: Follows redirects to extract creator usernames and video IDs
- **Metadata Extraction**: Parses TikTok pages to extract titles, descriptions, hashtags
- **Video Download**: Attempts to download TikTok videos where possible
- **Bulk Processing**: Processes text files containing multiple TikTok entries

## Prerequisites

- Java 11 or higher
- Maven 3.6 or higher

## Building the Service

```bash
cd tiktok-service
mvn clean package
```

This will create a JAR file in the `target` directory.

## Running the Service

```bash
java -jar target/tiktok-service-1.0-SNAPSHOT.jar
```

The service will start on port 8080 by default.

## API Endpoints

### Health Check

```
GET /api/tiktok/health
```

### Resolve TikTok URL

```
POST /api/tiktok/resolve
Content-Type: application/json

{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

### Download TikTok Video

```
POST /api/tiktok/download
Content-Type: application/json

{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

### Process TikTok List

```
POST /api/tiktok/process-list
Content-Type: multipart/form-data

file: [text file with TikTok entries]
```

### Get Video File

```
GET /api/tiktok/video/{filename}
```

## Limitations

- TikTok actively prevents scraping and downloading of their content.
- This service is for educational purposes and personal use only.
- The methods used to extract video URLs may stop working as TikTok updates their site.
- Use of this service may violate TikTok's Terms of Service.

## Integration with Frontend

This service is designed to be integrated with a React frontend application. To connect them:

1. Ensure the React app is running on port 3002 (configured in CORS settings)
2. Make API calls from the React app to this service
3. Handle the responses to display metadata and video links

## License

This project is intended for educational purposes only. 