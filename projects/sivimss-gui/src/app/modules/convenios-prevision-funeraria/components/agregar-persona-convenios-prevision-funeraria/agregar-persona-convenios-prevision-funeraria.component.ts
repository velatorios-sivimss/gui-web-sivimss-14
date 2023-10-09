import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { MenuItem } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";


import { MENU_STEPPER_AGREGAR_PERSONA } from "../../constants/menu-steppers-agregar-persona";
import { TipoDropdown } from "../../../../models/tipo-dropdown";

import { BeneficiarioInterface } from "../../models/beneficiario.interface";
import { PersonaInterface } from "../../models/persona.interface";

import {
  AgregarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../agregar-beneficiario-convenios-prevision-funeraria/agregar-beneficiario-convenios-prevision-funeraria.component";
import {
  DetalleBeneficiarioConveniosPrevisionFunerariaComponent
} from "../detalle-beneficiario-convenios-prevision-funeraria/detalle-beneficiario-convenios-prevision-funeraria.component";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {
  ModificarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../modificar-beneficiario-convenios-prevision-funeraria/modificar-beneficiario-convenios-prevision-funeraria.component";
import {
  CATALOGO_ENFERMEDAD_PREEXISTENTE,
  CATALOGO_SEXO,
} from "../../constants/catalogos-funcion";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoPaquete} from "../../models/tipo-paquete.interface";
import * as moment from 'moment';
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";

@Component({
  selector: 'app-agregar-persona-convenios-prevision-funeraria',
  templateUrl: './agregar-persona-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-persona-convenios-prevision-funeraria.component.scss'],
  providers: [DialogService]
})
export class AgregarPersonaConveniosPrevisionFunerariaComponent implements OnInit {

  @Output() personaConvenio = new EventEmitter<PersonaInterface>();

  readonly POSICION_PAISES = 0;
  readonly POSICION_ESTADOS = 1;
  readonly POSICION_PAQUETES = 3;

  personaForm!: FormGroup;
  documentacionForm!: FormGroup;

  beneficiarioRef!: DynamicDialogRef;
  detalleBeneficiarioRef!: DynamicDialogRef;
  modificarBeneficiarioRef!: DynamicDialogRef;

  menuStep: MenuItem[] = MENU_STEPPER_AGREGAR_PERSONA;
  indice: number = 0;

  tipoPaquete!: TipoDropdown[];
  entidadFederativa!: TipoDropdown[];
  enfermedadPrexistente: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  estado!: TipoDropdown[];
  pais!: TipoDropdown[];

  objectoConfirmacion!: PersonaInterface;
  beneficiario: BeneficiarioInterface[] = [];

  otroTipoEnferemdad: boolean = false;
  mostrarModalConfirmacion: boolean = false;
  infoTipoPaquete!: any[];
  detallePais!: any;
  detalleEntidadFederativa!: any;
  detalleEnfermedad!: any;
  detalleTipoPaquete!: any;
  infoPaqueteSeleccionado!: any;
  respuesta: any;
  flujo!: any;

  fechaActual = new Date();

  colonias:TipoDropdown[] = [];


  constructor(
    private alertaService: AlertaService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.flujo = localStorage.getItem('flujo');
    this.respuesta = this.route.snapshot.data['respuesta'];
    this.estado = this.respuesta[this.POSICION_ESTADOS]!.map(
      (estado: TipoDropdown) => (
        {label: estado.label, value: estado.value}
      )
    ) || [];
    this.pais = this.respuesta[this.POSICION_PAISES]!.map(
      (pais: TipoDropdown) => (
        {label: pais.label, value: pais.value}
      )
    ) || [];
    this.tipoPaquete = this.respuesta[this.POSICION_PAQUETES]!.datos.map(
      (paquete: any) => (
        {label: paquete.nomPaquete, value: paquete.idPaquete}
      )
    )
    this.entidadFederativa = this.respuesta[this.POSICION_ESTADOS];
    this.infoTipoPaquete = this.respuesta[this.POSICION_PAQUETES].datos;
    this.inicializarFormPersona();
    this.inicializarDocumentacionForm();
  }

