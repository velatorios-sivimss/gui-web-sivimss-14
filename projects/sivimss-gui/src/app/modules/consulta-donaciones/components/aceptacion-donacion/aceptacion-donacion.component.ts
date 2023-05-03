import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AtaudDonado, GuardarAgregarDonacion} from "../../models/consulta-donaciones-interface"
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AgregarAtaudDonadoComponent} from "../agregar-ataud-donado/agregar-ataud-donado.component";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {ConsultaDonacionesService} from "../../services/consulta-donaciones.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {mensajes} from "../../../reservar-salas/constants/mensajes";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {PlantillaAceptarDonacion} from "../../models/generar-plantilla-interface";
import * as moment from "moment/moment";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-aceptacion-donacion',
  templateUrl: './aceptacion-donacion.component.html',
  styleUrls: ['./aceptacion-donacion.component.scss'],
  providers: [DialogService,DescargaArchivosService]
})
export class AceptacionDonacionComponent implements OnInit {

  ataudDonadoRef!: DynamicDialogRef;

  donacionForm!: FormGroup;

  ataudDonado: AtaudDonado[] = [];
  confirmacion : boolean = false;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  idOrdenServicio!: number;
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private consultaDonacionesService: ConsultaDonacionesService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService
  ) {
    moment.locale('es');
  }

  ngOnInit(): void {
    localStorage.setItem("mensajes", JSON.stringify(mensajes));
    this.actualizarBreadcrumb();
    this.inicializarDonacionForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
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
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        this.generarArchivo();
        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
        this.router.navigate(["consulta-donaciones"]);

      },
      (error: HttpErrorResponse) => {
        console.log(error);
        if(error.error.datos.length > 0){
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error.error.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        }
      }
    )
  }

  generarArchivo(): void{
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    const plantilla = this.modeloPlantillaDonacion();
    this.descargaArchivosService.descargarArchivo(
      this.consultaDonacionesService.generarPlantillaAgregarDonacion(plantilla),configuracionArchivo
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

  modeloPlantillaDonacion(): PlantillaAceptarDonacion {
    const usuario = JSON.parse(localStorage.getItem('usuario') as string)
    return {
      numContrato: "234234234234",
      nomAdministrador: "Raúl de Jesús",
      lugar: "Col. Doctores, Ciudad de México",
      version: 5.2,
      velatorioId: usuario.idVelatorio,
      ooadId: usuario.idDelegacion,
      nomFinado: this.f.nombreFinado.value,
      nomResponsableAlmacen: this.f.responsableAlmacen.value,
      nomContratante: this.f.nombreContratante.value,
      dia: parseInt(moment().format('DD')),
      mes: moment().format('MMMM'),
      anio: parseInt(moment().format('yyyy')),
      tipoReporte: 'pdf'
    }
  }

  modeloAgregarDonacion():GuardarAgregarDonacion {
    let ataudes: any = [];
    this.ataudDonado.forEach( ataud => {
      ataudes.push(
        {
          idArticulo: ataud.idArticulo,
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
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.idOrdenServicio = 0;
        this.f.nombreContratante.patchValue(null);
        this.f.nombreFinado.patchValue(null);
        if(respuesta.datos.length > 0){
          this.idOrdenServicio = respuesta.datos[0].idOrdenService;
          this.f.nombreContratante.setValue(respuesta.datos[0].nombreContratante);
          this.consultarFinadoPorFolioODS();
          return;
        }
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error.message);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
      }
    )
  }

  consultarFinadoPorFolioODS(){
    this.loaderService.activar()
    this.consultaDonacionesService.consultaFinadoPorFolioODS(this.f.folio.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.f.nombreFinado.setValue(respuesta.datos[0].nombreFinado);
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error.message);
      }
    )
  }

  generarPlantilla(): void {

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
