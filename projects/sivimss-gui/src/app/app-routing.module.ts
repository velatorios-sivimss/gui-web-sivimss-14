import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSerializer } from '@angular/router';
import { PaginaNoEncontradaComponent } from './components/pagina-no-encontrada/pagina-no-encontrada.component';
import { BloqueaUsuarioLogueadoGuard } from 'projects/sivimss-gui/src/app/guards/bloquea-usuario-logueado.guard';
import { PermiteUsuarioLogueadoGuard } from 'projects/sivimss-gui/src/app/guards/permite-usuario-logueado.guard';

const routes: Routes = [
  {
    path: 'pagina-no-encontrada',
    component: PaginaNoEncontradaComponent,
  },
  {
    path: '',
    loadChildren: () => import('./modules/inicio/inicio.module').then((m) => m.InicioModule),
    pathMatch: 'full',
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'inicio',
    loadChildren: () => import('./modules/inicio/inicio.module').then((m) => m.InicioModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'inicio-sesion',
    loadChildren: () => import('./modules/autenticacion/autenticacion.module').then((m) => m.AutenticacionModule),
    canActivate: [BloqueaUsuarioLogueadoGuard]
  },
  {
    path: 'roles',
    loadChildren: () => import('./modules/roles/roles.module').then(m => m.RolesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'roles-permisos',
    loadChildren: () => import('./modules/roles-permisos/roles-permisos.module').then(m => m.RolesPermisosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./modules/usuarios/usuarios.module').then(m => m.UsuariosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'capillas',
    loadChildren: () => import('./modules/capillas/capillas.module').then(m => m.CapillasModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'paquetes',
    loadChildren: () => import('./modules/paquetes/paquetes.module').then(m => m.PaquetesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'ordenes-de-servicio',
    loadChildren: () => import('./modules/ordenes-servicio/ordenes-servicio.module').then(m => m.OrdenesServicioModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'contratos-putr/administrar-contratos',
    loadChildren: () => import('./modules/contratos-putr/administrar-contratos/contratos.module').then(m => m.ContratosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'contratos-putr/seguimiento-de-pagos',
    loadChildren: () => import('./modules/contratos-putr/seguimiento-de-pagos/cuotas.module').then(m => m.CuotasModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'inventario-vehicular',
    loadChildren: () => import('./modules/inventario-vehicular/inventario-vehicular.module').then(m => m.InventarioVehicularModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'servicios',
    loadChildren: () => import('./modules/servicios/servicios.module').then(m => m.ServiciosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'operadores-por-velatorio',
    loadChildren: () => import('./modules/operadores-por-velatorio/operadores-por-velatorio.module').then(m => m.OperadoresPorVelatorioModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'registro-otorgamiento-servicios',
    loadChildren: () => import('./modules/registro-otorgamiento-servicios/registro-otorgamiento-servicios.module').then(m => m.RegistroOtorgamientoServiciosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'panteones',
    loadChildren: () => import('./modules/panteones/panteones.module').then(m => m.PanteonesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'salas',
    loadChildren: () => import('./modules/salas/salas.module').then(m => m.SalasModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'promotores',
    loadChildren: () => import('./modules/promotores/promotores.module').then(m => m.PromotoresModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'proveedores',
    loadChildren: () => import('./modules/proveedores/proveedores.module').then(m => m.ProveedoresModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'articulos',
    loadChildren: () => import('./modules/articulos/articulos.module').then(m => m.ArticulosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'convenios-prevision-funeraria',
    loadChildren: () => import('./modules/convenios-prevision-funeraria/convenios-prevision-funeraria.module').then(m => m.ConveniosPrevisionFunerariaModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'convenios-prevision-funeraria/renovar-convenio-pf',
    loadChildren: () => import('./modules/renovar-convenio-pf/renovar-convenio-pf.module').then(m => m.RenovarConvenioPfModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'velatorios',
    loadChildren: () => import('./modules/velatorios/velatorios.module').then(module => module.VelatoriosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'convenios-prevision-funeraria/renovacion-extemporanea',
    loadChildren: () => import('./modules/renovacion-extemporanea/renovacion-extemporanea.module').then(m => m.RenovacionExtemporaneaModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'contratantes',
    loadChildren: () => import('./modules/contratantes/contratantes.module').then(m => m.ContratantesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'servicios-funerarios',
    loadChildren: () => import('./modules/servicios-funerarios/servicios-funerarios.module').then(m => m.ServiciosFunerariosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'consulta-donaciones',
    loadChildren: () => import('./modules/consulta-donaciones/consulta-donaciones.module').then(m => m.ConsultaDonacionesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'reservar-capilla',
    loadChildren: () => import('./modules/capilla-reservacion/capilla-reservacion.module').then(m => m.CapillaReservacionModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'seguimiento-nuevo-convenio',
    loadChildren: () => import('./modules/convenios-nuevos/seguimiento-nuevo-convenio/seguimiento-nuevo-convenio.module').then(m => m.SeguimientoNuevoConvenioModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'reservar-capilla/velacion-en-domicilio',
    loadChildren: () => import('./modules/velacion-domicilio/velacion-domicilio.module').then(m => m.VelacionDomicilioModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'pagos',
    loadChildren: () => import('./modules/pagos/pagos.module').then(m => m.PagosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'reservar-salas',
    loadChildren: () => import('./modules/reservar-salas/reservar-salas.module').then(m => m.ReservarSalasModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'generar-nota-remision',
    loadChildren: () => import('./modules/generar-nota-remision/generar-nota-remision.module').then(m => m.GenerarNotaRemisionModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'programar-mantenimiento-vehicular',
    loadChildren: () => import('./modules/mantenimiento-vehicular/mantenimiento-vehicular.module').then(m => m.MantenimientoVehicularModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'control-de-vehiculos',
    loadChildren: () => import('./modules/control-vehiculos/control-vehiculos.module').then(m => m.ControlVehiculosModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'comisiones',
    loadChildren: () => import('./modules/calculo-comisiones/calculo-comisiones.module').then(m => m.CalculoComisionesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'solicitudes-pago',
    loadChildren: () => import('./modules/solicitudes-pago/solicitudes-pago.module').then(m => m.SolicitudesPagoModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./modules/reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'orden-entrada',
    loadChildren: () => import('./modules/orden-entrada/orden-entrada.module').then(m => m.OrdenEntradaModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'balance-cajas',
    loadChildren: () => import('./modules/balance-cajas/balance-caja.module').then(m => m.BalanceCajaModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'generar-orden-de-subrogacion',
    loadChildren: () => import('./modules/generar-orden-subrogacion/generar-orden-subrogacion.module').then(m => m.GenerarOrdenSubrogacionModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'generar-formato-de-actividades',
    loadChildren: () => import('./modules/generar-formato-actividades/generar-formato-actividades.module').then(m => m.GenerarFormatoActividadesModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: 'generar-hoja-de-consignacion',
    loadChildren: () => import('./modules/generar-hoja-consignacion/generar-hoja-consignacion.module').then(m => m.GenerarHojaConsignacionModule),
    canActivate: [PermiteUsuarioLogueadoGuard]
  },
  {
    path: '**',
    component: PaginaNoEncontradaComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'corrected',
      malformedUriErrorHandler: (
        error: URIError,
        urlSerializer: UrlSerializer,
        url: string
      ) => urlSerializer.parse('/pagina-no-encontrada'),
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}


