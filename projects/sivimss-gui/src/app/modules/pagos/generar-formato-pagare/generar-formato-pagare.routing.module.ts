import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { GenerarFormatoPagareComponent } from './components/generar-formato-pagare/generar-formato-pagare.component';
import { ReciboFormatoPagareComponent } from './components/recibo-formato-pagare/recibo-formato-pagare.component';
import { GenerarFormatoPagareResolver } from './services/generar-formato-pagare.resolver';

const routes: Route[] = [
    {
        path: '',
        component: GenerarFormatoPagareComponent,
        resolve: {
            respuesta: GenerarFormatoPagareResolver,
        }
    },
    {
        path: 'generar-formato-pagare',
        component: ReciboFormatoPagareComponent,
        resolve: {
            respuesta: GenerarFormatoPagareResolver
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        GenerarFormatoPagareResolver
    ]
})
export class GenerarReciboRoutingModule { }
