import {Component, ElementRef, OnInit, Renderer2,} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import 'leaflet';
import 'leaflet-control-geocoder';
import {MapaContratatarConvenioPfService} from "./services/mapa-contratatar-convenio-pf.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {validarUsuarioLogueadoOnline} from "../../../../utils/funciones";

declare let L: any;

@Component({
  selector: 'app-contratar-convenio-prevision-funeraria',
  templateUrl: './mapa-contratar-convenio-prevision-funeraria.component.html',
  styleUrls: ['./mapa-contratar-convenio-prevision-funeraria.component.scss'],
})
export class MapaContratarConvenioPrevisionFunerariaComponent
  implements OnInit {
  map: any = null;
  coordenadasPorDefecto: number[] = [19.4326296, -99.1331785];

  listaVelatorios: any[] = [];
  listaVelatoriosBackUp: any[] = [];

  filtroVelatorio: any = "";


  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mapaContratatarConvenioPfService: MapaContratatarConvenioPfService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
  ) {
  }

  ngOnInit(): void {
    if (validarUsuarioLogueadoOnline()) return;
    this.mapaContratatarConvenioPfService.obtenerListaVelatorios().pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.listaVelatorios = respuesta.datos
        this.listaVelatoriosBackUp = respuesta.datos
        this.inicializarMapa();
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Error al consultar la información.');
      }
    })
  }

  inicializarMapa(): void {
    L.Icon.Default.imagePath = 'assets/images/leaflet/';
    this.getPosition()
      .then(respuesta => {
        this.inicializarUbicacion([respuesta.lat, respuesta.lng])
      })
      .catch(error => {
        this.inicializarUbicacion(this.coordenadasPorDefecto)
      })
  }

  inicializarUbicacion(coordenadas: number[]): void {
    setTimeout(() => {
      this.map = L.map('map').setView(coordenadas, 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);
      const map = this.el.nativeElement.querySelector('#map');
      this.renderer.listen(map, 'click', this.consultarVelatorio.bind(this));
      this.agregarMarcadores();
    }, 300)
  }

  consultarVelatorio(e: any): void {
    if (e.target.dataset.funeraria && e.target.dataset.nombre) {
      this.seleccionar(e)
    }
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        err => {
          reject(err);
        });
    });
  }

  seleccionar(e: any) {
    //Con esto podriamos obtener el id de la funeraria mostrada en el popup
    void this.router.navigate(
      ['registro-contratacion-convenio-de-prevision-funeraria'],
      {
        relativeTo: this.activatedRoute,
        queryParams: {idVelatorio: e.target.dataset.funeraria, velatorio: e.target.dataset.nombre}
      }
    );
  }

  seleccionarVelatorio(velatorio: number): void {
    const velatorioSeleccionado = this.listaVelatorios.find((e: any) => (e.idVelatorio === velatorio));
    const {longitud, latitud, servicios, nombreVelatorio, direccion, telefono, idVelatorio} = velatorioSeleccionado;
    L.marker([+longitud, +latitud]).addTo(this.map)
      .bindPopup(`<div class="custom-popup">
        <span class="popup-title">${nombreVelatorio}</span>
        <span class="popup-description">${direccion}</span>
        <span class="popup-telephone">${telefono ?? ""}</span>
        <hr>
        <span class="info-title">Servicios disponibles</span>
        `
        + this.consultarVelatorios(servicios) +
        `<div class="flex justify-content-end">
          <button class="btn btn-primary btn-md" id="seleccionar"
          data-nombre="${nombreVelatorio}" data-funeraria="${idVelatorio}">Continuar</button>
        </div>
     </div>`).openPopup();
    setTimeout(() => {
      const buttonElement = this.el.nativeElement.querySelector('#seleccionar');
      if (buttonElement) {
        this.renderer.listen(buttonElement, 'click', this.seleccionar.bind(this));
      }
    }, 300)
  }


  agregarMarcadores(): void {
    this.listaVelatorios.forEach((velatorio: any) => {
      L.marker([+velatorio.longitud, +velatorio.latitud]).addTo(this.map).bindPopup(
        `
      <div class="custom-popup">
        <span class="popup-title"> ${velatorio.nombreVelatorio} </span>
        <span class="popup-description">${velatorio.direccion}</span>
        <span class="popup-telephone">${velatorio.telefono ?? ""}</span>
        <hr>
        <span class="info-title">Servicios disponibles</span>
        ` +
        this.consultarVelatorios(velatorio.servicios)
        + `
        <div class="flex justify-content-end">
          <button class="btn btn-primary btn-md" id="seleccionar"
          data-nombre="${velatorio.nombreVelatorio}" data-funeraria="${velatorio.idVelatorio}">Continuar</button>
        </div>
     </div>
     `)
    });
  }

  consultarVelatorios(velatorios: any): any {
    let velatorioSeleccion: any = ``;
    if (!velatorios) return '';
    velatorios.forEach((velatorio: string) => {
      velatorioSeleccion += `<ul><li class="info-description">` + velatorio + `</li></ul>`
    })
    return velatorioSeleccion
  }

  filtrarVelatorios(event: KeyboardEvent): void {
    let filtered: any[] = [];
    for (let filtroVelatorio of this.listaVelatoriosBackUp) {
      if (filtroVelatorio.nombreVelatorio.toLowerCase().indexOf(this.filtroVelatorio.toLowerCase()) == 0) {
        filtered.push(
          {
            idVelatorio: filtroVelatorio.idVelatorio,
            nombreVelatorio: filtroVelatorio.nombreVelatorio,
            direccion: filtroVelatorio.direccion,
            telefono: filtroVelatorio.telefono,
            longitud: filtroVelatorio.longitud,
            latitud: filtroVelatorio.latitud,
            servicios: filtroVelatorio.servicios
          },
        )
      }
    }
    this.listaVelatorios = filtered
  }
}
