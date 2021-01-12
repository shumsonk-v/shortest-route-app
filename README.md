# Shortest Train Route Finder

CLI application to obtain origin and destination station from command line input and process the shortest route with route map data provided via data file.

## Technology
- Framework: Node.js with Javascript
- Jest - for unit testing

## How to run
- You must have Node.js installed on your machine first
- Clone this project to your local machine
- Open your favorite terminal app.
- Navigate to project directory and run `npm install`
- When package installation complete, run `npm run start` to start the application.

> `npm run start` will run `node ./index.js --file=routes.csv` by default. If you want to specify another file under `/data` directory, you have run it manually i.e. `node ./index.js --file=other_routes.csv`

- Enter the parameters, both origin and destination and you should get the result in your console. Please note that you cannot (and should not) enter the destination the be the same as origin station.

## Testing
Simply run `npm run test` on your console.