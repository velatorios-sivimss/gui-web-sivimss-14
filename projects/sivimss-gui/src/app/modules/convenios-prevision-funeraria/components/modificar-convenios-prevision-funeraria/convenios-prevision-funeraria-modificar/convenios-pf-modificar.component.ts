import { Component, OnInit } from '@angular/core';
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../../constants/menu-steppers";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AgregarConvenioPFService} from "../../../services/agregar-convenio-pf.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {ModeloGuardarPorPersona} from "../../../models/modelo-guardar-por-persona.interface";
import {PersonaInterface} from "../../../models/persona.interface";
import {Promotor} from "../../../models/promotor.interface";
import {SERVICIO_BREADCRUMB_AGREGAR} from "../../../constants/breadcrumb-agregar";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {ModeloGuardarPorEmpresa} from "../../../models/modelo-guardar-por-empresa.interface";

@Component({
  selector: 'app-convenios-prevision-funeraria-modificar',
  templateUrl: './convenios-pf-modificar.component.html',
  styleUrls: ['./convenios-pf-modificar.component.scss']
})
export class ConveniosPfModificarComponent implements OnInit {

  readonly POSICION_PROMOTOR:number = 4;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  promotores: Promotor[] = [];
  agregarPromotor: boolean = false;

  tipoContratacion:TipoDropdown[] = [{value:1,label:'Por Persona'},{value:2,label:'Por Grupo o por Empresa'}];


  filtroForm!: FormGroup;
  documentacionForm!: FormGroup;

  modeloGuardarPersona!: ModeloGuardarPorPersona;
  personasAgregadas!:PersonaInterface[];
  existePersona: boolean = false;

  velatorio!: TipoDropdown[];
  velatorioDescripcion!: string;
  folioConvenioPersona!: string;
  folioEmpresa!: string;
  deshabilitarBtnGuardarEmpresa: boolean = true;
  deshabilitarBtnGuardarPersona: boolean = true;
  confirmarGuardadoPersona: boolean = false;
  formularioPersonaValido!: boolean;
  confirmacionGuardadoEmpresa: boolean = false;

  modeloGuardarEmpresa: ModeloGuardarPorEmpresa = {};

  banderaGuardarPersona!: boolean;
  banderaGuardarEmpresa!: boolean;

  consultarFormularioValido:boolean = false;
  formularioEmpresaValido!: boolean;

  folioUnicoDelConvenio!: string;
  velatorioUsuario!: string;
  fecha!: string;

  constructor(
    private route: ActivatedRoute,
    private agregarConvenioPFService:AgregarConvenioPFService,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    const datosConvneio = JSON.parse(localStorage.getItem('datosConvenio') as string);
    localStorage.removeItem('datosConvenio');
    this.folioUnicoDelConvenio = datosConvneio.convenio.folioConvenio;
    this.velatorioUsuario= "";
    this.fecha= datosConvneio.convenio.fechaContratacion;

    this.inicializarModeloGuardarPersona();
    const formularioPrevio = JSON.parse(localStorage.getItem('fomularioPrincipal') as string);
    localStorage.removeItem('fomularioPrincipal')

    this.personasAgregadas = JSON.parse(localStorage.getItem('persona') as string) || [];
    if(this.personasAgregadas.length > 0){
      // localStorage.removeItem('persona')
      this.existePersona = true;
    }

    const respuesta = this.route.snapshot.data['respuesta'];
    this.promotores = respuesta[this.POSICION_PROMOTOR]!.datos.map(
      (promotor: any) => (
        {label: promotor.nombrePromotor, value: promotor.idPromotor}
      )
    )

    this.actualizarBreadcrumb();
    this.inicializarFiltroForm(formularioPrevio);
    this.inicializarDocumentacionForm();
    this.validarEscenarioPorEmpresa();
    this.consultaVelatorio();
  }

