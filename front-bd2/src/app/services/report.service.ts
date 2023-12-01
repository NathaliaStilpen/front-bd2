import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  apiUrl = "http://localhost:5000";

  constructor(private http: HttpClient) { }

  queryData(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/query`, dados);
  }
}
