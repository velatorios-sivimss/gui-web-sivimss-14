import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AtaudDonado, GuardarAgregarDonacion} from "../../models/consulta-donaciones-interface"
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AgregarAtaudDonadoComponent} from "../agregar-ataud-donado/agregar-ataud-donado.component";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {DatosAdministrador, PlantillaAceptarDonacion} from "../../models/generar-plantilla-interface";
import * as moment from "moment/moment";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import { GestionarDonacionesService} from "../../services/gestionar-donaciones.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-aceptacion-donacion',
  templateUrl: './aceptacion-donacion.component.html',
  styleUrls: ['./aceptacion-donacion.component.scss'],
  providers: [DialogService,DescargaArchivosService, AutenticacionService]
})
export class AceptacionDonacionComponent implements OnInit {

  ataudDonadoRef!: DynamicDialogRef;

  donacionForm!: FormGroup;

  ataudDonado: AtaudDonado[] = [];
  delegacion: TipoDropdown[] = [];
  confirmacion : boolean = false;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  idOrdenServicio!: number;
  datosAdministrador!: DatosAdministrador;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private consultaDonacionesService: GestionarDonacionesService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    private route: ActivatedRoute,
    private authService: AutenticacionService
  ) {
    moment.locale('es');
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.delegacion = respuesta[2]!.map((estado: any) => (
      {label: estado.label, value: estado.value} )) || [];
    this.actualizarBreadcrumb();
    this.inicializarDonacionForm();
    this.consultarDatosAdministrador();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarDonacionForm(): void {
    this.donacionForm = this.formBuilder.group({
      folio: [{value: null, disabled: false}, [Validators.required]],
      nombreContratante: [{value: null, disabled: true}],
      nombreFinado: [{value: null, disabled: true}],
      responsableAlmacen: [{value: null, disabled: false}, [Validators.required]],
      matricula: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  agregarAtaud(): void {
    this.ataudDonadoRef = this.dialogService.open(AgregarAtaudDonadoComponent, {
      header:"Agregar ataúd",
      width:"920px",
      data: {folio: this.f.folio.value, ataudes:this.ataudDonado },
    });

    this.ataudDonadoRef.onClose.subscribe((ataud:AtaudDonado) => {
      if(ataud){
        this.ataudDonado.push(ataud);
      }
    });
  }

  guardar(): void {
    this.loaderService.activar();
    const registro = this.modeloAgregarDonacion();
    this.consultaDonacionesService.guardarAgregarDonacion(registro).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.generarArchivo();
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg);

        this.router.navigate(["../consulta-donaciones"]);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg);

      }
    });
  }

  generarArchivo(): void{
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {nombreArchivo: "Aceptación y control de ataúdes de donación"};
    const plantilla = this.modeloPlantillaDonacion();
    this.descargaArchivosService.descargarArchivo(
      this.consultaDonacionesService.generarPlantillaAgregarDonacion(plantilla),configuracionArchivo
    ).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        console.log(respuesta);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  modeloPlantillaDonacion(): PlantillaAceptarDonacion {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    return {
      version: 5.2,
      ooadNom: this.nombreOoad(+usuario.idDelegacion),
      velatorioId: this.datosAdministrador.nombreVelatorio,
      numContrato: this.f.folio.value,
      modeloAtaud: this.modeloAtaudes(),
      tipoAtaud: this.tipoAtaud(),
      numInventarios: this.numInventario(),
      claveResponsableAlmacen: this.f.matricula.value,
      nomFinado: this.f.nombreFinado.value,
      nomResponsableAlmacen: this.f.responsableAlmacen.value,
      nomContratante: this.f.nombreContratante.value,
      nomAdministrador: this.datosAdministrador.nombreAdministrador,
      claveAdministrador: this.datosAdministrador.matriculaAdministrador,
      lugar: this.datosAdministrador.lugardonacion,
      ooadId: +usuario.idDelegacion,
      dia: parseInt(moment().format('DD')),
      mes: moment().format('MMMM').toUpperCase(),
      anio: parseInt(moment().format('yyyy')),
      tipoReporte: 'pdf'
    }
  }

  modeloAgregarDonacion():GuardarAgregarDonacion {
    let ataudes: any = [];
    this.ataudDonado.forEach( ataud => {
      ataudes.push(
        {
          idInventarioArticulo: ataud.idInventarioArticulo,
          folioArticulo: ataud.folioArticulo
        }
      )
    })
    return {
      idOrdenServicio: this.idOrdenServicio,
      responsableAlmacen: this.f.responsableAlmacen.value,
      matricularesponsable: this.f.matricula.value,
      numTotalAtaudes: this.ataudDonado.length,
      ataudesDonados: ataudes
    }
  }

  abrirConfirmacion() : void {
    this.confirmacion = true;
  }

  consultaContratantePorFolioODS(): void {
    if(!this.f.folio.value){return}
    this.loaderService.activar()
    this.consultaDonacionesService.consultaContratantePorFolioODS(this.f.folio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.idOrdenServicio = 0;
        this.limpiarDatos();
        if(respuesta.datos.length > 0){
          this.idOrdenServicio = respuesta.datos[0].idOrdenService;
          this.f.nombreContratante.setValue(respuesta.datos[0].nombreContratante);
          this.consultarFinadoPorFolioODS();
          return;
        }
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
      }
    });
  }

  limpiarDatos(): void {
    this.f.nombreContratante.patchValue(null);
    this.f.nombreFinado.patchValue(null);
    this.ataudDonado = [];
  }
  nombreOoad(idOoad: number): string {
    let nombreDelegacion: TipoDropdown[];

    nombreDelegacion = this.delegacion.filter((nombre => {
      return idOoad == nombre.value;
    }));

    return nombreDelegacion[0].label;
  }

  modeloAtaudes(): string{
    let modeloAtaud:string = "";
    this.ataudDonado.forEach( ataud => {
      modeloAtaud += ataud.desModeloArticulo + ',';
    });
    modeloAtaud = modeloAtaud.substring(0,modeloAtaud.length -1);
    return modeloAtaud;
  }

  consultarDatosAdministrador(): void {
    this.loaderService.activar();
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();

    this.consultaDonacionesService.consultarDatosAdministrador(+usuario.idVelatorio).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.datosAdministrador = {
          nombreAdministrador: respuesta.datos[0].nombreAdministrador,
          lugardonacion: respuesta.datos[0].lugardonacion,
          matriculaAdministrador: respuesta.datos[0].matriculaAdministrador,
          nombreVelatorio: respuesta.datos[0].velatorio
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    });
  }

  tipoAtaud(): string {
    let tipoAtaud = "";
    this.ataudDonado.forEach( ataud => {
      tipoAtaud += ataud.desTipoMaterial + ',';
    });
    tipoAtaud = tipoAtaud.substring(0, tipoAtaud.length - 1);
    return tipoAtaud;
  }

  numInventario(): string {
    let numInventario = "";
    this.ataudDonado.forEach( ataud => {
      numInventario += ataud.folioArticulo + ',';
    });
    numInventario = numInventario.substring(0, numInventario.length - 1)
    return numInventario;
  }


  consultarFinadoPorFolioODS(){
    this.loaderService.activar()
    this.consultaDonacionesService.consultaFinadoPorFolioODS(this.f.folio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.f.nombreFinado.setValue(respuesta.datos[0].nombreFinado);
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  noEspaciosAlPrincipio() {
    this.f.responsableAlmacen.setValue(
      this.f.responsableAlmacen.value.trimStart()
    );
  }

  get f() {
    return this.donacionForm.controls;
  }

}
