import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { GenerarNotaRemisionComponent } from './components/generar-nota-remision/generar-nota-remision.component';
import { FormatoGenerarNotaRemisionComponent } from './components/formato-generar-nota-remision/formato-generar-nota-remision.component';
import { DetalleFormatoGenerarNotaRemisionComponent } from './components/detalle-formato-generar-nota-remision/detalle-formato-generar-nota-remision.component';
import { CancelarFormatoGenerarNotaRemisionComponent } from './components/cancelar-formato-generar-nota-remision/cancelar-formato-generar-nota-remision.component';
import { GenerarNotaRemisionResolver } from './services/generar-nota-remision.resolver';
import { DetalleNotaRemisionResolver } from "./services/detalle-nota-remision.resolver";
import { DetalleOrderServicioResolver } from "./services/detalle-orden-servicio.resolver";

const routes: Route[] = [
    {
        path: '',
        component: GenerarNotaRemisionComponent,
        resolve: {
            respuesta: GenerarNotaRemisionResolver,
        }
    },
    {
        path: 'detalle-orden-servicio/:idOds',
        component: FormatoGenerarNotaRemisionComponent,
        resolve: {
            respuesta: DetalleOrderServicioResolver
        }
    },
    {
        path: 'detalle-formato/:idNota/:idOds',
        component: DetalleFormatoGenerarNotaRemisionComponent,
        resolve: {
            respuesta: DetalleNotaRemisionResolver
        }
    },
    {
        path: 'cancelar-formato/:idNota/:idOds',
        component: CancelarFormatoGenerarNotaRemisionComponent,
        resolve: {
            respuesta: DetalleNotaRemisionResolver
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        GenerarNotaRemisionResolver,
        DetalleNotaRemisionResolver,
        DetalleOrderServicioResolver,
    ]
})
export class GenerarReciboRoutingModule { }
