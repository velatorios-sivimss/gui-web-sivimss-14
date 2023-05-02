export interface EstiloLinea {
  /**
   * Si se establece en false, no se mostrará la linea de la etapa
   */
  mostrar: boolean;

  /**
   * Para controlar si la linea es solid o dashed
   */
  estilo: 'solid' | 'dashed';
}
