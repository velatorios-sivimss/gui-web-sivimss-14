import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LatLng } from 'leaflet';
//import { MarkGeocodeEvent } from "leaflet-control-geocoder/dist/control";
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import 'leaflet';
import 'leaflet-control-geocoder';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Dropdown } from 'primeng/dropdown';

import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { LoaderService } from '../../../../shared/loader/services/loader.service';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ContenidoPaqueteInterface } from '../../models/ContenidoPaquete,interface';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

declare var L: any;

@Component({
  selector: 'app-modal-agregar-servicio',
  templateUrl: './modal-agregar-servicio.component.html',
  styleUrls: ['./modal-agregar-servicio.component.scss'],
})
export class ModalAgregarServicioComponent
  implements OnInit, AfterContentChecked, AfterViewInit
{
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  listaproveedor: any[] = [];
  form!: FormGroup;
  fila: number = 0;
  proveedor: string = '';
  idProveedor: number = 0;
  map: any = null;

  mostrarLoaderOrigen: boolean = false;
  mostrarLoaderDestino: boolean = false;

  mostrarSeccionCreacion: boolean = true;

  coordOrigen: any[] = [];
  coordDestino: any[] = [];
  marcadorOrigen: any;
  marcadorDestino: any;
  polyline: any;
  ocultarServicios: boolean = false;
  ocultarMapa: boolean = true;
  resultadosBusquedaMapa: any[] = [];
  proviene: string = '';
  idServicio: number = 0;
  ocultarProveedor: boolean = false;
  servicios: any[] = [];
  nombreServicio: string = '';
  concepto: string = '';
  costo: string = '0';
  grupo: string = '';
  idCategoria: number = 0;
  idTipoServicio: number = 0;
  serviciosCompletos: any[] = [];
  proveedorCompletos: any[] = [];
  disableddMapa: boolean = false;
  ocultarBtn: boolean = false;
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private changeDetector: ChangeDetectorRef,
    private gestionarOrdenServicioService: GenerarOrdenServicioService
  ) {}

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    this.listaproveedor = this.config.data.proveedor;
    this.fila = this.config.data.fila;
    this.proviene = this.config.data.proviene;
    this.idServicio = this.config.data.idServicio;
    this.inicializarForm();
  }

  inicializarForm(): void {
    let validacionServicio = [Validators.required];
    let validacionMapa = [Validators.required];

    console.log(this.proviene);
    if (this.proviene == 'traslados') {
      this.disableddMapa = false;
      this.ocultarServicios = false;
      validacionServicio = [];
      this.ocultarMapa = true;
      this.ocultarProveedor = false;
      this.ocultarBtn = false;
    } else if (this.proviene == 'proveedor') {
      this.disableddMapa = true;
      this.ocultarMapa = false;
      this.ocultarServicios = false;
      validacionServicio = [];
      this.ocultarProveedor = true;
      this.ocultarBtn = true;
    } else if (this.proviene == 'servicios') {
      this.disableddMapa = true;
      this.ocultarMapa = true;
      this.ocultarServicios = true;
      this.ocultarBtn = false;
      this.ocultarProveedor = true;
      validacionMapa = [];
      this.buscarServicios();
    }
    this.form = this.formBuilder.group({
      servicio: [{ value: null, disabled: false }, validacionServicio],
      proveedor: [{ value: null, disabled: false }, [Validators.required]],
      origen: [{ value: null, disabled: false }, validacionMapa],
      destino: [{ value: null, disabled: false }, validacionMapa],
      kilometraje: [{ value: null, disabled: false }, validacionMapa], //Se coloca automaticamente
    });
  }

  buscarServicios(): void {
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarServiciosVigentes()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);

          if (respuesta.error) {
            this.servicios = [];
            this.serviciosCompletos = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
            return;
          }
          console.log(
            this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(15)
          );
          const datos = respuesta.datos;
          this.serviciosCompletos = datos;
          this.servicios = mapearArregloTipoDropdown(
            datos,
            'nombreServicio',
            'idServicio'
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);

          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        }
      );
  }

  seleccionaServicio(dd: Dropdown): void {
    this.nombreServicio = dd.selectedOption.label;
    this.idServicio = dd.selectedOption.value;
    this.serviciosCompletos.forEach((datos: any) => {
      if (Number(datos.idServicio) == Number(dd.selectedOption.value)) {
        this.concepto = datos.nombreServicio;
        this.idServicio = datos.idServicio;
        this.grupo = datos.grupo;
        this.idProveedor = datos.idTipoServicio;
        if (Number(datos.idServicio) == 4) {
          this.disableddMapa = false;
        }
      }
    });

    this.consultarProveeedorServicio();
  }

  seleccionaProveedor(dd: Dropdown): void {
    this.proveedor = dd.selectedOption.label;
    this.proveedorCompletos.forEach((datos: any) => {
      if (Number(datos.idProveedor) == Number(dd.selectedOption.value)) {
        this.idProveedor = datos.nombreServicio;
        this.costo = datos.importe;
      }
    });
  }

  consultarProveeedorServicio(): void {
    const parametros = { idServicio: this.idServicio };
    this.gestionarOrdenServicioService
      .consultarProveeedorServicio(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error) {
            this.listaproveedor = [];
            this.proveedorCompletos = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
            return;
          }
          const datos = respuesta.datos;
          console.log('datos', datos);
          this.proveedorCompletos = datos;
          this.listaproveedor = mapearArregloTipoDropdown(
            datos,
            'nombreProveedor',
            'idProveedor'
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        }
      );
  }

  cerrarModal(): void {
    this.ref.close(null);
  }

  aceptarModal(): void {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    let salida = null;
    if (this.proviene == 'traslados' || this.proviene == 'proveedor') {
      salida = {
        fila: this.fila,
        proveedor: this.proveedor,
        datosFormulario: this.form.value,
        coordOrigen: this.coordOrigen,
        coordDestino: this.coordDestino,
      };
    } else if (this.proviene == 'servicios') {
      salida = {
        cantidad: '1',
        concepto: this.concepto,
        coordOrigen: this.coordOrigen,
        coordDestino: this.coordDestino,
        proveedor: this.proveedor,
        fila: -1,
        grupo: this.grupo,
        idCategoria: this.idCategoria,
        idInventario: null,
        idArticulo: null,
        idTipoServicio: this.idTipoServicio,
        idProveedor: this.proveedor,
        totalPaquete: this.costo,
        importe: this.costo,
        esDonado: false,
        proviene: 'presupuesto',
      };
    }
    console.log(salida);
    this.ref.close(salida);
  }

  get f() {
    return this.form.controls;
  }

  inicializarMapa(): void {
    try {
      L.Icon.Default.imagePath = 'assets/images/leaflet/';

      this.map = L.map('map').setView([19.4326296, -99.1331785], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      let geoCoderOptions = {
        collapsed: false,
        placeholder: 'Buscar dirección',
        geocoder: L.Control.Geocoder.nominatim({
          geocodingQueryParams: {
            countrycodes: 'mx',
          },
        }),
      };
    } catch (error) {
      console.log(error);
    }
  }

  buscar(event: Event, direccion: any, nombreInput: string) {
    this.activarLoaderBusqueda(nombreInput);

    let geocoder = new L.Control.Geocoder.Nominatim({
      geocodingQueryParams: {
        limit: 10,
        countrycodes: 'mx',
      },
    });

    geocoder.geocode(direccion, (respuesta: any) => {
      this.overlayPanel.toggle(event);
      this.resultadosBusquedaMapa =
        respuesta.length > 0
          ? respuesta.map((r: any) => ({
              ...r,
              inputBusqueda: nombreInput,
            }))
          : [];
      console.log(this.resultadosBusquedaMapa);
      this.desactivarLoaderBusqueda(nombreInput);
    });
  }

  activarLoaderBusqueda(nombre: string) {
    if (nombre == 'origen') {
      this.mostrarLoaderOrigen = true;
    } else if (nombre == 'destino') {
      this.mostrarLoaderDestino = true;
    }
  }

  desactivarLoaderBusqueda(nombre: string) {
    if (nombre == 'origen') {
      this.mostrarLoaderOrigen = false;
    } else if (nombre == 'destino') {
      this.mostrarLoaderDestino = false;
    }
  }

  limpiarInput(formControlName: string) {
    (this.form.controls[formControlName] as FormControl).reset();
  }

  pintarMarcador(resultado: any) {
    let { lat, lng } = resultado.center;

    if (resultado.inputBusqueda === 'origen') {
      if (this.marcadorOrigen) {
        this.map.removeLayer(this.marcadorOrigen);
      }
      this.coordOrigen = [lat, lng];
      this.marcadorOrigen = L.marker([lat, lng]).addTo(this.map);
    } else if (resultado.inputBusqueda === 'destino') {
      if (this.marcadorDestino) {
        this.map.removeLayer(this.marcadorDestino);
      }
      this.coordDestino = [lat, lng];
      this.marcadorDestino = L.marker([lat, lng]).addTo(this.map);
    }

    if (this.coordOrigen.length > 0 && this.coordDestino.length > 0) {
      if (this.polyline) {
        this.map.removeLayer(this.polyline);
      }
      this.polyline = L.polyline([this.coordOrigen, this.coordDestino], {
        color: 'black',
      }).addTo(this.map);
      this.map.fitBounds(this.polyline.getBounds());
      this.calcularDistancia(this.coordOrigen, this.coordDestino);
    } else {
      this.map.fitBounds([this.coordOrigen, this.coordDestino]);
    }

    this.overlayPanel.hide();
    console.log('Coordenada origen:', this.coordOrigen);
    console.log('Coordenada destino:', this.coordDestino);
  }

  calcularDistancia([lat1, lng1]: any, [lat2, lng2]: any) {
    let punto1 = L.latLng(lat1, lng1);
    let punto2 = L.latLng(lat2, lng2);
    let distanciaMetros = punto1.distanceTo(punto2);
    let distanciaKm = (distanciaMetros / 1000).toFixed(2);
    this.form.get('kilometraje')?.setValue(distanciaKm);
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
}
