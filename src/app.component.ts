import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';

import { SupabaseService } from './services/supabase.service';
import { TransformedMedicion } from './models/paradero.model';
import { StatusCardComponent } from './components/status-card/status-card.component';
import { HistoryChartComponent } from './components/history-chart/history-chart.component';
import { MapDisplayComponent } from './components/map-display/map-display.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    StatusCardComponent,
    HistoryChartComponent,
    MapDisplayComponent,
    TitleCasePipe
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private dataSubscription: Subscription | null = null;

  state = signal<{
    data: TransformedMedicion[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: true,
    error: null,
  });

  latestMeasurement = computed(() => this.state().data?.[0] ?? null);
  historicalData = computed(() => this.state().data);
  
  statusColorClass = computed(() => {
    const status = this.latestMeasurement()?.status;
    switch (status) {
      case 'low':
      case 'vacio':
        return 'text-green-400';
      case 'medium':
      case 'medio':
        return 'text-yellow-400';
      case 'high':
      case 'lleno':
        return 'text-red-400';
      case 'normal':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  });


  ngOnInit(): void {
    this.fetchData();
    this.dataSubscription = interval(10000).subscribe(() => this.fetchData());
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  fetchData(): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.supabaseService.fetchData().subscribe({
      next: (data) => {
        this.state.set({ data, loading: false, error: null });
      },
      error: (err) => {
        console.error('Failed to fetch data', err);
        this.state.set({ data: [], loading: false, error: 'Could not load data from the source.' });
      }
    });
  }
}