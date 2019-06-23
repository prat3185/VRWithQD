import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RxSpeechRecognitionService } from '@kamiazya/ngx-speech-recognition';
import { FlowChartComponent } from './flow-chart/flow-chart.component';
import { HomeComponent } from './home/home.component';
import { SpeechService } from 'src/Services/speech.service';


@NgModule({
  declarations: [
    AppComponent,
    FlowChartComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [RxSpeechRecognitionService, SpeechService],
  bootstrap: [AppComponent]
})
export class AppModule { }
