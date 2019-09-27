import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CityNode } from 'src/app/classes/models/city-node';
import { Utils } from 'src/app/classes/utils';
import { FormControl, FormBuilder } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as CanvasJS from 'src/assets/lib/canvasjs.min.js';
import { AiService } from 'src/app/services/ai.service';
import { Results } from 'src/app/classes/models/results';

const CHART_OPTS = {
  animationEnabled: true,
  theme: 'dark2',
  zoomEnabled: true,
  title: {
    text: 'Project 4 Genetic Algorithm'
  },
  toolTip: {
    contentFormatter: e => {
      const entry = e.entries[0] || e.entries[1];
      return `${entry.dataPoint.name}: (${entry.dataPoint.x}, ${entry.dataPoint.y})`;
    }
  },
  axisX: {
    viewportMinimum: -10,
    viewportMaximum: 110
  },
  axisY: {
    viewportMinimum: -10,
    viewportMaximum: 120
  },
  data: [
    // { type: 'scatter', dataPoints: [] },
    {
      type: 'line',
      markerType: 'circle',
      markerSize: 10,
      dataPoints: []
    }
  ]
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild('graphCanvas') graphCanvas: ElementRef;

  tspFileCtrl: FormControl = this.fb.control(null);
  chart: any;

  constructor(readonly fb: FormBuilder, readonly aiSvc: AiService) {}

  ngOnInit() {
    this.chart = new CanvasJS.Chart('chartContainer', CHART_OPTS);
    this.chart.render();
    this.watchResultChanges().subscribe();
    this.tspFileCtrlChanges().subscribe();
  }

  /** watchResultChanges
   * @desc subscribe to updates in results from the AI service
   */
  watchResultChanges(): Observable<Results> {
    return this.aiSvc.results.asObservable().pipe(
      tap((results?: Results) => {
        if (results) {
          this.chart.options.data[0].dataPoints = Utils.convertCitiesToDataPoints(
            results.minRoute
          );
          this.chart.render();
        }
        console.log(results);
      })
    );
  }

  /** tspFileCtrlChanges
   * @desc wait to read new file inputs and begin finding the Hamiltonian path
   */
  tspFileCtrlChanges(): Observable<any> {
    return this.tspFileCtrl.valueChanges.pipe(
      tap((file: File) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const allCities = Utils.parseCitiesFromFileText(
            reader.result as string
          );
          this.chart.options.data[0].dataPoints = Utils.convertCitiesToDataPoints(
            allCities
          );
          this.chart.render();
          this.aiSvc.startGeneticAlgorithm(allCities);
        };
        if (file) {
          reader.readAsText(file);
        }
      })
    );
  }
}
