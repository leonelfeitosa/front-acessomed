import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClinicasService } from '../../services/clinicas.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SwalComponent, SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalService } from '../../services/local.service';
import { Estado } from '../../models/estado';
import { Cidade } from '../../models/cidade';
import { FiltroService } from '../../services/filtro.service';



declare var $: any;
@Component({
  selector: 'app-clinicas',
  templateUrl: './clinicas.component.html',
  styleUrls: ['./clinicas.component.scss']
})
export class ClinicasComponent implements OnInit {
  clinicas: any = [];
  filtros: any[] = [];
  filtrosEstadoCidade: any[] = [];
  clinicaAtual: any;
  loaded = false;
  estados: Array<Estado> = [];
  cidades: Array<Cidade> = [];
  cidadeOpcao = 'Selecione um estado'
  inativos = false;

  procedimentoGroup = new FormGroup({
    nome: new FormControl('', Validators.required),
    valor: new FormControl('', Validators.required)
  });

  filtroGroup = new FormGroup({
    situacao: new FormControl('todos'),
    estado: new FormControl('selecione'),
    cidade: new FormControl('selecione'),
    pesquisa: new FormControl('')
  })

  @ViewChild('procedimentosSwal') private procedimentoModal: SwalComponent;
  @ViewChild('apagarSwal') apagarModal: SwalComponent;

  constructor(private clinicasService: ClinicasService,
    public readonly swalTargets: SwalPortalTargets,
    private spinner: NgxSpinnerService,
    private localService: LocalService,
    private filtroService: FiltroService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.spinner.show();
    this.configureForm();
    this.route.data.subscribe((data) => {
      if (data.hasOwnProperty('inativos') && data.inativos) {
        this.inativos = true;
      }
      this.getClinicas();
    })
  }

  getEstados(): void {
    const estadosSubscription = this.localService.getEstados().subscribe((estados) => {
      estados.forEach((estado) => {
        const newEstado = new Estado();
        newEstado.id = estado.id;
        newEstado.nome = estado.nome;
        newEstado.sigla = estado.sigla;
        this.estados.push(newEstado);
      });
      estadosSubscription.unsubscribe();
    })
  }

  getCidades(estadoId: number): void {
    this.clearArray(this.cidades);
    const cidadeSubscription = this.localService.getCidades(estadoId).subscribe((cidades) => {
      cidades.forEach((cidade) => {
        const newCidade = new Cidade();
        newCidade.nome = cidade.nome;
        this.cidades.push(newCidade);
      });
      cidadeSubscription.unsubscribe();
    });
  }

  estadoSelecionado(valor: Estado): void {
    if (valor.nome === 'todos') {
      this.filtro('todos');
      this.cidadeOpcao = 'Selecione um estado';
    } else {
      this.cidadeOpcao = 'Selecione uma cidade';
      this.getCidades(valor.id);
      this.filtrosEstadoCidade = this.filtroService.filtroEstado([...this.clinicas], valor);
      this.clearArray(this.filtros);
      this.filtros = [...this.filtrosEstadoCidade];
    }
    this.filtroGroup.get('cidade').setValue('selecione', { emitEvent: false });
  }

  cidadeSelecionada(cidade: Cidade): void {
    this.clearArray(this.filtros);
    this.filtros = this.filtroService.filtroCidade(this.filtrosEstadoCidade, cidade);
  }

  async getClinicas() {
    if (this.inativos) {
      const retorno = await this.clinicasService.getClinicasInativos().toPromise();
      this.clinicas = [...retorno];
      this.filtros = [...this.clinicas];
      this.loaded = true;
      this.spinner.hide();
    } else {
      const retorno = await this.clinicasService.getClinicasAtivos().toPromise();
      this.clinicas = [...retorno];
      this.filtros = [...this.clinicas];
      this.loaded = true;
      this.spinner.hide();
    }
  }

  async filtro(filtro: string) {
    this.clearArray(this.filtros);
    this.filtros = this.filtroService.filtroSituacao([...this.clinicas], filtro);
    if (filtro === 'todos') {
      this.cidadeOpcao = 'Selecione um estado'
      this.clearArray(this.cidades);
      this.filtroGroup.get('cidade').setValue('selecione', { emitEvent: false });
      this.filtroGroup.get('estado').setValue('selecione', { emitEvent: false });
    }
  }
  async filtrarPesquisa(filtro: string) {
    this.clearArray(this.filtros);
    if (filtro.length > 0) {
      if (this.filtrosEstadoCidade.length > 0) {
        this.filtros = this.filtroService.filtroPesquisa([...this.filtrosEstadoCidade], filtro);
      } else {
        this.filtros = this.filtroService.filtroPesquisa([...this.clinicas], filtro);
      }
    } else {
      this.filtros = [...this.clinicas];
    }
  }

  private clearArray(array: Array<any>) {
    while (array.length > 0) {
      array.pop();
    }
  }

  collapse(index: number): void {
    this.clinicas[index].collapsed = !this.clinicas[index].collapsed;
    for (let i = 0; i < this.clinicas.length; i++) {
      if (this.clinicas[i].collapsed && i !== index) {
        this.clinicas[i].collapsed = false;
      }
    }
  }

  abrirModalProcedimento(clinica: any): void {
    this.clinicaAtual = clinica;
    this.procedimentoModal.fire();
  }

  abrirModalApagar(clinica: any, event): void {
    event.stopPropagation();
    this.clinicaAtual = clinica;
    this.apagarModal.fire();
  }

  async apagarClinica() {
    await this.clinicasService.deleteClinica(this.clinicaAtual.id).toPromise();
    this.spinner.show();
    this.loaded = false;
    this.clinicaAtual = null;
    this.getClinicas();
  }

  configureForm(): void {
    this.getEstados();
    this.filtroGroup.get('estado').valueChanges.subscribe((value) => {
      this.estadoSelecionado(value);
    });
    this.filtroGroup.get('cidade').valueChanges.subscribe((value) => {
      this.cidadeSelecionada(value);
    });
    this.filtroGroup.get('situacao').valueChanges.subscribe((value) => {
      this.filtro(value);
    });
    this.filtroGroup.get('pesquisa').valueChanges.subscribe((value) => {
      this.filtrarPesquisa(value);
    })
  }

  cadastrarProcedimento(): void {
    const procedimento = {
      nome: this.procedimentoGroup.value.nome,
      valor: this.procedimentoGroup.value.valor
    };
    this.clinicasService.addProcedimento(this.clinicaAtual.id, procedimento).subscribe((clinica) => {
      this.clearArray(this.filtros);
      this.getClinicas();
      $.notify({
        icon: '',
        message: 'Procedimento adicionado'
      }, {
        type: 'info',
        timer: '1000',
        placement: {
          from: 'top',
          align: 'center'
        }
      });
    })
  }

}
