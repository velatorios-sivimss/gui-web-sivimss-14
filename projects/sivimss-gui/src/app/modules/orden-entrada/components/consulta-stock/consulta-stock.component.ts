import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OrdenEntradaService } from "../../services/orden-entrada.service";
import { LazyLoadEvent } from "primeng/api";
import { OverlayPanel } from "primeng/overlaypanel";
import { ActivatedRoute } from "@angular/router";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { finalize } from "rxjs/operators";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { HttpErrorResponse } from "@angular/common/http";
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';

@Component({
  selector: 'app-consulta-stock',
  templateUrl: './consulta-stock.component.html',
  styleUrls: ['./consulta-stock.component.scss'],
  providers: [DescargaArchivosService]
})
export class ConsultaStockComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;

  mensajeArchivoConfirmacion: string = "";
  mostrarModalConfirmacion: boolean = false;

  formulario!: FormGroup;
  paginacionConFiltrado: boolean = false;
  stock: any[] = [];
  stockSeleccionado!: any;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  catalogoOrdenesEntrada: string[] = [];
  catalogoOrdenesEntradaCompleto: any[] = [];
  catalogoCategorias: string[] = [];
  catalogoCategoriasCompleto: any[] = [];

  asignacion: TipoDropdown[] = [
    {
      value: 1,
      label: "consignado"
    },
    {
      value: 2,
      label: "donado"
    },
    {
      value: 3,
      label: "ambos"
    },
  ];

  filtros: any;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  numPaginaActual: number = 0
  totalElementos: number = 0

  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ordenEntradaService: OrdenEntradaService,
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
  ) {
  }

  ngOnInit(): void {
    this.cargarVelatorios(true);
    this.inicializarFormulario();
    this.inicializarCatalogos()
  }

  inicializarFormulario(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.formulario = this.formBuilder.group({
      nivel: [{ value: +usuario.idOficina, disabled: false }],
      velatorio: [{ value: +usuario.idVelatorio, disabled: false }],
      ordenEntrada: [{ value: null, disabled: false }],
      categoria: [{ value: null, disabled: false }],
      asignacion1: [{ value: null, disabled: false }],
      asignacion2: [{ value: null, disabled: false }],
      asignacion3: [{ value: null, disabled: false }]
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.formulario.get('velatorio')?.patchValue("");
    }
    if (!usuario.idDelegacion) return;
    this.ordenEntradaService.obtenerVelatorios(usuario.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  validarNombre(posicion: number): void {
    let formularios = [this.f.ordenEntrada];
    let value = formularios[posicion].value;
    let nuevoValor = value.replace(/[^a-zA-Z0-9ñÑ\s]+/g, '');
    nuevoValor = nuevoValor.replace(/\s+/g, ' ');
    formularios[posicion].setValue(nuevoValor)
  }

  sinEspacioInicial(posicion: number): void {
    let formularios = [this.f.ordenEntrada]
    if (formularios[posicion].value.charAt(posicion).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  consultarOrdenesEntrada(event: any): void {
    let usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.loaderService.activar();
    this.ordenEntradaService.consultarOrdenesEntrada(this.f.ordenEntrada.value, usuario.idVelatorio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.catalogoOrdenesEntrada = [];
          this.catalogoOrdenesEntradaCompleto = [];
          this.catalogoOrdenesEntradaCompleto = respuesta.datos;
          respuesta.datos.forEach((ordenEntrada: any) => {
            this.catalogoOrdenesEntrada.push(ordenEntrada.NUM_FOLIO);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  consultarCategorias(event: any): void {
    this.loaderService.activar();
    this.ordenEntradaService.consultarCategoria(this.f.categoria.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.catalogoCategorias = [];
          this.catalogoCategoriasCompleto = [];
          this.catalogoCategoriasCompleto = respuesta.datos;
          respuesta.datos.forEach((ordenEntrada: any) => {
            this.catalogoCategorias.push(ordenEntrada.DES_CATEGORIA_ARTICULO);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    this.paginacionConFiltrado = false;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      if (this.numPaginaActual === 0) {
        this.filtros = this.mapearFiltrosBusqueda();
      }
      this.paginar();
    }
  }

  paginar(): void {
    this.loaderService.activar();
    this.ordenEntradaService.buscarStockPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, this.filtros)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.stock = [];
          this.stock = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  paginarConFiltros(): void {
    let filtros: any = this.mapearFiltrosBusqueda();
    this.loaderService.activar();
    this.ordenEntradaService.buscarStockPorFiltros(0, this.cantElementosPorPagina, filtros)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.stock = [];
          this.stock = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  abrirPanel(event: MouseEvent, stock: any): void {
    this.stockSeleccionado = stock;
    this.overlayPanel.toggle(event);
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    this.loaderService.activar();
    const busqueda = this.mapearDatosReporte(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.ordenEntradaService.generarReporteStock(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.mostrarModalConfirmacion = true;
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        if (mensaje) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje);
        } else {
          this.alertaService.mostrar(TipoAlerta.Error, "Error en la descarga del documento. Intenta nuevamente.");
        }
      },
    });
  }

  mapearDatosReporte(tipoReporteSeleccionado: string): any {
    return {
      idVelatorio: this.formulario.get("velatorio")?.value === "" ? null : this.formulario.get("velatorio")?.value,
      numFolioOrdenEntrada: this.formulario.get("ordenEntrada")?.value,
      tipoReporte: tipoReporteSeleccionado
    }
  }

  mapearFiltrosBusqueda(): any {
    const asignacion1 = this.formulario.get("asignacion1")?.value;
    const asignacion2 = this.formulario.get("asignacion2")?.value;
    const asignacion3 = this.formulario.get("asignacion3")?.value;

    let idTipoAsignacion: string | null = null;

    // Creamos un array con las asignaciones válidas
    const asignacionesValidas = [asignacion1, asignacion2, asignacion3].filter(value => value !== undefined && value !== null);

    // Filtramos las asignaciones que son diferentes de 0 y obtenemos sus primeros elementos.
    const asignacionesNoCero = asignacionesValidas.filter(value => value[0] !== 0).map(innerArray => innerArray[0]);

    // Comprobamos si quedan asignaciones después de filtrar los ceros
    if (asignacionesNoCero.length > 0) {
      idTipoAsignacion = asignacionesNoCero.join(',');
      idTipoAsignacion = idTipoAsignacion.replace(",","").replace(",",""); 
    }

    // Si idTipoAsignacion es null, asignamos "1,3" si asignacion1 es 0
    if (idTipoAsignacion === null && asignacion1 && asignacion1[0] === 0) {
      idTipoAsignacion = "1,3";
    }
    let ordenEntrada = this.catalogoOrdenesEntradaCompleto.filter((o) => o.NUM_FOLIO === this.formulario.get("ordenEntrada")?.value);
    let categoria = this.catalogoCategoriasCompleto.filter((c) => c.DES_CATEGORIA_ARTICULO === this.formulario.get("categoria")?.value);
    return {
      idVelatorio: this.formulario.get("velatorio")?.value === "" ? null : this.formulario.get("velatorio")?.value,
      idOrdenEntrada: ordenEntrada.length > 0 ? ordenEntrada[0].ID_ODE : null,
      idCategoriaArticulo: categoria.length > 0 ? categoria[0].ID_CATEGORIA_ARTICULO : null,
      idTipoAsignacionArt: idTipoAsignacion
    }
  }

  limpiar(): void {
    this.formulario.reset();
    this.cargarVelatorios(true);
    this.inicializarFormulario();
    this.paginar();
  }

  get f() {
    return this.formulario.controls;
  }

}