  inicializarFormPersona(): void {
    this.personaForm = this.formBuilder.group({
                       curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                        rfc: [{value: null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
                  matricula: [{value: null, disabled: false}],
                     nombre: [{value: null, disabled: true},  [Validators.required]],
             primerApellido: [{value: null, disabled: true},  [Validators.required]],
            segundoApellido: [{value: null, disabled: true},  [Validators.required]],
          correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
                   telefono: [{value: null, disabled: false}, [Validators.required]],
                      calle: [{value: null, disabled: false}, [Validators.required]],
                 noExterior: [{value: null, disabled: false}, [Validators.required]],
                 noInterior: [{value: null, disabled: false}],
                         cp: [{value: null, disabled: false}, [Validators.required]],
                    colonia: [{value: null, disabled: false}, [Validators.required]],
                  municipio: [{value: null, disabled: true}, [Validators.required]],
                     estado: [{value: null, disabled: true}, [Validators.required]],
                tipoPaquete: [{value: null, disabled: false}, [Validators.required]],
      enfermedadPrexistente: [{value: null, disabled: false}, [Validators.required]],
                       pais: [{value: null, disabled: false}, [Validators.required]],
             otraEnferdedad: [{value: null, disabled: false}],
                       sexo: [{value:null, disabled: false}, [Validators.required]],
                   otroSexo: [{value:null, disabled: false}, [Validators.required]],
            fechaNacimiento: [{value:null, disabled: true}, [Validators.required]],
          entidadFederativa: [{value:null, disabled: false}, [Validators.required]]
    });
  }

  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group( {
      ineAfiliado: [{value: null, disabled: false}],
        copiaCURP: [{value: null, disabled: false}],
         copiaRFC: [{value: null, disabled: false}],
      // copiaActaNacimiento: [{value: null, disabled: false}],
      //            copiaINE: [{value: null, disabled: false}],
    });
  }

  abrirModalAgregarBeneficiario(): void {
    this.beneficiarioRef = this.dialogService.open(AgregarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header: "Agregar beneficiario",
      width: "920px",
    });

    this.beneficiarioRef.onClose.subscribe((beneficiarioModal: BeneficiarioInterface) => {
      if (beneficiarioModal) {
        this.beneficiario.push(beneficiarioModal);
      }
    });
  }

  cambioTipoSexo(): void {
    if(this.fp.sexo.value == 3){
      this.fp.otroSexo.setValidators(Validators.required);
    }else{
      this.fp.otroSexo.patchValue(null);
      this.fp.otroSexo.clearValidators();
    }
    this.fp.otroSexo.updateValueAndValidity();
  }

