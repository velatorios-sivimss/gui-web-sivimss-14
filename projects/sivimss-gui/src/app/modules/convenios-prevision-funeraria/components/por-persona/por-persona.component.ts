import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {ActivatedRoute, Router} from "@angular/router";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import {
  AgregarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../agregar-beneficiario-convenios-prevision-funeraria/agregar-beneficiario-convenios-prevision-funeraria.component";
import {
  CATALOGO_ENFERMEDAD_PREEXISTENTE,
  CATALOGO_SEXO,
} from "../../constants/catalogos-funcion";
import {
  DetalleBeneficiarioConveniosPrevisionFunerariaComponent
} from "../detalle-beneficiario-convenios-prevision-funeraria/detalle-beneficiario-convenios-prevision-funeraria.component";
import {
  ModificarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../modificar-beneficiario-convenios-prevision-funeraria/modificar-beneficiario-convenios-prevision-funeraria.component";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoPaquete} from "../../models/tipo-paquete.interface";
import * as moment from 'moment';

@Component({
  selector: 'app-por-persona',
  templateUrl: './por-persona.component.html',
  styleUrls: ['./por-persona.component.scss'],
  providers: [DialogService]
})
export class PorPersonaComponent implements OnInit,OnChanges, AfterViewInit {

  @Input() folioConvenio!: string;
  @Input() consultarFormularioValido!: boolean;
  @Input() confirmacionGuardado!: boolean;
  @Input() escenario!: string;
  @Input() siguienteSeccion!: boolean
  @Output() formularioValido = new EventEmitter<{ origen:string,valido:boolean }>();
  @Output() formularioPersona = new EventEmitter<any>();

  readonly POSICION_PAISES = 0;
  readonly POSICION_ESTADOS = 1;
  readonly POSICION_PAQUETES = 3;

  infoTipoPaquete!: any[];
  infoPaqueteSeleccionado!: any;

  personaForm!: FormGroup;

  modificarBeneficiarioRef!: DynamicDialogRef;
  detalleBeneficiarioRef!: DynamicDialogRef;
  beneficiarioRef!: DynamicDialogRef;
  beneficiarios: BeneficiarioInterface[] = [];

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  tipoPaquete!: TipoDropdown[];
  entidadFederativa!: TipoDropdown[];
  enfermedadPrexistente: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  folioRedireccion: string = "";
  fechaRedireccion: string = "";

  otroTipoEnferemdad: boolean = false;
  mostrarModalConfirmacion: boolean = false;
  confirmarRedireccionamiento: boolean = false;

  fechaActual= new Date();

  constructor(
    private alertaService: AlertaService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.estado = respuesta[this.POSICION_ESTADOS]!.map(
      (estado: TipoDropdown) => (
        {label: estado.label, value: estado.value}
      )
    ) || [];
    this.pais = respuesta[this.POSICION_PAISES]!.map(
      (pais: TipoDropdown) => (
        {label: pais.label, value: pais.value}
      )
    ) || [];
    this.tipoPaquete = respuesta[this.POSICION_PAQUETES]!.datos.map(
      (paquete: any) => (
        {label: paquete.nomPaquete, value: paquete.idPaquete}
      )
    )
    this.infoTipoPaquete = respuesta[this.POSICION_PAQUETES].datos;
    this.entidadFederativa = respuesta[this.POSICION_ESTADOS];

    this.inicializarPersonaForm();
  }

  inicializarPersonaForm(): void {
    this.personaForm= this.formBuilder.group({
                  matricula: [{value:null, disabled: false}],
                        rfc: [{value:null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
                  idPersona: {value:null, disabled: false},
                       curp: [{value:null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                     nombre: [{value:null, disabled: true}, [Validators.required]],
             primerApellido: [{value:null, disabled: true}, [Validators.required]],
            segundoApellido: [{value:null, disabled: true}, [Validators.required]],
                      calle: [{value:null, disabled: false}, [Validators.required]],
             numeroExterior: [{value:null, disabled: false}, [Validators.required]],
             numeroInterior: [{value:null, disabled: false}],
                         cp: [{value:null, disabled: false}, [Validators.required]],
                    colonia: [{value:null, disabled: false}, [Validators.required]],
                  municipio: [{value:null, disabled: true}, [Validators.required]],
                     estado: [{value:null, disabled: true}, [Validators.required]],
                       pais: [{value:null, disabled: false}, [Validators.required]],
          correoElectronico: [{value:null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
                   telefono: [{value:null, disabled: false}, [Validators.required]],
      enfermedadPrexistente: [{value:null, disabled: false}, [Validators.required]],
             otraEnfermedad: [{value:null, disabled: false}],
                tipoPaquete: [{value:null, disabled: false}, [Validators.required]],
                       sexo: [{value:null, disabled: false}, [Validators.required]],
                   otroSexo: [{value:null, disabled: false}, [Validators.required]],
            fechaNacimiento: [{value:null, disabled: false}, [Validators.required]],
          entidadFederativa: [{value:null, disabled: false}, [Validators.required]]
    })
  }

  abrirModalAgregarBeneficiarios(): void {
    this.beneficiarioRef = this.dialogService.open(AgregarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header: "Agregar beneficiario",
      width: "920px",
    });
    this.beneficiarioRef.onClose.subscribe((beneficiario: BeneficiarioInterface) => {
      if(beneficiario){
        this.beneficiarios.push(beneficiario);
      }
    });
  }

  abrirModalEliminarBeneficiario(eliminarBeneficiario: BeneficiarioInterface): void {
    this.beneficiarios = this.beneficiarios.filter((element) => {
      return eliminarBeneficiario.curp != element.curp;
    })
  }

  cambioEnfermedadPrexistente(): void {
    this.otroTipoEnferemdad = false;

    this.fp.otraEnfermedad.disable();
    this.fp.otraEnfermedad.clearValidators();
    if(this.fp.enfermedadPrexistente.value == 4){
      this.otroTipoEnferemdad = true
      this.fp.otraEnfermedad.enable();
      this.fp.otraEnfermedad.setValidators(Validators.required);
      this.fp.otraEnfermedad.updateValueAndValidity();
    }
    this.validarFormularioVacio(false,'local');
  }

  cambioTipoSexo(): void {
    if(this.fp.sexo.value == 3){
      this.fp.otroSexo.setValidators(Validators.required);
    }else{
      this.fp.otroSexo.patchValue(null);
      this.fp.otroSexo.clearValidators();
    }
    this.fp.otroSexo.updateValueAndValidity();
    this.validarFormularioVacio(false,'local');
  }

  abrirModalDetalleBeneficario(beneficiario: BeneficiarioInterface): void {
    this.detalleBeneficiarioRef = this.dialogService.open(DetalleBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Detalle de beneficiario",
      width:"920px",
      data: beneficiario,
    });
  }
  abrirModalModificarBeneficiario(beneficiario: BeneficiarioInterface): void {
    this.modificarBeneficiarioRef = this.dialogService.open(ModificarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Modificar beneficiario",
      width:"920px",
      data: beneficiario,
    })

    this.modificarBeneficiarioRef.onClose.subscribe((beneficiario: BeneficiarioInterface) => {
      if(beneficiario){
        const index = this.beneficiarios.findIndex((item: BeneficiarioInterface) => item.curp === beneficiario.curp);
        this.beneficiarios[index] = beneficiario;
      }
    })
  }

  mostrarModalTipoPaquete(): void {
    this.infoTipoPaquete.forEach((paquete: TipoPaquete) => {
      if(paquete.idPaquete == this.fp.tipoPaquete.value){
        this.infoPaqueteSeleccionado = paquete.descPaquete
      }
    })

    this.validarFormularioVacio(false,'local')

    this.mostrarModalConfirmacion = true;
  }

  consultaCURP(): void {
    this.limpiarDatosCurpRFC(1);
    if(!this.fp.curp.value)return;
    if (this.personaForm.controls.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }
    this.loaderService.activar();
    this.validarFormularioVacio(false,'local');
    this.agregarConvenioPFService.consultaCURPRFC("",this.fp.curp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta.mensaje === ""){
          this.fp.nombre.setValue(respuesta.datos.nomPersona);
          this.fp.primerApellido.setValue(respuesta.datos.primerApellido);
          this.fp.segundoApellido.setValue(respuesta.datos.segundoApellido);
          this.fp.idPersona.setValue(respuesta.datos.idPersona)
          return
        }
        if(respuesta.datos[0].tieneConvenio>0){
          if(this.router.url.includes('convenios-prevision-funeraria/ingresar-nuevo-convenio')){
            this.folioRedireccion = respuesta.datos[0].folioConvenio;
            this.fechaRedireccion = respuesta.datos[0].fecha;
            this.confirmarRedireccionamiento = true
            return
          }else{
            window.location.reload()
          }
        }
        this.fp.nombre.setValue(respuesta.datos[0].nomPersona);
        this.fp.primerApellido.setValue(respuesta.datos[0].primerApellido);
        this.fp.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
        this.fp.idPersona.setValue(respuesta.datos[0].idPersona)
        this.fp.rfc.setValue(respuesta.datos[0].rfc)
        this.fp.correoElectronico.setValue(respuesta.datos[0].correo)
        this.fp.telefono.setValue(respuesta.datos[0].telefono)
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  limpiarDatosCurpRFC(posicion:number): void {
    this.fp.nombre.patchValue(null)
    this.fp.primerApellido.patchValue(null)
    this.fp.segundoApellido.patchValue(null)
    this.fp.idPersona.patchValue(null)
    if(posicion == 1)this.fp.rfc.patchValue(null)
    if(posicion == 2)this.fp.curp.patchValue(null)
    this.fp.correoElectronico.patchValue(null)
    this.fp.telefono.patchValue(null)
  }

  consultaRFC(): void {
    if(!this.fp.rfc.value){return}
    // this.limpiarDatosCurpRFC(2);
    if (this.personaForm.controls.rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
      return;
    }

    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC(this.fp.rfc.value,"").pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {

        if(respuesta.datos[0].tieneConvenio>0){
          if(this.router.url.includes('convenios-prevision-funeraria/ingresar-nuevo-convenio')){
            this.folioRedireccion = respuesta.datos[0].folioConvenio;
            this.fechaRedireccion = respuesta.datos[0].fecha;
            this.confirmarRedireccionamiento = true
            return
          }else{
            window.location.reload()
          }
        }
        // if(respuesta.mensaje === ""){
        //   this.fp.nombre.setValue(respuesta.datos.nomPersona);
        //   this.fp.primerApellido.setValue(respuesta.datos.primerApellido);
        //   this.fp.segundoApellido.setValue(respuesta.datos.segundoApellido);
        //   this.fp.idPersona.setValue(respuesta.datos.idPersona)
        //   return
        // }
        // this.fp.nombre.setValue(respuesta.datos[0].nomPersona);
        // this.fp.primerApellido.setValue(respuesta.datos[0].primerApellido);
        // this.fp.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
        // this.fp.curp.setValue(respuesta.datos[0].curp)
        // this.fp.correoElectronico.setValue(respuesta.datos[0].correo)
        // this.fp.telefono.setValue(respuesta.datos[0].telefono)
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultarMatricula(): void {
    if(!this.fp.matricula.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarMatriculaSiap(this.fp.matricula.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(!respuesta.datos){
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
        }
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultarCP(): void {
    if(!this.fp.cp.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consutaCP(+this.fp.cp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.fp.estado.setValue(respuesta.datos[0]?.estado);
        this.fp.municipio.setValue(respuesta.datos[0]?.municipio);
        this.fp.colonia.setValue(respuesta.datos[0]?.colonia)
        this.fp.pais.setValue(119);
        this.validarFormularioVacio(false,'local');
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultarFolioPersona(): void {
    this.beneficiarios=[]
    this.personaForm.reset();
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarFolioPersona(this.folioConvenio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(!respuesta.datos)return;
          const [anio,mes,dia] = respuesta.datos.datosContratante.fechaNacimiento.split('-')
          this.fp.curp.setValue(respuesta.datos.datosContratante.curp);
          this.fp.rfc.setValue(respuesta.datos.datosContratante.rfc);
          this.fp.nombre.setValue(respuesta.datos.datosContratante.nombrePersona);
          this.fp.primerApellido.setValue(respuesta.datos.datosContratante.primerApellido);
          this.fp.segundoApellido.setValue(respuesta.datos.datosContratante.segundoApellido);
          this.fp.correoElectronico.setValue(respuesta.datos.datosContratante.correo);
          this.fp.telefono.setValue(respuesta.datos.datosContratante.telefono);
          this.fp.calle.setValue(respuesta.datos.datosContratante.calle);
          this.fp.numeroExterior.setValue(respuesta.datos.datosContratante.numExterior)
          this.fp.numeroInterior.setValue(respuesta.datos.datosContratante.numInterior);
          this.fp.cp.setValue(respuesta.datos.datosContratante.cp);
          this.fp.colonia.setValue(respuesta.datos.datosContratante.colonia);
          this.fp.municipio.setValue(respuesta.datos.datosContratante.municipio);
          this.fp.estado.setValue(respuesta.datos.datosContratante.estado);
          this.fp.pais.setValue(+respuesta.datos.datosContratante.idPais);
          this.fp.tipoPaquete.setValue(+respuesta.datos.datosContratante.idPaquete);
          this.fp.idPersona.setValue(+respuesta.datos.datosContratante.idPersona)
          this.fp.sexo.setValue(+respuesta.datos.datosContratante.numSexo)
          this.fp.otroSexo.setValue(respuesta.datos.datosContratante.otroSexo)
          this.fp.entidadFederativa.setValue(+respuesta.datos.datosContratante.idEstado)
          this.fp.fechaNacimiento.setValue(new Date(anio + '-' + mes + '-' + dia))



        this.fp.enfermedadPrexistente.setValue(+respuesta.datos.datosContratante.idEnfermedadPreexistente);
        this.fp.otraEnfermedad.setValue(respuesta.datos.datosContratante.otraEnfermedad);

        // this.fp.enfermedadPrexistente.setValue(respuesta.datos.datosContratante.enfermedadPrexistente);

        // if(this.escenario.includes('modificar')){
        //   respuesta.datos.beneficiarios.forEach((beneficiario:any) => {
        //     const [anio, mes, dia]: string[] = beneficiario.fechaNacimiento.split("-");
        //     const objetoFecha: Date = new Date(+anio, +mes - 1, +dia);
        //     this.beneficiarios.push({
        //       fechaNacimiento: objetoFecha,
        //       nombre: beneficiario.nombreBeneficiario,
        //       primerApellido: beneficiario.primerApellido,
        //       segundoApellido: beneficiario.segundoApellido,
        //       curp: beneficiario.curp,
        //       rfc: beneficiario.rfc ?? null,
        //       correoElectronico: beneficiario.correo,
        //       telefono: beneficiario.telefono,
        //       edad: beneficiario.edad,
        //       parentesco : beneficiario.idParentesco,
        //       actaNacimiento: beneficiario.cveActa,
        //       documentacion: {
        //           validaActaNacimientoBeneficiario: beneficiario.validaActaNacimientoBeneficiario,
        //           validaIneBeneficiario: beneficiario.validaIneBeneficiario,
        //       }
        //     }
        //     )
        //   });
        // }


          // this.fp.tipoPaquete.setValue(+respuesta.datos.datosContratante.idPaquete);
          // this.fp.matricula.setValue(respuesta.datosContratante.matricula);
          // this.fp.calle.setValue(respuesta.datos.datosContratante.calle);
          // this.fp.numeroExterior.setValue(respuesta.datos.datosContratante.numeroExterior);
          // this.fp.numeroInterior.setValue(respuesta.datos.datosContratante.numeroInterior);
          // this.fp.cp.setValue(respuesta.datos.datosContratante.cp);
          // this.fp.colonia.setValue(respuesta.datos.datosContratante.colonia);
          // this.fp.municipio.setValue(respuesta.datos.datosContratante.municipio);
          // this.fp.estado.setValue(respuesta.datos.datosContratante.estado);
          // this.fp.pais.setValue(respuesta.datos.datosContratante.pais);
          // this.fp.enfermedadPrexistente.setValue(respuesta.datos.datosContratante.enfermedadPrexistente);
          // this.fp.otraEnfermedad.setValue(respuesta.datos.datosContratante.otraEnfermedad);
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    );
  }


  validarCorreoElectornico(): void {
    if(!this.fp.correoElectronico.value){return}
    if (this.personaForm.controls.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
    this.validarFormularioVacio(false,'local');
  }


  validarFormularioVacio(formularioPrincipalValido?: boolean, origen?:string): void{

    setTimeout(()=> {
      if(this.personaForm.valid && formularioPrincipalValido && origen?.includes('externo')){
        this.formularioValido.emit({origen:origen,valido:true})
        return
      }
      if(this.personaForm.valid && formularioPrincipalValido == false && origen?.includes('local')){
        this.formularioValido.emit({origen:origen,valido:true})
        return
      }
      this.formularioValido.emit({origen:'',valido:false})
    },500)


  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.confirmacionGuardado && changes.consultarFormularioValido && changes.folioConvenio){
      return
    }
    if(this.consultarFormularioValido && changes.consultarFormularioValido) {
      this.validarFormularioVacio(changes.consultarFormularioValido.currentValue,'externo')
    }
    if(this.confirmacionGuardado){
      this.formularioPersona.emit(
        {
          idPersona: this.fp.idPersona.value ? this.fp.idPersona?.value.toString() : null,
          matricula: this.fp.matricula.value ? this.fp.matricula.toString() : "",
          rfc:this.fp.rfc?.value?.toString() ?? "",
          curp:this.fp.curp.value.toString(),
          nss:"",
          numIne:"",
          nombre:this.fp.nombre.value ? this.fp.nombre.value.toString() : "",
          primerApellido:this.fp.primerApellido ? this.fp.primerApellido.value.toString() : "",
          segundoApellido:this.fp.segundoApellido ? this.fp.segundoApellido.value.toString() : "",
          tipoPersona:"",
          calle:this.fp.calle.value.toString(),
          numeroExterior:this.fp.numeroExterior.value.toString(),
          numeroInterior: this.fp.numeroInterior.value ? this.fp.numeroInterior.value.toString() : "",
          cp:this.fp.cp.value.toString(),
          colonia:this.fp.colonia.value.toString(),
          municipio:this.fp.municipio.value.toString(),
          estado:this.fp.estado.value.toString(),
          pais:this.fp.pais.value.toString(),
          correoElectronico:this.fp.correoElectronico.value.toString(),
          telefono:this.fp.telefono.value.toString(),
          enfermedadPreexistente:this.fp.enfermedadPrexistente.value.toString(),
          otraEnfermedad:this.fp.otraEnfermedad?.value,
          paquete:this.fp.tipoPaquete.value.toString(),
          beneficiarios: this.beneficiarios,
          sexo: this.fp.sexo.value,
          otroSexo: this.fp.otroSexo.value ?? "",
          fechaNacimiento: moment(this.fp.fechaNacimiento.value).format("YYYY-MM-DD"),
          entidadFederativa: this.fp.entidadFederativa.value,
          documentacion:{
            validaIneContratante:false,
            validaCurp:false,
            validaRfc:false,
            validaActaNacimientoBeneficiario:false,
            validaIneBeneficiario:false
          }
        }
      )
    }

    if(this.siguienteSeccion)return;
    if(this.folioConvenio === "" || this.folioConvenio == undefined) return;
    this.consultarFolioPersona();
  }

  convertirMayusculas(posicion: number): void {
    const formularios = [this.fp.curp,this.fp.rfc]
    if(!formularios[posicion].value)return;
    formularios[posicion].setValue(
      formularios[posicion].value.toUpperCase()
    )
  }

  convertirMinusculas(posicion:number): void {
    const formularios = [this.fp.correoElectronico]
    if(!formularios[posicion].value)return;
    formularios[posicion].setValue(
      formularios[posicion].value.toLowerCase()
    )
  }

  redireccionarModificar(): void {
    this.router.navigate(['../convenios-prevision-funeraria/modificar-nuevo-convenio'],
      {
        queryParams:{
          folio: this.folioRedireccion,
          fecha: this.fechaRedireccion
        }
      }
    )
  }

  get fp() {
    return this.personaForm.controls;
  }

  ngAfterViewInit(): void {
    setTimeout(()=> {
      this.cambioTipoSexo();
      this.validarFormularioVacio(false,'local');
    },800)
  }
}

