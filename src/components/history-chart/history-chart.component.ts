
import { Component, ChangeDetectionStrategy, input, viewChild, ElementRef, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Chart } from 'chart.js';
import { TransformedMedicion } from '../../models/paradero.model';

declare var Chart: any;

@Component({
  selector: 'app-history-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryChartComponent implements OnDestroy {
  data = input<TransformedMedicion[]>([]);
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');

  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      if (this.data().length > 0) {
        this.createChart();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }
  
  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private createChart(): void {
    this.destroyChart();

    const chartData = this.data().slice().reverse(); // Oldest to newest
    const labels = chartData.map(d => new Date(d.timestamp).toLocaleTimeString());
    const personCounts = chartData.map(d => d.personCount);

    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nº de Personas',
          data: personCounts,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(99, 102, 241)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { 
              color: textColor,
              stepSize: 1
            }
          },
          x: {
            grid: { display: false },
            ticks: { 
              color: textColor,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10
            }
          }
        }
      }
    });
  }
}
