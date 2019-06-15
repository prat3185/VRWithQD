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
export class AppComponent implements AfterViewInit,OnInit {

  title = 'DrawDoodle';
  url = 'https://quickdrawfiles.appspot.com/drawing/';
  properties='?isAnimated=false&format=json&key=';
  key='AIzaSyCLxdiMV5-46xuFWFbdDhVoJi7DMwe-H9Q';
  ObjectToDraw='cat';
  RandomArray:any[]=["cat","dog","table","chair","watch","sheep","fish","flower","monkey"]
  drawing:any;
  drawSuccess:boolean=true;
  message:string="";

  constructor(private http:HttpClient, public service: RxSpeechRecognitionService, private drawService:DoodleDrawServiceService){

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
    this.http.get(this.url+this.ObjectToDraw+this.properties+this.key).subscribe((data)=>{
        if(data['recognized']==true){
        this.drawSuccess=true;
        this.cx.clearRect(0, 0, this.width, this.height);
        this.drawing=data['drawing'];
        this.draw();
        }
        else{
          this.getContentJSON();
        }
    },(err)=>{
        console.log("Cannnot find image for "+ this.ObjectToDraw);
        this.drawSuccess=false;
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
  let strokeIndex = 0;
  let index = 0;
  let prevx, prevy;
  while (this.drawing) {
    let x = this.drawing[strokeIndex][0][index];
    let y = this.drawing[strokeIndex][1][index];
    if (prevx !== undefined) {
      this.drawOnCanvas({x:prevx, y:prevy}, {x, y});
    }
    index++;
    if (index === this.drawing[strokeIndex][0].length) {
      strokeIndex++;
      prevx = undefined;
      prevy = undefined;
      index = 0;
      if (strokeIndex === this.drawing.length) {
        this.drawing = undefined;
        strokeIndex = 0;
        //setTimeout(newCat, 100);
      }
    } else {
      prevx = x;
      prevy = y;
    }
  }
}

getNouns(speech:string){
  let doc=nlp(speech).nouns().list[0];
  return doc? doc.terms:[];
}

performAction(action:string){
  if(action.toLocaleLowerCase()=="draw"){
    this.performDrawAction();
  }
  else if(action.toLocaleLowerCase()=="draw"){
    this.drawRandom();
  }
  else{
    this.performDrawNext();
  }
}

performDrawAction(){
let nouns=this.getNouns(this.message);
if(nouns.length>0){
  for(var i=0;i<nouns.length;i++){
    this.ObjectToDraw=nouns[i].text;
    this.getContentJSON();
    break;
  }
}
}

drawRandom(){
  if(this.getNouns(this.message).length>0){
    this.performDrawAction();
  }
  else{
    this.ObjectToDraw=this.RandomArray[Math.floor(Math.random() * this.RandomArray.length)];
    this.getContentJSON();
  }
}

performDrawNext()
{
  if(this.getNouns(this.message).length>0){
    this.performDrawAction();
  }
  else{
    this.getContentJSON();
  }
}


listen() {
  this.service
    .listen()
    .pipe(resultList)
    .subscribe((list: SpeechRecognitionResultList) => {
      this.message = list.item(0).item(0).transcript;
      console.log('RxComponent:onresult', this.message, list);
      this.drawService.getAction(this.message).subscribe((data)=>{
        console.log(data.res['srcAnswer']);
        if(data.res['srcAnswer']==undefined || data.res['srcAnswer']==null){
          let nouns=this.getNouns(this.message);
          if(nouns.length>0)
          {
              this.performDrawAction();
          }
          else{
            console.log("I didn't get it");
          }
        }
        else{
              this.performAction(data.res['srcAnswer']);
        }
      });
    });
}
}

