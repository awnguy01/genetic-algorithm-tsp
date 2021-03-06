import { Injectable } from '@angular/core';
import { CityNode } from '../classes/models/city-node';
import { BehaviorSubject } from 'rxjs';
import { Results } from '../classes/models/results';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  results = new BehaviorSubject<Results | undefined>(undefined);
  worker: Worker;

  constructor() {
    // updates the results upon receiving a new message from the web worker
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('./ai.worker', { type: 'module' });
      this.worker.onmessage = ({ data }) => {
        const results: Results = data;
        this.results.next(results);
      };
    } else {
      // Web Workers are not supported in this environment.
    }
  }

  /** startGeneticAlgorithm
   * @desc sends a signal to the web worker to start the specified algorithm
   */
  startGeneticAlgorithm(algorithm: 1 | 2 | 3 | 4, allCities: CityNode[]) {
    this.worker.postMessage({ algorithm, allCities });
  }
}
