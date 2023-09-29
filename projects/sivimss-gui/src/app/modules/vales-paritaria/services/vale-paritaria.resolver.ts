import {Injectable} from "@angular/core";
import {ValeParitariaService} from "./vale-paritaria.service";

@Injectable()
export class ValeParitariaResolver<t> {

  constructor(private valeParitariaService: ValeParitariaService) {
  }

}
