import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from "primeng/api";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
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
import {finalize} from "rxjs/operators";

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
  public catalogoServiciosConAtributos: any;
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public esModificacion: any;
  public ordenSeleccionada: any;
  public idProveedor!: number;
  public idServicio!: number;

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
    this.inicializarCatalogos();
    this.inicializarEditForm();
    this.cargarVelatorios(true);
    if(this.esModificacion)this.consultarDetalle(this.ordenSeleccionada.idHojaSubrogacion);
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
      razonSocial: new FormControl({ value: null, disabled: true }, []),
      numOrden: new FormControl({ value: this.ordenSeleccionada.folioOds, disabled: true }, []),
      fechaOrden: new FormControl({ value: this.ordenSeleccionada.fechaOds.replaceAll("-","/"), disabled: true }, []),
      nombreFinado: new FormControl({ value: this.ordenSeleccionada.nombreFinado, disabled: true }, []),
      tipoTraslado: new FormControl({ value: null , disabled: false }, [Validators.required]),
      servicios: new FormControl({ value: null, disabled: this.esModificacion ? true : false }, [Validators.required]),
      especificaciones: new FormControl({ value: null, disabled: false }, []),
      lugarOrigen: new FormControl({ value: null, disabled: true }, []),
      lugarDestino: new FormControl({ value: null, disabled: true }, []),
      distancia: new FormControl({ value: null, disabled: true }, []),
      nombreOperador: new FormControl({ value: null, disabled: false }, [Validators.required]),
      nombreAcompanante: new FormControl({ value: null, disabled: false }, []),
      numCarroza: new FormControl({ value: null, disabled: false }, [Validators.required]),
      numPlacas: new FormControl({ value: null, disabled: false }, []),
      horaPartida: new FormControl({ value: null, disabled: false }, []),
      diaPartida: new FormControl({ value: null, disabled: false }, [])
    });
  }

  validarCadenaFechaVacia(cadenaFecha:string):Date | null{
    if(cadenaFecha === '') return null
    const [anio, mes, dia] = cadenaFecha.split('-')
    return  new Date(+anio + '/' + +mes + '/' + +dia);
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.generarOrdenSubrogacionService.consultarServicios(this.ordenSeleccionada.idOds).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoServiciosConAtributos = respuesta.datos;
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

  onChangeServicio(event: any) {
    let idServicioSeleccionado = event.value;
    let servicio = this.catalogoServiciosConAtributos.filter( (s: any) => s.idServicio === idServicioSeleccionado);
    this.idProveedor = servicio[0].idProveedor;
    this.idServicio = servicio[0].idServicio;
    this.ef.razonSocial.setValue(servicio[0].nombreProveedor)
    if (servicio.length > 0 ) {
      this.editForm.get('lugarOrigen')?.setValue(servicio[0].origen);
      this.editForm.get('lugarDestino')?.setValue(servicio[0].destino);
      this.editForm.get('distancia')?.setValue(servicio[0].totalKilometros);
    }
  }

  guardarOrden() {
    let orden = this.mapearOrden();
    console.log("Despues ", orden);
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
          this.alertaService.mostrar(TipoAlerta.Error, "Error al guardar la información. Intenta nuevamente.");
        }
      });
    }
  }

  mapearOrden(): any {
    let servicio = this.catalogoServicios.filter((s) => s.value === this.editForm.get("servicios")?.value);
    console.log("ANTES " ,this.editForm.value);
    return {
      idOrdenServicio: this.ordenSeleccionada.idOds,
      idDelegacion: this.editForm.get("delegacion")?.value,
      idVelatorio: this.editForm.get("velatorio")?.value,
      idProveedor: this.idProveedor,
      fecGeneracionHoja: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      tipoTraslado: this.editForm.get("tipoTraslado")?.value ? "Oficial" : "Particular",
      idFinado: this.ordenSeleccionada.idFinado,
      origen: this.editForm.get("lugarOrigen")?.value,
      destino: this.editForm.get("lugarDestino")?.value,
      distanciaRecorrer: this.editForm.get("distancia")?.value,
      idServicio: this.idServicio,
      especificaciones: this.editForm.get("especificaciones")?.value ?? "",
      nombreOperador: this.editForm.get("nombreOperador")?.value,
      carrozaNum: this.editForm.get("numCarroza")?.value,
      numeroPlacas: this.editForm.get("numPlacas")?.value ?? "",
      diaPartida: this.obtenerDiaPartida(this.editForm.get("diaPartida")?.value),
      horaPartida: this.obtenerHoraPartida(this.editForm.get("horaPartida")?.value),
      nomAcompaniante: this.editForm.get("nombreAcompanante")?.value ?? ""
    }
  }

  obtenerDiaPartida(diaPartida:Date){
    return diaPartida ? moment(diaPartida).format('YYYY-MM-DD') : null;
  }

  obtenerHoraPartida(horaPartida:Date){
    return horaPartida ? moment(horaPartida).format('HH:mm:ss') : null;
  }

  formatearHora(cadenaHora: string) {
    const fecha = new Date(); // Fecha ficticia, solo para obtener la hora
    const horaCompleta = new Date(fecha.toDateString() + ' ' + cadenaHora);
    return this.datePipe.transform(horaCompleta, 'HH:mm:ss');
  }

  consultarDetalle(orden:string): void {
    this.loaderService.activar()
    this.generarOrdenSubrogacionService.detalleSubrogacion(+orden).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.ef.razonSocial.setValue(respuesta.datos[0].razonSocial);
        this.ef.tipoTraslado.setValue(respuesta.datos[0].tipoTraslado == "Oficial" ? true : false);
        this.ef.servicios.setValue(respuesta.datos[0].servicio);
        this.ef.especificaciones.setValue(respuesta.datos[0].especificaciones);
        this.ef.lugarOrigen.setValue(respuesta.datos[0].origen);
        this.ef.lugarDestino.setValue(respuesta.datos[0].destino);
        this.ef.distancia.setValue(respuesta.datos[0].distancia);
        this.ef.nombreOperador.setValue(respuesta.datos[0].operador);
        this.ef.nombreAcompanante.setValue(respuesta.datos[0].acompaniante);
        this.ef.numCarroza.setValue(respuesta.datos[0].carroza);
        this.ef.numPlacas.setValue(respuesta.datos[0].placas);
        this.ef.horaPartida.setValue(this.parseoHora(respuesta.datos[0].horaPArtida));
        this.ef.diaPartida.setValue(this.validarCadenaFechaVacia(respuesta.datos[0].diaPartida));
        this.idProveedor = respuesta.datos[0].idProveedor;
        this.idServicio = respuesta.datos[0].idServicio;
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, "Error al guardar la información. Intenta nuevamente.");
      }
    })
  }

  parseoHora(tiempo: string): any {
    const fechaActual = moment().format('YYYY-MM-DD');
    const [anio, mes, dia] = fechaActual.split('-')
    const [horas, minutos,segundos] = tiempo.split(':')
    return  new Date(+anio, +mes, +dia, +horas, +minutos, +segundos)
  }

  get ef() {
    return this.editForm.controls;
  }
}
