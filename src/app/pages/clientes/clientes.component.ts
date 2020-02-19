import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SwalComponent, SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Estado } from '../../models/estado';
import { Cidade } from '../../models/cidade';
import { LocalService } from '../../services/local.service';
import { FiltroService } from '../../services/filtro.service';
import { ComprasService } from '../../services/compras.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {

  clientes: Array<Cliente> = [];
  filtros: Array<Cliente> = [];
  filtrosEstadoCidade: Array<Cliente> = [];
  loaded = false;
  estados: Estado[] = [];
  cidades: Cidade[] = [];
  cidadeOpcao = 'Selecione um estado';
  comprasCliente = [];
  @ViewChild('apagarSwal') apagarModal: SwalComponent;
  clienteAtualId: string;
  inativos = false;

  filtroGroup = new FormGroup({
    estado: new FormControl(''),
    cidade: new FormControl(''),
    pesquisa: new FormControl('')
  });

  @ViewChild('historicoSwalAtivo') private historicoSwal: SwalComponent;
  @ViewChild('historicoSwalInativo') private historicoSwalInativo: SwalComponent;

  constructor(private clientesService: ClientesService,
              private spinner: NgxSpinnerService,
              private localService: LocalService,
              private filtroService: FiltroService,
              public readonly swalTargets: SwalPortalTargets,
              private comprasService: ComprasService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.spinner.show();
    this.getEstados();
    this.filtroGroup.get('estado').setValue('selecione', {emitEvent: false});
    this.filtroGroup.get('cidade').setValue('selecione', {emitEvent: false});
    this.configureForm();
    this.route.data.subscribe((data) => {
      if (data.hasOwnProperty('inativos') && data.inativos) {
        this.inativos = true;
      }
      this.getClientes();
    })
  }

  private async getClientes() {
    if (this.inativos) {
      const clientes = await this.clientesService.getClientesInativos().toPromise();
      this.clientes = [...clientes];
      this.filtros = [...this.clientes];
      this.spinner.hide();
      this.loaded = true;
    } else {
      const clientes = await this.clientesService.getClientesAtivos().toPromise();
      this.clientes = [...clientes];
      this.filtros = [...this.clientes];
      this.spinner.hide();
      this.loaded = true;
    }
    
  }

  getEstados() {
    this.localService.getEstados().subscribe((estados) => {
      this.estados = estados.map((estado) => {
        const newEstado = new Estado();
        newEstado.id = estado.id;
        newEstado.nome = estado.nome;
        newEstado.sigla = estado.sigla;
        return newEstado;
      });
    });
  }

  getCidades(id: number) {
    this.clearArray(this.cidades);
    this.localService.getCidades(id).subscribe((cidades) => {
      this.cidades = cidades.map((cidade) => {
        const newCidade = new Cidade();
        newCidade.nome = cidade.nome;
        return newCidade;
      })
    })
  }

  estadoSelecionado(estado: Estado) {
    this.clearArray(this.filtros);
    this.clearArray(this.cidades);
    if (estado.nome === 'todos') {
      this.filtros = [...this.clientes];
      this.cidadeOpcao = 'Selecione um estado';
    } else {
      this.filtrosEstadoCidade = this.filtroService.filtroEstado([...this.clientes], estado);
      this.filtros = [...this.filtrosEstadoCidade];
      this.getCidades(estado.id);
      this.cidadeOpcao = 'Selecione uma cidade';
    }
    this.filtroGroup.get('cidade').setValue('selecione', {emitEvent: false});
  }

  cidadeSelecionada(cidade: Cidade) {
    this.clearArray(this.filtros);
    this.filtros = this.filtroService.filtroCidade([...this.filtrosEstadoCidade], cidade);
  }

  filtrarPesquisa(filtro: string) {
    if (filtro.length > 0) {
      if (this.filtrosEstadoCidade.length > 0) {
        this.filtros = this.filtroService.filtroPesquisaCliente([...this.filtrosEstadoCidade], filtro);
      } else {
        this.filtros = this.filtroService.filtroPesquisaCliente([...this.clientes], filtro);
      }
    } else {
      this.filtros = [...this.clientes];
    }
  }

  async historico(cliente) {
    this.clearArray(this.comprasCliente);
    const compras = await this.comprasService.getHistorico(cliente.id).toPromise();
    this.comprasCliente = compras;
    this.clienteAtualId = cliente.id;
    if (this.inativos) {
      this.historicoSwalInativo.fire();
    } else {
      this.historicoSwal.fire();
    }
  }

  clearCliente() {
    this.clienteAtualId = null;
  }

  abrirModalApagar(clienteId, event) {
    event.stopPropagation();
    this.clienteAtualId = clienteId;
    this.apagarModal.fire();
  }

  async apagarCliente() {
    await this.clientesService.deleteCliente(this.clienteAtualId).toPromise();
    this.loaded = false;
    this.spinner.show();
    this.clearArray(this.comprasCliente);
    this.clienteAtualId = null;
    this.getClientes();
  }

  async desativarCliente() {
    await this.clientesService.updateCliente(this.clienteAtualId, {isActive: false}).toPromise();
    this.loaded = false;
    this.spinner.show();
    this.getClientes();
    this.clienteAtualId = null;
    
  }
  async ativarCliente() {
    await this.clientesService.updateCliente(this.clienteAtualId, {isActive: true}).toPromise();
    this.loaded = false;
    this.spinner.show();
    this.getClientes();
    this.clienteAtualId = null;
    
  }

  configureForm() {
    this.filtroGroup.get('estado').valueChanges.subscribe((estado) => {
      this.estadoSelecionado(estado);
    });
    this.filtroGroup.get('pesquisa').valueChanges.subscribe((value) => {
      this.filtrarPesquisa(value);
    });
    this.filtroGroup.get('cidade').valueChanges.subscribe((value) => {
      this.cidadeSelecionada(value);
    })
  }

  clearArray(array: Array<any>) {
    while (array.length > 0) {
      array.pop();
    }
  }

}
