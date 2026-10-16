import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrivenPage } from './driven.page';
import { DrivenPageRoutingModule } from './driven-routing.module';

@NgModule({
  imports: [
    CommonModule,
    DrivenPageRoutingModule,
    DrivenPage
  ]
})
export class DrivenPageModule {}