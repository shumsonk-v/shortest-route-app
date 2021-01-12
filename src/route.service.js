const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// To find shortest time in the given time cost collection
const findNearestStation = (timeCosts, processed) => {
  return Object.keys(timeCosts).reduce((nearestStation, station) => {
    if ((nearestStation === null || timeCosts[station] < timeCosts[nearestStation]) &&
      !processed.includes(station) &&
      station !== 'start') {
      nearestStation = station;
    }

    return nearestStation;
  }, null);
};

const getShortestPath = (params) => {
  const { graph } = params;

  // Variable to collect processed node name
  const processed = [];

  // 1. Define first node collection at the starting point of graph
  const timeCosts = Object.assign({ finish: Infinity }, graph.start);  

  // 2. Define parents to create tree. First to assign the second-level nodes which is the collection from starting node
  const parents = { finish: null };
  for (const child of Object.keys(graph.start)) {
    parents[child] = 'start';
  }

  // 3. Let's find the very nearest node (station)
  let node = findNearestStation(timeCosts, processed);
  
  // 4. While node is available, this loop will keep finding and accumulating
  // total cost of line of each children. However, there is some case that
  // children is not available before reaching 'finish' station and that means
  // no available route to continue.
  while (node) {
    const cost = timeCosts[node];
    const children = graph[node];

    if (!children) {
      break;
    }

    // When children available, calculate accumulate the cost of each line
    for (const n of Object.keys(children)) {
      const newCost = cost + children[n];

      // If new cost is less than current time cost or time cost at node n in children is not available,
      // assign to time cost collection. Also set parent of node n to current node
      if (!timeCosts[n] || timeCosts[n] > newCost) {
        timeCosts[n] = newCost;
        parents[n] = node;
      }
    }

    processed.push(node);
    node = findNearestStation(timeCosts, processed);
  }

  // 5. Start populating route map start from finishing point.
  // If starting point reached, break out from the loop.
  const optimalPath = ['finish'];
  let parent = parents.finish;

  while (parent) {
    optimalPath.push(parent);
    if (parent === 'start') {
      break;
    }
    parent = parents[parent];
  }

  // 6. Once optimal path populated, reverse it to make a readable map
  optimalPath.reverse();

  // 7. When cost to finishing point is Infinity, that means no valid path
  if (timeCosts.finish === Infinity) {
    const { origin, destination } = params.targetStations;
    return Promise.reject(`No available route between your ${origin} and ${destination}.`);
  }

  return Promise.resolve({
    timeUse: timeCosts.finish,
    stops: optimalPath.length ? optimalPath.length - 2 : 0,
    routePlan: optimalPath,
    targetStations: params.targetStations,
  });
};

const askForOrigin = () => {
  return new Promise((resolve, reject) => {
    rl.question('What status are you getting on the train? (type "exit" to quit) : ', (answer) => {
      if (answer === 'exit') {
        rl.close();
        reject();
        process.exit(0);
      }
  
      resolve(answer);
    });
  });
};

const askFormDestination = (originStation) => {
  return new Promise((resolve, reject) => {
    rl.question('What status are you getting off the train? (type "exit" to quit) : ', (answer) => {
      if (answer === 'exit') {
        rl.close();
        reject();
        process.exit(0);
      }
  
      if (answer !== originStation) {
        resolve({
          origin: originStation,
          destination: answer
        });
        return;
      }

      console.log('You cannot select destination to be same as origin, please try again.');
      reject();
      process.exit(0);
    });
  });  
};

const createRouteGraph = (routeRecords, targetStations) => {
  const originStation = targetStations.origin;
  const destinationStation = targetStations.destination;

  const routeGraph = routeRecords.reduce((map, rec) => {
    const stationInfo = rec.split(/\,/);

    if (stationInfo.length === 3 && !isNaN(+stationInfo[2])) {
      const [origin, destination, time] = stationInfo;
      
      let originPropName = origin;
      if (origin === originStation) {
        originPropName = 'start';
      }
      if (origin === destinationStation) {
        originPropName = 'finish';
      }

      let destPropName = destination;
      if (destination === originStation) {
        destPropName = 'start';
      }
      if (destination === destinationStation) {
        destPropName = 'finish';
      }

      if (!map.hasOwnProperty(originPropName)) {
        map[originPropName] = {};
      }
      if (!map[originPropName].hasOwnProperty(destPropName)) {
        map[originPropName][destPropName] = +time;
      }
      
      // Two blocks below are for generating backward route map purposes to make more sense.
      // i.e. If A -> D from csv data file is assigned, it will generate D -> A with the same cost
      // if it's not already in the csv data file.
      if (!map.hasOwnProperty(destPropName)) {
        map[destPropName] = {};
      }
      if (!map[destPropName].hasOwnProperty(originPropName)) {
        map[destPropName][originPropName] = +time;
      }
    }

    return map;
  }, {});

  return Promise.resolve({
    graph: routeGraph,
    targetStations
  });
}

const processShortestPath = (routeRecords, targetStations) => {
  return createRouteGraph(routeRecords, targetStations).then((res) => getShortestPath(res));
}

const startRouteService = (routeRecords) => {
  return askForOrigin().then((origin) => {
    return askFormDestination(origin);
  }).then((targetStations) => {
    return processShortestPath(routeRecords, targetStations);
  });
};

module.exports = {
  startRouteService,
  processShortestPath,
};
