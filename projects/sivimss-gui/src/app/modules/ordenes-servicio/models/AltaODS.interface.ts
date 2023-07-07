import { CaracteristicasPresupuestoInterface } from './CaracteristicasPresupuesto,interface';
import { ContratanteInterface } from './Contratante.interface';
import { FinadoInterface } from './Finado.interface';
import { InformacionServicioInterface } from './InformacionServicio.interface';

export interface AltaODSInterface {
  idOrdenServicio?: number;
  idParentesco: number | null;
  idVelatorio: number | null;
  idOperador: number | null;
  idEstatus: number | null;
  idContratantePf: number | null;
  contratante: ContratanteInterface;
  finado: FinadoInterface;
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface;
  informacionServicio: InformacionServicioInterface;
}
