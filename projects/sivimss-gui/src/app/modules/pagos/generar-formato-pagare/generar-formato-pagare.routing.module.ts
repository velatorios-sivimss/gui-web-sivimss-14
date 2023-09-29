import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { GenerarFormatoPagareComponent } from './components/generar-formato-pagare/generar-formato-pagare.component';
import { ReciboFormatoPagareComponent } from './components/recibo-formato-pagare/recibo-formato-pagare.component';
import { GenerarFormatoPagareResolver } from './services/generar-formato-pagare.resolver';
import { ReciboFormatoPagareResolver } from "./services/recibo-fomrato-pagare.resolver"; 

const routes: Route[] = [
    {
        path: '',
        component: GenerarFormatoPagareComponent,
        resolve: {
            respuesta: GenerarFormatoPagareResolver,
        }
    },
    {
        path: 'formato-pagare/:idODS',
        component: ReciboFormatoPagareComponent,
        resolve: {
            respuesta: ReciboFormatoPagareResolver
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        GenerarFormatoPagareResolver,ReciboFormatoPagareResolver
    ]
})
export class GenerarReciboRoutingModule { }
