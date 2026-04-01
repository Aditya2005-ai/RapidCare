# RapidCare

Welcome to the RapidCare project! RapidCare is a responsive web application designed to provide quick and efficient healthcare solutions at your fingertips.

## Key Features
- **Patient Management**: Streamlined patient management for healthcare providers.
- **Appointment Booking**: Easy scheduling and management of appointments.
- **Telemedicine Support**: Facilitate remote consultations through video conferencing.

## Tech Stack
- **Frontend**: React, HTML, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Additional Tools**: Docker, Jest for testing.

## Getting Started
To get started with the RapidCare project, follow these steps:

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Aditya2005-ai/RapidCare.git
   cd RapidCare
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
To run the application locally:
```bash
npm start
```

### Building for Production
To build the application for production:
```bash
npm run build
```

## Environment Variables
Make sure to set the following environment variables in your `.env` file:
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API Key.

## Project Structure
The source code is organized as follows:
```
/RapidCare
|-- /rapidcare       # Main application folder
|-- .env             # Environment variables
|-- README.md        # Project documentation
|-- package.json     # Dependencies and scripts
```

## Security Notes
- **Node Modules**: Do not commit the `node_modules` folder to the repository. Instead, use `.gitignore` to exclude it.
- **API Keys**: Never hardcode your API keys in the source code. Always use environment variables to store them securely.

## Contribution
We welcome contributions! Please fork the repository and submit a pull request. Make sure to follow the code of conduct and contribution guidelines.

## License
This project is licensed under the MIT License. See the LICENSE file for more information.