  inicializarFiltroForm(formularioPrevio: any): void {
    this.filtroForm = this.formBuilder.group({
      numeroConvenio: [{value: formularioPrevio?.numeroConvenio ?? null, disabled: false}],
      tipoContratacion: [{value: formularioPrevio?.tipoContratacion ?? null, disabled: false}, [Validators.required]],
      rfcCurp: [{value: formularioPrevio?.rfcCurp ?? null, disabled: false}],
      promotor: [{value: formularioPrevio?.promotor ?? null, disabled: false}, [Validators.required]],
      listaPromotor: [{value: formularioPrevio?.listaPromotor ?? null, disabled: false}, [Validators.required]]
    })
    this.agregarPromotor = formularioPrevio?.promotor ?? false;
  }
  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group( {
      ineAfiliado: [{value: null, disabled: false}],
      copiaCURP: [{value: null, disabled: false}],
      copiaRFC: [{value: null, disabled: false}],
    });
  }
  validarEscenarioPorEmpresa(): void {
    if(this.personasAgregadas.length > 0){
      this.ff.tipoContratacion.setValue(2);
    }
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_AGREGAR);
  }

  mofificarModeloPersona(): void {
    setTimeout(()=> {
      this.modeloGuardarPersona.persona.documentacion.validaCurp = this.fd.copiaCURP?.value ?? false;
      this.modeloGuardarPersona.persona.documentacion.validaIneContratante = this.fd.ineAfiliado?.value ?? false;
      this.modeloGuardarPersona.persona.documentacion.validaRfc = this.fd.copiaRFC?.value ?? false;
      this.modeloGuardarPersona.persona.documentacion.validaActaNacimientoBeneficiario = false;
      this.modeloGuardarPersona.persona.documentacion.validaIneBeneficiario = false;

    },200)
  }

  consultaVelatorio(): void  {
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
        let velatorioSeleccionado = this.velatorio.filter(velatorio => {
          return velatorio.value == usuario.idVelatorio;
        })
        this.velatorioDescripcion =  velatorioSeleccionado[0].label;
      },
      (error: HttpErrorResponse)=> {
        console.log(error);
      }
    )
  }
  guardarFormularioLocalStorage(event:any): void {
    const formularioPrincipal = {
      numeroConvenio:this.ff.numeroConvenio.value,
      tipoContratacion:this.ff.tipoContratacion.value,
      rfcCurp:this.ff.rfcCurp.value,
      promotor:this.ff.promotor.value,
      listaPromotor:this.ff.listaPromotor.value,
    }
    localStorage.setItem("fomularioPrincipal",JSON.stringify(formularioPrincipal))
  }

  validarFormularioEmpresa(event: any): void{
    this.deshabilitarBtnGuardarEmpresa = !(this.filtroForm.valid && event);
  }


  validarTipoContratacion(): void{
    localStorage.removeItem('persona');
    localStorage.removeItem('personasAgregadas');
    localStorage.removeItem('fomularioPrincipal');

    if(!this.ff.numeroConvenio.value)this.ff.numeroConvenio.reset();
    if(!this.ff.numeroConvenio.value)this.ff.numeroConvenio.reset();
    this.ff.rfcCurp.reset();
    this.ff.promotor.reset();
    this.ff.listaPromotor.reset();
    this.agregarPromotor = false;

    this.documentacionForm.reset();
    if(!this.ff.numeroConvenio.value && !this.ff.tipoContratacion.value)return;
    this.validarFormularioVacio();
    this.consultarConvenio();
    // this.ff.tipoContratacion.value == 1 ? this.consultarConvenioPersona() : this.consultarConvenio();

  }

  datosFormularioEmpresa(event: any): void {
    const datosUsuario = JSON.parse(localStorage.getItem('usuario') as string);
    this.indice = 2;
    this.modeloGuardarEmpresa =
      {
        idVelatorio: datosUsuario.idVelatorio,
        nombreVelatorio: this.velatorioDescripcion,
        indTipoContratacion: this.ff.tipoContratacion.value,
        idPromotor: this.ff.listaPromotor?.value ?? "",
        numeroConvenio: this.ff.numeroConvenio.value,
        rfcCurp: this.ff.rfcCurp?.value ?? "",
        empresa:{
          nombreEmpresa: event.nombre,
          razonSocial: event.razonSocial,
          rfc: event.nombre,
          pais: event.pais,
          cp: event.cp,
          colonia: event.colonia,
          estado: event.estado,
          municipio: event.municipio,
          calle: event.calle,
          numeroExterior: event.numeroExterior,
          numeroInterior: event.numeroInterior,
          telefono: event.telefono,
          correoElectronico: event.correoElectronico,
          personas: event.personas
        }
      }
  }

  validarFormularioVacio(): void {
    if(this.ff.tipoContratacion.value == 1){
      this.filtroForm.valid ? this.consultarFormularioValido = true: this.consultarFormularioValido = false;
    }
    if(this.ff.tipoContratacion.value == 2){
      this.filtroForm.valid ? this.consultarFormularioValido = true: this.consultarFormularioValido = false;
    }
  }
  consultaRFCCURP(): void {
    if(!this.ff.rfcCurp.value){return}
    const tipo = this.ff.rfcCurp.value;
    let rfc = "";
    let curp = "";
    tipo.length <= 13 ? rfc = tipo : curp = tipo;
    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC(rfc,curp).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    )
  }

  consultarConvenio(): void{
    if(this.ff.tipoContratacion.value == 1){
      this.folioConvenioPersona="";
      if(this.ff.numeroConvenio.value){
        this.folioConvenioPersona=this.ff.numeroConvenio.value;
      }
    }
    else{
      this.folioEmpresa = "";
      if(!this.ff.numeroConvenio.value){
        this.deshabilitarBtnGuardarEmpresa = true;
        return;
      }else{
        if(this.filtroForm.valid && this.formularioEmpresaValido){
          this.deshabilitarBtnGuardarEmpresa = false;
        }
        this.folioEmpresa = this.ff.numeroConvenio.value
      }
    }
  }

  consultarConvenioPersona(): void {
    if(!this.ff.numeroConvenio.value)return;
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarFolioPersona(this.ff.numeroConvenio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    );
  }


  validarFormularioPersona(event: any): void {
    this.deshabilitarBtnGuardarPersona = true;
    this.formularioPersonaValido = event;
    if(event.origen.includes('externo') && event.valido){
      this.deshabilitarBtnGuardarPersona = false;
    }
    if(event.origen.includes('local') && event.valido && this.filtroForm.valid){
      this.deshabilitarBtnGuardarPersona = false;
    }
  }

  datosFormularioPersona(event:any): void {
    const datosUsuario = JSON.parse(localStorage.getItem('usuario') as string);
    this.indice ++;
    this.modeloGuardarPersona = {
      idVelatorio: datosUsuario.idVelatorio,
      nombreVelatorio: this.velatorioDescripcion,
      indTipoContratacion: this.ff.tipoContratacion.value.toString(),
      idPromotor: this.ff.listaPromotor.value ? this.ff.listaPromotor.value.toString() : "",
      idPersona :event?.idPersona.toString() ?? null,
      idDomicilio :null,
      idContratante :null,

      // numeroConvenio: this.ff.numeroConvenio.value,
      // rfcCurp: this.ff.rfcCurp.value,

      persona: event,
    }

  }

  existePromotor(existePromotor: boolean): void {
    this.agregarPromotor = existePromotor;
    this.ff.listaPromotor.reset();
    if(existePromotor){
      this.ff.listaPromotor.enable();
      this.ff.listaPromotor.setValidators(Validators.required);
      this.deshabilitarBtnGuardarEmpresa = true;
      this.deshabilitarBtnGuardarPersona = true;
      this.validarFormularioVacio();
      return
    }
    this.ff.listaPromotor.clearValidators();
    this.ff.listaPromotor.disable();
    this.ff.listaPromotor.updateValueAndValidity();
    this.deshabilitarBtnGuardarEmpresa = this.deshabilitarBtnGuardarEmpresa && existePromotor;
    this.deshabilitarBtnGuardarPersona = this.deshabilitarBtnGuardarPersona && existePromotor;
    this.validarFormularioVacio();
  }
  validarListadoPormotores(): void{
    // this.deshabilitarBtnGuardarEmpresa ? this.deshabilitarBtnGuardarEmpresa = false: this.deshabilitarBtnGuardarEmpresa = true;
    this.validarFormularioVacio();
  }

  siguiente(): void {
    if(this.indice == 0){
      this.confirmarGuardadoPersona = false;
      this.confirmarGuardarPersona()
      return;
    }
    this.indice ++;
  }

  guardar(origen:string): void{
    if(origen.includes('persona'))this.banderaGuardarPersona = true;
    if(origen.includes('empresa'))this.banderaGuardarEmpresa = true;
  }

  confirmarGuardarEmpresa(): void {
    this.confirmacionGuardadoEmpresa = true;
  }

  confirmarGuardarPersona(): void {
    this.confirmarGuardadoPersona = true;
  }

  get ff() {
    return this.filtroForm.controls;
  }

  get fd(){
    return this.documentacionForm.controls;
  }

  inicializarModeloGuardarPersona(): void {
    this.modeloGuardarPersona = {
      idVelatorio: "",
      nombreVelatorio: "",
      indTipoContratacion: "",
      idPromotor: "",
      idPersona: null,
      idDomicilio: null,
      idContratante: null,
      persona: {
        matricula:"",
        rfc:"",
        curp:"",
        nss:"",
        numIne:"",
        nombre:"",
        primerApellido:"",
        segundoApellido:"",
        sexo:"",
        otroSexo:"",
        fechaNacimiento:"",
        tipoPersona:"",
        calle:"",
        numeroExterior:"",
        numeroInterior:"",
        cp:"",
        colonia:"",
        municipio:"",
        estado:"",
        pais:"",
        correoElectronico:"",
        telefono:"",
        enfermedadPreexistente:"",
        otraEnfermedad:"",
        paquete:"",
        beneficiarios: [],
        documentacion: {
          validaIneContratante: false,
          validaCurp: false,
          validaRfc: false,
          validaActaNacimientoBeneficiario: false,
          validaIneBeneficiario: false
        }
      }
    }
  }

}
