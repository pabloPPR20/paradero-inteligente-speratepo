
import { Component, ChangeDetectionStrategy, input, viewChild, ElementRef, effect, OnDestroy, afterNextRender } from '@angular/core';

declare var L: any;

@Component({
  selector: 'app-map-display',
  standalone: true,
  templateUrl: './map-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapDisplayComponent implements OnDestroy {
  location = input<{ lat: number; lng: number } | null>(null);
  mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('map');

  private map: any;
  private marker: any;

  constructor() {
    afterNextRender(() => {
        this.initMap();
    });

    effect(() => {
        const loc = this.location();
        if (loc && this.map) {
            this.updateMap(loc.lat, loc.lng);
        }
    });
  }

  private initMap(): void {
    if (this.map || !this.location()) return;
    
    const loc = this.location();
    if (!loc) return;
    
    try {
      this.map = L.map(this.mapContainer().nativeElement, {
        scrollWheelZoom: false,
      }).setView([loc.lat, loc.lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.marker = L.marker([loc.lat, loc.lng]).addTo(this.map);
    } catch(e) {
      console.error("Leaflet not available yet or failed to initialize.", e);
    }
  }

  private updateMap(lat: number, lng: number): void {
    if(this.map) {
        this.map.setView([lat, lng], 16);
        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng]).addTo(this.map);
        }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
