import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransformedMedicion } from '../../models/paradero.model';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusCardComponent {
  // Fix: Change input to be nullable to prevent runtime errors when latestMeasurement is null.
  data = input<TransformedMedicion | null>(null);
}