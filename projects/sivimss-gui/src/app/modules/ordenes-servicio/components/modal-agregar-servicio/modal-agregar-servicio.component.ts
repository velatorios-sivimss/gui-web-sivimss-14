import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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

declare var L: any;

@Component({
  selector: 'app-modal-agregar-servicio',
  templateUrl: './modal-agregar-servicio.component.html',
  styleUrls: ['./modal-agregar-servicio.component.scss'],
})
export class ModalAgregarServicioComponent implements OnInit, AfterViewInit {
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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    this.listaproveedor = this.config.data.proveedor;
    this.fila = this.config.data.fila;
    this.proviene = this.config.data.proviene;
    this.idServicio = this.config.data.idServicio;
    this.inicializarForm(this.config.data.proveedor.traslado);
  }

  inicializarForm(traslado: boolean): void {
    let validacion = [Validators.required];

    console.log(this.proviene);
    if (this.proviene == 'traslados') {
      this.ocultarServicios = false;
      validacion = [];
      this.ocultarMapa = true;
      this.ocultarProveedor = true;
    } else if (this.proviene == 'proveedor') {
      this.ocultarMapa = false;
      this.ocultarServicios = false;
      this.ocultarProveedor = true;
    }
    this.form = this.formBuilder.group({
      servicio: [{ value: null, disabled: false }, validacion],
      proveedor: [{ value: null, disabled: false }, [Validators.required]],
      origen: [{ value: null, disabled: false }, [Validators.required]],
      destino: [{ value: null, disabled: false }, [Validators.required]],
      kilometraje: [{ value: null, disabled: false }, [Validators.required]], //Se coloca automaticamente
    });
  }

  seleccionaProveedor(dd: Dropdown): void {
    this.proveedor = dd.selectedOption.label;
  }
  cerrarModal(): void {
    this.ref.close(null);
  }

  aceptarModal(): void {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    let salida = null;
    if (this.proviene == 'traslados') {
      salida = {
        fila: this.fila,
        proveedor: this.proveedor,
        datosFormulario: this.form.value,
        coordOrigen: this.coordOrigen,
        coordDestino: this.coordDestino,
      };
    } else if (this.proviene == 'proveedor') {
      salida = {
        fila: this.fila,
        proveedor: this.proveedor,
        datosFormulario: this.form.value,
        coordOrigen: this.coordOrigen,
        coordDestino: this.coordDestino,
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
}
