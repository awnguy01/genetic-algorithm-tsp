import { Injectable } from '@angular/core';
import { CityNode } from '../classes/models/city-node';
import { BehaviorSubject } from 'rxjs';
import { Results } from '../classes/models/results';
import { Utils } from '../classes/utils';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  results = new BehaviorSubject<Results | undefined>(undefined);

  constructor() {}

  initRandomPopulation(allCities: CityNode[]): CityNode[][] {
    const pool: CityNode[][] = [];
    for (let i = 0; i < 100; i++) {
      const route: CityNode[] = [];
      const remCities = [...allCities];
      while (remCities.length) {
        const randomIndex = Math.floor(Math.random() * remCities.length);
        route.push(remCities[randomIndex]);
        remCities.splice(randomIndex, 1);
      }
      pool.push(route);
    }
    return pool;
  }

  startGeneticAlgorithm(allCities: CityNode[]): void {
    const population: CityNode[][] = this.initRandomPopulation(allCities);
    const minRoute: CityNode[] = this.findPopulationMinRoute(population);
    const minDistance: number = Utils.calcTotalDistance(minRoute);
    const newResults: Results = new Results(population, minRoute, minDistance);
    this.results.next(newResults);
  }

  findPopulationMinRoute(population: CityNode[][]): CityNode[] {
    let minRoute: CityNode[] = population[0];
    let minDistance: number = Utils.calcTotalDistance(minRoute);
    population.forEach((route: CityNode[]) => {
      const routeDistance: number = Utils.calcTotalDistance(route);
      if (routeDistance < minDistance) {
        minRoute = route;
        minDistance = routeDistance;
      }
    });
    return minRoute;
  }
}