  abrirModalDetalleBeneficiario(detalleBeneficiario: BeneficiarioInterface): void {
    this.detalleBeneficiarioRef = this.dialogService.open(DetalleBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Detalle de beneficiario",
      width:"920px",
      data: detalleBeneficiario,
    });
  }

  abrirModalModificarBeneficiario(modificarBeneficiario: BeneficiarioInterface): void {
    this.modificarBeneficiarioRef = this.dialogService.open(ModificarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Modificar beneficiario",
      width:"920px",
      data: modificarBeneficiario,
    })
    this.modificarBeneficiarioRef.onClose.subscribe((beneficiario: BeneficiarioInterface) => {
      if(beneficiario){
        const index = this.beneficiario.findIndex((item: BeneficiarioInterface) => item.curp === beneficiario.curp);
        this.beneficiario[index] = beneficiario;
      }
    })
  }

  abrirModalEliminarBeneficiario(eliminarBeneficiario: BeneficiarioInterface): void {
    this.beneficiario = this.beneficiario.filter((element) => {
      return eliminarBeneficiario.curp != element.curp;
    })
  }

  consultarCP(): void {
    if(!this.fp.cp.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consutaCP(this.fp.cp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe({
        next:(respuesta: HttpRespuesta<any>) => {
          this.colonias = mapearArregloTipoDropdown(respuesta.datos,'nombre','nombre')
          this.fp.colonia.setValue(respuesta.datos[0].nombre);
          this.fp.estado.setValue(respuesta.datos[0].municipio.entidadFederativa.nombre);
          this.fp.municipio.setValue(respuesta.datos[0].municipio.nombre);
          this.fp.pais.setValue(119);
        },
        error:(error:HttpErrorResponse) => {
          console.log(error);
        }
      }
    )
  }

  guardar(): void {
    let personasAgregadas: PersonaInterface = JSON.parse(localStorage.getItem('persona') as string);
    personasAgregadas = this.objectoConfirmacion
    localStorage.setItem('persona',JSON.stringify(personasAgregadas));
    if(this.flujo.includes('modificar')){
      this.router.navigate(['convenios-prevision-funeraria/modificar-nuevo-convenio']);
      return
    }
    this.router.navigate(['convenios-prevision-funeraria/ingresar-nuevo-convenio']);
  }

  cambioEnfermedadPrexistente(): void {
    this.otroTipoEnferemdad = false;
    this.fp.otraEnferdedad.disable();
    this.fp.otraEnferdedad.clearValidators();
    if(this.fp.enfermedadPrexistente.value == 4){
      this.otroTipoEnferemdad = true
      this.fp.otraEnferdedad.enable();
      this.fp.otraEnferdedad.patchValue(null);
      this.fp.otraEnferdedad.setValidators(Validators.required);
      this.fp.otraEnferdedad.updateValueAndValidity();
    }
  }

  mostrarModalTipoPaquete(): void {
    this.infoTipoPaquete.forEach((paquete: TipoPaquete) => {
      if(paquete.idPaquete == this.fp.tipoPaquete.value){
        this.infoPaqueteSeleccionado = paquete.descPaquete
      }
    })
    this.mostrarModalConfirmacion = true;
  }

  consultaCURP(): void{
    if(!this.fp.curp.value)return;
    if (this.personaForm.controls.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      this.limpiarDatosCurpRFC(1);
      return;
    }
    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC("",this.fp.curp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if ((respuesta.datos[0]?.curp ?? null) != null) {
          const [anio, mes, dia] = respuesta.datos[0].fechaNacimiento.split('-')
          this.fp.nombre.setValue(respuesta.datos[0].nomPersona);
          this.fp.primerApellido.setValue(respuesta.datos[0].primerApellido);
          this.fp.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
          this.fp.rfc.setValue(respuesta.datos[0].rfc)
          respuesta.datos[0].correo.includes('null') ? this.fp.correoElectronico.patchValue(null) : this.fp.correoElectronico.setValue(respuesta.datos[0].correo)
          respuesta.datos[0].telefono.includes('null') ? this.fp.telefono.patchValue(null) : this.fp.telefono.setValue(respuesta.datos[0].telefono)
          this.fp.fechaNacimiento.setValue(new Date(anio + '/' + mes + '/' + dia))
          this.fp.sexo.setValue(respuesta.datos[0].sexo);
          this.fp.otroSexo.setValue(respuesta.datos[0].otroSexo);
          this.fp.entidadFederativa.setValue(respuesta.datos[0].idEstado);
          this.fp.calle.setValue(respuesta.datos[0].calle);
          this.fp.noExterior.setValue(respuesta.datos[0].numExterior);
          this.fp.noInterior.setValue(respuesta.datos[0].numInterior);
          this.fp.cp.setValue(respuesta.datos[0].cp);
          this.colonias = [{label:respuesta.datos[0].colonia,value:respuesta.datos[0].colonia}]
          this.fp.colonia.setValue(respuesta.datos[0].colonia);
          this.fp.municipio.setValue(respuesta.datos[0].municipio);
          this.fp.estado.setValue(respuesta.datos[0].estado);
          this.fp.pais.setValue(respuesta.datos[0].idPais);
          this.cambioTipoSexo();
        } else if (respuesta.mensaje === "") {
          if (respuesta.datos.curp === "" || respuesta.datos.curp == null) {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
            return
          }
          const [dia, mes, anio] = respuesta.datos.fechaNacimiento.split('/')
          this.fp.nombre.setValue(respuesta.datos.nomPersona);
          this.fp.primerApellido.setValue(respuesta.datos.primerApellido);
          this.fp.segundoApellido.setValue(respuesta.datos.segundoApellido);
          this.fp.fechaNacimiento.setValue(new Date(anio + '/' + mes + '/' + dia))
          this.fp.sexo.setValue(+respuesta.datos.sexo);
          this.cambioTipoSexo();
          this.consultarLugarNacimiento(respuesta.datos.desEstado);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    })
  }

  consultarLugarNacimiento(entidad:string): void {
    const entidadEditada = this.accentsTidy(entidad);
    if(entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')){
      this.fp.lugarNacimiento.setValue(11);
      return
    }
    if(entidadEditada.toUpperCase().includes('DISTRITO FEDERAL')|| entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')){
      this.fp.lugarNacimiento.setValue(7);
      return
    }
    this.estado.forEach((element:any) => {
      const entidadIteracion =  this.accentsTidy(element.label);
      if(entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())){
        this.fp.entidadFederativa.setValue(element.value);
      }
    })
  }

  accentsTidy(s: string): string {
    let r=s.toLowerCase();
    r = r.replace(new RegExp(/[àáâãäå]/g),"a");
    r = r.replace(new RegExp(/æ/g),"ae");
    r = r.replace(new RegExp(/ç/g),"c");
    r = r.replace(new RegExp(/[èéêë]/g),"e");
    r = r.replace(new RegExp(/[ìíîï]/g),"i");
    r = r.replace(new RegExp(/ñ/g),"n");
    r = r.replace(new RegExp(/[òóôõö]/g),"o");
    r = r.replace(new RegExp(/œ/g),"oe");
    r = r.replace(new RegExp(/[ùúûü]/g),"u");
    r = r.replace(new RegExp(/[ýÿ]/g),"y");
    return r;
  };

  consultaRFC(): void {
    if(!this.fp.rfc.value){return}
    if (this.personaForm.controls.rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
  }

  consultarMatricula(): void {
    if(!this.fp.matricula.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarMatriculaSiap(this.fp.matricula.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    })
  }

  limpiarDatosCurpRFC(posicion:number): void {
    this.fp.nombre.patchValue(null)
    this.fp.primerApellido.patchValue(null)
    this.fp.segundoApellido.patchValue(null)
    if(posicion == 1)this.fp.rfc.patchValue(null)
    if(posicion == 2)this.fp.curp.patchValue(null)
    this.fp.correoElectronico.patchValue(null)
    this.fp.telefono.patchValue(null)
  }

  validarCorreoElectornico(): void {
    if(!this.fp.correoElectronico.value){return}
    if (this.personaForm.controls.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  siguiente(): void {
    this.indice++;
    if(this.indice == 3){
      this.objectoConfirmacion = {
          curp: this.personaForm.get('curp')?.value ? this.personaForm.get('curp')?.value : "",
          rfc: this.personaForm.get('rfc')?.value ? this.personaForm.get('rfc')?.value : "",
          matricula: this.personaForm.get('matricula')?.value ? this.personaForm.get('matricula')?.value : "",
          nombre: this.personaForm.get('nombre')?.value ? this.personaForm.get('nombre')?.value : "",
          primerApellido: this.personaForm.get('primerApellido')?.value ? this.personaForm.get('primerApellido')?.value : "",
          segundoApellido: this.personaForm.get('segundoApellido')?.value ? this.personaForm.get('segundoApellido')?.value : "",
          correoElectronico: this.personaForm.get('correoElectronico')?.value ? this.personaForm.get('correoElectronico')?.value : "",
          telefono: this.personaForm.get('telefono')?.value ? this.personaForm.get('telefono')?.value : "",
          calle: this.personaForm.get('calle')?.value ? this.personaForm.get('calle')?.value : "",
          numeroExterior: this.personaForm.get('noExterior')?.value ? this.personaForm.get('noExterior')?.value : "",
          numeroInterior: this.personaForm.get('noInterior')?.value ? this.personaForm.get('noInterior')?.value : "",
          cp: this.personaForm.get('cp')?.value ? this.personaForm.get('cp')?.value : "",
          colonia: this.personaForm.get('colonia')?.value ? this.personaForm.get('colonia')?.value : "",
          municipio: this.personaForm.get('municipio')?.value ? this.personaForm.get('municipio')?.value : "",
          estado: this.personaForm.get('estado')?.value ? this.personaForm.get('estado')?.value : "",
          pais: this.personaForm.get('pais')?.value ? this.personaForm.get('pais')?.value : "",
          paquete: this.personaForm.get('tipoPaquete')?.value ? this.personaForm.get('tipoPaquete')?.value : "",
          enfermedadPreexistente: this.personaForm.get('enfermedadPrexistente')?.value ? this.personaForm.get('enfermedadPrexistente')?.value : "",
          ineAfiliado: this.documentacionForm.get('ineAfiliado')?.value ? this.documentacionForm.get('ineAfiliado')?.value : false,
          copiaCURP: this.documentacionForm.get('copiaCURP')?.value ? this.documentacionForm.get('copiaCURP')?.value : false,
          copiaRFC: this.documentacionForm.get('copiaRFC')?.value ? this.documentacionForm.get('copiaRFC')?.value : false,
          sexo: this.personaForm.get('sexo')?.value ?? "",
          otroSexo: this.personaForm.get('otroSexo')?.value ?? "",
          fechaNacimiento: moment(this.personaForm.get('fechaNacimiento')?.value).format('YYYY-MM-DD') ?? "",
          entidadFederativa: this.personaForm.get('entidadFederativa')?.value ?? "",
          beneficiarios: this.beneficiario,
          documentacion:{
            validaIneContratante:false,
            validaCurp:false,
            validaRfc:false
          },
          nss:"",
          numIne:"",
          tipoPersona:"",
          otraEnfermedad:"",
      }
      this.detallePais = this.pais.filter(pais => {
        return pais.value == this.fp.pais.value;
      });
      this.detalleTipoPaquete = this.tipoPaquete.filter(paquete => {
        return paquete.value == this.fp.tipoPaquete.value;
      })
      this.detalleEnfermedad = CATALOGO_ENFERMEDAD_PREEXISTENTE.filter(enfermedad => {
        return enfermedad.value == this.fp.enfermedadPrexistente.value;
      });
      this.detalleEntidadFederativa = this.entidadFederativa.filter(entidad => {
        return entidad.value == this.fp.entidadFederativa.value
      })
    }
  }

  regresar(): void {
    this.indice--;
  }



  convertirMayusculas(posicion: number): void {
    const formularios = [this.fp.curp,this.fp.rfc]
    if(!formularios[posicion].value)return;
    formularios[posicion].setValue(
      formularios[posicion].value.toUpperCase()
    )
  }

  convertirMinusculas(posicion: number): void {
    const formularios = [this.fp.correoElectronico]
    if(!formularios[posicion].value)return;
    formularios[posicion].setValue(
      formularios[posicion].value.toLowerCase()
    )
  }

  get fp() {
    return this.personaForm.controls;
  }

  get fd(){
    return this.documentacionForm.controls;
  }
}
