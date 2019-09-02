import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LbdModule } from '../../lbd/lbd.module';
import { NguiMapModule} from '@ngui/map';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { HomeComponent } from '../../home/home.component';
import { CadastrarAgenteComponent } from '../../cadastrar-agente/cadastrar-agente.component';
import { ClinicasComponent } from '../../clinicas/clinicas.component';
import { CadastrarClinicaComponent } from '../../cadastrar-clinica/cadastrar-clinica.component';
import { FotoPerfilComponent } from '../../foto-perfil/foto-perfil.component';
import { ClientesComponent } from '../../clientes/clientes.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    LbdModule,
    NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=YOUR_KEY_HERE'}),
    SweetAlert2Module.forRoot()
  ],
  declarations: [
    HomeComponent,
    CadastrarAgenteComponent,
    ClinicasComponent,
    CadastrarClinicaComponent,
    FotoPerfilComponent,
    ClientesComponent,
  ]
})

export class AdminLayoutModule {}
