import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Object } from '../models/object.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RxSpeechRecognitionService, resultList } from '@kamiazya/ngx-speech-recognition';
import { DoodleDrawServiceService } from 'src/Services/doodle-draw-service.service';
import { SpeechService } from 'src/Services/speech.service';
import { Connectors } from '../models/connector.model';
import * as jsPDF from 'jspdf';

declare var nlp:any;

@Component({
  selector: 'app-flow-chart',
  templateUrl: './flow-chart.component.html',
  styleUrls: ['./flow-chart.component.css']
})
export class FlowChartComponent implements OnInit {
  title = 'flow-chart';
  objects: Object[] = [];
  objectForm: FormGroup;
  name: FormControl;
  shape: FormControl;
  content: FormControl;
  top: FormControl;
  right: FormControl;
  bottom: FormControl;
  left: FormControl;

  speechErrorMessage:string='No speech found. We are stopping the service';
  
  connectors:Connectors[]=[];
  connectArray:string[]=["connect","connector","join","connects","connected","line"];
  contentArray:string[]=["content","text","write","contents","information","name","value"];
  connectCommand:boolean=false;
  contentCommand:boolean=false;
  
  message:string="";

  actualPositions: string[] = ["top", "left", "bottom", "right"];
  positions: string[] = [];
  units: number[]=[];
  
  constructor( public service: RxSpeechRecognitionService, private drawService:DoodleDrawServiceService,
               public speechService: SpeechService) {
  }

  ngOnInit(){
    this.createFormControls();
    this.createForm();
    this.objects = [];
    this.connectors=[];

    this.objects.forEach((val: Object) => {
      val.imgPath = this.getObjectImagepath(val.shape);
    });
  }

  createFormControls(){
    this.name = new FormControl('', Validators.required);
    this.shape = new FormControl('', Validators.required);
    this.content = new FormControl('', Validators.required);
    this.top = new FormControl(0, Validators.required);
    this.right = new FormControl(0, Validators.required);
    this.bottom = new FormControl(0, Validators.required);
    this.left = new FormControl(0, Validators.required);
  }

  createForm(){
    this.objectForm = new FormGroup({
      'name': this.name,
      'shape': this.shape,
      'content': this.content,
      'top': this.top,
      'right': this.right,
      'bottom': this.bottom,
      'left': this.left
    });
  }

  getObjectImagepath(val: string){
    if(val == 'oval')
      return '../assets/oval.png';
    else if(val == 'rectangle')
      return '../assets/rectangle.png';
    else if(val == 'arrow')
      return '../assets/oval.png'
    else
      return '../assets/rhombus.jpg'
  }

  createObject(){
    console.log(this.objects);
    if(this.objectForm.valid){
      let temp: Object;

      
      let containerWidth: number = document.getElementById('objectContainer').offsetWidth/20;
      let containerHeight: number = document.getElementById('objectContainer').offsetHeight/10;

      // let height = parseInt(this.objects[this.objects.length - 1].height.slice(0, this.objects[this.objects.length - 1].height.length - 2));
      // let width = parseInt(this.objects[this.objects.length - 1].width.slice(0, this.objects[this.objects.length - 1].width.length - 2));
      
      // let top = parseInt(this.objects[this.objects.length - 1].top.slice(0, this.objects[this.objects.length - 1].top.length - 2));
      // top = top + height + 40;
        
      
      // let left = parseInt(this.objects[this.objects.length - 1].left.slice(0, this.objects[this.objects.length - 1].left.length - 2));

      temp = {
        'name': this.objectForm.get('name').value,
        'shape': this.objectForm.get('shape').value,
        'content': this.objectForm.get('content').value,
        'top': (this.objectForm.get('top').value*containerHeight).toString() + 'px',
        'left': (this.objectForm.get('left').value*containerWidth).toString() + 'px',
        'right': (this.objectForm.get('right').value*containerWidth).toString() + 'px',
        'bottom': (this.objectForm.get('bottom').value*containerHeight).toString() + 'px',
        'height': '60'+'px',
        'width': '90'+'px',
        'imgPath': this.getObjectImagepath(this.objectForm.get('shape').value),
        'id': this.objects.length
      };

      this.objects.push(temp);
      this.objectForm.reset();
      this.top.setValue(0); 
      this.bottom.setValue(0); 
      this.left.setValue(0); 
      this.right.setValue(0);
    }
  }

  resetForm(){
    this.objectForm.reset();
    this.top.setValue(0); 
    this.bottom.setValue(0); 
    this.left.setValue(0); 
    this.right.setValue(0);
  }

