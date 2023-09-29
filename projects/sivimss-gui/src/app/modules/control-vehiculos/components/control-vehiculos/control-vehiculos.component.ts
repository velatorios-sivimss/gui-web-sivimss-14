import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { RESERVAR_SALAS_BREADCRUMB } from '../../constants/breadcrumb';
import { OpcionesControlVehiculos, SelectButtonOptions } from '../../constants/opciones-reservar-salas';
import { ActivatedRoute } from '@angular/router';
import { ControlVehiculosService } from '../../services/control-vehiculos.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { BuscarVehiculosDisponibles, ControlVehiculoListado } from '../../models/control-vehiculos.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { mensajes } from '../../../reservar-salas/constants/mensajes';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

@Component({
  selector: 'app-control-vehiculos',
  templateUrl: './control-vehiculos.component.html',
  styleUrls: ['./control-vehiculos.component.scss']
})
export class ControlVehiculosComponent implements OnInit {
  readonly POSICION_CATALOGO_NIVELES = 0;
  readonly POSICION_CATALOGO_DELEGACION = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  OpcionesControlVehiculos = OpcionesControlVehiculos;
  opcionControlVehiculo: any = OpcionesControlVehiculos[0];
  modoCalendario: boolean = false;
  filtroForm!: FormGroup;
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  controlVehiculos: ControlVehiculoListado[] = [];

  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private controlVehiculosService: ControlVehiculosService,
    private formBuilder: FormBuilder,
  ) { }

  async ngOnInit() {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION];

    this.actualizarBreadcrumb();
    await this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(RESERVAR_SALAS_BREADCRUMB);
  }

  async inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: new FormControl({ value: +this.rolLocalStorage.idOficina || null, disabled: +this.rolLocalStorage.idOficina >= 1 }, [Validators.required]),
      delegacion: new FormControl({ value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idOficina >= 2 }, []),
      velatorio: new FormControl({ value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idOficina === 3 }, []),
    });
    await this.obtenerVelatorios();
    await this.obtenerVehiculos();
  }

  handleCambioVista(opcion: { value: SelectButtonOptions }): void {
    if (opcion.value.section === 'calendario') {
      this.modoCalendario = true;
    } else {
      this.modoCalendario = false;
    }
  }

  async obtenerVelatorios() {
    this.controlVehiculosService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
        this.controlVehiculos = [];
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  async obtenerVehiculos() {
    if (!this.modoCalendario) {
      let buscar: BuscarVehiculosDisponibles = {
        idDelegacion: this.f.delegacion.value,
        idVelatorio: this.f.velatorio.value,
        fecIniRepo: null,
        fecFinRepo: null
      };
      this.controlVehiculosService.obtenerVehiculosDisponibles(buscar).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.controlVehiculos = [];
          if (respuesta.datos?.content.length > 0) {
            this.controlVehiculos = respuesta.datos?.content;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
          const mensaje = this.alertas.filter((msj: any) => {
            return msj.idMensaje == error?.error?.mensaje;
          })
          if (mensaje && mensaje.length > 0) {
            this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
          }
        }
      });
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }

}
