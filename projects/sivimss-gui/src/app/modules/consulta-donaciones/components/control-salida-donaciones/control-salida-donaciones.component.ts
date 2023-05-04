import { Component, OnInit } from '@angular/core';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import { CATALOGOS_DUMMIES} from "../../../articulos/constants/dummies";
import {PATRON_CORREO,PATRON_CURP,PATRON_RFC} from "../../../../utils/constantes";

import {AtaudDonado, FinadoInterface, RespuestaFinado} from "../../models/consulta-donaciones-interface";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AgregarFinadoComponent} from "./agregar-finado/agregar-finado.component";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {AgregarAtaudComponent} from "./agregar-ataud/agregar-ataud.component";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {ActivatedRoute, Router} from "@angular/router";
import {mensajes} from "../../../reservar-salas/constants/mensajes";
import {ConsultaDonacionesService} from "../../services/consulta-donaciones.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {CATALOGO_SEXO, ESTADO, NACIONALIDAD, PAIS} from "../../constants/catalogo";
import * as moment from 'moment'
import {AgregarSalidaDonacionInterface, AtaudesDonados, Finado} from "../../models/agregar-salida-donacion-interface";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {PlantillaControlSalida} from "../../models/generar-plantilla-interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-control-salida-donaciones',
  templateUrl: './control-salida-donaciones.component.html',
  styleUrls: ['./control-salida-donaciones.component.scss'],
  providers: [DialogService,DescargaArchivosService]
})
export class ControlSalidaDonacionesComponent implements OnInit {

  agregarFinadoRef!: DynamicDialogRef;
  agregarAtaudRef!: DynamicDialogRef;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  otroTipoSexo: boolean = false;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  sexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = NACIONALIDAD;
  lugarNacimiento: TipoDropdown[] = ESTADO;
  paisNacimiento: TipoDropdown[] = PAIS;
  estado: TipoDropdown[] = ESTADO;
  finados: FinadoInterface[] = [];
  ataudes: AtaudDonado[] = [];
  backlogAutaudes!: AtaudDonado[];
  finadoLista: Finado[] = [];
  ataudLista: AtaudesDonados[] = [];

