const fs = require('fs');
const path = require('path');
const { processShortestPath } = require('../src/route.service');

describe('Route Service', () => {
  let routeData;
  let routeRecords;

  beforeEach(() => {
    routeData = fs.readFileSync(path.join(__dirname, '../data/routes.csv'), { encoding: 'utf8' });
    routeRecords = routeData.split(/\r\n/gi);
  });

  it('should get correct result if route is valid (A -> B)', () => {
    const targetStations = {
      origin: 'A',
      destination: 'B'
    };

    return processShortestPath(routeRecords, targetStations).then((res) => {
      expect(res.timeUse).toEqual(5);
      expect(res.stops).toEqual(0);
    });
  });

  it('should get correct result if route is valid (A -> C)', () => {
    const targetStations = {
      origin: 'A',
      destination: 'C'
    };

    return processShortestPath(routeRecords, targetStations).then((res) => {
      expect(res.timeUse).toEqual(10);
      expect(res.stops).toEqual(1);
    });
  });

  it('should get correct result if route is valid (E -> J)', () => {
    const targetStations = {
      origin: 'E',
      destination: 'J'
    };

    return processShortestPath(routeRecords, targetStations).then((res) => {
      expect(res.timeUse).toEqual(30);
      expect(res.stops).toEqual(2);
    });
  });

  it('should get correct result if route is valid (A -> D)', () => {
    const targetStations = {
      origin: 'A',
      destination: 'D'
    };

    return processShortestPath(routeRecords, targetStations).then((res) => {
      expect(res.timeUse).toEqual(15);
      expect(res.stops).toEqual(0);
    });
  });

  it('should get correct result if route is invalid (A -> J)', () => {
    const targetStations = {
      origin: 'A',
      destination: 'J'
    };

    // Invalid route will return rejected promise with string-type error message.
    return processShortestPath(routeRecords, targetStations).then(() => { }, (err) => {
      expect(typeof err).toEqual('string');
    });
  });

  it('should get correct result if route is invalid (G -> D)', () => {
    const targetStations = {
      origin: 'G',
      destination: 'D'
    };

    // Invalid route will return rejected promise with string-type error message.
    return processShortestPath(routeRecords, targetStations).then(() => { }, (err) => {
      expect(typeof err).toEqual('string');
    });
  });
});
