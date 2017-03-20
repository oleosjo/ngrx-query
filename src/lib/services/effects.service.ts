import { defaultEntitiesSelector, defaultQueriesSelector } from './../helpers/config';
import { invariant } from '../helpers/invariant';
import * as ngrxQueryActionTypes from '../helpers/actionTypes';
import { NGRX_QUERY_CONFIG, NgrxQueryConfig } from '../helpers/config';
import { getLatest } from '../helpers/getLatest';
import { Inject, Injectable } from '@angular/core';
import { Http, Request } from '@angular/http';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as actions from '../redux-query/actions';
import * as actionTypes from '../redux-query/action-types';
import * as httpMethods from '../redux-query/http-methods';
import { reconcileQueryKey } from '../redux-query/query-key';
import { Observable } from 'rxjs/Observable';

export function identity(x: any, y?: any): any {
  return x;
}

export const optimisticUpdateEntities = (optimisticUpdate, entities) => {
  return Object.keys(optimisticUpdate).reduce(
    (accum, key) => {
      if (optimisticUpdate[key]) {
        accum[key] = optimisticUpdate[key](entities[key]);
      } else {
        accum[key] = entities[key];
      }

      return accum;
    },
    {});
};

export const updateEntities = (update, entities, transformed) => {
  // If update not supplied, then no change to entities should be made
  return Object.keys(update || {}).reduce(
    (accum, key) => {
      accum[key] = update[key]((entities || {})[key], (transformed || {})[key]);

      return accum;
    },
    {});
};

export const getPendingQueries = (queries: any[]) => {
  return queries.filter((query) => query.isPending);
};

@Injectable()
export class NgrxQueryEffects {
  @Effect() public requestAsync: Observable<Action> = this.actions$
    .ofType(ngrxQueryActionTypes.REQUEST_ASYNC)
    .map((action: any) => {
      const {
        url,
        force,
        retry,
        update,
      } = action;

      invariant(!!url, 'Missing required `url` field in action handler');
      invariant(!!update, 'Missing required `update` field in action handler');

      const queryKey = reconcileQueryKey(action);

      const state = getLatest(this.store);
      const queries = this.config.queriesSelector
        ? this.config.queriesSelector(state)
        : defaultQueriesSelector(state);

      const queriesState = queries[queryKey];
      const { isPending, status } = queriesState || <any>{};
      const hasSucceeded = status >= 200 && status < 300;
      const attemptRequest = force || !queriesState || (retry && !isPending && !hasSucceeded);
      return { attemptRequest, action };
    })
    .filter(({ attemptRequest }) => attemptRequest)
    .mergeMap(({ action }) => {
      const {
        url,
        body,
        transform = identity,
        update,
        options = <any>{},
        meta,
      } = action;
      const queryKey = reconcileQueryKey(action);

      const start = new Date();
      const { method = httpMethods.GET } = options;

      const request = new Request({
        url,
        method,
        body,
        headers: options.headers,
        withCredentials: options.credentials === 'include',
      });

      return Observable.of({})
        .mergeMap(() => {
          this.store.dispatch(actions.requestStart(url, body, request, meta, queryKey));
          return this.http.request(url, request);
        })
        .map(response => {
          const callbackState = getLatest(this.store);
          const entities = this.config.entitiesSelector
            ? this.config.entitiesSelector(callbackState)
            : defaultEntitiesSelector(callbackState);
          const transformed = transform(response.json(), response.text());
          const newEntities = updateEntities(update, entities, transformed);
          this.store.dispatch(actions.requestSuccess(url, body, response.status, newEntities, meta, queryKey));
          const end = new Date();
          const duration = end.valueOf() - start.valueOf();
          return {
            body: response.json(),
            duration,
            entities: newEntities,
            status: response.status,
            text: response.text,
            transformed,
            type: actionTypes.REQUEST_ASYNC,
          };
        })
        .retryWhen(attempts => {
          return Observable.range(1, this.config.backoff.maxAttempts + 1)
            .zip(attempts, (i, response) => ({ response, i }))
            .flatMap(({ response, i }) => {
              if (i < this.config.backoff.maxAttempts && this.config.retryableStatusCodes.indexOf(response.status) >= 0) {
                // Delay retry by min duration the first attempt, up to max duration on the (maxAttempts)th attempt
                return Observable.timer(
                  this.config.backoff.minDuration +
                  (i - 1) * (this.config.backoff.maxDuration - this.config.backoff.minDuration) / this.config.backoff.maxAttempts,
                );
              } else {
                // Tried maxAttempts, now fail
                throw response;
              }
            });
        })
        .catch((errResponse, caught) => {
          if (!errResponse.text) {
            throw errResponse;
          }
          return Observable.of(actions.requestFailure(
            url,
            body,
            errResponse.status,
            errResponse.text(),
            meta,
            queryKey,
          ));
        });
    });

  @Effect() public mutateAsync: Observable<any> = this.actions$
    .ofType(ngrxQueryActionTypes.MUTATE_ASYNC)
    .mergeMap((action: any) => {
      const {
          url,
        transform = identity,
        update,
        body,
        optimisticUpdate,
        options = <any>{},
      } = action;
      invariant(!!url, 'Missing required `url` field in action handler');

      const state = getLatest(this.store);
      const entities = this.config.entitiesSelector
        ? this.config.entitiesSelector(state)
        : defaultEntitiesSelector(state);
      let optimisticEntities;
      if (optimisticUpdate) {
        optimisticEntities = optimisticUpdateEntities(optimisticUpdate, entities);
      }

      const queryKey = reconcileQueryKey(action);
      // const start = new Date();
      const { method = httpMethods.POST } = options;
      const request = new Request({
        url,
        method,
        body,
        headers: options.headers,
        withCredentials: options.credentials === 'include',
      });

      // Note: only the entities that are included in `optimisticUpdate` will be passed along in the
      // `mutateStart` action as `optimisticEntities`
      this.store.dispatch(actions.mutateStart(url, body, request, optimisticEntities, queryKey));

      return this.http.request(url, request)
        .map(response => {
          const resStatus = (response && response.status) || 0;
          const resBody = (response && response.json()) || undefined;
          const resText = (response && response.text()) || undefined;

          const transformed = transform(resBody, resText);
          const newEntities = updateEntities(update, entities, transformed);
          return actions.mutateSuccess(url, body, resStatus, newEntities, queryKey);
        })
        .catch(errResponse => Observable.of(actions.mutateFailure(url, body, errResponse.status, entities, queryKey)));
    });
  // @Effect() public cancelQuery: Observable<Action> = this.actions$;
  // @Effect() public reset: Observable<Action> = this.actions$;

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private http: Http,
    @Inject(NGRX_QUERY_CONFIG) private config: NgrxQueryConfig,
  ) { }
}
