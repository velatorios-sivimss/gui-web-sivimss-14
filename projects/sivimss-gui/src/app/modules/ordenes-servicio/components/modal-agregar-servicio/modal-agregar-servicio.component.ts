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
  @ViewChild('dd')
  valorProveedor!: any;


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
  paqueteSelccionado!: number;
  botonPresupuesto:boolean = true;
  consultarKilometraje:boolean = false;
  kilometrosPermitidos!: number;
  costoPorKilometraje!: number;
  costoExtraKilometros:number = 0;
  serviciosPaquete!: any[];
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
    this.paqueteSelccionado = this.config.data.paqueteSeleccionado;
    this.serviciosPaquete = this.config.data.filaSeleccionada;
    this.inicializarForm();
  }

  inicializarForm(): void {
    let validacionServicio = [Validators.required];
    let validacionMapa = [Validators.required];

    if (this.proviene == 'traslados') {
      this.disableddMapa = false;
      this.ocultarServicios = false;
      validacionServicio = [];
      this.ocultarMapa = false;
      this.ocultarProveedor = false;
      this.ocultarBtn = false;
      this.consultarKilometraje = true;
    } else if (this.proviene == 'proveedor') {
      this.disableddMapa = true;
      this.ocultarMapa = true;
      this.ocultarServicios = false;
      validacionServicio = [];
      validacionMapa = [];
      this.ocultarProveedor = true;
      this.ocultarBtn = true;
    } else if (this.proviene == 'servicios') {
      this.botonPresupuesto = false;
      this.disableddMapa = true;
      this.ocultarMapa = true;
      this.ocultarServicios = true;
      this.ocultarBtn = true;
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
    let tipoServicio = dd.selectedOption.label.toUpperCase()
    this.nombreServicio = dd.selectedOption.label;
    this.idServicio = dd.selectedOption.value;

    this.consultarKilometraje = false;
    if(tipoServicio.includes("TRASLADO")){
      this.ocultarMapa = false;
      // servicio: [{ value: null, disabled: false }, validacionServicio],
      // proveedor: [{ value: null, disabled: false }, [Validators.required]],
      this.f.origen.setValidators(Validators.required);
      this.f.origen.updateValueAndValidity();
      this.f.destino.setValidators(Validators.required);
      this.f.destino.updateValueAndValidity();
      this.consultarKilometraje = true;
      // kilometraje: [{ value: null, disabled: false }, validacionMapa],


    }else{
      this.ocultarMapa = true;
      this.f.origen.clearValidators();
      this.f.origen.updateValueAndValidity();
      this.f.destino.clearValidators();
      this.f.destino.updateValueAndValidity();
    }

    this.serviciosCompletos.forEach((datos: any) => {
      if (Number(datos.idServicio) == Number(dd.selectedOption.value)) {
        this.concepto = datos.nombreServicio;
        this.grupo = datos.grupo;
        this.idProveedor = datos.idProveedor;
        this.idTipoServicio = datos.idTipoServicio;
        if (Number(datos.idServicio) == 4) {
          this.disableddMapa = false;
        } else {
          this.disableddMapa = true;
        }
      }
    });

    this.consultarProveeedorServicio();
  }

  consultarKilometrajePaquete(): void {

    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarKilometrajePaquete(this.paqueteSelccionado,this.f.proveedor.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.kilometrosPermitidos = respuesta.datos[0].numKilometraje;
        this.costoPorKilometraje = respuesta.datos[0].costoPorKilometraje;
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error,errorMsg || 'El servicio no responde, no permite más llamadas.')
      }
    )
  }

  consultarKilometrajeServicio(): void {

    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarKilometrajeServicio(this.idServicio,this.idProveedor).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.costoPorKilometraje = respuesta.datos[0].costoPorKilometraje;
      },
      (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error,errorMsg || 'El servicio no responde, no permite más llamadas.')
      }
    )
  }


  seleccionaProveedor(dd: Dropdown): void {
    this.proveedor = dd.selectedOption.label;
    this.idProveedor = Number(dd.selectedOption.value);
    this.proveedorCompletos.forEach((datos: any) => {
      if (Number(datos.idProveedor) == Number(dd.selectedOption.value)) {
        this.costo = datos.importe;
      }
    });
    if(this.consultarKilometraje){
      if(!this.ocultarServicios){
        this.consultarKilometrajePaquete();
      }else{
        this.consultarKilometrajeServicio();
      }
    }
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
        costoExtraKilometros: this.costoExtraKilometros
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
        idCategoria: null,
        idInventario: null,
        idArticulo: null,
        idTipoServicio: this.idTipoServicio,
        idServicio: this.idServicio,
        idProveedor: this.idProveedor,
        totalPaquete: this.costoExtraKilometros > 0 ? this.costoExtraKilometros :  this.costo,
        importe:  this.costoExtraKilometros > 0 ? this.costoExtraKilometros :  this.costo,
        esDonado: false,
        proviene: 'presupuesto',
        costoExtraKilometros: this.costoExtraKilometros
      };
    }
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
    let kilometrosExtra:number = 0;

    this.form.get('kilometraje')?.setValue(distanciaKm);

    this.costoPorKilometraje;
    this.kilometrosPermitidos;
    if(this.ocultarServicios){
      this.costoExtraKilometros = Number(distanciaKm) * this.costoPorKilometraje
      return
    }
    if(Number(distanciaKm) > this.kilometrosPermitidos){
      kilometrosExtra = Number(distanciaKm) - this.kilometrosPermitidos
      this.costoExtraKilometros = kilometrosExtra * this.costoPorKilometraje;
    }
  }

  llenarMapaPrevio(datosPrevios:any):void {


    this.coordOrigen = [datosPrevios.coordOrigen[0], datosPrevios.coordOrigen[1]];
    this.marcadorOrigen = L.marker(this.coordOrigen).addTo(this.map);

    this.coordDestino = [datosPrevios.coordDestino[0], datosPrevios.coordDestino[1]];
    this.marcadorDestino = L.marker(this.coordDestino).addTo(this.map);

    this.polyline = L.polyline([this.coordOrigen, this.coordDestino], {
      color: 'black',
    }).addTo(this.map);
    this.map.fitBounds(this.polyline.getBounds());



    this.f.origen.setValue(datosPrevios.origen);
    this.f.destino.setValue(datosPrevios.destino);
    this.f.kilometraje.setValue(datosPrevios.kilometraje);
    this.f.proveedor.setValue(datosPrevios.idProveedor);

    this.proveedor = this.valorProveedor.selectedOption.label;
    setTimeout(()=> {
      this.consultarKilometrajePaquete();
    },200)





  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    if(this.proviene == "traslados"){
      this.serviciosPaquete.forEach((data:any) => {
        if(data.grupo.includes("TRASLADO")){
          if(data.coordDestino && data.coordOrigen){
            this.llenarMapaPrevio(data);
          }
        }
      });
    }
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
}
