import { mutateAsync, requestAsync } from '../helpers/actions';
import { defaultEntitiesSelector, NGRX_QUERY_CONFIG } from '../helpers/config';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
var ConnectService = (function () {
    function ConnectService(store, config) {
        this.store = store;
        this.config = config;
    }
    ConnectService.prototype.mutateAsync = function (config) {
        this.store.dispatch(mutateAsync(config));
        return this.select(config.selector);
    };
    ConnectService.prototype.requestAsync = function (config) {
        this.store.dispatch(requestAsync(config));
        return this.select(config.selector);
    };
    ConnectService.prototype.select = function (selector) {
        return this.store.select(selector || this.config && this.config.entitiesSelector || defaultEntitiesSelector);
    };
    return ConnectService;
}());
export { ConnectService };
ConnectService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ConnectService.ctorParameters = function () { return [
    { type: Store, },
    { type: undefined, decorators: [{ type: Inject, args: [NGRX_QUERY_CONFIG,] },] },
]; };
//# sourceMappingURL=connect.service.js.map