import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
// Fix: Use modern RxJS imports
import { map, catchError } from 'rxjs';
import { SupabaseMedicion, TransformedMedicion } from '../models/paradero.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Fix: Explicitly type `http` as HttpClient to resolve type inference issue.
  private http: HttpClient = inject(HttpClient);
  private supabaseUrl = 'https://izrwdgnhpqdfmwhtrylt.supabase.co';
  private supabaseKey = 'sb_publishable_1cdquiCf2Vp2YA3MATaOOQ_l6Kwt0V5';
  private tableName = 'paradero_mediciones';

  fetchData(): Observable<TransformedMedicion[]> {
    const url = `${this.supabaseUrl}/rest/v1/${this.tableName}?select=*&order=timestamp.desc`;
    
    return this.http.get<SupabaseMedicion[]>(url, {
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`
      }
    }).pipe(
      map(response => this.transformData(response)),
      catchError(error => {
        console.error('Supabase API Error:', error);
        return of([]);
      })
    );
  }

  private transformData(data: SupabaseMedicion[]): TransformedMedicion[] {
    return data.map(item => {
      let location: { lat: number; lng: number; } | null = null;
      
      try {
        if (item.location) {
          let parsedLocation: any = null;

          // Case 1: location is already a valid object (from jsonb)
          if (typeof item.location === 'object' && item.location !== null) {
            parsedLocation = item.location;
          } 
          // Case 2: location is a JSON string that needs parsing
          else if (typeof item.location === 'string') {
            // Avoid parsing common invalid stringified objects like "[object Object]" by checking for a valid start.
            if (item.location.trim().startsWith('{')) {
               parsedLocation = JSON.parse(item.location);
            }
          }

          // Validate the parsed/retrieved object has the required properties
          if (parsedLocation && typeof parsedLocation.lat === 'number' && typeof parsedLocation.lng === 'number') {
            location = { lat: parsedLocation.lat, lng: parsedLocation.lng };
          }
        }
      } catch (e) {
        console.error(`Error processing location data for item id ${item.id}:`, item.location, e);
      }

      const getEstimatedTime = (count: number): string => {
        if (count === 0) return '0 min';
        if (count <= 3) return '2-4 min';
        if (count <= 7) return '5-8 min';
        if (count <= 12) return '8-12 min';
        return '15+ min';
      };

      return {
        id: item.id,
        timestamp: item.timestamp,
        personCount: item.person_count,
        status: item.status.toLowerCase(),
        distances: {
          sensor1: item.sensor1_distance,
          sensor2: item.sensor2_distance
        },
        location,
        recommendation: item.recommendation,
        estimatedTime: getEstimatedTime(item.person_count)
      };
    });
  }
}
