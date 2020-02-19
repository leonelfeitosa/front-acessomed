import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [],
  exports: [NgxSpinnerModule, NgxMaskModule]
})
export class SharedModuleModule { }
