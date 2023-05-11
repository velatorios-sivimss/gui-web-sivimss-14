import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { RESERVAR_SALAS_BREADCRUMB } from '../../constants/breadcrumb';
import { OpcionesControlVehiculos, SelectButtonOptions } from '../../constants/opciones-reservar-salas';
import { Router, ActivatedRoute } from '@angular/router';
import { ControlVehiculosService } from '../../services/control-vehiculos.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { BuscarVehiculosDisponibles, ControlVehiculoListado } from '../../models/control-vehiculos.interface';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private controlVehiculosService: ControlVehiculosService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION];

    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(RESERVAR_SALAS_BREADCRUMB);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: new FormControl({ value: 1, disabled: true }, [Validators.required]),
      delegacion: new FormControl({ value: null, disabled: false }, Validators.required),
      velatorio: new FormControl({ value: null, disabled: false }, Validators.required),
    });
  }

  handleCambioVista(opcion: { value: SelectButtonOptions }): void {
    if (opcion.value.section === 'calendario') {
      this.modoCalendario = true;
    } else {
      this.modoCalendario = false;
    }
  }

  obtenerVelatorios() {
    this.controlVehiculosService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe(
      (respuesta) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta!.datos, "desc", "id");
        this.controlVehiculos = [];
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  obtenerVehiculos(evt?: unknown) {
    if (this.filtroForm.valid && !this.modoCalendario) {
      let buscar: BuscarVehiculosDisponibles = {
        idVelatorio: this.f.velatorio.value,
        fecIniRepo: null,
        fecFinRepo: null,
        paginado: 1,
      };
      this.controlVehiculosService.obtenerVehiculosDisponibles(buscar).subscribe(
        (respuesta) => {
          // TO DO mostrar mensaje 45 -  no hay datos
          this.controlVehiculos = respuesta.datos?.content;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }

}
