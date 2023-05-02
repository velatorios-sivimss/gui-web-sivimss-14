export interface SidebarConfig {
  /**
   * Establece el tiempo para la transicion del sidebar cuando se abre o cierra. Se usan segundos.
   */
  tiempoTransicion: number;
  /**
   * Establece el ancho (width) del sidebar.
   */
  widthMenuSidebar: number;
  /**
   * Establece si al rendereizar el sidebar debera aparecer abierto la primera vez
   */
  inicializarMenuSidebarAbierto: boolean;
}
