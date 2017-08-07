import { ConnectEntityService } from './services/connectEntity.service';
import { ConnectRequestDirective } from './directives/connect.directive';
import { NGRX_QUERY_CONFIG } from './helpers/config';
import { ConnectService } from './services/connect.service';
import { NgrxQueryEffects } from './services/effects.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
})
export class NgrxQueryModule {
  static decorators = [
    { type: NgModule, args: [{
                declarations: [
                    ConnectRequestDirective,
                ],
                exports: [
                    ConnectRequestDirective,
                ],
                imports: [
                    EffectsModule.forFeature([NgrxQueryEffects]),
                ],
            },] },
];

  /* optional: in case you need users to override your providers or providers need to be singletons */
  static forRoot(config): ModuleWithProviders {
    return {
            ngModule: NgrxQueryModule,
            providers: [
                { provide: NGRX_QUERY_CONFIG, useValue: config },
                ConnectService,
                ConnectEntityService,
            ],
    };
  }

}