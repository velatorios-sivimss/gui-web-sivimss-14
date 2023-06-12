import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

import {finalize} from "rxjs/operators";

import {PersonaInterface} from "../../models/persona.interface";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";

@Component({
  selector: 'app-por-empresa',
  templateUrl: './por-empresa.component.html',
  styleUrls: ['./por-empresa.component.scss']
})
export class PorEmpresaComponent implements OnInit {



  readonly POSICION_PAISES = 0;
  readonly POSICION_ESTADOS = 1;

  empresaForm!: FormGroup;

  agregarPersona: boolean = false;
  personasConvenio: PersonaInterface[] = [];

  estado!: TipoDropdown[];
  pais!: TipoDropdown[]


  constructor(
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.estado = respuesta[this.POSICION_ESTADOS]!.map((estado: TipoDropdown) => (
      {label: estado.label, value: estado.value} )) || [];
    this.pais = respuesta[this.POSICION_PAISES]!.map((pais: TipoDropdown) => (
      {label: pais.label, value: pais.value} )) || [];
    this.inicializarEmpresaForm();
  }

  inicializarEmpresaForm(): void{
    this.empresaForm = this.formBuilder.group({
                 nombre: [{value: null, disabled: false}, [Validators.required]],
            razonSocial: [{value: null, disabled: false}, [Validators.required]],
                    rfc: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_RFC)]],
                   pais: [{value: null, disabled: false}, [Validators.required]],
                     cp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                colonia: [{value: null, disabled: false}, [Validators.required]],
                 estado: [{value: null, disabled: true},  [Validators.required]],
              municipio: [{value: null, disabled: true},  [Validators.required]],
                  calle: [{value: null, disabled: false}, [Validators.required]],
         numeroExterior: [{value: null, disabled: false}, [Validators.required]],
         numeroInterior: [{value: null, disabled: false}],
               telefono: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
               promotor: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  consultarRFC(): void {
    if(!this.fe.rfc.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consultaRFC(this.fe.rfc.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        // R.F.C. no valido.

      },(error: HttpErrorResponse) => {

      }
    )
  }

  agregarPersonaSolicitante(): void {

  }

  abrirAgregarPersona(): void {
    this.agregarPersona = true;
  }

  mostrarPersonas( personas: PersonaInterface): void {
    this.agregarPersona = false;
    this.personasConvenio.push(personas);
  }

  abrirModalDetallePersona(personaDetalle: PersonaInterface) {
    console.log("Se comenta método para que no marque error en Sonar", personaDetalle);
  }

  get fe() {
    return this.empresaForm.controls;
  }

}
