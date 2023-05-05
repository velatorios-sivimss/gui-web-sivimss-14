import { Component, OnInit, ViewChild } from '@angular/core';
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { EquipoVelacionInterface } from "../../models/velacion-domicilio.interface";
import { OverlayPanel } from "primeng/overlaypanel";
import { ActivatedRoute } from '@angular/router';
import { ControlVehiculosService } from '../../../control-vehiculos/services/control-vehiculos.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';

@Component({
  selector: 'app-generar-vale-salida',
  templateUrl: './generar-vale-salida.component.html',
  styleUrls: ['./generar-vale-salida.component.scss']
})
export class GenerarValeSalidaComponent implements OnInit {
  readonly POSICION_CATALOGO_NIVELES = 0;
  readonly POSICION_CATALOGO_DELEGACION = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  confirmacion: boolean = false;
  generarValeSalidaForm!: FormGroup;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  estado: TipoDropdown[] = [];

  equipo: EquipoVelacionInterface[] = [
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    },
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    },
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    }
  ];
  equipoSeleccionado: EquipoVelacionInterface = {};

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private controlVehiculosService: ControlVehiculosService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION];
    debugger
    this.actualizarBreadcrumb();
    this.inicializarForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  inicializarForm(): void {
    this.generarValeSalidaForm = this.formBuilder.group({
      nivel: new FormControl({ value: 1, disabled: true }, [Validators.required]),
      delegacion: new FormControl({ value: null, disabled: false }, Validators.required),
      velatorio: new FormControl({ value: null, disabled: false }, Validators.required),
      folioODS: new FormControl({ value: null, disabled: false }, [Validators.required]),
      nombreContratante: new FormControl({ value: null, disabled: false }, [Validators.required]),
      nombreFinado: new FormControl({ value: null, disabled: false }, [Validators.required]),
      responsableEntrega: new FormControl({ value: null, disabled: false }, [Validators.required]),
      diasNovenario: new FormControl({ value: null, disabled: false }, [Validators.required]),
      fechaSalida: new FormControl({ value: null, disabled: false }, [Validators.required]),
      responsableInstalacion: new FormControl({ value: null, disabled: false }, [Validators.required]),
      matriculaResponsableInstalacion: new FormControl({ value: null, disabled: false }, [Validators.required]),
      responsableEquipoVelacion: new FormControl({ value: null, disabled: false }, [Validators.required]),
      matriculaResponsableVelacion: new FormControl({ value: null, disabled: false }, [Validators.required]),
      fechaEntrada: new FormControl({ value: null, disabled: false }, [Validators.required]),
      cp: new FormControl({ value: null, disabled: false }, [Validators.required]),
      calle: new FormControl({ value: null, disabled: false }, [Validators.required]),
      numeroExterior: new FormControl({ value: null, disabled: false }, [Validators.required]),
      numeroInterior: new FormControl({ value: null, disabled: false }, [Validators.required]),
      colonia: new FormControl({ value: null, disabled: false }, [Validators.required]),
      municipio: new FormControl({ value: null, disabled: false }, [Validators.required]),
      estado: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });
  }

  obtenerVelatorios() {
    this.controlVehiculosService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe(
      (respuesta) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta!.datos, "desc", "id");
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  abrirPanel(event: MouseEvent, equipo: EquipoVelacionInterface): void {
    this.equipoSeleccionado = equipo;
    this.overlayPanel.toggle(event);
  }

  registrarSalida(): void {

  }

  aceptar(): void {

  }

  eliminarEquipoVelacion(): void {

  }

  get f() {
    return this.generarValeSalidaForm.controls;
  }

}
