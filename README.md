# ServiceNow ERD Viewer

A web-based Entity Relationship Diagram (ERD) viewer for ServiceNow database schemas. Upload your schema JSON file and visualize table relationships with multiple layout options.

## Features

- Upload and parse ServiceNow schema JSON files
- Multiple layout algorithms (grid, hierarchical, organic, circular, etc.)
- Interactive table filtering
- Toggle column details visibility
- Zoom and pan functionality

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
