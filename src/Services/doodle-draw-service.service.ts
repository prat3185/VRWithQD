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

  getFlowChartAction(statement:string):Observable<any>{
    return this.http.post<string>('/api/v1/flowChart',{statement},httpOptions)
  }

  
  getEntitiestoConnect(statement:string):Observable<any>{
    return this.http.post<string>('/api/v1/flowChart/getEntities',{statement},httpOptions)
  }


  textToSpeech(message:string){
    let spk = new SpeechSynthesisUtterance();
    spk.text = message;
    spk.volume = 1;
    spk.pitch = 1;
    spk.rate = 1;
    spk.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(spk);

  }

}
