import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {SERVICIO_BREADCRUMB_AGREGAR} from "../../constants/breadcrumb-agregar";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies"
import {PersonaInterface} from "../../models/persona.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {Promotor} from "../../models/promotor.interface";
import {Empresa} from "../../models/empresa.interface";
import {ModeloGuardarPorEmpresa} from "../../models/modelo-guardar-por-empresa.interface";
import {ModeloGuardarPorPersona} from "../../models/modelo-guardar-por-persona.interface";

@Component({
  selector: 'app-agregar-convenios-prevision-funeraria',
  templateUrl: './agregar-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-convenios-prevision-funeraria.component.scss']
})
export class AgregarConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PROMOTOR:number = 4;


  filtroForm!: FormGroup;
  convenioForm!: FormGroup;
  documentacionForm!: FormGroup;

  personasAgregadas!:PersonaInterface[];

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  tipoContratacion:TipoDropdown[] = [{value:1,label:'Por Persona'},{value:2,label:'Por Grupo o por Empresa'}];
  pais: TipoDropdown[] = CATALOGOS_DUMMIES;
  estado: TipoDropdown[] = CATALOGOS_DUMMIES;
  promotores: Promotor[] = [];
  agregarPersona: boolean = false;
  agregarPromotor: boolean = false;
  formularioEmpresaValido!: boolean;
  formularioPersonaValido!: boolean;

  existePersona: boolean = false;
  datosEmpresaFolio!: Empresa;
  folioEmpresa!: string;
  folioConvenioPersona!: string;
  continuarGuardadoEmpresa: boolean = false;
  confirmacionGuardadoEmpresa: boolean = false;
  confirmarGuardadoPersona: boolean = false;
  deshabilitarBtnGuardarEmpresa: boolean = true;
  deshabilitarBtnGuardarPersona: boolean = true;
  modeloGuardarEmpresa: ModeloGuardarPorEmpresa = {};
  modeloGuardarPersona!: ModeloGuardarPorPersona;

  banderaGuardarPersona!: boolean;
  banderaGuardarEmpresa!: boolean;

  velatorio!: TipoDropdown[];
  velatorioDescripcion!: string;



  consultarFormularioValido:boolean = false;

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
    this.validarFormularioVacio();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_AGREGAR);
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

  consultaRFCCURP(): void {
    const tipo = this.ff.rfcCurp.value;
    let rfc = "";
    let curp = "";
    tipo.length <= 13 ? rfc = tipo : curp = tipo;
    if(!this.ff.rfcCurp.value){return}


    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC(rfc,curp).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {

      },
      (error: HttpErrorResponse) => {
        console.log(error);
        if(tipo.length <= 13){
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
        }else{
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
        }
      }
    )
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

  consultarConvenio(): void{
    if(this.ff.tipoContratacion.value == 1){
      this.folioConvenioPersona="";
      if(this.ff.numeroConvenio.value){
        this.folioConvenioPersona = this.ff.numeroConvenio.value;
        this.consultarFolioPersona();
      }
    }
    else{
      this.folioEmpresa = "";
      if(!this.ff.numeroConvenio.value){
        this.deshabilitarBtnGuardarEmpresa = true;
        return;
      }else{
        this.consultarFolioEmpresa();
        if(this.filtroForm.valid && this.formularioEmpresaValido){
          this.deshabilitarBtnGuardarEmpresa = false;
        }
        this.folioEmpresa = this.ff.numeroConvenio.value
      }
    }
  }
  consultarFolioEmpresa(): void {
    this.loaderService.activar()
    this.existePromotor(false);
    this.ff.promotor.patchValue(null);
    this.ff.rfcCurp.patchValue(null);
    this.ff.listaPromotor.patchValue(null);

    this.agregarConvenioPFService.consultarFolioConvenioEmpresa(this.ff.numeroConvenio.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        //TODO agregar id promotor
        if(!respuesta.datos)return;
        this.ff.rfcCurp.setValue(respuesta.datos[0].rfc);
        if(respuesta.datos[0]?.idPromotor){
          this.ff.promotor.setValue(true);
          this.existePromotor(true)
          this.ff.listaPromotor.setValue(+respuesta.datos[0].idPromotor);
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.error);
      }
    )
  }

  consultarFolioPersona(): void {
    this.loaderService.activar()
    this.existePromotor(false);
    this.ff.promotor.patchValue(null);
    this.ff.rfcCurp.patchValue(null);
    this.ff.listaPromotor.patchValue(null);

    this.agregarConvenioPFService.consultarFolioPersona(this.ff.numeroConvenio.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(!respuesta.datos)return;
          this.ff.rfcCurp.setValue(respuesta.datos.datosContratante.curp);
        if(respuesta.datos.datosContratante.idPromotor){
          this.ff.promotor.setValue(true);
          this.existePromotor(true)
          this.ff.listaPromotor.setValue(+respuesta.datos.datosContratante.idPromotor);
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.error);
      }
    )
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

  validarEscenarioPorEmpresa(): void {
    if(this.personasAgregadas.length > 0){
      this.ff.tipoContratacion.setValue(2);
    }
  }

  existePromotor(existePromotor: boolean): void {
    this.agregarPromotor = existePromotor;
    this.ff.listaPromotor.reset();
    if(existePromotor){
      this.ff.listaPromotor.enable();
      this.ff.listaPromotor.setValidators(Validators.required);
      this.ff.listaPromotor.updateValueAndValidity()
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

  abrirModalDetallePersona(personaDetalle: PersonaInterface) {
    console.log("Se comenta método para que no marque error en Sonar", personaDetalle);
  }

  abrirAgregarPersona(): void {
  this.agregarPersona = true;
  }

  aceptar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado correctamente');
    this.router.navigateByUrl('convenios-prevision-funeraria');
  }

  cancelar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  siguiente(): void {
    if(this.indice == 0){
      this.confirmarGuardadoPersona = false;
      this.confirmarGuardarPersona()
      return;
    }
    this.indice ++;
  }

  regresar(): void {
    this.indice --;
  }

  confirmarGuardarEmpresa(): void {
    this.confirmacionGuardadoEmpresa = true;
  }

  confirmarGuardarPersona(): void {
    this.confirmarGuardadoPersona = true;
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

  validarListadoPormotores(): void{
    // this.deshabilitarBtnGuardarEmpresa ? this.deshabilitarBtnGuardarEmpresa = false: this.deshabilitarBtnGuardarEmpresa = true;
    this.validarFormularioVacio();
  }





  datosEmpresa(): ModeloGuardarPorEmpresa {
    const datosUsuario = JSON.parse(localStorage.getItem('usuario') as string);
    return{
      idVelatorio: datosUsuario.idVelatorio,
      nombreVelatorio: this.velatorioDescripcion,
      indTipoContratacion: this.ff.tipoContratacion.value,
      idPromotor: this.ff.listaPromotor.value,


    }
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


  datosFormularioPersona(event:any): void {
    const datosUsuario = JSON.parse(localStorage.getItem('usuario') as string);
    this.indice ++;
    this.modeloGuardarPersona = {
      idVelatorio: datosUsuario.idVelatorio,
      nombreVelatorio: this.velatorioDescripcion,
      indTipoContratacion: this.ff.tipoContratacion.value.toString(),
      idPromotor: this.ff.listaPromotor.value ? this.ff.listaPromotor.value.toString() : "",
      idPersona :event.idPersona ? event.idPersona.toString() : null,
      idDomicilio :null,
      idContratante :null,

      // numeroConvenio: this.ff.numeroConvenio.value,
      // rfcCurp: this.ff.rfcCurp.value,

      persona: event,
    }

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

  mofificarModeloPersona(): void {
    setTimeout(()=> {
      this.modeloGuardarPersona.persona.documentacion.validaCurp = this.fd.copiaCURP?.value ?? false;
      this.modeloGuardarPersona.persona.documentacion.validaIneContratante = this.fd.ineAfiliado?.value ?? false;
      this.modeloGuardarPersona.persona.documentacion.validaRfc = this.fd.copiaRFC?.value ?? false;
      this.modeloGuardarPersona.persona.documentacion.validaActaNacimientoBeneficiario = false;
      this.modeloGuardarPersona.persona.documentacion.validaIneBeneficiario = false;

    },200)
  }

  validarFormularioVacio(): void {
    if(this.ff.tipoContratacion.value == 1){
      this.filtroForm.valid ? this.consultarFormularioValido = true: this.consultarFormularioValido = false;
    }
    if(this.ff.tipoContratacion.value == 2){
      if(this.ff.promotor.value){
        this.ff.listaPromotor.enable();
        this.ff.listaPromotor.setValidators(Validators.required);
      }else{
        this.ff.listaPromotor.disable();
        this.ff.listaPromotor.patchValue(null)
        this.ff.listaPromotor.updateValueAndValidity();
      }
      this.filtroForm.valid ? this.consultarFormularioValido = true: this.consultarFormularioValido = false;
    }
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

  validarFormularioEmpresa(event: any): void{
    this.deshabilitarBtnGuardarEmpresa = !(this.filtroForm.valid && event);
  }

  guardar(origen:string): void{
    if(origen.includes('persona'))this.banderaGuardarPersona = true;
    if(origen.includes('empresa'))this.banderaGuardarEmpresa = true;
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


  convertirMayusculas(posicion: number): void {
    const formularios = [this.ff.rfcCurp]
    formularios[posicion].setValue(
      formularios[posicion].value.toUpperCase()
    )
  }

}




