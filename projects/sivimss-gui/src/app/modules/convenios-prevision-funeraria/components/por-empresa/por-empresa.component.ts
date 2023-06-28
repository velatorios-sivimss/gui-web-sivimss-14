import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

import {finalize} from "rxjs/operators";

import {PersonaInterface} from "../../models/persona.interface";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {Empresa} from "../../models/empresa.interface";

@Component({
  selector: 'app-por-empresa',
  templateUrl: './por-empresa.component.html',
  styleUrls: ['./por-empresa.component.scss']
})
export class PorEmpresaComponent implements OnInit, OnChanges {

  @Input() existePersona: boolean = false;
  @Input() folioEmpresa!: any;
  @Input() confirmacionGuardado!: boolean;
  @Output() guardarFormularioPrincipal = new EventEmitter<boolean>();
  @Output() formularioValido = new EventEmitter<boolean>();
  @Output() formularioEmpresa = new EventEmitter<any>();

  readonly POSICION_PAISES = 0;
  readonly POSICION_ESTADOS = 1;

  empresaForm!: FormGroup;
  empresaFormTempora!: Empresa;

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
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {

    this.empresaFormTempora = JSON.parse(localStorage.getItem('empresaForm') as string) || {};
    if(this.empresaFormTempora)localStorage.removeItem('empresaForm');
    // if(!this.existePersona) this.empresaFormTempora = {};
    this.personasConvenio = JSON.parse(localStorage.getItem('persona') as string) || [];
    localStorage.removeItem('persona');



    const respuesta = this.route.snapshot.data['respuesta'];
    this.estado = respuesta[this.POSICION_ESTADOS]!.map((estado: TipoDropdown) => (
      {label: estado.label, value: estado.value} )) || [];
    this.pais = respuesta[this.POSICION_PAISES]!.map((pais: TipoDropdown) => (
      {label: pais.label, value: pais.value} )) || [];
    this.inicializarEmpresaForm();
    if(this.folioEmpresa ==="")return;
    this.consultarFolio("onInit")
  }

