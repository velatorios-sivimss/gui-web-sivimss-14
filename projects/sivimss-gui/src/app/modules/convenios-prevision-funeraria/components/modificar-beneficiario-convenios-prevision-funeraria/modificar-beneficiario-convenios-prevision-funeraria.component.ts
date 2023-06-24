import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {ActivatedRoute} from "@angular/router";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";

@Component({
  selector: 'app-modificar-beneficiario-convenios-prevision-funeraria',
  templateUrl: './modificar-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./modificar-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class ModificarBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiarioForm!: FormGroup;

  datosBeneficiario!: BeneficiarioInterface;

  velatorio: TipoDropdown[] = [];
  parentesco!: TipoDropdown[];

  hoy = new Date();

  constructor(
    private route: ActivatedRoute,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.datosBeneficiario = this.config.data;
    let respuesta = this.route.snapshot.data['respuesta'];
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.inicializarBeneficiarioForm();
    this.consultaVelatorio();
    if(+this.f.edad.value < 18){
      this.f.actaDeNacimiento.enable();
      this.f.copiaINE.disable();
    }else{
      this.f.actaDeNacimiento.disable();
      this.f.copiaINE.disable();
    }
  }

  inicializarBeneficiarioForm(): void {
    this.beneficiarioForm = this.formBuilder.group({
              velatorio: [{value: this.datosBeneficiario.velatorio, disabled: true}, [Validators.required]],
        fechaNacimiento: [{value: this.datosBeneficiario.fechaNacimiento, disabled: false}, [Validators.required]],
                   edad: [{value: this.datosBeneficiario.edad, disabled: false}, [Validators.required]],
                 nombre: [{value: this.datosBeneficiario.nombre, disabled: false}, [Validators.required]],
         primerApellido: [{value: this.datosBeneficiario.primerApellido, disabled: false}, [Validators.required]],
        segundoApellido: [{value: this.datosBeneficiario.segundoApellido, disabled: false}, [Validators.required]],
             parentesco: [{value: this.datosBeneficiario.parentesco, disabled: false}, [Validators.required]],
                   curp: [{value: this.datosBeneficiario.curp, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                    rfc: [{value: this.datosBeneficiario.rfc, disabled: false}, [Validators.required, Validators.pattern(PATRON_RFC)]],
         actaNacimiento: [{value: this.datosBeneficiario.actaNacimiento, disabled: false}, [Validators.required]],
      correoElectronico: [{value: this.datosBeneficiario.correoElectronico, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
               telefono: [{value: this.datosBeneficiario.telefono, disabled: false}, [Validators.required]],
       actaDeNacimiento: [{value: this.datosBeneficiario.actaDeNacimiento, disabled: false}],
               copiaINE: [{value: this.datosBeneficiario.copiaINE, disabled: true}],
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
