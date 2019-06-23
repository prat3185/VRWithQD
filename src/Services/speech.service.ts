import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from "lodash";

interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

@Injectable()
export class SpeechService {
    speechRecognition: any;

    constructor(private zone: NgZone) {
    }

    record(): Observable<string> {
        let term: string = '';
        return Observable.create(observer => {
            const { webkitSpeechRecognition }: IWindow = <IWindow>window;
            this.speechRecognition = new webkitSpeechRecognition();
            //this.speechRecognition = SpeechRecognition;
            this.speechRecognition.continuous = true;
            //this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'en-us';
            this.speechRecognition.maxAlternatives = 1;
      
            this.speechRecognition.onresult = speech => {
                term = "";
                if (speech.results) {
                    //console.log(speech);
                    var result = speech.results[speech.results.length - 1];
                    var transcript = result[0].transcript;
                    
                    if (result.isFinal) {
                        if (result[0].confidence < 0.3) {
                            term = "Unrecognized result - Please try again";
                        }
                        else {
                            term = _.trim(transcript);
                            //console.log("Did you said? -> " + term + " , If not then say something else...");
                        }
                    }
                }
                this.zone.run(() => {
                    observer.next(term);
                    setTimeout(() => {
                        observer.complete();
                        this.speechRecognition.stop();
                    }, 200);
                });
            };
            this.speechRecognition.onerror = speech => observer.error(speech);
            this.speechRecognition.onend = () => observer.complete();
            this.speechRecognition.lang = 'en-US';
            term = '';
            this.speechRecognition.start();
            this.speechRecognition = new webkitSpeechRecognition();
          }
        );
    }

    DestroySpeechObject() {
        if (this.speechRecognition)
            this.speechRecognition.stop();
    }

}