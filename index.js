const fs = require('fs');
const path = require('path');
const { startRouteService } = require('./src/route.service.js');

const getDataPathFromArgv = () => {
  if (process.argv) {
    let cliInputFile = process.argv.find((argv) => /\-\-(file)\=/gi.test(argv));
    let inputFile = null;

    if (cliInputFile) {
      inputFile = (cliInputFile.split(/\=/g)[1] || '').trim();
    }

    return path.join(__dirname, 'data', inputFile);
  }
};

const renderLineBreak = () => {
  console.log('----------------------------------------------');
}

const renderResult = (res) => {
  const { timeUse, stops, routePlan } = res;
  const { origin, destination } = res.targetStations;

  const stopsList = routePlan.map((stop) => {
    if (stop === 'start') {
      return origin;
    }
    if (stop === 'finish') {
      return destination;
    }
    return stop;
  });

  console.log(`Your trip from ${origin} to ${destination} includes ${stops} stop(s) and will take ${timeUse} minute(s).`);
  if (routePlan.length) {
    console.log(`Route plan: ${stopsList.join(' -> ')}`);
  }
};


// Only start app when route data file exists
const routeDataPath = getDataPathFromArgv();

if (routeDataPath && fs.existsSync(routeDataPath)) {
  const routeData = fs.readFileSync(routeDataPath, { encoding: 'utf8' });
  if (routeData) {
    const routeRecords = routeData.split(/\r\n/gi);

    startRouteService(routeRecords).then((res) => {
      renderLineBreak();
      renderResult(res);
    }, (err) => {
      renderLineBreak();
      console.log(err);
    }).finally(() => {
      renderLineBreak();
      process.exit(0);
    });
  }
} else {
  console.log(`No route data found in "/data" directory with specified filename: "${routeDataPath}"`);
  process.exit(0);
}
