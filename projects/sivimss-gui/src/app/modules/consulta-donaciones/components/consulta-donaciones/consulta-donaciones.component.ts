import {ConsultaDonacionesService} from '../../services/consulta-donaciones.service'
import {Component, OnInit, ViewChild} from '@angular/core'
import {BreadcrumbService} from '../../../../shared/breadcrumb/services/breadcrumb.service'
import {OverlayPanel} from 'primeng/overlaypanel'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {TipoDropdown} from '../../../../models/tipo-dropdown'
import {CATALOGOS_DONADO_POR} from '../../../servicios-funerarios/constants/dummies'
import {LazyLoadEvent} from 'primeng/api'
import {ConsultaDonacionesInterface, FiltroDonacionesInterface,} from '../../models/consulta-donaciones-interface'
import {DIEZ_ELEMENTOS_POR_PAGINA} from '../../../../utils/constantes'
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog'
import {RegistrarDonacionComponent} from '../registrar-donacion/registrar-donacion.component'
import {HttpErrorResponse} from '@angular/common/http'
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service'
import {ActivatedRoute} from '@angular/router'
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones'
import * as moment from 'moment'
import {finalize} from "rxjs/operators";
import {of} from "rxjs"
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {VelatorioInterface} from "../../../reservar-salas/models/velatorio.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";

@Component({
  selector: 'app-consulta-donaciones',
  templateUrl: './consulta-donaciones.component.html',
  styleUrls: ['./consulta-donaciones.component.scss'],
  providers: [DialogService,DescargaArchivosService],
})

export class ConsultaDonacionesComponent implements OnInit {

  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel


  rolLocaleStorage = JSON.parse(localStorage.getItem('usuario')as string);

  registrarDonacionRef!: DynamicDialogRef
  paginacionConFiltrado: boolean = false

  donaciones: ConsultaDonacionesInterface[] = []

  filtroForm!: FormGroup

  ataudesDonados: ConsultaDonacionesInterface[] = []
  ataudDonadoSeleccionado: ConsultaDonacionesInterface = {}

  base64: string = ''

  nivel: TipoDropdown[] = [];
  delegacion: TipoDropdown[] = [];
  velatorio: TipoDropdown[] = []
  donadoPor: TipoDropdown[] = CATALOGOS_DONADO_POR

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0
  fechaFinal: any
  fechaInicial: any

  niveles: TipoDropdown[] = []
  velatorios: TipoDropdown[] = []

  mostrarModalConfirmacion: boolean = false;
  mostrarModalFechaMayor: boolean = false;
  mensajeArchivoConfirmacion: string = "";

