import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActualizarBeneficiario, Beneficiario, BusquedaConvenio, BusquedaListBeneficiarios, CatalogoDatosGenerales, GuardarBeneficiario } from '../../models/convenio.interface';
import { Accordion } from 'primeng/accordion';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute } from '@angular/router';
import { RenovarConvenioPfService } from '../../services/renovar-convenio-pf.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-renovar-convenio-beneficiarios',
  templateUrl: './renovar-convenio-beneficiarios.component.html',
  styleUrls: ['./renovar-convenio-beneficiarios.component.scss']
})
export class RenovarConvenioBeneficiariosComponent implements OnInit {
  readonly POSICION_BENEFICIARIOS: number = 1;
  readonly POSICION_DATOS_GRALES: number = 2;

  @ViewChild('accordion') accordion: Accordion | undefined;

  mode: 'listado' | 'crear' | 'modificar' | 'desactivar' = 'listado';
  altaBeneficiarioForm!: FormGroup;
  modificarBeneficiarioForm!: FormGroup;
  beneficiarioForm!: FormGroup;
  documentacionForm!: FormGroup;
  convenio: BusquedaConvenio = {};
  beneficiarioSeleccionado!: Beneficiario;
  beneficiarios: Beneficiario[] = [];
  numBeneficiario: number = 0;
  activeIndex: number | null = null;
  datosGenerales!: CatalogoDatosGenerales;
  busquedaListBeneficiarios!: BusquedaListBeneficiarios;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private renovarConvenioPfService: RenovarConvenioPfService,
  ) {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.convenio.folio = params.folio;
      }
    });
    const respuesta = this.route.snapshot.data["respuesta"];
    this.busquedaListBeneficiarios = respuesta[this.POSICION_BENEFICIARIOS].datos;
    this.beneficiarios = this.busquedaListBeneficiarios.beneficiarios || [];
    this.datosGenerales = respuesta[this.POSICION_DATOS_GRALES].datos[0];
  }

  ngOnInit(): void { }

  nuevo() {
    this.activeIndex = null;
    this.numBeneficiario = this.beneficiarios.length + 1;
    this.mode = 'crear';
  }

  desactivar() {
    if (this.activeIndex !== null && this.activeIndex >= 0) {
      this.numBeneficiario = this.activeIndex + 1;
      this.mode = 'desactivar';
    }
  }

  modificar() {
    if (this.activeIndex !== null && this.activeIndex >= 0) {
      this.numBeneficiario = this.activeIndex + 1;
      this.mode = 'modificar';
    }
  }

  obtenerDetalleBeneficiario(idBeneficiario: number) {
    this.renovarConvenioPfService.cambiarEstatusBeneficiario({ idBeneficiario }).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta?.datos) {
          console.log(respuesta?.datos);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  crearBeneficiario(beneficiario: Beneficiario | null) {
    if (!beneficiario) {
      this.mode = 'listado';
    } else {
      this.renovarConvenioPfService.crearBeneficiario(this.datosCrearBeneficiario(beneficiario)).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos) {
            this.alertaService.mostrar(TipoAlerta.Exito, `Nuevo registro de los Beneficiarios del Folio ${this.convenio.folio}`);
            this.mode = 'listado';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  activarDesactivarBeneficiario(beneficiario: Beneficiario | null) {
    if (!beneficiario) {
      this.mode = 'listado';
    } else {
      this.renovarConvenioPfService.cambiarEstatusBeneficiario({ idBeneficiario: 18, estatusBenefic: false }).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos) {
            this.alertaService.mostrar(TipoAlerta.Exito, `Modificado correctamente los Beneficiarios del Folio ${this.convenio.folio}`);
            this.mode = 'listado';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  actualizarBeneficiario(beneficiario: Beneficiario | null) {
    if (!beneficiario) {
      this.mode = 'listado';
    } else {
      this.renovarConvenioPfService.actualizarBeneficiario(this.datosActualizarBeneficiario(beneficiario)).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos) {
            this.alertaService.mostrar(TipoAlerta.Exito, `Modificado correctamente los Beneficiarios del Folio ${this.convenio.folio}`);
            this.mode = 'listado';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  handleActiveBeneficiario(beneficiario: Beneficiario) {
    this.beneficiarioSeleccionado = beneficiario;
    this.beneficiarioSeleccionado.tipoConvenioDesc = this.convenio.tipoConvenioDesc;
  }

  activeIndexChange(index: number) {
    this.activeIndex = index;
  }

  datosCrearBeneficiario(beneficiario: Beneficiario): GuardarBeneficiario {
    return {
      nombre: beneficiario.nombre,
      apellidoP: beneficiario.primerApellido,
      apellidoM: beneficiario.segundoApellido,
      fechaNac: moment().subtract(beneficiario.edad, 'years').format('DD-MM-YYYY'),
      curp: beneficiario.curp,
      rfc: beneficiario.rfc,
      correoE: beneficiario.email,
      tel: beneficiario.telefono,
      beneficiario: {
        idContratanteConvenioPf: this.busquedaListBeneficiarios?.idContratanteConvenioPf,
        idParentesco: beneficiario.parentesco ? +beneficiario.parentesco : null,
        indActa: beneficiario.actaNacimiento ? 1 : 0,
        indIne: beneficiario.ineBeneficiario ? 1 : 0,
      },
      docPlanAnterior: {
        indComprobanteEstudios: beneficiario.comprobanteEstudios ? 1 : 0,
        indActaMatrimonio: beneficiario.actaMatrimonio ? 1 : 0,
        indDeclaracionConcubinato: beneficiario.declaracionConcubinato ? 1 : 0,
      }
    }
  }

  datosActualizarBeneficiario(beneficiario: Beneficiario): ActualizarBeneficiario {
    return {
      idBeneficiario: beneficiario.idBeneficiario,
      idPersona: beneficiario.idPersona,
      nombre: beneficiario.nombre,
      apellidoP: beneficiario.primerApellido,
      apellidoM: beneficiario.segundoApellido,
      fechaNac: moment().subtract(beneficiario.edad, 'years').format('DD-MM-YYYY'),
      curp: beneficiario.curp,
      rfc: beneficiario.rfc,
      correoE: beneficiario.email,
      tel: beneficiario.telefono,
      beneficiario: {
        idParentesco: beneficiario.parentesco ? +beneficiario.parentesco : null,
        indActa: beneficiario.actaNacimiento ? 1 : 0,
        indIne: beneficiario.ineBeneficiario ? 1 : 0,
      },
      docPlanAnterior: {
        indComprobanteEstudios: beneficiario.comprobanteEstudios ? 1 : 0,
        indActaMatrimonio: beneficiario.actaMatrimonio ? 1 : 0,
        indDeclaracionConcubinato: beneficiario.declaracionConcubinato ? 1 : 0,
      }
    }
  }
}