  convertToPDF(){
    let doc = new jsPDF('p', 'pt', 'a4');
    const content = document.getElementById('objectContainer');
    doc.addHTML(content, () => {
      doc.save('content.pdf');
    });
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

  listen() {
    this.message = "";
    this.units = [];
    this.positions = [];
    this.speechService.record().subscribe(
      (value) => {
        if(this.testNotContentOrConnect(value)){
        console.log(value);
        this.message = value;
        this.drawService.getFlowChartAction(value).subscribe((data)=>{
          console.log(data);
          if(data.res["answer"]=="Draw"){

          // extracting numeric entities
          let entities=data.res["entities"];
          for(let i =0 ; i < entities.length; i++){
              if(entities[i].entity=="number"){
                this.units.push(entities[i].resolution.value);
              }
          }

          // extracting positions data
          let stringParts = this.message.split(" ");
          stringParts.forEach((val: string, index: number) => {
            if(this.actualPositions.includes(val) && !this.positions.includes(val)){
              this.positions.push(val);
            }
          });

          let nouns = this.getNouns(this.message);
          let confirmationStatement="Did you mean Draw a ";
          confirmationStatement+=nouns[0].text;
          for(let i=0;i<this.units.length;i++){
            confirmationStatement+=" " +this.units[i] +" units from "+this.positions[i];
            if(this.units.length>i+2){
              confirmationStatement+=","
            }
            else if(this.units.length==i+2){
              confirmationStatement+=" and";
            }
          }
          confirmationStatement+="?"
          console.log(confirmationStatement);
          this.drawService.textToSpeech(confirmationStatement);
          this.stop();
          setTimeout(()=>{
            this.confirmDraw(nouns[0].text);
          },5000)
          }
          else if(data.res["answer"]=="Relative"){
            let message="I am still in learning phase and relative drawing are not yet supported";
            this.drawService.textToSpeech(message);
            this.stop();
          }
        })
      }
      else{
        this.stop();
        this.connectOrAddContent(value);
      }
        // console.log(nouns[0].text);
        // console.log(this.positions);
        // console.log(this.units);
        // this.insertObject(nouns[0].text, this.positions, this.units);
 
      },
      (err) => {
        if(err.error == "no-speech"){
         this.drawService.textToSpeech(this.speechErrorMessage);
          this.speechService.DestroySpeechObject();
          //this.listen();
        }
      },
      () => {
        this.speechService.DestroySpeechObject();
      }
    );
  }

  confirmDraw(objectToDraw){
    console.log("confrim draw called");
    this.speechService.record().subscribe(
      (value) => {
        console.log("confirmation value:"+value);
        if(value.toLowerCase().indexOf("yes")!=-1){
        let status="Ok here is a "+objectToDraw+ " for you";
        this.drawService.textToSpeech(status);
        this.insertObject(objectToDraw, this.positions, this.units);
        this.stop();
        }
        else if(value.toLocaleLowerCase().indexOf("no")!=-1){
          let message="Ok discarding the statement";
          this.drawService.textToSpeech(message);
          this.stop();
        }
        else{
          setTimeout(()=>{
            let message="Didn't get proper response.Discarding the changes";
            this.drawService.textToSpeech(message);
            this.stop();
          },5000)
        }
      },
      (err) => {
        if(err.error == "no-speech"){
          this.drawService.textToSpeech(this.speechErrorMessage);
          this.stop();
          //setTimeout(this.confirmDraw,3000);
        }
      },
      () => {
        this.stop();
      }
    );
  }


  insertObject(shape: string, positions: string[], units: number[]){
    let containerWidth: number = document.getElementById('objectContainer').offsetWidth/20;
    let containerHeight: number = document.getElementById('objectContainer').offsetHeight/10;

    console.log(containerWidth);
    console.log(containerHeight);

    let top: string = '';
    let left: string = '';
    let bottom: string = '';
    let right: string = '';

    if(positions.includes('top')){
      let index = positions.findIndex(val => val == 'top');
      if(index >= 0){
        top = (units[index]*containerHeight).toString() + 'px';
      }
      else{
        top = '0px';
      }
    }
    else{
      top = '0px';
    }

    if(positions.includes('left')){
      
      let index = positions.findIndex(val => val == 'left');
      console.log(index);
      if(index >= 0){
        console.log(units[index]);
        console.log(units[index]*containerWidth);
        left = (units[index]*containerWidth).toString() + 'px';
      }
      else{
        left = '0px';
      }
    }
    else{
      left = '0px';
    }

    if(positions.includes('bottom')){
      let index = positions.findIndex(val => val == 'bottom');
      if(index >= 0){
        bottom = (units[index]*containerHeight).toString() + 'px';
      }
      else{
        bottom = '0px';
      }
    }
    else{
      bottom = '0px';
    }

    if(positions.includes('right')){
      let index = positions.findIndex(val => val == 'right');
      if(index >= 0){
        right = (units[index]*containerWidth).toString() + 'px';
      }
      else{
        right = '0px';
      }
    }
    else{
      right = '0px';
    }

    console.log(top);
    console.log(left);
    console.log(bottom);
    console.log(right);
    let obj = new Object('', this.objects.length+1, shape, shape, '60px', '90px', top, left, right,
                         bottom, this.getObjectImagepath(shape));

    this.objects.push(obj);
    console.log(this.objects);
  }

  connectObjects(message:string){
      console.log("connect called");
      let objectsToconnect:number[]=[];
      this.drawService.getEntitiestoConnect(message).subscribe((data)=>{
        let entities=data.res["entities"];
        for(let i =0 ; i < entities.length; i++){
            if(entities[i].entity=="number" || entities[i].entity=="ordinal" ){
              objectsToconnect.push(entities[i].resolution.value);
            }
        }

        console.log(objectsToconnect);

        if(objectsToconnect.length!=2){
          let error="";
          if(objectsToconnect.length>2){
            error="I am in learning phase and can connect only two objects";
          }
          else 
          error="Please provide atleast two object to connect";
          this.drawService.textToSpeech(error);
        }
        else{
          //check array index;
          let success=true;
          for(let i=0;i<objectsToconnect.length;i++){
            if(objectsToconnect[i]>this.objects.length){
              success=false;
            }
          }
          if(success){       
          let x1=parseInt(this.objects[objectsToconnect[0]-1].left.slice(0,-2))+(parseInt(this.objects[objectsToconnect[0]-1].width.slice(0,-2))/2);
          let y1=parseInt(this.objects[objectsToconnect[0]-1].top.slice(0,-2))+(parseInt(this.objects[objectsToconnect[0]-1].height.slice(0,-2))/2);
          let x2=parseInt(this.objects[objectsToconnect[1]-1].left.slice(0,-2))+(parseInt(this.objects[objectsToconnect[1]-1].width.slice(0,-2))/2);
          let y2=parseInt(this.objects[objectsToconnect[1]-1].top.slice(0,-2))+(parseInt(this.objects[objectsToconnect[1]-1].height.slice(0,-2))/2);
          this.connectors.push(new Connectors({id:(this.connectors.length+1),content:"test",connectorType:false,x1:x1,y1:y1,x2:x2,y2:y2}))
          console.log(this.connectors);
          }
          else{
            let error="Unable to find the requested object";
            this.drawService.textToSpeech(error);
          }
        }
      });
  } 

  AddContent(message:string){
    console.log("content called");
    let objectToAddContent:number[]=[];
    this.drawService.getEntitiestoConnect(message).subscribe((data)=>{
      let entities=data.res["entities"];
      for(let i =0 ; i < entities.length; i++){
          if(entities[i].entity=="number" || entities[i].entity=="ordinal" ){
            objectToAddContent.push(entities[i].resolution.value);
          }
      }
      console.log(objectToAddContent);
      let success=true;
      if(objectToAddContent[0]>this.objects.length){
        success=false;
      }
      if(success){
        let contentStartIndex=message.toLocaleLowerCase().indexOf("content")!=-1?message.toLocaleLowerCase().indexOf("content"):
        message.toLocaleLowerCase().indexOf("text")!=-1?message.toLocaleLowerCase().indexOf("text"):
        message.toLocaleLowerCase().indexOf("information")!=-1?message.toLocaleLowerCase().indexOf("information"):
        message.toLocaleLowerCase().indexOf("value")!=-1?message.toLocaleLowerCase().indexOf("value"):0;
        let contentStopIndex=message.toLocaleLowerCase().lastIndexOf("in")!=-1?message.toLocaleLowerCase().lastIndexOf("in"):-1;        
        let content=message.substr(contentStartIndex);
        content=content.substr(content.indexOf(" ") + 1)
        console.log(content);
        this.objects[objectToAddContent[0]-1].content=content;
      }
      else{
        let error="Unable to find the requested object";
        this.drawService.textToSpeech(error);
      }
    });

  }

  testNotContentOrConnect(message:string){
    let response=true;
    this.connectCommand=false;
    this.contentCommand=false;
    for(let i=0;i<this.connectArray.length;i++){
      if(message.toLocaleLowerCase().indexOf(this.connectArray[i])!=-1){
        this.connectCommand=true;
        response=false;
      }
    }
    for(let i=0;i<this.contentArray.length;i++){
      if(message.toLocaleLowerCase().indexOf(this.contentArray[i])!=-1){
        this.contentCommand=true;
        response=false;
      }
    }
    return response
  }

  connectOrAddContent(message:string){
    if(this.connectCommand==true){
      this.connectObjects(message);
    }
    if(this.contentCommand==true){
      this.AddContent(message);
    }
  }

  stop(){
    this.speechService.DestroySpeechObject();
  }
}
