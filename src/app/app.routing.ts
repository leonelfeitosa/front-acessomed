import { AuthComponent } from './auth/auth.component';
import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './guards/auth-guard.service';


import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CheckTokenComponent } from './check-token/check-token.component';


const routes: Routes = [
    {
    path: '',
    component:  CheckTokenComponent
  },
  {
    path: 'auth/login',
    component: AuthComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [AuthGuardService],
    children: [
        {
      path: '',
      loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
  }]},
  {
    path: '**',
    redirectTo: 'admin/agentes'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
