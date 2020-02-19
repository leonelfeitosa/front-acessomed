import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AgenteService } from '../../services/agente.service';
import { confirmarSenha } from '../../shared/confirmar-senha.directive';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FotoPerfilComponent } from 'app/components/foto-perfil/foto-perfil.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { LocalService } from '../../services/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Estado } from '../../models/estado';
import { Cidade } from '../../models/cidade';

declare var $: any;

@Component({
  selector: 'app-cadastrar-agente',
  templateUrl: './cadastrar-agente.component.html',
  styleUrls: ['./cadastrar-agente.component.scss']
})
export class CadastrarAgenteComponent implements OnInit {

  @ViewChild('fotoPerfil') fotoPerfil: FotoPerfilComponent;
  agenteID: any;
  agenteActive: boolean;
  edit = false;
  editedFoto = false;
  currentAgente: any;

  estados: Array<Estado> = [];
  cidades: Array<Cidade> = [];

  cidadeOpcao = 'Selecione um estado';


  agenteGroup = new FormGroup({
    name: new FormControl(''),
    cpf: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    rg: new FormControl(''),
    telefone: new FormControl(''),
    email: new FormControl(''),
    endereco: new FormControl(''),
    estado: new FormControl(''),
    cidade: new FormControl(''),
  }, {validators: confirmarSenha});

  submitted = false;

  constructor(private agenteService: AgenteService,
              private router: Router,
              private storage: AngularFireStorage,
              private route: ActivatedRoute,
              private localService: LocalService,
              private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.estados = this.route.snapshot.data.pageData.estados;
    this.setForm();
    this.route.data.subscribe((data) => {
      if (data.hasOwnProperty('edit') && data.edit) {
        this.spinner.show();
        this.getAgente();
      }
    });
  }

  public getAgente() {
    this.route.params.subscribe((params) => {
      this.agenteID = params['id'];
      this.edit = true;
      this.agenteService.getAgente(this.agenteID).subscribe(async (agente) => {
        this.agenteGroup.get('name').setValue(agente.name);
        this.agenteGroup.get('cpf').setValue(agente.cpf);
        this.agenteGroup.get('rg').setValue(agente.rg);
        this.agenteGroup.get('telefone').setValue(agente.telefone);
        this.agenteGroup.get('email').setValue(agente.email);
        this.agenteGroup.get('endereco').setValue(agente.endereco);
        const estado = this.findEstado(agente.estado);
        this.agenteGroup.get('estado').setValue(estado, {emitEvent: false});
        await this.estadoSelecionado(estado);
        const cidade = this.findCidade(agente.cidade);
        this.agenteGroup.get('cidade').setValue(cidade, {emitEvent: false});
        this.agenteActive = agente.isActive;
        if (agente.foto_perfil !== '') {
        this.storage.storage.refFromURL(agente.foto_perfil).getDownloadURL().then((url) => {
          this.fotoPerfil.image.nativeElement.src = url;
        });
      }
        this.currentAgente = agente;
        this.spinner.hide();
      });
    });
  }

