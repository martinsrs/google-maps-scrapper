# google-maps-scrapper

[![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)](https://www.docker.com/)  
[![Node.js](https://img.shields.io/badge/node.js-18.x-green?logo=node.js)](https://nodejs.org/)  
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A Google Maps data scrapper that runs via Docker and is accessible via the browser on `localhost:3000`. It allows you to fetch business information based on a search term directly from Google Maps.

## 🚀 Features

- Run with Docker
- Accessible via browser (localhost)
- Accepts search criteria via URL parameter
- Returns structured JSON with business data

## 🔧 How It Works

Once the application is running, open your browser and go to:

```
http://localhost:3000/?term=your+search+term
```

Replace `your+search+term` with your actual query, such as:

```
http://localhost:3000/?term=energia+solar+em+osorio
```

The app will return a JSON with the results scraped from Google Maps.

### 📦 Example Output

```json
{
  "term": "Search term",
  "results": [
    {
      "name": "Company Name",
      "website": "http://www.companywebsite.com.br/",
      "address": "full address",
      "phone": "(99) 3132-4444",
      "summary": "Summary text from google maps"
    }
  ]
}
```

## 🐳 Running with Docker

```bash
git clone https://github.com/your-username/google-maps-scrapper.git
cd google-maps-scrapper
docker build -t google-maps-scrapper .
docker run -p 3000:3000 google-maps-scrapper
```

Once running, open [http://localhost:3000/?term=energia+solar+em+osorio](http://localhost:3000/?term=energia+solar+em+osorio) in your browser.

## 📄 License

This project is licensed under the [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0).
