import { ConsultaDonacionesService } from './../../services/consulta-donaciones.service'
import { Component, OnInit, ViewChild } from '@angular/core'
import { BreadcrumbService } from '../../../../shared/breadcrumb/services/breadcrumb.service'
import { OverlayPanel } from 'primeng/overlaypanel'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { TipoDropdown } from '../../../../models/tipo-dropdown'
import {
  CATALOGOS_DONADO_POR,
  CATALOGOS_DUMMIES,
} from '../../../servicios-funerarios/constants/dummies'
import { LazyLoadEvent } from 'primeng/api'
import {
  ConsultaDonacionesInterface,
  FiltroDonacionesInterface,
} from '../../models/consulta-donaciones-interface'
import { DIEZ_ELEMENTOS_POR_PAGINA } from '../../../../utils/constantes'
import { ServiciosFunerariosInterface } from '../../../servicios-funerarios/models/servicios-funerarios.interface'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { RegistrarDonacionComponent } from '../registrar-donacion/registrar-donacion.component'
import { HttpErrorResponse } from '@angular/common/http'
import { TipoAlerta } from '../../../convenios-nuevos/seguimiento-nuevo-convenio/components/modificar-persona/modificar-persona.component'
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service'
import { CatNiveles, CatVelatorios } from '../../models/catalogos.interface'
import { CATALOGO_NIVEL } from '../../../articulos/constants/dummies'
import { ActivatedRoute } from '@angular/router'
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones'
import * as moment from 'moment'

@Component({
  selector: 'app-consulta-donaciones',
  templateUrl: './consulta-donaciones.component.html',
  styleUrls: ['./consulta-donaciones.component.scss'],
  providers: [DialogService],
})
export class ConsultaDonacionesComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  registrarDonacionRef!: DynamicDialogRef
  paginacionConFiltrado: boolean = false

  donaciones: ConsultaDonacionesInterface[] = []

  filtroForm!: FormGroup

  ataudesDonados: ConsultaDonacionesInterface[] = []
  ataudDonadoSeleccionado: ConsultaDonacionesInterface = {}

  base64: string = ''

  nivel: TipoDropdown[] = CATALOGOS_DUMMIES
  delegacion: TipoDropdown[] = CATALOGOS_DUMMIES
  velatorio: TipoDropdown[] = CATALOGOS_DUMMIES
  donadoPor: TipoDropdown[] = CATALOGOS_DONADO_POR

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0
  fechaFinal: any
  fechaInicial: any

  niveles: TipoDropdown[] = []

  velatorios: TipoDropdown[] = []

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private consultaDonacionesService: ConsultaDonacionesService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.inicializarFiltroForm()
    let respuesta = this.route.snapshot.data['respuesta']
    this.velatorios = mapearArregloTipoDropdown(
      respuesta[0]?.datos,
      'NOM_VELATORIO',
      'ID_VELATORIO',
    )
    this.niveles = mapearArregloTipoDropdown(
      respuesta[1]?.datos,
      'DES_NIVELOFICINA',
      'ID_OFICINA',
    )
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: false }, [Validators.required]],
      delegacion: [{ value: null, disabled: false }, [Validators.required]],
      velatorio: [{ value: null, disabled: false }, [Validators.required]],
      donadoPor: [{ value: null, disabled: false }],
      fechaDesde: [{ value: null, disabled: false }],
      fechaHasta: [{ value: null, disabled: false }],
    })
  }

  obtenerObjetoParaFiltrado(): FiltroDonacionesInterface {
    let fechaHasta = this.filtroForm.get('fechaHasta')?.value
    if (fechaHasta == null) {
      this.fechaFinal = fechaHasta
    } else {
      let fechaHastaSinHora = fechaHasta.toISOString().substring(0, 10)
      this.fechaFinal = fechaHastaSinHora
    }
    let fechaDesde = this.filtroForm.get('fechaDesde')?.value

    if (fechaDesde == null) {
      this.fechaInicial = fechaDesde
    } else {
      let fechaDesdeSinHora = fechaDesde.toISOString().substring(0, 10)
      this.fechaInicial = fechaDesdeSinHora
    }

    return {
      idVelatorio: parseInt(this.filtroForm.get('velatorio')?.value),
      idNivel: parseInt(this.filtroForm.get('nivel')?.value),
      idDelegacion: parseInt(this.filtroForm.get('delegacion')?.value),
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
    const filtros = this.obtenerObjetoParaFiltrado()
    const solicitudFiltros = JSON.stringify(filtros)
    this.consultaDonacionesService
      .buscarAtaudesPorFiltros(
        solicitudFiltros,
        this.numPaginaActual,
        this.cantElementosPorPagina,
      )
      .subscribe(
        (respuesta) => {
          this.ataudesDonados = respuesta!.datos.content
          this.totalElementos = respuesta!.datos.totalElements
          if (this.totalElementos == 0) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'No se encontró información relacionada a tu búsqueda.',
            )
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error)
          this.alertaService.mostrar(TipoAlerta.Error, error.message)
        },
      )
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1))
    }
    if (this.paginacionConFiltrado) {
      this.paginarPorFiltros()
    } else {
      this.paginarPorFiltros()
    }
  }

  limpiar(): void {
    this.limpiarAtaudesDonados()
    this.paginacionConFiltrado = false
    if (this.filtroForm) {
      this.filtroForm.reset()
    }
    this.numPaginaActual = 0
    this.paginarPorFiltros()
  }

  paginar(): void {
    this.consultaDonacionesService
      .buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .subscribe(
        (respuesta) => {
          this.ataudesDonados = respuesta!.datos.content
          this.totalElementos = respuesta!.datos.totalElements
          if (this.totalElementos == 0) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'No se encontró información relacionada a tu búsqueda.',
            )
          }
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

  get ff() {
    return this.filtroForm.controls
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
}
