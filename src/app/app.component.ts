import { Component, ElementRef, ViewChild, Input, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  RxSpeechRecognitionService,
  resultList,
} from '@kamiazya/ngx-speech-recognition';
import { DoodleDrawServiceService } from 'src/Services/doodle-draw-service.service';


declare var nlp:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title='Quick Draw';
}

