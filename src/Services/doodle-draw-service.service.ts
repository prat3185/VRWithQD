import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class DoodleDrawServiceService {

  

  constructor(private http:HttpClient) { }

  getAction(statement:string):Observable<any>{
      return this.http.post<string>('/api/v1/nlp',{statement},httpOptions)
  }



}
