import { Component, OnInit, ViewChild } from '@angular/core';
import { ComprasService } from '../../services/compras.service';
import { SwalComponent, SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss']
})
export class ComprasComponent implements OnInit {
  compras: any[];
  compraSelecionada:any;
  @ViewChild('detalhesSwal') private detalhesModal: SwalComponent;

  constructor(private comprasService: ComprasService,
    public readonly swalTargets: SwalPortalTargets) { }

  ngOnInit() {
    this.getCompras();
  }

  private getCompras() {
    this.comprasService.getCompras().subscribe((compras) => {
      console.log(compras);
      this.compras = compras;
    });
  }

  abrirModal(compra) {
    this.compraSelecionada = compra;
    this.detalhesModal.fire();
  }

  isUndefined(obj) {
    const retorno = Object.keys(obj).length === 0;
    return retorno;
  }

}
