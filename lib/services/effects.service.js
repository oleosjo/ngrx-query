var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { defaultEntitiesSelector, defaultQueriesSelector, defaultBackoffConfig, defaultRetryableStatusCodes } from './../helpers/config';
import { invariant } from '../helpers/invariant';
import * as ngrxQueryActionTypes from '../helpers/actionTypes';
import { NGRX_QUERY_CONFIG } from '../helpers/config';
import { getLatest } from '../helpers/getLatest';
import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as actions from 'redux-query/dist/commonjs/actions';
import * as actionTypes from 'redux-query/dist/commonjs/constants/action-types';
import * as httpMethods from 'redux-query/dist/commonjs/constants/http-methods';
import { reconcileQueryKey } from 'redux-query/dist/commonjs/lib/query-key';
import { Observable } from 'rxjs/Observable';
export function identity(x, y, z) {
    return x;
}
export function optimisticUpdateEntities(optimisticUpdate, entities) {
    return Object.keys(optimisticUpdate).reduce(function (accum, key) {
        if (optimisticUpdate[key]) {
            accum[key] = optimisticUpdate[key](entities[key]);
        }
        else {
            accum[key] = entities[key];
        }
        return accum;
    }, {});
}
;
export function updateEntities(update, entities, transformed) {
    // If update not supplied, then no change to entities should be made
    return Object.keys(update || {}).reduce(function (accum, key) {
        accum[key] = update[key]((entities || {})[key], (transformed || {})[key]);
        return accum;
    }, {});
}
;
export function getPendingQueries(queries) {
    return queries.filter(function (query) { return query.isPending; });
}
;
var NgrxQueryEffects = (function () {
    // @Effect() public cancelQuery: Observable<Action> = this.actions$;
    // @Effect() public reset: Observable<Action> = this.actions$;
    function NgrxQueryEffects(actions$, store, http, config) {
        var _this = this;
        this.actions$ = actions$;
        this.store = store;
        this.http = http;
        this.config = config;
        this.requestAsync = this.actions$
            .ofType(ngrxQueryActionTypes.REQUEST_ASYNC)
            .map(function (action) {
            var url = action.url, force = action.force, retry = action.retry, update = action.update;
            invariant(!!url, 'Missing required `url` field in action handler');
            invariant(!!update, 'Missing required `update` field in action handler');
            var queryKey = reconcileQueryKey(action);
            var state = getLatest(_this.store);
            var queries = _this.config && _this.config.queriesSelector && _this.config.queriesSelector(state)
                || defaultQueriesSelector(state);
            var queriesState = queries[queryKey];
            var _a = queriesState || {}, isPending = _a.isPending, status = _a.status;
            var hasSucceeded = status >= 200 && status < 300;
            var attemptRequest = force || !queriesState || (retry !== false && !isPending && !hasSucceeded);
            return { attemptRequest: attemptRequest, action: action };
        })
            .filter(function (_a) {
            var attemptRequest = _a.attemptRequest;
            return attemptRequest;
        })
            .mergeMap(function (_a) {
            var action = _a.action;
            var url = action.url, body = action.body, _b = action.transform, transform = _b === void 0 ? identity : _b, update = action.update, _c = action.options, options = _c === void 0 ? {} : _c, meta = action.meta;
            var queryKey = reconcileQueryKey(action);
            var start = new Date();
            var _d = options.method, method = _d === void 0 ? httpMethods.GET : _d;
            var request = {
                url: url,
                method: method,
                body: body,
                headers: options.headers,
                withCredentials: options.credentials === 'include',
            };
            return Observable.of({})
                .mergeMap(function () {
                _this.store.dispatch(actions.requestStart(url, body, request, meta, queryKey));
                return _this.http.request(url, request)
                    .map(function (response) {
                    if (!response.ok) {
                        throw response;
                    }
                    return response;
                });
            })
                .map(function (response) {
                var callbackState = getLatest(_this.store);
                var entities = _this.config && _this.config.entitiesSelector && _this.config.entitiesSelector(callbackState)
                    || defaultEntitiesSelector(callbackState);
                var parsedResponse;
                try {
                    parsedResponse = response.json();
                }
                catch (ex) {
                    parsedResponse = response.text();
                }
                var transformed = transform(parsedResponse, response.text(), response);
                var newEntities = updateEntities(update, entities, transformed);
                _this.store.dispatch(actions.requestSuccess(url, body, response.status, newEntities, meta, queryKey));
                var end = new Date();
                var duration = end.valueOf() - start.valueOf();
                return {
                    body: parsedResponse,
                    duration: duration,
                    entities: newEntities,
                    meta: meta,
                    status: response.status,
                    text: response.text,
                    transformed: transformed,
                    type: actionTypes.REQUEST_ASYNC,
                };
            })
                .retryWhen(function (attempts) {
                var backoff = _this.config && _this.config.backoff || defaultBackoffConfig;
                var retryableStatusCodes = _this.config && _this.config.retryableStatusCodes || defaultRetryableStatusCodes;
                return Observable.range(1, backoff.maxAttempts + 1)
                    .zip(attempts, function (i, response) { return ({ response: response, i: i }); })
                    .flatMap(function (_a) {
                    var response = _a.response, i = _a.i;
                    if (i < backoff.maxAttempts && retryableStatusCodes.indexOf(response.status) >= 0) {
                        // Delay retry by min duration the first attempt, up to max duration on the (maxAttempts)th attempt
                        return Observable.timer(backoff.minDuration +
                            (i - 1) * (backoff.maxDuration - backoff.minDuration) / backoff.maxAttempts);
                    }
                    else {
                        // Tried maxAttempts, now fail
                        throw response;
                    }
                });
            })
                .catch(function (errResponse, caught) {
                if (!errResponse.text || typeof errResponse.text !== 'function') {
                    throw errResponse;
                }
                return Observable.of(actions.requestFailure(url, body, errResponse.status, errResponse.text(), meta, queryKey));
            });
        });
        this.mutateAsync = this.actions$
            .ofType(ngrxQueryActionTypes.MUTATE_ASYNC)
            .mergeMap(function (action) {
            var url = action.url, _a = action.transform, transform = _a === void 0 ? identity : _a, update = action.update, body = action.body, meta = action.meta, optimisticUpdate = action.optimisticUpdate, _b = action.options, options = _b === void 0 ? {} : _b;
            invariant(!!url, 'Missing required `url` field in action handler');
            var state = getLatest(_this.store);
            var entities = _this.config && _this.config.entitiesSelector && _this.config.entitiesSelector(state)
                || defaultEntitiesSelector(state);
            var optimisticEntities;
            if (optimisticUpdate) {
                optimisticEntities = optimisticUpdateEntities(optimisticUpdate, entities);
            }
            var queryKey = reconcileQueryKey(action);
            // const start = new Date();
            var _c = options.method, method = _c === void 0 ? httpMethods.POST : _c;
            var request = {
                url: url,
                method: method,
                body: body,
                headers: options.headers,
                withCredentials: options.credentials === 'include',
            };
            // Note: only the entities that are included in `optimisticUpdate` will be passed along in the
            // `mutateStart` action as `optimisticEntities`
            _this.store.dispatch(actions.mutateStart(url, body, request, optimisticEntities, queryKey, meta));
            return _this.http.request(url, request)
                .map(function (response) {
                if (!response.ok) {
                    throw response;
                }
                var resStatus = (response && response.status) || 0;
                var resBody = (response && response.json()) || undefined;
                var resText = (response && response.text()) || undefined;
                var transformed = transform(resBody, resText, response);
                var newEntities = updateEntities(update, entities, transformed);
                return actions.mutateSuccess(url, body, resStatus, newEntities, queryKey, resBody, resText, response.headers, meta);
            })
                .catch(function (errResponse) {
                if (!errResponse.text || typeof errResponse.text !== 'function') {
                    throw errResponse;
                }
                return Observable.of(actions.mutateFailure(url, body, errResponse.status, entities, queryKey, errResponse.text(), errResponse.text(), errResponse.headers, meta));
            });
        });
    }
    return NgrxQueryEffects;
}());
export { NgrxQueryEffects };
NgrxQueryEffects.decorators = [
    { type: Injectable },
];
/** @nocollapse */
NgrxQueryEffects.ctorParameters = function () { return [
    { type: Actions, },
    { type: Store, },
    { type: Http, },
    { type: undefined, decorators: [{ type: Inject, args: [NGRX_QUERY_CONFIG,] },] },
]; };
__decorate([
    Effect(),
    __metadata("design:type", Observable)
], NgrxQueryEffects.prototype, "requestAsync", void 0);
__decorate([
    Effect(),
    __metadata("design:type", Observable)
], NgrxQueryEffects.prototype, "mutateAsync", void 0);
//# sourceMappingURL=effects.service.js.map