  public async addAgente() {
    if (!this.agenteGroup.valid) {
          $.notify({
            icon: '',
            message: 'Preencha todos os campos corretamente!!'
          }, {
            type: 'warning',
            timer: '1000',
            placement: {
              from: 'top',
              align: 'center'
            }
          });
        } else {
          this.spinner.show();
          const newAgente: any = {
            name: this.agenteGroup.value.name,
            cpf: this.agenteGroup.value.cpf,
            email: this.agenteGroup.value.email,
            endereco: this.agenteGroup.value.endereco,
            estado: this.agenteGroup.value.estado.sigla,
            cidade: this.agenteGroup.value.cidade.nome,
            rg: this.agenteGroup.value.rg,
            telefone: this.agenteGroup.value.telefone,
            password: this.agenteGroup.value.password
          }
          if (this.editedFoto) {
            const foto: File = this.fotoPerfil.getFile();
            const fotoId = Math.random().toString(36).substring(2);
            let fotoRefUrl = '';
            let fotoRef: any;
            if (this.edit) {
              fotoRefUrl = this.currentAgente.foto_perfil;
              fotoRef = this.storage.storage.refFromURL(fotoRefUrl);
              await fotoRef.delete();
            }
            fotoRefUrl = 'fotos_perfil/' + fotoId + '.png';
            fotoRef = this.storage.storage.ref(fotoRefUrl);
            await fotoRef.put(foto).then(async (snapshot) => {
              newAgente.foto_perfil = await snapshot.ref.getDownloadURL();
            })
          } else {
            newAgente.foto_perfil = '';
          }
          if (this.edit) {
            if (!this.editedFoto) {
            newAgente.foto_perfil = this.currentAgente.foto_perfil;
            }
            try {
              await this.agenteService.updateAgente(this.agenteID, newAgente).toPromise();
            $.notify({
              icon: '',
              message: 'Agente alterado'
            }, {
              type: 'info',
              timer: '1000',
              placement: {
                from: 'top',
                align: 'center'
              }
            });
            if (this.agenteActive) {
              this.router.navigateByUrl('/admin/agentes');
            } else {
              this.router.navigateByUrl('/admin/agentes/inativos');
            }
            } catch (err) {
              this.spinner.hide();
              $.notify({
                icon: '',
                message: 'Ocorreu um erro'
              }, {
                type: 'danger',
                timer: '1000',
                placement: {
                  from: 'top',
                  align: 'center'
                }
              });
            }
          } else {
            try {
              await this.agenteService.addAgente(newAgente).toPromise();
              $.notify({
                icon: '',
                message: 'Agente criado'
              }, {
                type: 'info',
                timer: '1000',
                placement: { 
                  from: 'top',
                  align: 'center'
                }
              });
              this.router.navigateByUrl('/admin/agentes');
            } catch(err) {
              console.log(err);
              this.spinner.hide();
              $.notify({
                icon: '',
                message: 'Este CPF já está cadastrado!'
              }, {
                type: 'danger',
                timer: '1000',
                placement: {
                  from: 'top',
                  align: 'center'
                }
              });
            }
            
          }
        }
        }
  public desativarAgente() {
    const agente = {
      isActive: false
    };
    this.agenteService.updateAgente(this.agenteID, agente).subscribe(() => {
      $.notify({
        icon: '',
        message: 'Agente desativado'
      }, {
        type: 'info',
        timer: '1000',
        placement: {
          from: 'top',
          align: 'center'
        }
      });
      this.router.navigateByUrl('/admin/agentes');
    });
  }

  public reativarAgente() {
    const agente = {
      isActive: true
    };
    this.agenteService.updateAgente(this.agenteID, agente).subscribe(() => {
      $.notify({
        icon: '',
        message: 'Agente reativado'
      }, {
        type: 'info',
        timer: '1000',
        placement: {
          from: 'top',
          align: 'center'
        }
      });
      this.router.navigateByUrl('/admin/agentes');
    });
  }


  public fotoEditada() {
    console.log('Foto Selecionada');
    this.editedFoto = true;
  }

  clearArray(values: Array<any>) {
    while (values.length) {
      values.pop();
    }
  }

  public getEstados(): void {
    this.localService.getEstados().subscribe((estados) => {
      estados.forEach(element => {
        const estado = new Estado()
        estado.id = element.id;
        estado.nome = element.nome;
        estado.sigla = element.sigla;
        this.estados.push(estado);
      });
    });
  }
  public async estadoSelecionado(estado: Estado) {
    this.clearArray(this.cidades);
    const cidades = await this.localService.getCidades(estado.id).toPromise();
    this.cidades = await Promise.all(cidades.map(async (cidade) => {
      const newCidade = new Cidade();
      newCidade.nome = cidade.nome;
      return newCidade;
    }))
    this.cidadeOpcao = 'Selecione uma Cidade';
  }

  public cidadeSelecionada(cidade: Cidade) {
    this.agenteGroup.get('cidade').setValue(cidade);
  }

  findEstado(sigla: string) {
    return this.estados.find((estado) => {
      if (sigla.toLowerCase() === estado.sigla.toLowerCase()) {
        return true
      }
      return false
    });
  }

  findCidade(nome: string) {
    return this.cidades.find((cidade) => {
      if (nome.toLowerCase() === cidade.nome.toLowerCase()) {
        return true;
      }
      return false;
    })
  }
  private setForm(): void {
    this.getEstados();
    this.agenteGroup.get('estado').setValue('selecione', {emitEvent: false});
    this.agenteGroup.get('estado').valueChanges.subscribe((value) => {
      this.estadoSelecionado(value);
    });
    this.agenteGroup.get('cidade').setValue('selecione', {emitEvent: false});
  }
}


