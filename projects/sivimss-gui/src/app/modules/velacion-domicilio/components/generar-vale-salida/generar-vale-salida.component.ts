import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { Articulo, BuscarFoliosOds, DatosFolioODS, EquipoVelacionInterface } from "../../models/velacion-domicilio.interface";
import { finalize } from "rxjs/operators";
import { OverlayPanel } from "primeng/overlaypanel";
import { ActivatedRoute, Router } from '@angular/router';
import { VelacionDomicilioService } from '../../services/velacion-domicilio.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import * as moment from 'moment';
import { mensajes } from '../../../reservar-salas/constants/mensajes';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EliminarArticuloComponent } from '../eliminar-articulo/eliminar-articulo.component';
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {CookieService} from "ngx-cookie-service";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-generar-vale-salida',
  templateUrl: './generar-vale-salida.component.html',
  styleUrls: ['./generar-vale-salida.component.scss'],
  providers: [DialogService, AutenticacionService, CookieService]
})
export class GenerarValeSalidaComponent implements OnInit {
  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACION: number = 1;
  readonly POSICION_ODS_GENERADAS: number = 2;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  eliminarArticuloRef!: DynamicDialogRef;
  confirmacion: boolean = false;
  generarValeSalidaForm!: FormGroup;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  estado: TipoDropdown[] = [];
  foliosGenerados: TipoDropdown[] = [];
  datosFolio: DatosFolioODS = {
    articulos: []
  };
  equipoSeleccionado: EquipoVelacionInterface = {};
  bloquearRegistrarSalida: boolean = false;
  idOds: number = 0;
  paso: 'formulario' | 'confirmacion' = 'formulario';
  alertas = JSON.parse(this.cookieService.get('mensajes') as string) || mensajes;
  rolUsuarioEnSesion: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private velacionDomicilioService: VelacionDomicilioService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    private router: Router,
    public dialogService: DialogService,
    private cookieService: CookieService,
    private authService: AutenticacionService
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION];
    this.actualizarBreadcrumb();
    void this.inicializarForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  async inicializarForm() {
    this.generarValeSalidaForm = this.formBuilder.group({
      nivel: new FormControl({ value: +this.rolUsuarioEnSesion.idOficina || null, disabled: +this.rolUsuarioEnSesion.idOficina >= 1 }, [Validators.required]),
      delegacion: new FormControl({ value: +this.rolUsuarioEnSesion.idDelegacion || null, disabled: +this.rolUsuarioEnSesion.idOficina >= 2 }, []),
      velatorio: new FormControl({ value: +this.rolUsuarioEnSesion.idVelatorio || null, disabled: +this.rolUsuarioEnSesion.idOficina === 3 }, []),
      folio: new FormControl({ value: null, disabled: false }, [Validators.required, Validators.maxLength(11)]),
      nombreContratante: new FormControl({ value: null, disabled: true }, []),
      nombreFinado: new FormControl({ value: null, disabled: true }, []),
      nombreResponsableEntrega: new FormControl({ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]),
      diasNovenario: new FormControl({ value: null, disabled: false }, [Validators.maxLength(2)]),
      fechaSalida: new FormControl({ value: null, disabled: false }, [Validators.required]),
      nombreResponsableInstalacion: new FormControl({ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]),
      matriculaResponsableInstalacion: new FormControl({ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]),
      cp: new FormControl({ value: null, disabled: true }, [Validators.required]),
      calle: new FormControl({ value: null, disabled: true }, [Validators.required]),
      numExt: new FormControl({ value: null, disabled: true }, [Validators.required]),
      numInt: new FormControl({ value: null, disabled: true }, []),
      colonia: new FormControl({ value: null, disabled: true }, [Validators.required]),
      municipio: new FormControl({ value: null, disabled: true }, [Validators.required]),
      estado: new FormControl({ value: null, disabled: true }, [Validators.required]),
      articulos: this.formBuilder.array([]),
    });

    await this.obtenerVelatorios();
  }

  addControls(articulo: Articulo) {
    return new FormGroup({
      idValeSalida: new FormControl(articulo.idValeSalida),
      idInventario: new FormControl(articulo.idInventario),
      articulo: new FormControl(articulo.nombreArticulo),
      maxCantidad: new FormControl(articulo.cantidad),
      cantidad: new FormControl(null, [Validators.maxLength(3), Validators.required]),
      observaciones: new FormControl(articulo.observaciones, [Validators.maxLength(100), Validators.required]),
    });
  }

  async obtenerVelatorios() {
    this.foliosGenerados = [];
    this.velacionDomicilioService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  obtenerDatosFolioOds() {
    if (this.f.folio.valid && this.f.delegacion.value && this.f.velatorio.value) {
      const datos = {
        folioOds: this.f.folio.value,
        idDelegacion: this.f.delegacion.value,
        idVelatorio: this.f.velatorio.value,
      }
      this.velacionDomicilioService.obtenerDatosFolioOds(datos).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.bloquearRegistrarSalida = false;
          this.datosFolio.articulos = [];
          this.articulos.clear();

          if (respuesta.datos) {
            this.datosFolio = respuesta.datos;
            this.idOds = respuesta.datos.idOds;
          } else {
            this.datosFolio.nombreContratante = '';
            this.datosFolio.nombreFinado = '';
            this.datosFolio.cp = '';
            this.datosFolio.calle = '';
            this.datosFolio.numExt = '';
            this.datosFolio.numInt = '';
            this.datosFolio.colonia = '';
            this.datosFolio.municipio = '';
            this.datosFolio.estado = '';

            const mensaje = this.alertas.filter((msj: any) => {
              return msj.idMensaje == respuesta.mensaje;
            })
            this.alertaService.mostrar(TipoAlerta.Precaucion, mensaje[0].desMensaje);
          }

          this.generarValeSalidaForm.patchValue({
            ...this.datosFolio,
          });
          this.datosFolio.articulos?.forEach((item: Articulo) => {
            this.articulos.push(this.addControls(item));
          })
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  abrirPanel(event: MouseEvent, equipo: EquipoVelacionInterface): void {
    this.equipoSeleccionado = equipo;
    this.overlayPanel.toggle(event);
  }

  generarValeSalidaConfirmacion(): void {
    if (this.generarValeSalidaForm.valid && this.articulos.length > 0) {
      this.paso = 'confirmacion';
    } else {
      this.generarValeSalidaForm.markAllAsTouched();
    }
  }

  generarValeSalida(): void {
    if (this.generarValeSalidaForm.valid && this.articulos.length > 0) {
      this.velacionDomicilioService.crearValeSalida(this.datosGuardar()).pipe(
        finalize(() => this.loaderService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == respuesta.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
          this.abrirDetalleValeSalida();
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
        }
      });
    } else {
      this.generarValeSalidaForm.markAllAsTouched();
    }
  }

  abrirDetalleValeSalida(): void {
    void this.router.navigate(['reservar-capilla/velacion-en-domicilio']);
  }

  datosGuardar(): DatosFolioODS {
    this.articulos.controls.forEach(item => {
      const numCantidad: number = item.get('cantidad')?.value || 0;
      item.get('cantidad')?.patchValue(+numCantidad);
    });
    return {
      ...this.generarValeSalidaForm.getRawValue(),
      nombreVelatorio: this.catalogoVelatorios.filter((item: TipoDropdown) => item.value === this.f.velatorio.value)[0].label,
      folioOds: this.f.folio.value,
      diasNovenario: +this.f.diasNovenario.value,
      cantidadArticulos: this.articulos.length,
      fechaSalida: moment(this.f.fechaSalida.value).format('DD-MM-yyyy'),
      idOds: this.idOds,
      idVelatorio: this.f.velatorio.getRawValue(),
    }
  }

  eliminarArticulo(): void {
    this.eliminarArticuloRef = this.dialogService.open(EliminarArticuloComponent, {
      header: 'Eliminar artículo',
      width: '920px',
    });

    this.eliminarArticuloRef.onClose.subscribe((eliminar: boolean) => {
      if (eliminar) {
        this.eliminarEquipoVelacion();
      }
    })
  }

  eliminarEquipoVelacion(): void {
    const index = this.articulos.value.findIndex(
      (item: EquipoVelacionInterface) => item.idInventario === this.equipoSeleccionado.idInventario);
    if (index !== -1) {
      this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo eliminado correctamente');
      this.articulos.removeAt(index);

      if (this.articulos.length === 0) {
        this.bloquearRegistrarSalida = true;
      }
    }
  }

  obtenerFoliosGenerados() {
    let buscarFoliosOds: BuscarFoliosOds = {
      idDelegacion: this.f.delegacion.value,
      idVelatorio: this.f.velatorio.value,
    }
    this.velacionDomicilioService.obtenerOds(buscarFoliosOds).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        let filtrado: TipoDropdown[] = [];
        if (respuesta.datos?.length > 0) {
          respuesta.datos.forEach((e: any) => {
            filtrado.push({
              label: e.folioOds,
              value: e.idOds,
            });
          });
          this.foliosGenerados = filtrado;
        } else {
          this.foliosGenerados = [];
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  get f() {
    return this.generarValeSalidaForm.controls;
  }

  get articulos(): FormArray {
    return this.generarValeSalidaForm.get("articulos") as FormArray;
  }

}
