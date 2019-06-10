import { Component, ElementRef, ViewChild, Input, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  RxSpeechRecognitionService,
  resultList,
} from '@kamiazya/ngx-speech-recognition';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit,OnInit {
  title = 'DrawDoodle';
  url = 'https://quickdrawfiles.appspot.com/drawing/car?isAnimated=false&format=json&key=';
  key='AIzaSyCLxdiMV5-46xuFWFbdDhVoJi7DMwe-H9Q'
  cat:any;
  message:string="";

  constructor(private http:HttpClient, public service: RxSpeechRecognitionService){

  }

  @ViewChild('canvas') public canvas: ElementRef;

  // setting a width and height for the canvas
  @Input() public width = 400;
  @Input() public height = 400;

  private cx: CanvasRenderingContext2D;  

  ngOnInit(){
    this.getContentJSON();
  }

  ngAfterViewInit() {
    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    // set the width and height
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    // set some default properties about the line
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    
  }

  getContentJSON() {
    this.http.get(this.url+this.key).subscribe((data)=>{
        this.cat=data['drawing'];
        this.draw();
    });
  }


drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) 
{
  // incase the context is not set
  if (!this.cx) { return; }

  // start our drawing path
  this.cx.beginPath();

  // we're drawing lines so we need a previous position
  if (prevPos) {
    // sets the start point
    this.cx.moveTo(prevPos.x, prevPos.y); // from

    // draws a line from the start pos until the current position
    this.cx.lineTo(currentPos.x, currentPos.y);

    // strokes the current path with the styles we set earlier
    this.cx.stroke();
  }
}

draw() {
  debugger;
  let strokeIndex = 0;
  let index = 0;
  let prevx, prevy;
  while (this.cat) {
    let x = this.cat[strokeIndex][0][index];
    let y = this.cat[strokeIndex][1][index];
    if (prevx !== undefined) {
      this.drawOnCanvas({x:prevx, y:prevy}, {x, y});
    }
    index++;
    if (index === this.cat[strokeIndex][0].length) {
      strokeIndex++;
      prevx = undefined;
      prevy = undefined;
      index = 0;
      if (strokeIndex === this.cat.length) {
        this.cat = undefined;
        strokeIndex = 0;
        //setTimeout(newCat, 100);
      }
    } else {
      prevx = x;
      prevy = y;
    }
  }
}

listen() {
  this.service
    .listen()
    .pipe(resultList)
    .subscribe((list: SpeechRecognitionResultList) => {
      this.message = list.item(0).item(0).transcript;
      console.log('RxComponent:onresult', this.message, list);
    });
}
}

