# Obscured License Plate Complaints Visualized

==== THIS APP IS STILL IN DEVELOPMENT ====

View app here: https://tolls-lol.surge.sh/

This React application uses Mapbox to visualize 2024's 311 complaints about obscured license plates in New York City. It fetches data daily through an AWS Lambda function, which saves a JSON file to an S3 bucket. This data is then accessed by the app for display, ensuring the most recent complaints are visualized on the map.

## Background

Obscuring motor vehicle licenses plate is illegal in New York City. Those with obscured plates cost New York state money in lost toll revenue and removes the incentive not to speed where red light cameras are in operation. Obscured plates also hinder the ability of law enforcement to investigate crimes. Citizens may make 311 complaints [online](https://portal.311.nyc.gov/sr-step/?id=85c1a239-345a-ef11-b4ac-000d3ae68e09&stepid=8f39d3a3-cd7f-e811-a83f-000d3a33b3a3) or by phone to report an obscured plate.

## Features

- Interactive Mapbox map to visualize complaints.
- Nightly fetches data from the City of New York's Open Data API.
- Fetching data using AWS Lambda and S3 for storage.
- Customizable markers based on the resolution of complaints.
- Popup details for each complaint.

## Data Fetching and Storage
### AWS Lambda and EventBridge
To ensure data freshness, an AWS Lambda function fetches data from the City of New York's Open Data API every night. This Lambda function is scheduled with EventBridge to run at 3:00 am EST daily, retrieving up-to-date complaint data.

### S3 JSON Storage
The Lambda function saves the fetched data as obscured-license-plate-complaints.json in an S3 bucket. The app then retrieves this JSON file when loading the map, ensuring the latest data is always available. S3 permissions are configured to allow public read access to this file.

## Getting Started

Follow the instructions below to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18.19.0 or higher)
- npm (v6.14.8 or higher) or yarn (v1.22.10 or higher)
- A Mapbox account and access token (sign up at [Mapbox](https://www.mapbox.com/signup/))

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/license-plate-obscured-visualizer.git
   cd license-plate-obscured-visualizer
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root of the project and add your Mapbox access token:

   ```env
   VITE_REACT_APP_MAPBOX_TOKEN=your_mapbox_access_token
   ```

4. **Start the development server:**

   Using npm:

   ```bash
   npm run dev
   ```

   Or using yarn:

   ```bash
   yarn dev
   ```

   The application will be available at `http://localhost:5173/`.

## Usage

Once the application is running, you can interact with the map to view complaints about obscured license plates. Click on a circle to view detailed information about the complaint, including the incident address, the time the complaint was created and closed, and the resolution of the complaint.

## Project Structure

- `src/App.tsx`: Main application component.
- `src/Sidebar.tsx`: Component for controlling the visibility of complaint resolutions.
- `src/types.ts`: Type definitions for the project.
- `src/resolutionLabelColorArray.ts`: Array of resolution descriptions and their associated colors.

## Data Update Mechanism
The application relies on the nightly refreshed JSON data stored in S3 by AWS Lambda. This setup ensures that only the most recent data is retrieved and displayed, reducing the number of direct API calls and improving performance.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Mapbox](https://www.mapbox.com/) for the interactive map.
- [City of New York Open Data](https://opendata.cityofnewyork.us/) for the complaint data.
- [Personalized Vanity Plate Generator] https://platesmania.com/us/informer