  inicializarEmpresaForm(): void{
    this.empresaForm = this.formBuilder.group({
                 nombre: [{value: this.empresaFormTempora?.nombre ?? null, disabled: false}, [Validators.required]],
            razonSocial: [{value: this.empresaFormTempora?.razonSocial ?? null, disabled: false}, [Validators.required]],
                    rfc: [{value: this.empresaFormTempora?.rfc ?? null, disabled: false}],
                   pais: [{value: this.empresaFormTempora?.pais ?? null, disabled: false}, [Validators.required]],
                     cp: [{value: this.empresaFormTempora?.cp ?? null, disabled: false}, [Validators.required]],
                colonia: [{value: this.empresaFormTempora?.colonia ?? null, disabled: false}, [Validators.required]],
                 estado: [{value: this.empresaFormTempora?.estado ?? null, disabled: true},  [Validators.required]],
              municipio: [{value: this.empresaFormTempora?.municipio ?? null, disabled: true},  [Validators.required]],
                  calle: [{value: this.empresaFormTempora?.calle ?? null, disabled: false}, [Validators.required]],
         numeroExterior: [{value: this.empresaFormTempora?.numeroExterior ?? null, disabled: false}, [Validators.required]],
         numeroInterior: [{value: this.empresaFormTempora?.numeroInterior ?? null, disabled: false}],
               telefono: [{value: this.empresaFormTempora?.telefono ?? null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: this.empresaFormTempora?.correoElectronico ?? null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
    });
  }

  consultarRFC(): void {
    if(!this.fe.rfc.value){return}
    if(!this.fe.rfc.value.match(PATRON_RFC)){
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
    this.validarFormularioVacio();
  }

  consultarCP(): void {
    if(!this.fe.cp.value){return}
    this.validarFormularioVacio();
    this.loaderService.activar();
    this.agregarConvenioPFService.consutaCP(+this.fe.cp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.fe.estado.setValue(respuesta.datos[0]?.estado);
        this.fe.municipio.setValue(respuesta.datos[0]?.municipio);
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  validarCorreoElectornico(): void {
    if(!this.fe.correoElectronico.value){return}
    this.validarFormularioVacio();
    if (this.empresaForm.controls.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  agregarPersonaSolicitante(): void {
    this.empresaFormTempora = {
      nombre: this.fe.nombre.value,
      razonSocial: this.fe.razonSocial.value,
      rfc: this.fe.rfc.value,
      pais: this.fe.pais.value,
      cp: this.fe.cp.value,
      colonia: this.fe.colonia.value,
      estado: this.fe.estado.value,
      municipio: this.fe.municipio.value,
      calle: this.fe.calle.value,
      numeroExterior: this.fe.numeroExterior.value,
      numeroInterior: this.fe.numeroInterior.value,
      telefono: this.fe.telefono.value,
      correoElectronico: this.fe.correoElectronico.value,
    }
    localStorage.setItem('empresaForm',JSON.stringify(this.empresaFormTempora));
    // localStorage.setItem('personasAgregadas',JSON.stringify(this.empresaFormTempora));
    this.guardarFormularioPrincipal.emit(true);
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

  consultarFolio(origen: string): void {
    console.log(this.empresaFormTempora)
    //origen.includes("onChanges") &&
    if(!this.folioEmpresa)return;
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarFolioConvenioEmpresa(this.folioEmpresa).pipe(
      finalize(() => {this.loaderService.desactivar()})
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.loaderService.desactivar()
        this.empresaForm.reset()
        if(!respuesta.datos || respuesta.datos.length == 0)return;
        this.fe.nombre.setValue(respuesta.datos[0].nombreEmpresa);
        this.fe.razonSocial.setValue(respuesta.datos[0].razonSocial);
        this.fe.rfc.setValue(respuesta.datos[0].rfc);
        this.fe.pais.setValue(respuesta.datos[0].idPais);
        this.fe.cp.setValue(respuesta.datos[0].cp);
        this.fe.estado.setValue(respuesta.datos[0].desEstado);
        this.fe.municipio.setValue(respuesta.datos[0].desMunicipio);
        this.fe.colonia.setValue(respuesta.datos[0].desColonia);
        this.fe.calle.setValue(respuesta.datos[0].calle);
        this.fe.numeroInterior.setValue(respuesta.datos[0].numInterior);
        this.fe.numeroExterior.setValue(respuesta.datos[0].numExterior);
        this.fe.correoElectronico.setValue(respuesta.datos[0].correo);
        this.fe.telefono.setValue(respuesta.datos[0].telefono);
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    );
  }

  validarFormularioVacio(): void {
    //if(this.empresaForm.valid && this.personasConvenio.length > 0){
    if(this.empresaForm.valid){
      this.formularioValido.emit(true);
    }else{
      this.formularioValido.emit(false);
    }
  }

  get fe() {
    return this.empresaForm.controls;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.confirmacionGuardado){
      this.formularioEmpresa .emit(
        {
          nombre: this.fe.nombre.value,
          razonSocial: this.fe.razonSocial.value,
          rfc: this.fe.rfc.value,
          pais: this.fe.pais.value,
          cp: this.fe.cp.value,
          colonia: this.fe.colonia.value,
          estado: this.fe.estado.value,
          municipio: this.fe.municipio.value,
          calle: this.fe.calle.value,
          numeroExterior: this.fe.numeroExterior.value,
          numeroInterior: this.fe.numeroInterior.value,
          telefono: this.fe.telefono.value,
          correoElectronico: this.fe.correoElectronico.value,
          personas: this.personasConvenio
        }
      );
    }
    if(this.folioEmpresa === "")return;
      this.consultarFolio("onChanges");
  }
}
