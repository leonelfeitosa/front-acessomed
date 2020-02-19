import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private clientesUrl = 'http://localhost:3000/clientes';
  constructor(private http: HttpClient) { }

  private getToken() {
    const token =  localStorage.getItem('token');
    const headers = {
      'Token': token
    };
    const requestOptions = {
      headers: new HttpHeaders(headers)
    }
    return requestOptions;
  }

  public getClientesAtivos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.clientesUrl}/?situacao=ativo`, this.getToken());
  }

  public getClientesInativos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.clientesUrl}/?situacao=inativo`, this.getToken());
  }

  public deleteCliente(clienteId): Observable<any> {
    return this.http.delete<any>(`${this.clientesUrl}/${clienteId}`, this.getToken());
  }

  public updateCliente(clienteId, update): Observable<any> {
    return this.http.put<any>(`${this.clientesUrl}/${clienteId}`, update, this.getToken());
  }
}
