# Partner Geofence Tool

A self-service web tool for business partners to draw their property boundary on a satellite map.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Setup

### 1. Create Google Sheet

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

### 2. Set Up Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Copy the contents of `google-apps-script/Code.gs`
4. Replace `YOUR_SPREADSHEET_ID_HERE` with your Sheet ID
5. Run `setupHeaders()` once to create column headers
6. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
7. Copy the deployment URL

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your Google Apps Script URL
```

### 4. Deploy

```bash
npm run build
# Upload dist/ folder to Vercel, Netlify, or any static host
```

## Google Sheet Columns

| Column | Description |
|--------|-------------|
| Business Name | Name of the business |
| Address | Full street address |
| Business Type | Category (daycare, bar, etc.) |
| Contact Email | Optional contact email |
| Center Lat | Latitude of polygon center |
| Center Lng | Longitude of polygon center |
| Position | Format: `(lng,lat)` for Fi database |
| Point Count | Number of polygon vertices |
| Boundary (GeoJSON) | Full GeoJSON polygon |
| Submitted At | ISO timestamp |

## Tech Stack

- React + Vite
- Leaflet (maps)
- Google Apps Script (backend)
- Esri satellite tiles + Carto labels
