import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    HomePageRoutingModule,
    HomePage // <-- Al ser standalone se importa aquí directamente
  ]
})
export class HomePageModule {}