import { Component, ElementRef, ViewChild, Input, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  RxSpeechRecognitionService,
  resultList,
} from '@kamiazya/ngx-speech-recognition';
import { DoodleDrawServiceService } from 'src/Services/doodle-draw-service.service';
import { SpeechService } from 'src/Services/speech.service';
import { element } from '@angular/core/src/render3';


declare var webkitSpeechRecognition: any;
declare var nlp:any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('searchKey') hiddenSearchHandler;
  speechErrorMessage:string='No speech found. We are stopping the service';
  title = 'DrawDoodle';
  url = 'https://quickdrawfiles.appspot.com/drawing/';
  customSearchUrl="https://www.googleapis.com/customsearch/v1?searchType=image&imgSize=medium&imgType=photo&q=";
  testUrl="https://cse.google.com/cse?cx=&searchType=image&enableImageSearch=true&q="
  cxa:string="";
  properties='?isAnimated=false&format=json&key=';
  key='';
  customSearchAPIKey=""
  cuatomSearchProperties="&cx="+this.cxa+"&filetype=png&key=";
  customeTestProperties="&key="
  ObjectToDraw='chair';
  RandomArray:any[]=["cat","dog","table","chair","watch","sheep","fish","flower","monkey"]
  drawing:any;
  drawSuccess:boolean=true;
  message:string="";
  imageArray:any[]=[];
  imgCount:number=0;
  isWebImage:boolean=false;
  imageToDraw:string='';

  constructor(private http:HttpClient, public service: RxSpeechRecognitionService, private speechService: SpeechService, private drawService:DoodleDrawServiceService,private ref: ChangeDetectorRef){

  }

  @ViewChild('canvas') public canvas: ElementRef;

  // setting a width and height for the canvas
  @Input() public width = 400;
  @Input() public height = 400;

  private cx: CanvasRenderingContext2D;  

  ngOnInit(){
    this.getContentJSON();
 //   this.getImage();
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
          this.cx.clearRect(0,0,this.height,this.width);
        this.drawSuccess=true;
        this.ref.detectChanges();
        this.drawing=data['drawing'];
        this.imgCount=0;
        let message="Here is a image of "+ this.ObjectToDraw +" for you"
        this.drawService.textToSpeech(message);
        this.draw();
        }
        else{
          this.getContentJSON();
        }
    },(err)=>{
        console.log("Cannnot find image for "+ this.ObjectToDraw);
        let message="Cannnot find image of "+ this.ObjectToDraw +" on quick draw. pulling out some images from google";
        this.drawService.textToSpeech(message);
        setTimeout(()=>{this.getImage()},2000)
    });
  }

  getImage(){
    this.drawSuccess=false;
    let currentObject=encodeURI(this.ObjectToDraw);
    this.http.get(this.customSearchUrl+currentObject+this.cuatomSearchProperties+this.customSearchAPIKey).subscribe((data)=>{
      this.imageArray=[];
      for (var i = 0; i < data["items"].length; i++) {
        var item = data["items"][i];
        this.imageArray.push(item.link);
      }
      if(this.imageArray.length>0)
      {
        this.imageToDraw=this.imageArray[Math.floor(Math.random() * this.imageArray.length)];
        this.ref.detectChanges();
        // setTimeout(()=>{
        //   let img:HTMLImageElement = document.getElementById("drawImage") as HTMLImageElement;
        //   this.ref.detectChanges();
        //   this.cx.clearRect(0, 0, this.width, this.height);
        //   this.cx.drawImage(img, 0, 0, this.width, this.height);
 
        // },2000);
      }
      else{
        console.log("No image found");
      }
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
    this.drawSuccess=true;
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
    let doc=nlp(speech).nouns().list;
    doc=doc.filter((list)=>{
      console.log(list);
      let response=true;
     list.terms=list.terms.filter((term)=>{
       if(term.text.toLocaleLowerCase()!="image" && term.text.toLocaleLowerCase()!="of")
       return term;
     });
     if(response)
     return list;
    });
    doc = doc[0];
    console.log(doc);
    return doc? doc.terms:[];
  }

  performAction(action:string){
    if(action.toLocaleLowerCase()=="draw"){
      this.performDrawAction();
    }
    else if(action.toLocaleLowerCase()=="random"){
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
    this.imgCount=0;
      this.ObjectToDraw=this.RandomArray[Math.floor(Math.random() * this.RandomArray.length)];
      this.getContentJSON();
  }

  performDrawNext()
  {
      this.getContentJSON();
  }


  listen() {
    this.speechService.record().subscribe(
      (value) => {
        this.message=value;
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
              let message="I didn't find any object to draw";
              this.drawService.textToSpeech(message);
            }
          }
          else{
                this.performAction(data.res['srcAnswer']);
          }
        });
      },
      (err) => {
        if(err.error == "no-speech"){
          this.drawService.textToSpeech(this.speechErrorMessage);
          this.speechService.DestroySpeechObject();
        }
      },
      () => {
        this.speechService.DestroySpeechObject();
      }
    );
  }

}
