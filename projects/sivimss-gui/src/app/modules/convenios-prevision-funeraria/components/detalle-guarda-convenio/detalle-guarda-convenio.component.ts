import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ModeloGuardarPorPersona} from "../../models/modelo-guardar-por-persona.interface";
import {ModeloGuardarPorEmpresa} from "../../models/modelo-guardar-por-empresa.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGO_ENFERMEDAD_PREEXISTENTE} from "../../constants/catalogos-funcion";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-detalle-guarda-convenio',
  templateUrl: './detalle-guarda-convenio.component.html',
  styleUrls: ['./detalle-guarda-convenio.component.scss']
})
export class DetalleGuardaConvenioComponent implements OnInit, OnChanges {

  @Input() objetoDetalleEmpresa: ModeloGuardarPorEmpresa = {};
  @Input() objetoDetallePersona!: ModeloGuardarPorPersona;
  @Input() confirmarGuardarPersona!: boolean;
  @Input() confirmarGuardarEmpresa!: boolean;

  readonly POSICION_PAIES:number = 0;
  readonly POSICION_ESTADOS:number = 1;
  readonly POSICION_PAQUETES:number = 3;
  readonly POSICION_PROMOTORES:number = 4;

  paises!: TipoDropdown[];
  descripcionPais!: TipoDropdown[];
  tipoPaquete!: TipoDropdown[];
  promotores!: TipoDropdown[];
  descripcionPromotor!: TipoDropdown[];
  detalleTipoPaquete!:TipoDropdown[];
  detalleEnfermedad!:TipoDropdown[];


  constructor(
    private route: ActivatedRoute,
    private agregarConvenioPFService:AgregarConvenioPFService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.paises = respuesta[this.POSICION_PAIES]!.map((pais:TipoDropdown) => ({label: pais.label, value: pais.value})) || []

    this.promotores = respuesta[this.POSICION_PROMOTORES]!.datos.map(
    (promotor: any) => ({label: promotor.nombrePromotor, value: promotor.idPromotor}))

    this.tipoPaquete = respuesta[this.POSICION_PAQUETES]!.datos.map(
      (paquete: any) => (
        {label: paquete.nomPaquete, value: paquete.idPaquete}
      )
    )


    if(this.objetoDetalleEmpresa.empresa){
      this.descripcionPais = this.paises.filter(pais =>{
        return pais.value == this.objetoDetalleEmpresa.empresa?.pais
      });
      this.descripcionPromotor = this.paises.filter(promotor =>{
        return promotor.value == this.objetoDetalleEmpresa.idPromotor
      });
    }

    if(this.objetoDetallePersona.persona){
      this.descripcionPais = this.paises.filter(pais =>{
        return pais.value == this.objetoDetallePersona.persona?.pais
      });

      this.detalleTipoPaquete = this.tipoPaquete.filter(paquete => {
        return paquete.value == this.objetoDetallePersona.persona?.paquete;
      })
      this.detalleEnfermedad = CATALOGO_ENFERMEDAD_PREEXISTENTE.filter(enfermedad => {
        return enfermedad.value == this.objetoDetallePersona.persona?.enfermedadPreexistente;
      });

      this.descripcionPromotor = this.paises.filter(promotor =>{
        return promotor.value == this.objetoDetallePersona.idPromotor
      });
    }

    console.log(this.objetoDetalleEmpresa)
    console.log(this.objetoDetallePersona)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.confirmarGuardarEmpresa)this.guardarEmpresa();
    if(this.confirmarGuardarPersona)this.guardarPersona();
  }


  guardarEmpresa(): void {
    this.loaderService.activar();
    this.agregarConvenioPFService.guardarConvenioPorGrupoEmpresa(this.objetoDetalleEmpresa).pipe
    (
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {
      },
      (error:HttpErrorResponse) => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    )
  }

  guardarPersona(): void {
    this.loaderService.activar();
    this.agregarConvenioPFService.guardarConvenioPorPersona(this.objetoDetallePersona).pipe
    (
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {
      },
      (error:HttpErrorResponse) => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    )
  }

}
