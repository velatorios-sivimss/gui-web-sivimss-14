import { CaracteristicasDelPresupuestoInterface } from './CaracteristicasDelPresupuesto.interface';
import { CaracteristicasPaqueteInterface } from './CaracteristicasPaquete.interface';

export interface CaracteristicasPresupuestoInterface {
  caracteristicasPaquete: CaracteristicasPaqueteInterface | null;
  caracteristicasDelPresupuesto: CaracteristicasDelPresupuestoInterface;
}
