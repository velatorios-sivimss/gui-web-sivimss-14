export interface Articulo {
  idArticulo?: number;
  categoriaArticulo?: string;
  idCategoriaArticulo?: number;
  idTipoArticulo?: number;
  tipoArticulo?: string;
  tipoMaterial?: string;
  idTipoMaterial?: number;
  idTamanio?: number;
  tamanio?: string;
  idClasificacionProducto?: number;
  clasificacionProducto?: string;
  modeloArticulo?: string;
  desArticulo?: string;
  largo?: string;
  ancho?: string;
  alto?: string;
  estatus?: boolean;  
  idPartPresupuestal?: number;
  partPresupuestal?: string;
  idCuentaPartPresupuestal?: number;
  numCuentaPartPresupuestal?: string;
  idProductosServicios?: number;
  productoServicios?: string;
}

export interface ConfirmacionServicio {
  estatus?: boolean;
  origen?: string;
}





