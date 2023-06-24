import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {DynamicDialogRef} from "primeng/dynamicdialog";

import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {ActivatedRoute} from "@angular/router";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-agregar-beneficiario-convenios-prevision-funeraria',
  templateUrl: './agregar-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class AgregarBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiarioForm!: FormGroup;

  velatorio!: TipoDropdown[] ;
  parentesco!: TipoDropdown[];

  hoy = new Date();

  constructor(
    private alertaService: AlertaService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private route: ActivatedRoute,
    private ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.inicializarBeneficiarioForm();
    this.consultaVelatorio();
  }

  inicializarBeneficiarioForm(): void {
    this.beneficiarioForm = this.formBuilder.group({
              velatorio: [{value: null, disabled: true}, [Validators.required]],
        fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
                   edad: [{value: null, disabled: false}, [Validators.required]],
                 nombre: [{value: null, disabled: false}, [Validators.required]],
         primerApellido: [{value: null, disabled: false}, [Validators.required]],
        segundoApellido: [{value: null, disabled: false}, [Validators.required]],
             parentesco: [{value: null, disabled: false}, [Validators.required]],
                   curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                    rfc: [{value: null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
         actaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required,Validators.pattern(PATRON_CORREO)]],
               telefono: [{value: null, disabled: false}, [Validators.required]],
       actaDeNacimiento: [{value: null, disabled: true}],
               copiaINE: [{value: null, disabled: true}],
    });
  }

  consultaVelatorio(): void {
    let usuario = JSON.parse(localStorage.getItem('usuario') as string);
    this.loaderService.activar();
    this.agregarConvenioPFService.obtenerCatalogoVelatoriosPorDelegacion(usuario.idDelegacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.velatorio = respuesta.datos!.map(
          (velatorio: any) => (
            {label: velatorio.nomVelatorio, value: velatorio.idVelatorio}
          )
        )
        this.f.velatorio.setValue(+usuario.idVelatorio);
      },
      (error: HttpErrorResponse)=> {
        console.log(error);
      }
    )
  }

  validarEdad(): void {
    if(+this.f.edad.value < 18){
      this.f.actaDeNacimiento.enable();
      this.f.copiaINE.disable();
      this.f.copiaINE.patchValue(null);
    }else{
      this.f.copiaINE.enable();
      this.f.actaDeNacimiento.disable();
      this.f.actaDeNacimiento.patchValue(null);
    }
  }

  validarCURP(): void {
    if (this.beneficiarioForm.controls.curp?.errors?.pattern){
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
    }
  }

  validarRFC(): void {
    if (this.beneficiarioForm.controls.rfc?.errors?.pattern){
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
  }

  validarCorreoElectronico(): void {
    if (this.beneficiarioForm.controls.correoElectronico?.errors?.pattern){
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  aceptar(): void {
    this.ref.close(this.beneficiarioForm.value);
  }

  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.beneficiarioForm.controls;
  }
}