  formDatosSolicitante!: FormGroup;
  formAtaudes!: FormGroup;
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);
  catalogoVelatorios: TipoDropdown[] = [];



  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loaderService: LoaderService,
    private consultaDonacionesService: ConsultaDonacionesService,
    private descargaArchivosService: DescargaArchivosService,
    private route: ActivatedRoute,
  ) {
    moment.locale('es');
  }

  ngOnInit(): void {
    localStorage.setItem("mensajes", JSON.stringify(mensajes));
    // this.catalogoVelatorios = mapearArregloTipoDropdown(
    //   respuesta[0]?.datos,
    //   'NOM_VELATORIO',
    //   'ID_VELATORIO',
    // )
    this.consultarAtaudes();
    this.actualizarBreadcrumb();
    this.inicializarDatosSolicitantesForm();
    this.inicializarAtaudesForm();

  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  inicializarDatosSolicitantesForm(): void {
    this.formDatosSolicitante = this.formBuilder.group({
      nombre: [{value:null,disabled: true}, [Validators.required]],
      primerApellido: [{value:null,disabled: true}, [Validators.required]],
      segundoApellido: [{value:null,disabled: true}, [Validators.required]],
      curp: [{value:null,disabled: false},
        [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      rfc: [{value:null,disabled: false},[Validators.pattern(PATRON_RFC)]],
      fechaNacimiento: [{value:null,disabled: true}, [Validators.required]],
      sexo: [{value:null,disabled: false}, [Validators.required]],
      otro: [{value:null,disabled: false}],
      nacionalidad: [{value:null,disabled: false}],
      lugarNacimiento: [{value:null,disabled: false}],
      paisNacimiento: [{value:null,disabled: false}],
      telefono: [{value:null,disabled: false}, [Validators.required,Validators.maxLength(10)]],
      correoElectronico: [{value:null,disabled: false},
        [Validators.required, Validators.pattern(PATRON_CORREO)]],
      calle: [{value:null,disabled: false}, [Validators.required, Validators.maxLength(30)]],
      cp: [{value:null,disabled: false}, [Validators.required, Validators.maxLength(5)]],
      numeroExterior: [{value:null,disabled: false}, [Validators.required, Validators.maxLength(10)]],
      numeroInterior: [{value:null,disabled: false}],
      colonia: [{value:null,disabled: false}, [Validators.required]],
      municipio: [{value:null,disabled: true}, [Validators.required]],
      estado: [{value:null,disabled: true}, [Validators.required]],
      nombreInstitucion: [{value:null,disabled: false}],
    });
  }

  inicializarAtaudesForm(): void {
    this.formAtaudes = this.formBuilder.group({
      estudioSocioeconomico: [{value:null, disabled: false}],
      estudioLibre: [{value:null, disabled: false}],
      fechaSolicitud: [{value:null, disabled: false}, [Validators.required]],
      matriculaResponsable: [{value:null, disabled: false}, [Validators.required]],
      responsableAlmacenAtaud: [{value:null,disabled: false}, [Validators.required]]
    });
  }

  abrirModalFinado(): void {
    this.agregarFinadoRef = this.dialogService.open(AgregarFinadoComponent, {
      header: 'Agregar finado',
      width:"920px"
    })

    this.agregarFinadoRef.onClose.subscribe((finado: RespuestaFinado) => {
      if(finado.finado != null){
        this.finados.push(finado.finado);
      }
    });
  }

  abrirModalAtaud(): void {
    this.agregarAtaudRef = this.dialogService.open(AgregarAtaudComponent, {
      header: 'Agregar ataúd',
      width:"920px",
      data: this.ataudes
    })

    this.agregarAtaudRef.onClose.subscribe((ataud:AtaudDonado) => {
      if(ataud){
        this.ataudes.push(ataud);
      }
    })
  }

  consultaCURP(): void {
    if(!this.fds.curp.value){return}
    this.loaderService.activar();
    this.limpiarFormularioDatosSolicitante();
    this.consultaDonacionesService.consultaCURP(this.fds.curp.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos){
          if(respuesta.mensaje.includes("interno")){
            let [anio,mes,dia]= respuesta.datos[0].fecNac.split('-');
            dia = dia.substr(0,2);
            const fecha = new Date(anio+"/"+mes+"/"+dia)
            this.fds.nombre.setValue(respuesta.datos[0].nomPersona);
            this.fds.primerApellido.setValue(respuesta.datos[0].nomPersonaPaterno);
            this.fds.segundoApellido.setValue(respuesta.datos[0].nomPersonaMaterno);
            this.fds.fechaNacimiento.setValue(fecha);
          }

          if(respuesta.mensaje.includes("externo")){
            const [dia,mes,anio]= respuesta.datos.fechNac.split('/');
            const fecha = new Date(anio+"/"+mes+"/"+dia)
            this.fds.nombre.setValue(respuesta.datos.nombre);
            this.fds.primerApellido.setValue(respuesta.datos.apellido1);
            this.fds.segundoApellido.setValue(respuesta.datos.apellido2);
            this.fds.fechaNacimiento.setValue(fecha);
            if(respuesta.datos.nacionalidad.includes("MEX")){
              this.fds.nacionalidad.setValue(1);
              return
            }
            this.fds.nacionalidad.setValue(2);

          }
        }
      },
      (error: HttpErrorResponse) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        console.log(error);
      }
    )
  }
  consultaRFC(): void {
    if(!this.fds.rfc.value){return}
    this.loaderService.activar();
    this.consultaDonacionesService.consultaRFC(this.fds.rfc.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.limpiarFormularioDatosSolicitante();
        if(respuesta.datos){
          if(respuesta.mensaje.includes("interno")){
            let [anio,mes,dia]= respuesta.datos[0].fecNac.split('-');
            dia = dia.substr(0,2);
            const fecha = new Date(anio+"/"+mes+"/"+dia)
            this.fds.nombre.setValue(respuesta.datos[0].nomPersona);
            this.fds.primerApellido.setValue(respuesta.datos[0].nomPersonaPaterno);
            this.fds.segundoApellido.setValue(respuesta.datos[0].nomPersonaMaterno);
            this.fds.fechaNacimiento.setValue(fecha);
          }

          if(respuesta.mensaje.includes("externo")){
            const [anio,mes,dia]= respuesta.datos.identificacion[0].fNacimiento.split('-');
            const fecha = new Date(anio+"/"+mes+"/"+dia)
            this.fds.nombre.setValue(respuesta.datos.identificacion[0].nombre);
            this.fds.primerApellido.setValue(respuesta.datos.identificacion[0].apPaterno);
            this.fds.segundoApellido.setValue(respuesta.datos.identificacion[0].apMaterno);
            this.fds.fechaNacimiento.setValue(fecha);
          }
        }
      },
      (error: HttpErrorResponse) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        console.log(error);
      }
    )
  }

  consultaCP(): void {
    this.loaderService.activar();
    this.consultaDonacionesService.consutaCP(this.fds.cp.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.fds.municipio.setValue(respuesta.datos[0].localidad.municipio.nombre);
        this.fds.estado.setValue(+respuesta.datos[0].localidad.municipio.entidadFederativa.clave);
        this.fds.colonia.setValue(respuesta.datos[11].nombre);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  limpiarFormularioDatosSolicitante(): void {
    this.fds.nombre.patchValue(null);
    this.fds.primerApellido.patchValue(null);
    this.fds.segundoApellido.patchValue(null);
    this.fds.fechaNacimiento.patchValue(null);
    this.fds.sexo.patchValue(null);
    this.fds.nacionalidad.patchValue(null);
  }

  aceptar(): void {
    this.loaderService.activar();
    const informacion = this.generarDatosControlSalida();
    this.consultaDonacionesService.guardarControlSalidaDonacion(informacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        });
        this.generarArchivo();

        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
        this.router.navigate(["consulta-donaciones"]);
      },
      (error: HttpErrorResponse) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
      }
    )
  }


  generarArchivo(): void{
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    const plantilla = this.generarDatosPlantilla();
    this.descargaArchivosService.descargarArchivo(
      this.consultaDonacionesService.generarPlantillaControlSalida(plantilla),configuracionArchivo
    ).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  generarDatosControlSalida():AgregarSalidaDonacionInterface {
    return {
      rfc: this.fds.rfc.value,
      curp: this.fds.curp.value,
      nss: "",
      nomPersona: this.fds.nombre.value,
      nomPersonaPaterno:this.fds.primerApellido.value,
      nomPersonaMaterno: this.fds.segundoApellido.value,
      numSexo: this.fds.sexo.value,
      idPais:this.fds.paisNacimiento.value?this.fds.paisNacimiento.value:119,
      idEstado:this.fds.lugarNacimiento.value,
      desTelefono: this.fds.telefono.value,
      desCorreo: this.fds.correoElectronico.value,
      tipoPersona: this.fds.otro.value,
      idCodigoPostal: this.fds.cp.value,
      desCalle: this.fds.calle.value,
      numExterior: this.fds.numeroExterior.value,
      numInterior: this.fds.numeroInterior.value,
      desColonia: this.fds.colonia.value,
      nomInstitucion: this.fds.nombreInstitucion.value,
      fecNacimiento: moment(this.fds.fechaNacimiento.value).format('yyyy-MM-DD'),
      numTotalAtaudes:this.ataudes.length,
      estudioSocieconomico: this.fa.estudioSocioeconomico.value?1:0,
      estudioLibre: this.fa.estudioLibre.value? 1:0,
      fecSolicitad: moment(this.fa.fechaSolicitud.value).format('yyyy-MM-DD'),
      responsableAlmacen: this.fa.responsableAlmacenAtaud.value,
      matricularesponsable:this.fa.matriculaResponsable.value,
      ataudesDonados: this.formatoAtaud(),
      agregarFinados: this.formatoFinados()
    };
  }

  generarDatosPlantilla(): PlantillaControlSalida {
    let usuario = JSON.parse(localStorage.getItem('usuario') as string)


    return {
      nomSolicitantes:'',
      nomAdministrador:'Raúl de Jesús',
      lugar:'Col. Doctores, CDMX',

      ooadNom:'AGUASCALIENTES',
      velatorioId:usuario.idVelatorio,
      velatorioNom:'DOCTORES',
      version:5.2,
      numAtaudes:this.ataudes.length,
      modeloAtaud: this.modeloAtaudes(),
      tipoAtaud:this.tipoAtaud(),
      numInventarios: this.numInventario(),
      nomFinados: this.nombreFinados(),
      fecSolicitud:moment(this.fa.fechaSolicitud.value).format('DD/MM/yyyy'),
      nomResponsableAlmacen:this.fa.responsableAlmacenAtaud.value,
      nomSolicitante:this.fds.nombre.value,
      dia: parseInt(moment().format('DD')),
      mes:moment().format('MMMM'),
      anio: parseInt(moment().format('yyyy')) ,
      tipoReporte:'pdf'
    }

  }

  modeloAtaudes(): string{
    let modeloAtaud:string = "";
    this.ataudes.forEach( ataud => {
      modeloAtaud += ataud.desModeloArticulo + ',';
    });
    modeloAtaud = modeloAtaud.substr(0,modeloAtaud.length -1);
    return modeloAtaud;
  }

  tipoAtaud(): string {
    let tipoAtaud = "";
    this.ataudes.forEach( ataud => {
      tipoAtaud += ataud.desTipoMaterial + ',';
    });
    tipoAtaud = tipoAtaud.substr(0, tipoAtaud.length - 1);
    return tipoAtaud;
  }

  numInventario(): string {
    let numInventario = "";
    this.ataudes.forEach( ataud => {
      numInventario += ataud.folioArticulo + ',';
    });
    numInventario = numInventario.substr(0, numInventario.length - 1)
    return numInventario;
  }

  nombreFinados(): string {
    let nombreFinados = "";
    this.finados.forEach( finado => {
      nombreFinados += finado.nombre + ',';
    });
    nombreFinados = nombreFinados.substr(0 , nombreFinados.length - 1);
    return nombreFinados;
  }

  formatoFinados(): Finado[] {
    this.finados.forEach( finado => {
      this.finadoLista.push(
        {
          nomFinado: finado.nombre,
          nomFinadoPaterno: finado.primerApellido,
          nomFinadoMaterno: finado.segundoApellido
        }
      )
    });
    return this.finadoLista;
  }

  formatoAtaud(): AtaudesDonados[] {
    this.backlogAutaudes.forEach(ataud => {
      this.ataudLista.push(
        {
          idArticulo:ataud.idArticulo,
          folioArticulo:ataud.folioArticulo
        }
      );
    });
    return this.ataudLista;
  }

  cambiarSexo(): void {
    this.fds.otro.enabled;
    this.fds.otro.setValidators(Validators.required);
    if(this.fds.sexo.value == 3){
      this.otroTipoSexo = true;
      this.fds.otro.disabled;
      this.fds.otro.clearValidators();
      this.fds.otro.setValue("");
      return;
    }
    this.otroTipoSexo = false;
  }


  cambiarNacionalidad(): void {
    if(this.fds.nacionalidad.value == 1){
      this.fds.lugarNacimiento.enabled;
      this.fds.lugarNacimiento.setValidators(Validators.required);
      this.fds.paisNacimiento.disabled;
      this.fds.paisNacimiento.clearValidators();
      this.fds.paisNacimiento.reset();
      return;
    }
    this.fds.paisNacimiento.enabled;
    this.fds.paisNacimiento.setValidators(Validators.required);
    this.fds.lugarNacimiento.disabled;
    this.fds.lugarNacimiento.clearValidators();
    this.fds.lugarNacimiento.reset();
  }

  otorgamiento(tipo:number): void {
    if(tipo){
      this.fa.estudioSocioeconomico.setValue(false);
      return;
    }
    this.fa.estudioLibre.setValue(false);
  }

  noEspaciosAlPrincipio() {
    this.fa.responsableAlmacenAtaud.setValue(
      this.fa.responsableAlmacenAtaud.value.trimStart()
    );
  }

  tomarTipoSexo(): string {
    const sexo:any = CATALOGO_SEXO.filter(sexo => {
      return sexo.value == this.fds.sexo.value;
    })
    return sexo[0].label;
  }

  consultarAtaudes(): void {
    this.loaderService.activar();
    this.consultaDonacionesService.consultaControlSalidaAtaudes().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {
        this.backlogAutaudes = respuesta.datos;
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  siguiente(): void {
    this.indice ++;
  }

  regresar(): void {
    this.indice --;
  }

  get fds() {
    return this.formDatosSolicitante.controls;
  }

  get fa() {
    return this.formAtaudes.controls;
  }
}