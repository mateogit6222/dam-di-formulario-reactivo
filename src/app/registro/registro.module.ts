import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroPage } from './registro.page';
import { RegistroPageRoutingModule } from './registro-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RegistroPageRoutingModule,
    RegistroPage
  ]
})
export class RegistroPageModule {}