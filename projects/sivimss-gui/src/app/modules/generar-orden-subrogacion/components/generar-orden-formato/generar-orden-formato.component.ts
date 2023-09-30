import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from "primeng/api";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { GenerarOrdenSubrogacionService } from '../../services/generar-orden-subrogacion.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-generar-orden-formato',
  templateUrl: './generar-orden-formato.component.html',
  styleUrls: ['./generar-orden-formato.component.scss'],
  providers: [DatePipe, ConfirmationService, DynamicDialogConfig]
})
export class GenerarOrdenFormatoComponent implements OnInit {

  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;

  public editForm!: FormGroup;
  public catalogoServicios: TipoDropdown[] = [];
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public esModificacion: any;
  public ordenSeleccionada: any;

  constructor(
    public config: DynamicDialogConfig,
    private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private route: ActivatedRoute,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.esModificacion = this.route.snapshot.paramMap.get('esModificacion');
    this.esModificacion =  JSON.parse(this.esModificacion);
    this.ordenSeleccionada = this.generarOrdenSubrogacionService.ordenSeleccionada;
    console.log("ORDEN SELECCIONADA: ", this.ordenSeleccionada)
    this.cargarVelatorios(true);
    this.inicializarCatalogos();
    this.inicializarEditForm();
  }

  inicializarEditForm(): void {
    let servicio = this.catalogoServicios.filter( s => s.label === this.ordenSeleccionada.tipoServicio);
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.editForm = this.formBuilder.group({
      version: new FormControl({ value: '1.0.0', disabled: true }, []),
      fecha: new FormControl({ value: new Date(), disabled: true }, []),
      hora: new FormControl({ value: new Date(), disabled: true }, []),
      delegacion: new FormControl({ value: +usuario.idDelegacion, disabled: true }, []),
      velatorio: new FormControl({ value: +usuario.idVelatorio, disabled: true }, []),
      razonSocial: new FormControl({ value: this.ordenSeleccionada.proveedor, disabled: true }, []),
      numOrden: new FormControl({ value: this.ordenSeleccionada.folioOds, disabled: true }, []),
      fechaOrden: new FormControl({ value: this.ordenSeleccionada.fechaOds, disabled: true }, []),
      nombreFinado: new FormControl({ value: this.ordenSeleccionada.nombreFinado, disabled: true }, []),
      tipoTraslado: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.tipoTranslado == "Oficial" ? "true" : "false" : null , disabled: false }, []),
      servicios: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.tipoServicio ? this.ordenSeleccionada.tipoServicio : null : null, disabled: this.esModificacion ? true : false }, []),
      especificaciones: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.especificaciones : null, disabled: false }, []),
      lugarOrigen: new FormControl({ value: this.ordenSeleccionada.origen ? this.ordenSeleccionada.origen : null, disabled: false }, []),
      lugarDestino: new FormControl({ value: this.ordenSeleccionada.destino ? this.ordenSeleccionada.destino : null, disabled: false }, []),
      distancia: new FormControl({ value: this.ordenSeleccionada.totalKilometros ? this.ordenSeleccionada.totalKilometros : null, disabled: false }, []),
      nombreOperador: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.nombreOperador : null, disabled: false }, []),
      nombreAcompanante: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.nombreAcompaniante : null, disabled: false }, []),
      numCarroza: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.numCarroza : null, disabled: false }, []),
      numPlacas: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.numPlacas : null, disabled: false }, []),
      horaPartida: new FormControl({ value: this.esModificacion ? this.ordenSeleccionada.horaPartida.length > 5 ? this.ordenSeleccionada.horaPartida.substring(0,5) : this.ordenSeleccionada.horaPartida : null, disabled: false }, []),
      diaPartida: new FormControl({ value: this.esModificacion ? new Date(this.ordenSeleccionada.diaPartida) : null, disabled: false }, [])
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.generarOrdenSubrogacionService.consultarServicios(this.ordenSeleccionada.idOds).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoServicios = mapearArregloTipoDropdown(respuesta.datos, "servicio", "idServicio");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.editForm.get('velatorio')?.patchValue("");
    }
    if (!usuario.idDelegacion) return;
    this.generarOrdenSubrogacionService.obtenerVelatorios(usuario.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  guardarOrden() {
    let orden = this.mapearOrden();
    if (this.esModificacion) {
      orden.idHojaSubrogacion = this.ordenSeleccionada.idHojaSubrogacion;
      this.generarOrdenSubrogacionService.actualizarOrden(orden).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta.codigo === 200) {
            this.alertaService.mostrar(TipoAlerta.Exito, "Hoja de subrogación actualizada correctamente");
            void this.router.navigate(["../.."], {relativeTo: this.activatedRoute});
          }
        },
        error: (error: HttpErrorResponse): void => {
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
    } else {
      this.generarOrdenSubrogacionService.guardarOrden(orden).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta.codigo === 200) {
            this.alertaService.mostrar(TipoAlerta.Exito, "Hoja de subrogación generada correctamente");
            void this.router.navigate(["../.."], {relativeTo: this.activatedRoute});
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.error("ERROR: ", error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
    }
  }

  mapearOrden(): any {
    let servicio = this.catalogoServicios.filter((s) => s.value === this.editForm.get("servicios")?.value);
    return {
      idOrdenServicio: this.ordenSeleccionada.idOds,
      idDelegacion: this.editForm.get("delegacion")?.value,
      idVelatorio: this.editForm.get("velatorio")?.value,
      idProveedor: this.ordenSeleccionada.idProveedor,
      fecGeneracionHoja: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      tipoTraslado: this.editForm.get("tipoTraslado")?.value ? "Oficial" : "Particular",
      idFinado: this.ordenSeleccionada.idFinado,
      origen: this.editForm.get("lugarOrigen")?.value,
      destino: this.editForm.get("lugarDestino")?.value,
      distanciaRecorrer: this.editForm.get("distancia")?.value,
      idServicio: this.esModificacion ? this.ordenSeleccionada.idServicio : servicio.length > 0 ? servicio[0].value : null,
      especificaciones: this.editForm.get("especificaciones")?.value,
      nombreOperador: this.editForm.get("nombreOperador")?.value,
      carrozaNum: this.editForm.get("numCarroza")?.value,
      numeroPlacas: this.editForm.get("numPlacas")?.value,
      diaPartida: this.datePipe.transform(new Date(this.editForm.get("diaPartida")?.value), 'yyyy-MM-dd'),
      horaPartida: moment(this.editForm.get('horaPartida')?.value).format('HH:mm'),
      nomAcompaniante: this.editForm.get("nombreAcompanante")?.value
    }
  }

  formatearHora(cadenaHora: string) {
    const fecha = new Date(); // Fecha ficticia, solo para obtener la hora
    const horaCompleta = new Date(fecha.toDateString() + ' ' + cadenaHora);
    return this.datePipe.transform(horaCompleta, 'HH:mm:ss');
  }

  get ef() {
    return this.editForm.controls;
  }
}
