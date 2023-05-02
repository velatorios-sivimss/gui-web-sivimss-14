import { EstiloLinea } from "projects/sivimss-gui/src/app/shared/etapas/models/estilo-linea.interface";
import { EtapaEstado } from "projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum";

/**
 * Modelo para gestionar el componente de etapas
 */
export interface Etapa {
  /**
   * Para identificar cada etapa
   */
  idEtapa: number;
  /**
   * Texto que se muestra dentro de cada circulo
   */
  textoInterior: string;

  /**
   * Texto que se muestra debajo de cada circulo
   */
  textoExterior: string;

  /**
   * Controla el estilo de cada circulo, puede ser Activo, Inactivo o Completado
   */
  estado: EtapaEstado;

  /**
   * En caso de que se requiera mas espacio para el texto exterior
   */
  maxWidth?: number;

  /**
   * Para controlar si se muestra la linea de la izquierda de cada etapa ademas
   * del estilo de borde que debe mostrar
   */
  lineaIzquierda: EstiloLinea;

  /**
   * Para controlar si se muestra la linea de la derecha de cada etapa ademas
   * del estilo de borde que debe mostrar
   */
  lineaDerecha: EstiloLinea;
}
