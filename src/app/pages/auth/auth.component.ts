import { AuthService } from '../../services/auth.service';
import { Component, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';


declare var $: any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  authGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });
  auth: any =  {
    username: '',
    password: ''
  };
  authValidation = {
    username: false,
    password: false
  };
  authExists = {
    username: false,
    password: false
  };
  submitting = false;
  mask = '000.000.000-009';
  constructor(private authService: AuthService,
              private fireAuth: AngularFireAuth,
              private router: Router,
              private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.configureForm();
  }



  public authenticate() {
    if (this.authGroup.value.username === '') {
          this.authExists.username = true;
        } else if (this.authGroup.value.password === '') {
          this.authExists.password = true;
        } else {
          this.submitting = true;
          this.spinner.show();
          this.auth = {
            username: this.authGroup.value.username,
            password: this.authGroup.value.password
          };
          const subscriptionLogin = this.authService.login(this.auth).subscribe(async (result) => {
              await this.fireAuth.auth.signInWithCustomToken(result.token);
              this.fireAuth.auth.currentUser.getIdToken().then((token) => {
                localStorage.setItem('token', token);
                localStorage.setItem('username', result.username);
                if (result.type == 'admin'){
                  this.router.navigateByUrl('admin/agentes');
                } else if (result.type == 'clinica') {
                  this.router.navigateByUrl('medico/compras');
                }
                
                this.spinner.hide();
                subscriptionLogin.unsubscribe();
              });
          }, (error) => {
            this.submitting = false;
            const erro = error.error;
            console.log(erro);
            this.spinner.hide();
            if (typeof erro.message !==  'undefined') {
              if (erro.message === 'Username incorreto') {
                this.authValidation.username = true;
              }
              if (erro.message === 'Senha incorreta') {
                this.authValidation.password = true;
              }
              }
            }
          )
        }
  }

  public configureForm():void {
    this.authGroup.get('username').valueChanges.subscribe((value) => {
      this.authValidation.username = false;
      this.authValidation.password = false;
      this.authExists.username = false;
      this.authExists.password = false;
      
      if (value.length > 14) {
        this.mask = '00.000.000/0000-00'
      }
      if (value.length < 15) {
        this.mask = '000.000.000-009'
      }
    });
    
  }

}
