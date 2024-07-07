# Obscured License Plate Complaints Visualized

Visualizing New York City's complaint data for obscured license plates.

---

# License Plate Obscured Complaints Visualizer

This React application uses Mapbox to visualize complaints about obscured license plates in New York City. It fetches data from the City of New York's Open Data API and displays the complaints on an interactive map. The application caches the data to optimize performance, fetching new data only if the cached data is older than 12 hours.

## Features

- Interactive Mapbox map to visualize complaints.
- Fetches data from the City of New York's Open Data API.
- Caches data to minimize unnecessary API calls.
- Customizable markers based on the resolution of complaints.
- Popup details for each complaint.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

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

   The application will be available at `http://localhost:3000`.

## Usage

Once the application is running, you can interact with the map to view complaints about obscured license plates. Click on a marker to view detailed information about the complaint, including the incident address, the time the complaint was created and closed, and the resolution of the complaint.

## Project Structure

- `src/App.tsx`: Main application component.
- `src/ControlPanel.tsx`: Component for controlling the visibility of complaint resolutions.
- `src/types.ts`: Type definitions for the project.
- `src/ResolutionDescriptionsArray.ts`: Array of resolution descriptions and their associated colors.

## Caching Mechanism

The application uses `localStorage` to cache the fetched data. It checks if the data is older than 12 hours before fetching new data. This optimization reduces unnecessary API calls and improves performance.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Mapbox](https://www.mapbox.com/) for the interactive map.
- [City of New York Open Data](https://opendata.cityofnewyork.us/) for the complaint data.

---

By following these steps, other developers can install, run, and contribute to the License Plate Obscured Complaints Visualizer project.
