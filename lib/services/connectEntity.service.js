var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { withoutPath } from 'redux-query/dist/commonjs/reducers/entities';
import { ConnectService } from './connect.service';
import { Injectable } from '@angular/core';
export function objectsByIdToArray(obj) {
    if (!obj) {
        return [];
    }
    return Object.keys(obj).map(function (key) { return obj[key]; });
}
;
export function arrayToObjectsById(array, keyOf) {
    return array.reduce(function (objectsById, item) {
        objectsById[keyOf(item)] = item;
        return objectsById;
    }, {});
}
var ConnectEntityService = (function () {
    function ConnectEntityService(connectService) {
        this.connectService = connectService;
    }
    ConnectEntityService.prototype.init = function (config) {
        this.config = config;
    };
    ConnectEntityService.prototype.list = function () {
        var _this = this;
        return this.connectService.requestAsync({
            selector: function (s) { return objectsByIdToArray(s.entities[_this.config.entityTypeName]); },
            transform: function (response) {
                return (_a = {}, _a[_this.config.entityTypeName] = arrayToObjectsById(response, _this.config.idSelector), _a);
                var _a;
            },
            update: (_a = {},
                _a[this.config.entityTypeName] = function (prevEntities, entities) { return (__assign({}, prevEntities, entities)); },
                _a),
            url: this.config.endpoints.list,
        });
        var _a;
    };
    ConnectEntityService.prototype.get = function (id) {
        var _this = this;
        return this.connectService.requestAsync({
            selector: function (s) { return s.entities[_this.config.entityTypeName] && s.entities[_this.config.entityTypeName][id]; },
            transform: function (response) {
                return (_a = {}, _a[_this.config.entityTypeName] = (_b = {}, _b[id] = response, _b), _a);
                var _a, _b;
            },
            update: (_a = {},
                _a[this.config.entityTypeName] = function (prevEntities, entities) { return (__assign({}, prevEntities, entities)); },
                _a),
            url: this.config.endpoints.getById(id),
        });
        var _a;
    };
    ConnectEntityService.prototype.create = function (entity) {
        var _this = this;
        return this.connectService.mutateAsync({
            body: entity,
            optimisticUpdate: (_a = {},
                _a[this.config.entityTypeName] = function (prevEntities) {
                    return (__assign({}, prevEntities, (_a = {}, _a[_this.config.idSelector(entity)] = entity, _a)));
                    var _a;
                },
                _a),
            transform: function (response) {
                return (_a = {}, _a[_this.config.entityTypeName] = (_b = {}, _b[_this.config.idSelector(response)] = response, _b), _a);
                var _a, _b;
            },
            update: (_b = {},
                _b[this.config.entityTypeName] = function (prevEntities, entities) { return (__assign({}, prevEntities, entities)); },
                _b),
            url: this.config.endpoints.create,
        });
        var _a, _b;
    };
    ConnectEntityService.prototype.edit = function (entity) {
        var _this = this;
        return this.connectService.mutateAsync({
            body: entity,
            optimisticUpdate: (_a = {},
                _a[this.config.entityTypeName] = function (prevEntities) {
                    return (__assign({}, prevEntities, (_a = {}, _a[_this.config.idSelector(entity)] = entity, _a)));
                    var _a;
                },
                _a),
            options: {
                method: 'PUT',
            },
            selector: function (s) { return s.entities[_this.config.entityTypeName][_this.config.idSelector(entity)]; },
            transform: function (response) {
                return (_a = {}, _a[_this.config.entityTypeName] = (_b = {}, _b[_this.config.idSelector(response)] = response, _b), _a);
                var _a, _b;
            },
            update: (_b = {},
                _b[this.config.entityTypeName] = function (prevEntities, entities) { return (__assign({}, prevEntities, entities)); },
                _b),
            url: this.config.endpoints.update,
        });
        var _a, _b;
    };
    ConnectEntityService.prototype.delete = function (id) {
        var _this = this;
        return this.connectService.mutateAsync({
            selector: function (s) { return s.entities[_this.config.entityTypeName][id]; },
            optimisticUpdate: (_a = {},
                _a[this.config.entityTypeName] = function (prevEntities) { return withoutPath(prevEntities, [id]); },
                _a),
            options: {
                method: 'DELETE',
            },
            update: (_b = {},
                _b[this.config.entityTypeName] = function (prevEntities) { return withoutPath(prevEntities, [id]); },
                _b),
            url: this.config.endpoints.remove(id + ''),
        });
        var _a, _b;
    };
    return ConnectEntityService;
}());
export { ConnectEntityService };
ConnectEntityService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ConnectEntityService.ctorParameters = function () { return [
    { type: ConnectService, },
]; };
//# sourceMappingURL=connectEntity.service.js.map