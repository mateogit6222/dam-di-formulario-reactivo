import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrivenPage } from './driven.page';

const routes: Routes = [
  {
    path: '',
    component: DrivenPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DrivenPageRoutingModule {}