import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { NguiMapModule} from '@ngui/map';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';



import { AgentesComponent } from '../../pages/agentes/agentes.component';
import { CadastrarAgenteComponent } from '../../pages/cadastrar-agente/cadastrar-agente.component';
import { ClinicasComponent } from '../../pages/clinicas/clinicas.component';
import { CadastrarClinicaComponent } from '../../pages/cadastrar-clinica/cadastrar-clinica.component';
import { FotoPerfilComponent } from '../../components/foto-perfil/foto-perfil.component';
import { ClientesComponent } from '../../pages/clientes/clientes.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=YOUR_KEY_HERE'}),
    SweetAlert2Module.forRoot(),
    
    SharedModuleModule,
    TagInputModule,
  ],
  declarations: [
    AgentesComponent,
    CadastrarAgenteComponent,
    ClinicasComponent,
    CadastrarClinicaComponent,
    FotoPerfilComponent,
    ClientesComponent,
  ]
})

export class AdminLayoutModule {}
