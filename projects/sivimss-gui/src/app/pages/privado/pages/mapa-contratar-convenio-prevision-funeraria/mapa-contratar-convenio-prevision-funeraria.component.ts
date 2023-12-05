import {Component,ElementRef,OnInit,Renderer2,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import 'leaflet';
import 'leaflet-control-geocoder';
import {MapaContratatarConvenioPfService} from "./services/mapa-contratatar-convenio-pf.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService,TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

declare let L: any;

@Component({
  selector: 'app-contratar-convenio-prevision-funeraria',
  templateUrl: './mapa-contratar-convenio-prevision-funeraria.component.html',
  styleUrls: ['./mapa-contratar-convenio-prevision-funeraria.component.scss'],
})
export class MapaContratarConvenioPrevisionFunerariaComponent
  implements OnInit
{
  map: any = null;
  coordenadasPorDefecto: number[] = [19.4326296, -99.1331785];

  listaVelatorios: any[] = [];
  listaVelatoriosBackUp: any[] = [];

  filtroVelatorio:any = "";


  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mapaContratatarConvenioPfService: MapaContratatarConvenioPfService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
  ) {}

  ngOnInit(): void {
    this.mapaContratatarConvenioPfService.obtenerListaVelatorios().pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
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
      .then(respuesta=> {this.inicializarUbicacion([respuesta.lat, respuesta.lng])})
      .catch(error => {this.inicializarUbicacion(this.coordenadasPorDefecto)})
  }

  inicializarUbicacion(coordenadas: number[]): void {
    setTimeout(()=> {
      this.map = L.map('map').setView(coordenadas, 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);
      this.agregarMarcadores();
    },300)
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
          resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
        },
        err => {
          reject(err);
        });
    });
  }

  agregarMarker() {
    L.marker([19.4326296, -99.1331785])
      .addTo(this.map)
      .bindPopup(
        `
      <div class="custom-popup">
        <span class="popup-title">No. 01 Doctores</span>
        <span class="popup-description">Dr. Rafael Lucio No. 237, esquina Dr Isidro Olvera, Col. Doctores,
            C.P. 06720, Ciudad de México</span>
        <span class="popup-telephone">55 5607 3412</span>
        <hr>
        <span class="info-title">Servicios disponibles</span>
        <ul>
          <li class="info-description">Contratar convenio de previsión funeraria</li>
          <li class="info-description">Contratar plan de servicios funerarios pagos anticipados</li>
        </ul>
        <div class="flex justify-content-end">
          <button class="btn btn-primary btn-md" id="seleccionar" data-funeraria="idFuneraria">Continuar</button>
        </div>
     </div>
`
      )
      .openPopup();
    //Ojo, asegurate que el html ya se haya cargado antes de ejecutar este querySelector.

    const buttonElement = this.el.nativeElement.querySelector('#seleccionar');
    if (buttonElement) {
      this.renderer.listen(buttonElement, 'click', this.seleccionar.bind(this));
    }
  }

  seleccionar(e: any) {
    //Con esto podriamos obtener el id de la funeraria mostrada en el popup
    console.log(e.target.dataset.funeraria);
    this.router.navigate(
      ['registro-contratacion-convenio-de-prevision-funeraria'],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  seleccionarVelatorio(velatorio:number): void {
    let velatorioSeleccionado;

    velatorioSeleccionado = this.listaVelatorios.filter((e:any) => {
      return e.idVelatorio == velatorio;
    });
    L.marker([+velatorioSeleccionado[0].longitud,+velatorioSeleccionado[0].latitud]).addTo(this.map).bindPopup(
      `
      <div class="custom-popup">
        <span class="popup-title">${velatorioSeleccionado[0].nombreVelatorio}</span>
        <span class="popup-description">${velatorioSeleccionado[0].direccion}</span>
        <span class="popup-telephone">${velatorioSeleccionado[0].telefono ?? ""}</span>
        <hr>
        <span class="info-title">Servicios disponibles</span>
        `+
      this.consultarVelatorios(velatorioSeleccionado[0].servicios)
      +`
        <div class="flex justify-content-end">
          <button class="btn btn-primary btn-md" id="seleccionar" data-funeraria="idFuneraria">Continuar</button>
        </div>
     </div>
    `).openPopup();
    setTimeout(()=> {
      const buttonElement = this.el.nativeElement.querySelector('#seleccionar');
      if (buttonElement) {
        this.renderer.listen(buttonElement, 'click', this.seleccionar.bind(this));
      }
    },300)
  }


  agregarMarcadores():void {
    this.listaVelatorios.forEach((velatorio:any) => {
      L.marker([+velatorio.longitud,+velatorio.latitud]).addTo(this.map).bindPopup(
        `
      <div class="custom-popup">
        <span class="popup-title"> ${velatorio.nombreVelatorio} </span>
        <span class="popup-description">${velatorio.direccion}</span>
        <span class="popup-telephone">${velatorio.telefono ?? ""}</span>
        <hr>
        <span class="info-title">Servicios disponibles</span>
        `+
        this.consultarVelatorios(velatorio.servicios)
        +`
        <div class="flex justify-content-end">
          <button class="btn btn-primary btn-md" id="seleccionar" data-funeraria="idFuneraria">Continuar</button>
        </div>
     </div>
     `)});

  }
  consultarVelatorios(velatorios:any): any {
    let velatorioSeleccion:any = ``;
    velatorios.forEach((velatorio: string) => {
      velatorioSeleccion += `<ul><li class="info-description">`+ velatorio +`</li></ul>`
    })
    return velatorioSeleccion
  }

  filtrarVelatorios(event:KeyboardEvent): void {
    let filtered: any[] = [];
    for(let filtroVelatorio of this.listaVelatoriosBackUp){
      if(filtroVelatorio.nombreVelatorio.toLowerCase().indexOf(this.filtroVelatorio.toLowerCase()) == 0){
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