  fechaActual = new Date();
  fechaRango = moment().subtract(10,'years').toDate();
  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private consultaDonacionesService: ConsultaDonacionesService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
  ) {}

  ngOnInit(): void {
    this.inicializarFiltroForm()
    let respuesta = this.route.snapshot.data['respuesta']
    this.niveles = respuesta[this.POSICION_NIVELES].map((nivel: any) => ({label: nivel.label, value: nivel.value})) || [];
    this.delegacion = mapearArregloTipoDropdown(respuesta[this.POSICION_DELEGACIONES],'label','value');
    this.actualizarBreadcrumb();
    this.validarFiltros();
  }
  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: true }, [Validators.required]],
      delegacion: [{ value: null, disabled: +this.rolLocaleStorage.idOficina != 1 }, [Validators.required]],
      velatorio: [{ value: null, disabled: +this.rolLocaleStorage.idOficina == 3 }, [Validators.required]],
      donadoPor: [{ value: null, disabled: false }],
      fechaDesde: [{ value: null, disabled: false }],
      fechaHasta: [{ value: null, disabled: false }],
    })
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  validarFiltros(): void {
    this.ff.nivel.setValue(+this.rolLocaleStorage.idOficina);
    if(+this.rolLocaleStorage.idOficina == 1){return}
    this.ff.delegacion.setValue(+this.rolLocaleStorage.idDelegacion);
    if(+this.rolLocaleStorage.idOficina == 3){
      this.ff.velatorio.setValue(+this.rolLocaleStorage.idVelatorio);
    }
    this.cambiarDelegacion();
  }

  obtenerObjetoParaFiltrado(): FiltroDonacionesInterface {
    let fechaHasta = this.filtroForm.get('fechaHasta')?.value
    if (fechaHasta == null) {
      this.fechaFinal = fechaHasta
    } else {
      this.fechaFinal = fechaHasta.toISOString().substring(0, 10)
    }
    let fechaDesde = this.filtroForm.get('fechaDesde')?.value

    if (fechaDesde == null) {
      this.fechaInicial = fechaDesde
    } else {
      this.fechaInicial = fechaDesde.toISOString().substring(0, 10)
    }

    return {
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      idNivel: this.filtroForm.get('nivel')?.value,
      idDelegacion: this.filtroForm.get('delegacion')?.value,
      donadoPor: this.filtroForm.get('donadoPor')?.value,
      fechaFin: this.fechaFinal,
      fechaInicio: this.fechaInicial,
    }
  }

  buscar(): void {
    this.totalElementos = 0
    this.numPaginaActual = 0
    this.paginacionConFiltrado = true
    this.paginarPorFiltros()
  }

  limpiarAtaudesDonados(): void {
    this.ataudesDonados = []
    this.totalElementos = 0
  }

  paginarPorFiltros(): void {
    this.limpiarAtaudesDonados()
    const solicitudFiltros = this.obtenerObjetoParaFiltrado()
    this.consultaDonacionesService
      .buscarAtaudesPorFiltros(
        solicitudFiltros,
        this.numPaginaActual,
        this.cantElementosPorPagina,
      )
      .subscribe(
        (respuesta) => {
          this.ataudesDonados = respuesta.datos.content || []
          this.totalElementos = respuesta.datos.totalElements || 0
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          const numMnesaje = +error.error.mensaje
          const mensaje = this.mensajesSistemaService.obtenerMensajeSistemaPorId(numMnesaje)
          this.alertaService.mostrar(TipoAlerta.Error, mensaje);
        },
      )
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    }
    this.paginarPorFiltros()
  }



  limpiar(): void {
    this.limpiarAtaudesDonados()
    this.paginacionConFiltrado = false
    if (this.filtroForm) {
      this.filtroForm.reset()
      this.validarFiltros();
    }
    this.numPaginaActual = 0
    this.paginarPorFiltros()
  }

  paginar(): void {
    this.consultaDonacionesService
      .buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .subscribe(
        (respuesta) => {
          this.ataudesDonados = respuesta.datos.content || []
          this.totalElementos = respuesta.datos.totalElements || 0
        },
        (error: HttpErrorResponse) => {
          console.error(error)
          this.alertaService.mostrar(TipoAlerta.Error, error.message)
        },
      )
  }

  abrirPanel(
    event: MouseEvent,
    ataudDonado: ConsultaDonacionesInterface,
  ): void {
    this.ataudDonadoSeleccionado = ataudDonado
    this.overlayPanel.toggle(event)
  }

  abrirModarRegistrarDonacion(): void {
    this.registrarDonacionRef = this.dialogService.open(
      RegistrarDonacionComponent,
      {
        header: 'Registrar donación',
        width: '920px',
      },
    )
  }

  cambiarDelegacion(): void {
    this.loaderService.activar();
    this.consultaDonacionesService.obtenerCatalogoVelatoriosPorDelegacion(this.ff.delegacion.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.velatorios = respuesta.datos.map((velatorio: VelatorioInterface) => (
          {label: velatorio.nomVelatorio, value: velatorio.idVelatorio} )) || [];

      },(error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }


  descargarArchivo(tipoReporte: string) {
    const filtros = this.obtenerObjetoParaFiltrado()
    const tipoArchivo = JSON.stringify(filtros)
    const tipoArchivoConTipoDoc = JSON.parse(tipoArchivo)
    tipoArchivoConTipoDoc['tipoReporte'] = tipoReporte;
    this.consultaDonacionesService.exportarArchivo(tipoArchivoConTipoDoc).subscribe(
      (respuesta) => {
        this.base64 = respuesta!.datos
        if (this.totalElementos == 0) {
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'No se encontró información relacionada a tu búsqueda.',
          )
        }
        const linkSource =
          'data:application/' + tipoReporte + ';base64,' + this.base64 + '\n'
        const downloadLink = document.createElement('a')
        const fileName = 'Ataudes_donados.' + tipoReporte
        downloadLink.href = linkSource
        downloadLink.download = fileName
        downloadLink.click()
      },
      (error: HttpErrorResponse) => {
        console.error(error)
        this.alertaService.mostrar(TipoAlerta.Error, error.message)
      },
    )
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if(tipoReporte == "xls"){
      configuracionArchivo.ext = "xlsx"
    }
    this.loaderService.activar();
    const busqueda = this.objetoArchivo(tipoReporte);
    this.consultaDonacionesService.generarReporte(busqueda).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const file = new Blob([this.descargaArchivosService.base64_2Blob(
            respuesta.datos,this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) }
        );
        this.descargaArchivosService.descargarArchivo(of(file),configuracionArchivo).pipe(
          finalize(() => this.loaderService.desactivar())
        ).subscribe(
          (repuesta) => {
            this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
            this.mostrarModalConfirmacion = true;
          },
          (error) => {
            this.alertaService.mostrar(TipoAlerta.Error,this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        )
      },
      (error: HttpErrorResponse) => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, msg);
      }
    )
  }

  validarFechaFinal(): void {
    if(!this.ff.fechaDesde?.value || !this.ff.fechaHasta?.value){return}
    if(this.ff.fechaDesde.value > this.ff.fechaHasta.value){
      this.mostrarModalFechaMayor = true;
    }
  }

  objetoArchivo(tipoReporte: string) {
    return {
      idVelatorio: this.ff.velatorio?.value,
      idDelegacion: this.ff.delegacion?.value,
      donadoPor: this.ff.donadoPor?.value,
      fechaInicio: this.ff.fechaDesde.value? moment(this.ff.fechaDesde?.value).format('YYYY-MM-DD') : null,
      fechaFin: this.ff.fechaHasta.value ? moment(this.ff.fechaHasta?.value).format('YYYY-MM-DD') : null,
      tipoReporte: tipoReporte
    }
  }

  get ff() {
    return this.filtroForm.controls
  }
}
