import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from "./chunk-TW2ZCRHE.js";
import {
  DomSanitizer
} from "./chunk-WHOGFCWB.js";
import {
  AsyncPipe,
  CommonModule
} from "./chunk-CG6XAITJ.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef$1,
  ContentChildren,
  DOCUMENT,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  NgZone,
  NoopNgZone,
  Optional,
  Output,
  Renderer2,
  TemplateRef,
  Type,
  VERSION,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  inject,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵclassMap,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵdomTemplate,
  ɵɵelement,
  ɵɵgetInheritedFactory,
  ɵɵinject,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵsanitizeHtml,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵviewQuery
} from "./chunk-32LUUATS.js";
import {
  Observable,
  Subject,
  __objRest,
  __restKey,
  __spreadProps,
  __spreadValues,
  debounceTime,
  distinctUntilChanged,
  filter,
  isObservable,
  map,
  merge,
  of,
  startWith,
  switchMap,
  take,
  tap
} from "./chunk-3EKC2WDX.js";

// node_modules/@ngx-formly/core/fesm2022/ngx-formly-core.mjs
var _c0 = ["container"];
function FormlyField_ng_template_0_Template(rf, ctx) {
}
function LegacyFormlyField_ng_template_0_Template(rf, ctx) {
}
var _c1 = ["*"];
function FormlyGroup_For_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "formly-field", 0);
  }
  if (rf & 2) {
    const f_r1 = ctx.$implicit;
    ɵɵproperty("field", f_r1);
  }
}
var _c2 = ["fieldComponent"];
function disableTreeValidityCall(form, callback) {
  const _updateTreeValidity = form._updateTreeValidity.bind(form);
  form._updateTreeValidity = () => {
  };
  callback();
  form._updateTreeValidity = _updateTreeValidity;
}
function getFieldId(formId, field, index) {
  if (field.id) {
    return field.id;
  }
  let type = field.type;
  if (!type && field.template) {
    type = "template";
  }
  if (type instanceof Type) {
    type = type.prototype.constructor.name;
  }
  return [formId, type, field.key, index].join("_");
}
function hasKey(field) {
  return !isNil(field.key) && field.key !== "" && (!Array.isArray(field.key) || field.key.length > 0);
}
function getKeyPath(field) {
  if (!hasKey(field)) {
    return [];
  }
  if (field._keyPath?.key !== field.key) {
    let path = [];
    if (typeof field.key === "string") {
      const key = field.key.indexOf("[") === -1 ? field.key : field.key.replace(/\[(\w+)\]/g, ".$1");
      path = key.indexOf(".") !== -1 ? key.split(".") : [key];
    } else if (Array.isArray(field.key)) {
      path = field.key.slice(0);
    } else {
      path = [`${field.key}`];
    }
    defineHiddenProp(field, "_keyPath", {
      key: field.key,
      path
    });
  }
  return field._keyPath.path.slice(0);
}
var FORMLY_VALIDATORS = ["required", "pattern", "minLength", "maxLength", "min", "max"];
function assignFieldValue(field, value) {
  let paths = getKeyPath(field);
  if (paths.length === 0) {
    return;
  }
  let root = field;
  while (root.parent) {
    root = root.parent;
    paths = [...getKeyPath(root), ...paths];
  }
  if (value === void 0 && field.resetOnHide) {
    const k = paths.pop();
    const m = paths.reduce((model, path) => model[path] || {}, root.model);
    delete m[k];
    return;
  }
  assignModelValue(root.model, paths, value);
}
function assignModelValue(model, paths, value) {
  for (let i = 0; i < paths.length - 1; i++) {
    const path = paths[i];
    if (!model[path] || !isObject(model[path])) {
      model[path] = /^\d+$/.test(paths[i + 1]) ? [] : {};
    }
    model = model[path];
  }
  model[paths[paths.length - 1]] = clone(value);
}
function getFieldValue(field) {
  let model = field.parent ? field.parent.model : field.model;
  for (const path of getKeyPath(field)) {
    if (!model) {
      return model;
    }
    model = model[path];
  }
  return model;
}
function reverseDeepMerge(dest, ...args) {
  args.forEach((src) => {
    for (const srcArg in src) {
      if (isNil(dest[srcArg]) || isBlankString(dest[srcArg])) {
        dest[srcArg] = clone(src[srcArg]);
      } else if (objAndSameType(dest[srcArg], src[srcArg])) {
        reverseDeepMerge(dest[srcArg], src[srcArg]);
      }
    }
  });
  return dest;
}
function isNil(value) {
  return value == null;
}
function isUndefined(value) {
  return value === void 0;
}
function isBlankString(value) {
  return value === "";
}
function isFunction(value) {
  return typeof value === "function";
}
function objAndSameType(obj1, obj2) {
  return isObject(obj1) && isObject(obj2) && Object.getPrototypeOf(obj1) === Object.getPrototypeOf(obj2) && !(Array.isArray(obj1) || Array.isArray(obj2));
}
function isObject(x) {
  return x != null && typeof x === "object";
}
function isPromise(obj) {
  return !!obj && typeof obj.then === "function";
}
function clone(value) {
  if (!isObject(value) || isObservable(value) || value instanceof TemplateRef || /* instanceof SafeHtmlImpl */
  value.changingThisBreaksApplicationSecurity || ["RegExp", "FileList", "File", "Blob"].indexOf(value.constructor?.name) !== -1) {
    return value;
  }
  if (value instanceof Set) {
    return new Set(value);
  }
  if (value instanceof Map) {
    return new Map(value);
  }
  if (value instanceof Uint8Array) {
    return new Uint8Array(value);
  }
  if (value instanceof Uint16Array) {
    return new Uint16Array(value);
  }
  if (value instanceof Uint32Array) {
    return new Uint32Array(value);
  }
  if (value._isAMomentObject && isFunction(value.clone)) {
    return value.clone();
  }
  if (value instanceof AbstractControl) {
    return null;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.slice(0).map((v) => clone(v));
  }
  const proto = Object.getPrototypeOf(value);
  let c = Object.create(proto);
  c = Object.setPrototypeOf(c, proto);
  return Object.keys(value).reduce((newVal, prop) => {
    const propDesc = Object.getOwnPropertyDescriptor(value, prop);
    if (propDesc.get) {
      Object.defineProperty(newVal, prop, propDesc);
    } else {
      newVal[prop] = clone(value[prop]);
    }
    return newVal;
  }, c);
}
function defineHiddenProp(field, prop, defaultValue) {
  Object.defineProperty(field, prop, {
    enumerable: false,
    writable: true,
    configurable: true
  });
  field[prop] = defaultValue;
}
function observeDeep(source, paths, setFn) {
  let observers = [];
  const unsubscribe = () => {
    observers.forEach((observer2) => observer2());
    observers = [];
  };
  const observer = observe(source, paths, ({
    firstChange,
    currentValue
  }) => {
    !firstChange && setFn();
    unsubscribe();
    if (isObject(currentValue) && currentValue.constructor.name === "Object") {
      Object.keys(currentValue).forEach((prop) => {
        observers.push(observeDeep(source, [...paths, prop], setFn));
      });
    }
  });
  return () => {
    observer.unsubscribe();
    unsubscribe();
  };
}
function observe(o, paths, setFn) {
  if (!o._observers) {
    defineHiddenProp(o, "_observers", {});
  }
  let target = o;
  for (let i = 0; i < paths.length - 1; i++) {
    if (!target[paths[i]] || !isObject(target[paths[i]])) {
      target[paths[i]] = /^\d+$/.test(paths[i + 1]) ? [] : {};
    }
    target = target[paths[i]];
  }
  const key = paths[paths.length - 1];
  const prop = paths.join(".");
  if (!o._observers[prop]) {
    o._observers[prop] = {
      value: target[key],
      onChange: []
    };
  }
  const state = o._observers[prop];
  if (target[key] !== state.value) {
    state.value = target[key];
  }
  if (setFn && state.onChange.indexOf(setFn) === -1) {
    state.onChange.push(setFn);
    setFn({
      currentValue: state.value,
      firstChange: true
    });
    if (state.onChange.length >= 1 && isObject(target)) {
      const {
        enumerable
      } = Object.getOwnPropertyDescriptor(target, key) || {
        enumerable: true
      };
      Object.defineProperty(target, key, {
        enumerable,
        configurable: true,
        get: () => state.value,
        set: (currentValue) => {
          if (currentValue !== state.value) {
            const previousValue = state.value;
            state.value = currentValue;
            state.onChange.forEach((changeFn) => changeFn({
              previousValue,
              currentValue,
              firstChange: false
            }));
          }
        }
      });
    }
  }
  return {
    setValue(currentValue, emitEvent = true) {
      if (currentValue === state.value) {
        return;
      }
      const previousValue = state.value;
      state.value = currentValue;
      state.onChange.forEach((changeFn) => {
        if (changeFn !== setFn && emitEvent) {
          changeFn({
            previousValue,
            currentValue,
            firstChange: false
          });
        }
      });
    },
    unsubscribe() {
      state.onChange = state.onChange.filter((changeFn) => changeFn !== setFn);
      if (state.onChange.length === 0) {
        delete o._observers[prop];
      }
    }
  };
}
function getField(f, key) {
  key = Array.isArray(key) ? key.join(".") : key;
  if (!f.fieldGroup) {
    return void 0;
  }
  for (let i = 0, len = f.fieldGroup.length; i < len; i++) {
    const c = f.fieldGroup[i];
    const k = Array.isArray(c.key) ? c.key.join(".") : c.key;
    if (k === key) {
      return c;
    }
    if (c.fieldGroup && (isNil(k) || key.indexOf(`${k}.`) === 0)) {
      const field = getField(c, isNil(k) ? key : key.slice(k.length + 1));
      if (field) {
        return field;
      }
    }
  }
  return void 0;
}
function markFieldForCheck(field) {
  field._componentRefs?.forEach((ref) => {
    if (ref instanceof ComponentRef$1) {
      const changeDetectorRef = ref.injector.get(ChangeDetectorRef);
      changeDetectorRef.markForCheck();
    } else {
      ref.markForCheck();
    }
  });
}
function isNoopNgZone(ngZone) {
  return ngZone instanceof NoopNgZone;
}
function isHiddenField(field) {
  const isHidden = (f) => f.hide || f.expressions?.hide || f.hideExpression;
  let setDefaultValue = !field.resetOnHide || !isHidden(field);
  if (!isHidden(field) && field.resetOnHide) {
    let parent = field.parent;
    while (parent && !isHidden(parent)) {
      parent = parent.parent;
    }
    setDefaultValue = !parent || !isHidden(parent);
  }
  return !setDefaultValue;
}
function isSignalRequired() {
  return +VERSION.major > 18 || +VERSION.major >= 18 && +VERSION.minor >= 1;
}
function evalStringExpression(expression, argNames) {
  try {
    return Function(...argNames, `return ${expression};`);
  } catch (error) {
    console.error(error);
  }
}
function evalExpression(expression, thisArg, argVal) {
  if (typeof expression === "function") {
    return expression.apply(thisArg, argVal);
  } else {
    return expression ? true : false;
  }
}
function unregisterControl(field, emitEvent = false) {
  const control = field.formControl;
  const fieldIndex = control._fields ? control._fields.indexOf(field) : -1;
  if (fieldIndex !== -1) {
    control._fields.splice(fieldIndex, 1);
  }
  const form = control.parent;
  if (!form) {
    return;
  }
  const opts = {
    emitEvent
  };
  if (form instanceof UntypedFormArray) {
    const key = form.controls.findIndex((c) => c === control);
    if (key !== -1) {
      form.removeAt(key, opts);
    }
  } else if (form instanceof UntypedFormGroup) {
    const paths = getKeyPath(field);
    const key = paths[paths.length - 1];
    if (form.get([key]) === control) {
      form.removeControl(key, opts);
    }
  }
  control.setParent(null);
}
function findControl(field) {
  if (field.formControl) {
    return field.formControl;
  }
  if (field.shareFormControl === false) {
    return null;
  }
  return field.form?.get(getKeyPath(field));
}
function registerControl(field, control, emitEvent = false) {
  control = control || field.formControl;
  if (!control._fields) {
    defineHiddenProp(control, "_fields", []);
  }
  if (control._fields.indexOf(field) === -1) {
    control._fields.push(field);
  }
  if (!field.formControl && control) {
    defineHiddenProp(field, "formControl", control);
    control.setValidators(null);
    control.setAsyncValidators(null);
    field.props.disabled = !!field.props.disabled;
    const disabledObserver = observe(field, ["props", "disabled"], ({
      firstChange,
      currentValue
    }) => {
      if (!firstChange) {
        currentValue ? field.formControl.disable() : field.formControl.enable();
      }
    });
    if (control instanceof FormControl) {
      control.registerOnDisabledChange(disabledObserver.setValue);
    }
  }
  if (!field.form || !hasKey(field)) {
    return;
  }
  let form = field.form;
  const paths = getKeyPath(field);
  const value = getFieldValue(field);
  if (!(isNil(control.value) && isNil(value)) && control.value !== value && control instanceof FormControl) {
    control.patchValue(value);
  }
  for (let i = 0; i < paths.length - 1; i++) {
    const path = paths[i];
    if (!form.get([path])) {
      form.setControl(path, new UntypedFormGroup({}), {
        emitEvent
      });
    }
    form = form.get([path]);
  }
  const key = paths[paths.length - 1];
  if (!field._hide && form.get([key]) !== control) {
    form.setControl(key, control, {
      emitEvent
    });
  }
}
function updateValidity(c, onlySelf = false) {
  const status = c.status;
  const value = c.value;
  c.updateValueAndValidity({
    emitEvent: false,
    onlySelf
  });
  if (status !== c.status) {
    c.statusChanges.emit(c.status);
  }
  if (value !== c.value) {
    c.valueChanges.emit(c.value);
  }
}
function clearControl(form) {
  delete form?._fields;
  form.setValidators(null);
  form.setAsyncValidators(null);
  if (form instanceof UntypedFormGroup || form instanceof UntypedFormArray) {
    Object.values(form.controls).forEach((c) => clearControl(c));
  }
}
var FieldExpressionExtension = class {
  onPopulate(field) {
    if (field._expressions) {
      return;
    }
    defineHiddenProp(field, "_expressions", {});
    observe(field, ["hide"], ({
      currentValue,
      firstChange
    }) => {
      defineHiddenProp(field, "_hide", !!currentValue);
      if (!firstChange || firstChange && currentValue === true) {
        field.props.hidden = currentValue;
        field.options._hiddenFieldsForCheck.push({
          field
        });
      }
    });
    if (field.hideExpression) {
      observe(field, ["hideExpression"], ({
        currentValue: expr
      }) => {
        field._expressions.hide = this.parseExpressions(field, "hide", typeof expr === "boolean" ? () => expr : expr);
      });
    }
    const evalExpr = (key, expr) => {
      if (typeof expr === "string" || isFunction(expr)) {
        field._expressions[key] = this.parseExpressions(field, key, expr);
      } else if (expr instanceof Observable) {
        field._expressions[key] = {
          value$: expr.pipe(tap((v) => {
            this.evalExpr(field, key, v);
            field.options._detectChanges(field);
          }))
        };
      }
    };
    field.expressions = field.expressions || {};
    for (const key of Object.keys(field.expressions)) {
      observe(field, ["expressions", key], ({
        currentValue: expr
      }) => {
        evalExpr(key, isFunction(expr) ? (...args) => expr(field, args[3]) : expr);
      });
    }
    field.expressionProperties = field.expressionProperties || {};
    for (const key of Object.keys(field.expressionProperties)) {
      observe(field, ["expressionProperties", key], ({
        currentValue
      }) => evalExpr(key, currentValue));
    }
  }
  postPopulate(field) {
    if (field.parent) {
      return;
    }
    if (!field.options.checkExpressions) {
      let checkLocked = false;
      field.options.checkExpressions = (f, ignoreCache) => {
        if (checkLocked) {
          return;
        }
        checkLocked = true;
        const fieldChanged = this.checkExpressions(f, ignoreCache);
        const options = field.options;
        options._hiddenFieldsForCheck.sort((f2) => f2.field.hide ? -1 : 1).forEach((f2) => this.changeHideState(f2.field, f2.field.hide ?? f2.default, !ignoreCache));
        options._hiddenFieldsForCheck = [];
        if (fieldChanged) {
          this.checkExpressions(field);
        }
        checkLocked = false;
      };
    }
  }
  parseExpressions(field, path, expr) {
    let parentExpression;
    if (field.parent && ["hide", "props.disabled"].includes(path)) {
      const rootValue = (f) => {
        return path === "hide" ? f.hide : f.props.disabled;
      };
      parentExpression = () => {
        let root = field.parent;
        while (root.parent && !rootValue(root)) {
          root = root.parent;
        }
        return rootValue(root);
      };
    }
    expr = expr || (() => false);
    if (typeof expr === "string") {
      expr = evalStringExpression(expr, ["model", "formState", "field"]);
    }
    let currentValue;
    return {
      callback: (ignoreCache) => {
        try {
          const exprValue = evalExpression(parentExpression ? (...args) => parentExpression(field) || expr(...args) : expr, {
            field
          }, [field.model, field.options.formState, field, ignoreCache]);
          if (ignoreCache || currentValue !== exprValue && (!isObject(exprValue) || isObservable(exprValue) || JSON.stringify(exprValue) !== JSON.stringify(currentValue))) {
            currentValue = exprValue;
            this.evalExpr(field, path, exprValue);
            return true;
          }
          return false;
        } catch (error) {
          error.message = `[Formly Error] [Expression "${path}"] ${error.message}`;
          throw error;
        }
      }
    };
  }
  checkExpressions(field, ignoreCache = false) {
    if (!field) {
      return false;
    }
    let fieldChanged = false;
    if (field._expressions) {
      for (const key of Object.keys(field._expressions)) {
        field._expressions[key].callback?.(ignoreCache) && (fieldChanged = true);
      }
    }
    field.fieldGroup?.forEach((f) => this.checkExpressions(f, ignoreCache) && (fieldChanged = true));
    return fieldChanged;
  }
  changeDisabledState(field, value) {
    if (field.fieldGroup) {
      field.fieldGroup.filter((f) => !f._expressions.hasOwnProperty("props.disabled")).forEach((f) => this.changeDisabledState(f, value));
    }
    if (hasKey(field) && field.props.disabled !== value) {
      field.props.disabled = value;
    }
  }
  changeHideState(field, hide, resetOnHide) {
    if (field.fieldGroup) {
      field.fieldGroup.filter((f) => f && !f._expressions.hide).forEach((f) => this.changeHideState(f, hide, resetOnHide));
    }
    if (field.formControl && hasKey(field)) {
      defineHiddenProp(field, "_hide", !!(hide || field.hide));
      const c = field.formControl;
      if (c._fields?.length > 1) {
        updateValidity(c);
      }
      if (hide === true && (!c._fields || c._fields.every((f) => !!f._hide))) {
        unregisterControl(field, true);
        if (resetOnHide && field.resetOnHide) {
          assignFieldValue(field, void 0);
          field.formControl.reset({
            value: void 0,
            disabled: field.formControl.disabled
          });
          field.options.fieldChanges.next({
            value: void 0,
            field,
            type: "valueChanges"
          });
          if (field.fieldGroup && field.formControl instanceof UntypedFormArray) {
            field.fieldGroup.length = 0;
          }
        }
      } else if (hide === false) {
        if (field.resetOnHide && !isUndefined(field.defaultValue) && isUndefined(getFieldValue(field))) {
          assignFieldValue(field, field.defaultValue);
        }
        registerControl(field, void 0, true);
        if (field.resetOnHide && field.fieldArray && field.fieldGroup?.length !== field.model?.length) {
          field.options.build(field);
        }
      }
    }
    if (field.options.fieldChanges) {
      field.options.fieldChanges.next({
        field,
        type: "hidden",
        value: hide
      });
    }
  }
  evalExpr(field, prop, value) {
    if (prop.indexOf("model.") === 0) {
      const key = prop.replace(/^model\./, ""), parent = field.fieldGroup ? field : field.parent;
      let control = field?.key === key ? field.formControl : field.form.get(key);
      if (!control && field.get(key)) {
        control = field.get(key).formControl;
      }
      assignFieldValue({
        key,
        parent,
        model: field.model
      }, value);
      if (control && !(isNil(control.value) && isNil(value)) && control.value !== value) {
        control.patchValue(value);
      }
    } else {
      try {
        let target = field;
        const paths = this._evalExpressionPath(field, prop);
        const lastIndex = paths.length - 1;
        for (let i = 0; i < lastIndex; i++) {
          target = target[paths[i]];
        }
        target[paths[lastIndex]] = value;
      } catch (error) {
        error.message = `[Formly Error] [Expression "${prop}"] ${error.message}`;
        throw error;
      }
      if (["templateOptions.disabled", "props.disabled"].includes(prop) && hasKey(field)) {
        this.changeDisabledState(field, value);
      }
    }
    this.emitExpressionChanges(field, prop, value);
  }
  emitExpressionChanges(field, property, value) {
    if (!field.options.fieldChanges) {
      return;
    }
    field.options.fieldChanges.next({
      field,
      type: "expressionChanges",
      property,
      value
    });
  }
  _evalExpressionPath(field, prop) {
    if (field._expressions[prop] && field._expressions[prop].paths) {
      return field._expressions[prop].paths;
    }
    let paths = [];
    if (prop.indexOf("[") === -1) {
      paths = prop.split(".");
    } else {
      prop.split(/[[\]]{1,2}/).filter((p) => p).forEach((path) => {
        const arrayPath = path.match(/['|"](.*?)['|"]/);
        if (arrayPath) {
          paths.push(arrayPath[1]);
        } else {
          paths.push(...path.split(".").filter((p) => p));
        }
      });
    }
    if (field._expressions[prop]) {
      field._expressions[prop].paths = paths;
    }
    return paths;
  }
};
var CoreExtension = class {
  constructor(config) {
    this.config = config;
    this.formId = 0;
  }
  prePopulate(field) {
    const root = field.parent;
    this.initRootOptions(field);
    this.initFieldProps(field);
    if (root) {
      Object.defineProperty(field, "options", {
        get: () => root.options,
        configurable: true
      });
      Object.defineProperty(field, "model", {
        get: () => hasKey(field) && field.fieldGroup ? getFieldValue(field) : root.model,
        configurable: true
      });
    }
    Object.defineProperty(field, "get", {
      value: (key) => getField(field, key),
      configurable: true
    });
    this.getFieldComponentInstance(field).prePopulate?.(field);
  }
  onPopulate(field) {
    this.initFieldOptions(field);
    this.getFieldComponentInstance(field).onPopulate?.(field);
    if (field.fieldGroup) {
      field.fieldGroup.forEach((f, index) => {
        if (f) {
          Object.defineProperty(f, "parent", {
            get: () => field,
            configurable: true
          });
          Object.defineProperty(f, "index", {
            get: () => index,
            configurable: true
          });
        }
        this.formId++;
      });
    }
  }
  postPopulate(field) {
    this.getFieldComponentInstance(field).postPopulate?.(field);
  }
  initFieldProps(field) {
    field.props ??= field.templateOptions;
    Object.defineProperty(field, "templateOptions", {
      get: () => field.props,
      set: (props) => field.props = props,
      configurable: true
    });
  }
  initRootOptions(field) {
    if (field.parent) {
      return;
    }
    const options = field.options;
    field.options.formState = field.options.formState || {};
    if (!options.showError) {
      options.showError = this.config.extras.showError;
    }
    if (!options.fieldChanges) {
      defineHiddenProp(options, "fieldChanges", new Subject());
    }
    if (!options._hiddenFieldsForCheck) {
      options._hiddenFieldsForCheck = [];
    }
    options._detectChanges = (f) => {
      if (f._componentRefs) {
        markFieldForCheck(f);
      }
      f.fieldGroup?.forEach((f2) => f2 && options._detectChanges(f2));
    };
    options.detectChanges = (f) => {
      f.options.checkExpressions?.(f);
      options._detectChanges(f);
    };
    options.resetModel = (model) => {
      model = clone(model ?? options._initialModel);
      if (field.model) {
        Object.keys(field.model).forEach((k) => delete field.model[k]);
        Object.assign(field.model, model || {});
      }
      if (!isSignalRequired()) {
        observe(options, ["parentForm", "submitted"]).setValue(false, false);
      }
      options.build(field);
      field.form.reset(field.model);
    };
    options.updateInitialValue = (model) => options._initialModel = clone(model ?? field.model);
    field.options.updateInitialValue();
  }
  initFieldOptions(field) {
    reverseDeepMerge(field, {
      id: getFieldId(`formly_${this.formId}`, field, field.index),
      hooks: {},
      modelOptions: {},
      validation: {
        messages: {}
      },
      props: !field.type || !hasKey(field) ? {} : {
        label: "",
        placeholder: "",
        disabled: false
      }
    });
    if (this.config.extras.resetFieldOnHide && field.resetOnHide !== false) {
      field.resetOnHide = true;
    }
    if (field.type !== "formly-template" && (field.template || field.expressions?.template || field.expressionProperties?.template)) {
      field.type = "formly-template";
    }
    if (!field.type && field.fieldGroup) {
      field.type = "formly-group";
    }
    if (field.type) {
      this.config.getMergedField(field);
    }
    if (hasKey(field) && !isUndefined(field.defaultValue) && isUndefined(getFieldValue(field)) && !isHiddenField(field)) {
      assignFieldValue(field, field.defaultValue);
    }
    field.wrappers = field.wrappers || [];
  }
  getFieldComponentInstance(field) {
    const componentRefInstance = () => {
      let componentRef = this.config.resolveFieldTypeRef(field);
      const fieldComponentRef = field._componentRefs?.slice(-1)[0];
      if (fieldComponentRef instanceof ComponentRef$1 && fieldComponentRef?.componentType === componentRef?.componentType) {
        componentRef = fieldComponentRef;
      }
      return componentRef?.instance;
    };
    if (!field._proxyInstance) {
      defineHiddenProp(field, "_proxyInstance", new Proxy({}, {
        get: (_, prop) => componentRefInstance()?.[prop],
        set: (_, prop, value) => componentRefInstance()[prop] = value
      }));
    }
    return field._proxyInstance;
  }
};
var FieldFormExtension = class {
  prePopulate(field) {
    if (!this.root) {
      this.root = field;
    }
    if (field.parent) {
      Object.defineProperty(field, "form", {
        get: () => field.parent.formControl,
        configurable: true
      });
    }
  }
  onPopulate(field) {
    if (field.hasOwnProperty("fieldGroup") && !hasKey(field)) {
      defineHiddenProp(field, "formControl", field.form);
    } else {
      this.addFormControl(field);
    }
  }
  postPopulate(field) {
    if (this.root !== field) {
      return;
    }
    this.root = null;
    const markForCheck = this.setValidators(field);
    if (markForCheck && field.parent) {
      let parent = field.parent;
      while (parent) {
        if (hasKey(parent) || !parent.parent) {
          updateValidity(parent.formControl, true);
        }
        parent = parent.parent;
      }
    }
  }
  addFormControl(field) {
    let control = findControl(field);
    if (field.fieldArray) {
      return;
    }
    if (!control) {
      const controlOptions = {
        updateOn: field.modelOptions.updateOn
      };
      if (field.fieldGroup) {
        control = new UntypedFormGroup({}, controlOptions);
      } else {
        const value = hasKey(field) ? getFieldValue(field) : field.defaultValue;
        control = new UntypedFormControl({
          value,
          disabled: !!field.props.disabled
        }, __spreadProps(__spreadValues({}, controlOptions), {
          initialValueIsDefault: true
        }));
      }
    } else {
      if (control instanceof FormControl) {
        const value = hasKey(field) ? getFieldValue(field) : field.defaultValue;
        control.defaultValue = value;
      }
    }
    registerControl(field, control);
  }
  setValidators(field, disabled = false) {
    if (disabled === false && hasKey(field) && field.props?.disabled) {
      disabled = true;
    }
    let markForCheck = false;
    field.fieldGroup?.forEach((f) => f && this.setValidators(f, disabled) && (markForCheck = true));
    if (hasKey(field) || !field.parent || !hasKey(field) && !field.fieldGroup) {
      const {
        formControl: c
      } = field;
      if (c) {
        if (hasKey(field) && c instanceof FormControl) {
          if (disabled && c.enabled) {
            c.disable({
              emitEvent: false,
              onlySelf: true
            });
            markForCheck = true;
          }
          if (!disabled && c.disabled) {
            c.enable({
              emitEvent: false,
              onlySelf: true
            });
            markForCheck = true;
          }
        }
        if (null === c.validator && this.hasValidators(field, "_validators")) {
          c.setValidators(() => {
            const v = Validators.compose(this.mergeValidators(field, "_validators"));
            return v ? v(c) : null;
          });
          markForCheck = true;
        }
        if (null === c.asyncValidator && this.hasValidators(field, "_asyncValidators")) {
          c.setAsyncValidators(() => {
            const v = Validators.composeAsync(this.mergeValidators(field, "_asyncValidators"));
            return v ? v(c) : of(null);
          });
          markForCheck = true;
        }
        if (markForCheck) {
          updateValidity(c, true);
          let parent = c.parent;
          for (let i = 1; i < getKeyPath(field).length; i++) {
            if (parent) {
              updateValidity(parent, true);
              parent = parent.parent;
            }
          }
        }
      }
    }
    return markForCheck;
  }
  hasValidators(field, type) {
    const c = field.formControl;
    if (c?._fields?.length > 1 && c._fields.some((f) => f[type].length > 0)) {
      return true;
    } else if (field[type].length > 0) {
      return true;
    }
    return field.fieldGroup?.some((f) => f?.fieldGroup && !hasKey(f) && this.hasValidators(f, type));
  }
  mergeValidators(field, type) {
    const validators = [];
    const c = field.formControl;
    if (c?._fields?.length > 1) {
      c._fields.filter((f) => !f._hide).forEach((f) => validators.push(...f[type]));
    } else if (field[type]) {
      validators.push(...field[type]);
    }
    if (field.fieldGroup) {
      field.fieldGroup.filter((f) => f?.fieldGroup && !hasKey(f)).forEach((f) => validators.push(...this.mergeValidators(f, type)));
    }
    return validators;
  }
};
var FieldValidationExtension = class {
  constructor(config) {
    this.config = config;
  }
  onPopulate(field) {
    this.initFieldValidation(field, "validators");
    this.initFieldValidation(field, "asyncValidators");
  }
  initFieldValidation(field, type) {
    const validators = [];
    if (type === "validators" && !(field.hasOwnProperty("fieldGroup") && !hasKey(field))) {
      validators.push(this.getPredefinedFieldValidation(field));
    }
    if (field[type]) {
      for (const validatorName of Object.keys(field[type])) {
        validatorName === "validation" ? validators.push(...field[type].validation.map((v) => this.wrapNgValidatorFn(field, v))) : validators.push(this.wrapNgValidatorFn(field, field[type][validatorName], validatorName));
      }
    }
    defineHiddenProp(field, "_" + type, validators);
  }
  getPredefinedFieldValidation(field) {
    let VALIDATORS = [];
    FORMLY_VALIDATORS.forEach((opt) => observe(field, ["props", opt], ({
      currentValue,
      firstChange
    }) => {
      VALIDATORS = VALIDATORS.filter((o) => o !== opt);
      if (opt === "required" && currentValue != null && typeof currentValue !== "boolean") {
        console.warn(`Formly: Invalid prop 'required' of type '${typeof currentValue}', expected 'boolean' (Field:${field.key}).`);
      }
      if (currentValue != null && currentValue !== false) {
        VALIDATORS.push(opt);
      }
      if (!firstChange && field.formControl) {
        updateValidity(field.formControl);
      }
    }));
    return (control) => {
      if (VALIDATORS.length === 0) {
        return null;
      }
      return Validators.compose(VALIDATORS.map((opt) => () => {
        const value = field.props[opt];
        switch (opt) {
          case "required":
            return Validators.required(control);
          case "pattern":
            return Validators.pattern(value)(control);
          case "minLength":
            const minLengthResult = Validators.minLength(value)(control);
            const minLengthKey = this.config.getValidatorMessage("minlength") || field.validation?.messages?.minlength ? "minlength" : "minLength";
            return minLengthResult ? {
              [minLengthKey]: minLengthResult.minlength
            } : null;
          case "maxLength":
            const maxLengthResult = Validators.maxLength(value)(control);
            const maxLengthKey = this.config.getValidatorMessage("maxlength") || field.validation?.messages?.maxlength ? "maxlength" : "maxLength";
            return maxLengthResult ? {
              [maxLengthKey]: maxLengthResult.maxlength
            } : null;
          case "min":
            return Validators.min(value)(control);
          case "max":
            return Validators.max(value)(control);
          default:
            return null;
        }
      }))(control);
    };
  }
  wrapNgValidatorFn(field, validator, validatorName) {
    let validatorOption;
    if (typeof validator === "string") {
      validatorOption = clone(this.config.getValidator(validator));
    }
    if (typeof validator === "object" && validator.name) {
      validatorOption = clone(this.config.getValidator(validator.name));
      if (validator.options) {
        validatorOption.options = validator.options;
      }
    }
    if (typeof validator === "object" && validator.expression) {
      const _a = validator, {
        expression
      } = _a, options = __objRest(_a, [
        "expression"
      ]);
      validatorOption = {
        name: validatorName,
        validation: expression,
        options: Object.keys(options).length > 0 ? options : null
      };
    }
    if (typeof validator === "function") {
      validatorOption = {
        name: validatorName,
        validation: validator
      };
    }
    return (control) => {
      const errors = validatorOption.validation(control, field, validatorOption.options);
      if (isPromise(errors)) {
        return errors.then((v) => this.handleResult(field, validatorName ? !!v : v, validatorOption));
      }
      if (isObservable(errors)) {
        return errors.pipe(map((v) => this.handleResult(field, validatorName ? !!v : v, validatorOption)));
      }
      return this.handleResult(field, validatorName ? !!errors : errors, validatorOption);
    };
  }
  handleResult(field, errors, {
    name,
    options
  }) {
    if (typeof errors === "boolean") {
      errors = errors ? null : {
        [name]: options ? options : true
      };
    }
    const ctrl = field.formControl;
    ctrl?._childrenErrors?.[name]?.();
    if (isObject(errors)) {
      Object.keys(errors).forEach((name2) => {
        const errorPath = errors[name2].errorPath ? errors[name2].errorPath : options?.errorPath;
        const childCtrl = errorPath ? field.formControl.get(errorPath) : null;
        if (childCtrl) {
          const _a = errors[name2], {
            errorPath: _errorPath
          } = _a, opts = __objRest(_a, [
            "errorPath"
          ]);
          childCtrl.setErrors(__spreadProps(__spreadValues({}, childCtrl.errors || {}), {
            [name2]: opts
          }));
          !ctrl._childrenErrors && defineHiddenProp(ctrl, "_childrenErrors", {});
          ctrl._childrenErrors[name2] = () => {
            const _a2 = childCtrl.errors || {}, {
              [name2]: _toDelete
            } = _a2, childErrors = __objRest(_a2, [
              __restKey(name2)
            ]);
            childCtrl.setErrors(Object.keys(childErrors).length === 0 ? null : childErrors);
          };
        }
      });
    }
    return errors;
  }
};
var FieldType = class _FieldType {
  constructor() {
    this.field = {};
  }
  set _formlyControls(controls) {
    const f = this.field;
    f._localFields = controls.map((c) => c.control._fields || []).flat().filter((f2) => f2.formControl !== this.field.formControl);
  }
  get model() {
    return this.field.model;
  }
  get form() {
    return this.field.form;
  }
  get options() {
    return this.field.options;
  }
  get key() {
    return this.field.key;
  }
  get formControl() {
    return this.field.formControl;
  }
  get props() {
    return this.field.props || {};
  }
  /** @deprecated Use `props` instead. */
  get to() {
    return this.props;
  }
  get showError() {
    return this.options.showError(this);
  }
  get id() {
    return this.field.id;
  }
  get formState() {
    return this.options?.formState || {};
  }
  static {
    this.ɵfac = function FieldType_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FieldType)();
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _FieldType,
      viewQuery: function FieldType_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(NgControl, 5);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._formlyControls = _t);
        }
      },
      inputs: {
        field: "field"
      },
      standalone: false
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FieldType, [{
    type: Directive
  }], null, {
    _formlyControls: [{
      type: ViewChildren,
      args: [NgControl]
    }],
    field: [{
      type: Input
    }]
  });
})();
var FormlyTemplateType = class _FormlyTemplateType extends FieldType {
  get template() {
    if (this.field && this.field.template !== this.innerHtml.template) {
      this.innerHtml = {
        template: this.field.template,
        content: this.props.safeHtml ? this.sanitizer.bypassSecurityTrustHtml(this.field.template) : this.field.template
      };
    }
    return this.innerHtml.content;
  }
  constructor(sanitizer) {
    super();
    this.sanitizer = sanitizer;
    this.innerHtml = {};
  }
  static {
    this.ɵfac = function FormlyTemplateType_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyTemplateType)(ɵɵdirectiveInject(DomSanitizer));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyTemplateType,
      selectors: [["formly-template"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 1,
      vars: 1,
      consts: [[3, "innerHtml"]],
      template: function FormlyTemplateType_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵelement(0, "div", 0);
        }
        if (rf & 2) {
          ɵɵproperty("innerHtml", ctx.template, ɵɵsanitizeHtml);
        }
      },
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyTemplateType, [{
    type: Component,
    args: [{
      selector: "formly-template",
      template: `<div [innerHtml]="template"></div>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], () => [{
    type: DomSanitizer
  }], null);
})();
var FormlyConfig = class _FormlyConfig {
  constructor() {
    this.types = {};
    this.validators = {};
    this.wrappers = {};
    this.messages = {};
    this.extras = {
      checkExpressionOn: "modelChange",
      lazyRender: true,
      resetFieldOnHide: true,
      renderFormlyFieldElement: true,
      showError(field) {
        return field.formControl?.invalid && (field.formControl?.touched || field.options.parentForm?.submitted || !!field.field.validation?.show);
      }
    };
    this.extensions = {};
    this.presets = {};
    this.extensionsByPriority = {};
    this.componentRefs = {};
  }
  addConfig(config) {
    if (Array.isArray(config)) {
      config.forEach((c) => this.addConfig(c));
      return;
    }
    if (config.types) {
      config.types.forEach((type) => this.setType(type));
    }
    if (config.validators) {
      config.validators.forEach((validator) => this.setValidator(validator));
    }
    if (config.wrappers) {
      config.wrappers.forEach((wrapper) => this.setWrapper(wrapper));
    }
    if (config.validationMessages) {
      config.validationMessages.forEach((validation) => this.addValidatorMessage(validation.name, validation.message));
    }
    if (config.extensions) {
      this.setSortedExtensions(config.extensions);
    }
    if (config.extras) {
      this.extras = __spreadValues(__spreadValues({}, this.extras), config.extras);
    }
    if (config.presets) {
      this.presets = __spreadValues(__spreadValues({}, this.presets), config.presets.reduce((acc, curr) => __spreadProps(__spreadValues({}, acc), {
        [curr.name]: curr.config
      }), {}));
    }
  }
  /**
   * Allows you to specify a custom type which you can use in your field configuration.
   * You can pass an object of options, or an array of objects of options.
   */
  setType(options) {
    if (Array.isArray(options)) {
      options.forEach((option) => this.setType(option));
    } else {
      if (!this.types[options.name]) {
        this.types[options.name] = {
          name: options.name
        };
      }
      ["component", "extends", "defaultOptions", "wrappers"].forEach((prop) => {
        if (options.hasOwnProperty(prop)) {
          this.types[options.name][prop] = options[prop];
        }
      });
    }
  }
  getType(name, throwIfNotFound = false) {
    if (name instanceof Type) {
      return {
        component: name,
        name: name.prototype.constructor.name
      };
    }
    if (!this.types[name]) {
      if (throwIfNotFound) {
        throw new Error(`[Formly Error] The type "${name}" could not be found. Please make sure that is registered through the FormlyModule declaration.`);
      }
      return null;
    }
    this.mergeExtendedType(name);
    return this.types[name];
  }
  /** @ignore */
  getMergedField(field = {}) {
    const type = this.getType(field.type);
    if (!type) {
      return;
    }
    if (type.defaultOptions) {
      reverseDeepMerge(field, type.defaultOptions);
    }
    const extendDefaults = type.extends && this.getType(type.extends).defaultOptions;
    if (extendDefaults) {
      reverseDeepMerge(field, extendDefaults);
    }
    if (field?.optionsTypes) {
      field.optionsTypes.forEach((option) => {
        const defaultOptions = this.getType(option).defaultOptions;
        if (defaultOptions) {
          reverseDeepMerge(field, defaultOptions);
        }
      });
    }
    const componentRef = this.resolveFieldTypeRef(field);
    if (componentRef?.instance?.defaultOptions) {
      reverseDeepMerge(field, componentRef.instance.defaultOptions);
    }
    if (!field.wrappers && type.wrappers) {
      field.wrappers = [...type.wrappers];
    }
  }
  /** @ignore @internal */
  resolveFieldTypeRef(field = {}) {
    const type = this.getType(field.type);
    if (!type) {
      return null;
    }
    if (!type.component) {
      return null;
    }
    if (!this.componentRefs[type.name]) {
      const {
        _viewContainerRef,
        _injector
      } = field.options;
      if (!_viewContainerRef || !_injector) {
        return null;
      }
      const componentRef = _viewContainerRef.createComponent(type.component, {
        injector: _injector
      });
      this.componentRefs[type.name] = componentRef;
      try {
        componentRef.destroy();
      } catch (e) {
        console.error(`An error occurred while destroying the Formly component type "${field.type}"`, e);
      }
    }
    return this.componentRefs[type.name];
  }
  /** @ignore @internal */
  clearRefs() {
    this.componentRefs = {};
  }
  setWrapper(options) {
    this.wrappers[options.name] = options;
    if (options.types) {
      options.types.forEach((type) => {
        this.setTypeWrapper(type, options.name);
      });
    }
  }
  getWrapper(name) {
    if (name instanceof Type) {
      return {
        component: name,
        name: name.prototype.constructor.name
      };
    }
    if (!this.wrappers[name]) {
      throw new Error(`[Formly Error] The wrapper "${name}" could not be found. Please make sure that is registered through the FormlyModule declaration.`);
    }
    return this.wrappers[name];
  }
  /** @ignore */
  setTypeWrapper(type, name) {
    if (!this.types[type]) {
      this.types[type] = {};
    }
    if (!this.types[type].wrappers) {
      this.types[type].wrappers = [];
    }
    if (this.types[type].wrappers.indexOf(name) === -1) {
      this.types[type].wrappers.push(name);
    }
  }
  setValidator(options) {
    this.validators[options.name] = options;
  }
  getValidator(name) {
    if (!this.validators[name]) {
      throw new Error(`[Formly Error] The validator "${name}" could not be found. Please make sure that is registered through the FormlyModule declaration.`);
    }
    return this.validators[name];
  }
  addValidatorMessage(name, message) {
    this.messages[name] = message;
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      const deprecated = {
        minlength: "minLength",
        maxlength: "maxLength"
      };
      if (deprecated[name]) {
        console.warn(`Formly deprecation: passing validation messages key '${name}' is deprecated since v6.0, use '${deprecated[name]}' instead.`);
        this.messages[deprecated[name]] = message;
      }
    }
  }
  getValidatorMessage(name) {
    return this.messages[name];
  }
  setSortedExtensions(extensionOptions) {
    extensionOptions.forEach((extensionOption) => {
      const priority = extensionOption.priority ?? 1;
      this.extensionsByPriority[priority] = __spreadProps(__spreadValues({}, this.extensionsByPriority[priority]), {
        [extensionOption.name]: extensionOption.extension
      });
    });
    this.extensions = Object.keys(this.extensionsByPriority).map(Number).sort((a, b) => a - b).reduce((acc, prio) => __spreadValues(__spreadValues({}, acc), this.extensionsByPriority[prio]), {});
  }
  mergeExtendedType(name) {
    if (!this.types[name].extends) {
      return;
    }
    const extendedType = this.getType(this.types[name].extends);
    if (!this.types[name].component) {
      this.types[name].component = extendedType.component;
    }
    if (!this.types[name].wrappers) {
      this.types[name].wrappers = extendedType.wrappers;
    }
  }
  static {
    this.ɵfac = function FormlyConfig_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyConfig)();
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _FormlyConfig,
      factory: _FormlyConfig.ɵfac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyConfig, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var FormlyTemplate = class _FormlyTemplate {
  constructor(ref) {
    this.ref = ref;
  }
  ngOnChanges() {
    this.name = this.name || "formly-group";
  }
  static {
    this.ɵfac = function FormlyTemplate_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyTemplate)(ɵɵdirectiveInject(TemplateRef));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _FormlyTemplate,
      selectors: [["", "formlyTemplate", ""]],
      inputs: {
        name: [0, "formlyTemplate", "name"]
      },
      features: [ɵɵNgOnChangesFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyTemplate, [{
    type: Directive,
    args: [{
      selector: "[formlyTemplate]",
      standalone: true
    }]
  }], () => [{
    type: TemplateRef
  }], {
    name: [{
      type: Input,
      args: ["formlyTemplate"]
    }]
  });
})();
var LegacyFormlyTemplate = class _LegacyFormlyTemplate extends FormlyTemplate {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵLegacyFormlyTemplate_BaseFactory;
      return function LegacyFormlyTemplate_Factory(__ngFactoryType__) {
        return (ɵLegacyFormlyTemplate_BaseFactory || (ɵLegacyFormlyTemplate_BaseFactory = ɵɵgetInheritedFactory(_LegacyFormlyTemplate)))(__ngFactoryType__ || _LegacyFormlyTemplate);
      };
    })();
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _LegacyFormlyTemplate,
      selectors: [["", "formlyTemplate", ""]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LegacyFormlyTemplate, [{
    type: Directive,
    args: [{
      selector: "[formlyTemplate]",
      standalone: false
    }]
  }], null, null);
})();
var FormlyFieldTemplates = class _FormlyFieldTemplates {
  static {
    this.ɵfac = function FormlyFieldTemplates_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyFieldTemplates)();
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _FormlyFieldTemplates,
      factory: _FormlyFieldTemplates.ɵfac
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldTemplates, [{
    type: Injectable
  }], null, null);
})();
var FormlyField = class _FormlyField {
  get containerRef() {
    return this.config.extras.renderFormlyFieldElement ? this.viewContainerRef : this.hostContainerRef;
  }
  get elementRef() {
    if (this.config.extras.renderFormlyFieldElement) {
      return this._elementRef;
    }
    if (this.componentRefs?.[0] instanceof ComponentRef$1) {
      return this.componentRefs[0].location;
    }
    return null;
  }
  constructor(config, renderer, _elementRef, hostContainerRef, form) {
    this.config = config;
    this.renderer = renderer;
    this._elementRef = _elementRef;
    this.hostContainerRef = hostContainerRef;
    this.form = form;
    this.hostObservers = [];
    this.componentRefs = [];
    this.hooksObservers = [];
    this.detectFieldBuild = false;
    this.valueChangesUnsubscribe = () => {
    };
  }
  ngAfterContentInit() {
    this.triggerHook("afterContentInit");
  }
  ngAfterViewInit() {
    this.triggerHook("afterViewInit");
  }
  ngDoCheck() {
    if (this.detectFieldBuild && this.field && this.field.options) {
      this.render();
    }
  }
  ngOnInit() {
    this.triggerHook("onInit");
  }
  ngOnChanges(changes) {
    this.triggerHook("onChanges", changes);
  }
  ngOnDestroy() {
    this.resetRefs(this.field);
    this.hostObservers.forEach((hostObserver) => hostObserver.unsubscribe());
    this.hooksObservers.forEach((unsubscribe) => unsubscribe());
    this.valueChangesUnsubscribe();
    this.triggerHook("onDestroy");
  }
  renderField(containerRef, f, wrappers = []) {
    if (this.containerRef === containerRef) {
      this.resetRefs(this.field);
      this.containerRef.clear();
      wrappers = this.field?.wrappers;
    }
    if (wrappers?.length > 0) {
      const [wrapper, ...wps] = wrappers;
      const {
        component
      } = this.config.getWrapper(wrapper);
      const ref = containerRef.createComponent(component);
      this.attachComponentRef(ref, f);
      observe(ref.instance, ["fieldComponent"], ({
        currentValue,
        previousValue,
        firstChange
      }) => {
        if (currentValue) {
          if (previousValue && previousValue._lContainer === currentValue._lContainer) {
            return;
          }
          const viewRef = previousValue ? previousValue.detach() : null;
          if (viewRef && !viewRef.destroyed) {
            currentValue.insert(viewRef);
          } else {
            this.renderField(currentValue, f, wps);
          }
          !firstChange && ref.changeDetectorRef.detectChanges();
        }
      });
    } else if (f?.type) {
      const inlineType = this.form?.templates?.find((ref2) => ref2.name === f.type);
      let ref;
      if (inlineType) {
        ref = containerRef.createEmbeddedView(inlineType.ref, {
          $implicit: f
        });
      } else {
        const {
          component
        } = this.config.getType(f.type, true);
        ref = containerRef.createComponent(component);
      }
      this.attachComponentRef(ref, f);
    }
  }
  triggerHook(name, changes) {
    if (name === "onInit" || name === "onChanges" && changes.field && !changes.field.firstChange) {
      this.valueChangesUnsubscribe();
      this.valueChangesUnsubscribe = this.fieldChanges(this.field);
    }
    if (this.field?.hooks?.[name]) {
      if (!changes || changes.field) {
        const r = this.field.hooks[name](this.field);
        if (isObservable(r) && ["onInit", "afterContentInit", "afterViewInit"].indexOf(name) !== -1) {
          const sub = r.subscribe();
          this.hooksObservers.push(() => sub.unsubscribe());
        }
      }
    }
    if (name === "onChanges" && changes.field) {
      this.resetRefs(changes.field.previousValue);
      this.render();
    }
  }
  attachComponentRef(ref, field) {
    this.componentRefs.push(ref);
    field._componentRefs.push(ref);
    if (ref instanceof ComponentRef$1) {
      Object.assign(ref.instance, {
        field
      });
    }
  }
  render() {
    if (!this.field) {
      return;
    }
    if (!this.field.options) {
      this.detectFieldBuild = true;
      return;
    }
    this.detectFieldBuild = false;
    this.hostObservers.forEach((hostObserver) => hostObserver.unsubscribe());
    this.hostObservers = [observe(this.field, ["hide"], ({
      firstChange,
      currentValue
    }) => {
      const containerRef = this.containerRef;
      if (this.config.extras.lazyRender === false) {
        firstChange && this.renderField(containerRef, this.field);
        if (!firstChange || firstChange && currentValue) {
          this.elementRef && this.renderer.setStyle(this.elementRef.nativeElement, "display", currentValue ? "none" : "");
        }
      } else {
        if (currentValue) {
          containerRef.clear();
          if (this.field.className) {
            this.renderer.removeAttribute(this.elementRef.nativeElement, "class");
          }
        } else {
          this.renderField(containerRef, this.field);
          if (this.field.className) {
            this.renderer.setAttribute(this.elementRef.nativeElement, "class", this.field.className);
          }
        }
      }
      !firstChange && this.field.options.detectChanges(this.field);
    }), observe(this.field, ["className"], ({
      firstChange,
      currentValue
    }) => {
      if ((!firstChange || firstChange && currentValue) && (!this.config.extras.lazyRender || this.field.hide !== true)) {
        this.elementRef && this.renderer.setAttribute(this.elementRef.nativeElement, "class", currentValue);
      }
    })];
    if (!isSignalRequired()) {
      ["touched", "pristine", "status"].forEach((prop) => this.hostObservers.push(observe(this.field, ["formControl", prop], ({
        firstChange
      }) => !firstChange && markFieldForCheck(this.field))));
    } else if (this.field.formControl) {
      const events = this.field.formControl.events.subscribe(() => markFieldForCheck(this.field));
      this.hostObservers.push(events);
    }
  }
  resetRefs(field) {
    if (field) {
      if (field._localFields) {
        field._localFields = [];
      } else {
        defineHiddenProp(this.field, "_localFields", []);
      }
      if (field._componentRefs) {
        field._componentRefs = field._componentRefs.filter((ref) => this.componentRefs.indexOf(ref) === -1);
      } else {
        defineHiddenProp(this.field, "_componentRefs", []);
      }
    }
    this.componentRefs = [];
  }
  fieldChanges(field) {
    if (!field) {
      return () => {
      };
    }
    const propsObserver = observeDeep(field, ["props"], () => field.options.detectChanges(field));
    const subscribes = [() => {
      propsObserver();
    }];
    for (const key of Object.keys(field._expressions || {})) {
      const expressionObserver = observe(field, ["_expressions", key], ({
        currentValue,
        previousValue
      }) => {
        if (previousValue?.subscription) {
          previousValue.subscription.unsubscribe();
          previousValue.subscription = null;
        }
        if (isObservable(currentValue.value$)) {
          currentValue.subscription = currentValue.value$.subscribe();
        }
      });
      subscribes.push(() => {
        if (field._expressions[key]?.subscription) {
          field._expressions[key].subscription.unsubscribe();
        }
        expressionObserver.unsubscribe();
      });
    }
    for (const path of [["focus"], ["template"], ["fieldGroupClassName"], ["validation", "show"]]) {
      const fieldObserver = observe(field, path, ({
        firstChange
      }) => !firstChange && field.options.detectChanges(field));
      subscribes.push(() => fieldObserver.unsubscribe());
    }
    if (field.formControl && !field.fieldGroup) {
      const control = field.formControl;
      let valueChanges = control.valueChanges.pipe(map((value) => {
        field.parsers?.map((parserFn) => value = parserFn(value, field));
        if (!Object.is(value, field.formControl.value)) {
          field.formControl.setValue(value);
        }
        return value;
      }), distinctUntilChanged((x, y) => {
        if (x !== y || Array.isArray(x) || isObject(x)) {
          return false;
        }
        return true;
      }));
      if (control.value !== getFieldValue(field)) {
        valueChanges = valueChanges.pipe(startWith(control.value));
      }
      const {
        updateOn,
        debounce
      } = field.modelOptions;
      if ((!updateOn || updateOn === "change") && debounce?.default > 0) {
        valueChanges = valueChanges.pipe(debounceTime(debounce.default));
      }
      const sub = valueChanges.subscribe((value) => {
        if (control._fields?.length > 1 && control instanceof FormControl) {
          control.patchValue(value, {
            emitEvent: false,
            onlySelf: true
          });
        }
        if (hasKey(field)) {
          assignFieldValue(field, value);
        }
        field.options.fieldChanges.next({
          value,
          field,
          type: "valueChanges"
        });
      });
      subscribes.push(() => sub.unsubscribe());
    }
    let templateFieldsSubs = [];
    observe(field, ["_localFields"], ({
      currentValue
    }) => {
      templateFieldsSubs.forEach((unsubscribe) => unsubscribe());
      templateFieldsSubs = (currentValue || []).map((f) => this.fieldChanges(f));
    });
    return () => {
      subscribes.forEach((unsubscribe) => unsubscribe());
      templateFieldsSubs.forEach((unsubscribe) => unsubscribe());
    };
  }
  static {
    this.ɵfac = function FormlyField_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyField)(ɵɵdirectiveInject(FormlyConfig), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(FormlyFieldTemplates, 8));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyField,
      selectors: [["formly-field"]],
      viewQuery: function FormlyField_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(_c0, 7, ViewContainerRef);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.viewContainerRef = _t.first);
        }
      },
      inputs: {
        field: "field"
      },
      features: [ɵɵNgOnChangesFeature],
      decls: 2,
      vars: 0,
      consts: [["container", ""]],
      template: function FormlyField_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵdomTemplate(0, FormlyField_ng_template_0_Template, 0, 0, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      styles: ["[_nghost-%COMP%]:empty{display:none}"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyField, [{
    type: Component,
    args: [{
      selector: "formly-field",
      template: "<ng-template #container></ng-template>",
      standalone: true,
      styles: [":host:empty{display:none}\n"]
    }]
  }], () => [{
    type: FormlyConfig
  }, {
    type: Renderer2
  }, {
    type: ElementRef
  }, {
    type: ViewContainerRef
  }, {
    type: FormlyFieldTemplates,
    decorators: [{
      type: Optional
    }]
  }], {
    field: [{
      type: Input
    }],
    viewContainerRef: [{
      type: ViewChild,
      args: ["container", {
        read: ViewContainerRef,
        static: true
      }]
    }]
  });
})();
var LegacyFormlyField = class _LegacyFormlyField extends FormlyField {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵLegacyFormlyField_BaseFactory;
      return function LegacyFormlyField_Factory(__ngFactoryType__) {
        return (ɵLegacyFormlyField_BaseFactory || (ɵLegacyFormlyField_BaseFactory = ɵɵgetInheritedFactory(_LegacyFormlyField)))(__ngFactoryType__ || _LegacyFormlyField);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _LegacyFormlyField,
      selectors: [["formly-field"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["container", ""]],
      template: function LegacyFormlyField_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, LegacyFormlyField_ng_template_0_Template, 0, 0, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      styles: ["[_nghost-%COMP%]:empty{display:none}"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LegacyFormlyField, [{
    type: Component,
    args: [{
      selector: "formly-field",
      template: "<ng-template #container></ng-template>",
      standalone: false,
      styles: [":host:empty{display:none}\n"]
    }]
  }], null, null);
})();
var FormlyGroup = class _FormlyGroup extends FieldType {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyGroup_BaseFactory;
      return function FormlyGroup_Factory(__ngFactoryType__) {
        return (ɵFormlyGroup_BaseFactory || (ɵFormlyGroup_BaseFactory = ɵɵgetInheritedFactory(_FormlyGroup)))(__ngFactoryType__ || _FormlyGroup);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyGroup,
      selectors: [["formly-group"]],
      hostVars: 2,
      hostBindings: function FormlyGroup_HostBindings(rf, ctx) {
        if (rf & 2) {
          ɵɵclassMap(ctx.field.fieldGroupClassName || "");
        }
      },
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      ngContentSelectors: _c1,
      decls: 3,
      vars: 0,
      consts: [[3, "field"]],
      template: function FormlyGroup_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵprojectionDef();
          ɵɵrepeaterCreate(0, FormlyGroup_For_1_Template, 1, 1, "formly-field", 0, ɵɵrepeaterTrackByIndex);
          ɵɵprojection(2);
        }
        if (rf & 2) {
          ɵɵrepeater(ctx.field.fieldGroup);
        }
      },
      dependencies: [LegacyFormlyField],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyGroup, [{
    type: Component,
    args: [{
      selector: "formly-group",
      template: `
    @for (f of field.fieldGroup; track $index) {
      <formly-field [field]="f"></formly-field>
    }
    <ng-content></ng-content>
  `,
      host: {
        "[class]": 'field.fieldGroupClassName || ""'
      },
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
var FORMLY_CONFIG = new InjectionToken("FORMLY_CONFIG");
function withDefaultConfig(config) {
  return {
    types: [{
      name: "formly-group",
      component: FormlyGroup
    }, {
      name: "formly-template",
      component: FormlyTemplateType
    }],
    extensions: [{
      name: "core",
      extension: new CoreExtension(config),
      priority: -250
    }, {
      name: "field-validation",
      extension: new FieldValidationExtension(config),
      priority: -200
    }, {
      name: "field-form",
      extension: new FieldFormExtension(),
      priority: -150
    }, {
      name: "field-expression",
      extension: new FieldExpressionExtension(),
      priority: -100
    }]
  };
}
var provideFormlyCore = (configs = []) => {
  return [{
    provide: FORMLY_CONFIG,
    multi: true,
    useFactory: withDefaultConfig,
    deps: [FormlyConfig]
  }, provideFormlyConfig(configs)];
};
var provideFormlyConfig = (configs = []) => {
  return {
    provide: FORMLY_CONFIG,
    multi: true,
    useFactory: () => {
      const currentConfig = inject(FORMLY_CONFIG, {
        skipSelf: true,
        optional: true
      });
      if (currentConfig) {
        currentConfig.push(configs);
        return currentConfig;
      }
      return configs;
    }
  };
};
var FormlyFormBuilder = class _FormlyFormBuilder {
  constructor(config, injector, viewContainerRef, parentForm, configs = []) {
    this.config = config;
    this.injector = injector;
    this.viewContainerRef = viewContainerRef;
    this.parentForm = parentForm;
    if (configs) {
      configs.forEach((c) => config.addConfig(c));
    }
  }
  buildForm(form, fieldGroup = [], model, options) {
    this.build({
      fieldGroup,
      model,
      form,
      options
    });
  }
  build(field) {
    if (!this.config.extensions.core) {
      throw new Error("NgxFormly: missing `forRoot()` call. use `forRoot()` when registering the `FormlyModule`.");
    }
    if (!field.parent) {
      this._setOptions(field);
    }
    disableTreeValidityCall(field.form, () => {
      this._build(field);
      if (!field.parent || field.fieldArray) {
        const options = field.options;
        if (field.parent && isHiddenField(field)) {
          options._hiddenFieldsForCheck?.push({
            field,
            default: false
          });
        }
        options.checkExpressions?.(field, true);
        options._detectChanges?.(field);
      }
    });
  }
  _build(field) {
    if (!field) {
      return;
    }
    const extensions = Object.values(this.config.extensions);
    extensions.forEach((extension) => extension.prePopulate?.(field));
    extensions.forEach((extension) => extension.onPopulate?.(field));
    field.fieldGroup?.forEach((f) => this._build(f));
    extensions.forEach((extension) => extension.postPopulate?.(field));
  }
  _setOptions(field) {
    field.form = field.form || new UntypedFormGroup({});
    field.model = field.model || {};
    field.options = field.options || {};
    const options = field.options;
    if (!options._viewContainerRef) {
      defineHiddenProp(options, "_viewContainerRef", this.viewContainerRef);
    }
    if (!options._injector) {
      defineHiddenProp(options, "_injector", this.injector);
    }
    if (!options.build) {
      options.build = (f = field) => {
        this.build(f);
        return f;
      };
    }
    if (!options.parentForm && this.parentForm) {
      defineHiddenProp(options, "parentForm", this.parentForm);
      if (!isSignalRequired()) {
        observe(options, ["parentForm", "submitted"], ({
          firstChange
        }) => {
          if (!firstChange) {
            options.detectChanges(field);
          }
        });
      }
    }
  }
  static {
    this.ɵfac = function FormlyFormBuilder_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyFormBuilder)(ɵɵinject(FormlyConfig), ɵɵinject(Injector), ɵɵinject(ViewContainerRef, 8), ɵɵinject(FormGroupDirective, 8), ɵɵinject(FORMLY_CONFIG, 8));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _FormlyFormBuilder,
      factory: _FormlyFormBuilder.ɵfac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFormBuilder, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: FormlyConfig
  }, {
    type: Injector
  }, {
    type: ViewContainerRef,
    decorators: [{
      type: Optional
    }]
  }, {
    type: FormGroupDirective,
    decorators: [{
      type: Optional
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [FORMLY_CONFIG]
    }]
  }], null);
})();
var FormlyForm = class _FormlyForm {
  /** The form instance which allow to track model value and validation status. */
  set form(form) {
    this.field.form = form;
  }
  get form() {
    return this.field.form;
  }
  /** The model to be represented by the form. */
  set model(model) {
    if (this.config.extras.immutable && this._modelChangeValue === model) {
      return;
    }
    this.setField({
      model
    });
  }
  get model() {
    return this.field.model;
  }
  /** The field configurations for building the form. */
  set fields(fieldGroup) {
    this.setField({
      fieldGroup
    });
  }
  get fields() {
    return this.field.fieldGroup;
  }
  /** Options for the form. */
  set options(options) {
    this.setField({
      options
    });
  }
  get options() {
    return this.field.options;
  }
  set templates(templates) {
    this.fieldTemplates.templates = templates;
  }
  constructor(builder, config, ngZone, fieldTemplates) {
    this.builder = builder;
    this.config = config;
    this.ngZone = ngZone;
    this.fieldTemplates = fieldTemplates;
    this.modelChange = new EventEmitter();
    this.field = {
      type: "formly-group"
    };
    this._modelChangeValue = {};
    this.valueChangesUnsubscribe = () => {
    };
  }
  ngDoCheck() {
    if (this.config.extras.checkExpressionOn === "changeDetectionCheck") {
      this.checkExpressionChange();
    }
  }
  ngOnChanges(changes) {
    if (changes.fields && this.form) {
      clearControl(this.form);
    }
    if (changes.fields || changes.form || changes.model && this._modelChangeValue !== changes.model.currentValue) {
      this.valueChangesUnsubscribe();
      this.builder.build(this.field);
      this.valueChangesUnsubscribe = this.valueChanges();
    }
  }
  ngOnDestroy() {
    this.valueChangesUnsubscribe();
    this.config.clearRefs();
  }
  checkExpressionChange() {
    this.field.options.checkExpressions?.(this.field);
  }
  valueChanges() {
    this.valueChangesUnsubscribe();
    let formEvents = null;
    if (isSignalRequired()) {
      let submitted = this.options?.parentForm?.submitted;
      formEvents = this.form.events.subscribe(() => {
        if (submitted !== this.options?.parentForm?.submitted) {
          this.options.detectChanges(this.field);
          submitted = this.options?.parentForm?.submitted;
        }
      });
    }
    const fieldChangesDetection = [observeDeep(this.field.options, ["formState"], () => this.field.options.detectChanges(this.field))];
    const valueChanges = this.field.options.fieldChanges.pipe(filter(({
      field,
      type
    }) => hasKey(field) && type === "valueChanges"), switchMap(() => isNoopNgZone(this.ngZone) ? of(null) : this.ngZone.onStable.asObservable().pipe(take(1)))).subscribe(() => this.ngZone.runGuarded(() => {
      this.checkExpressionChange();
      this.modelChange.emit(this._modelChangeValue = clone(this.model));
    }));
    return () => {
      fieldChangesDetection.forEach((fnc) => fnc());
      formEvents?.unsubscribe();
      valueChanges.unsubscribe();
    };
  }
  setField(field) {
    if (this.config.extras.immutable) {
      this.field = __spreadValues(__spreadValues({}, this.field), clone(field));
    } else {
      Object.keys(field).forEach((p) => this.field[p] = field[p]);
    }
  }
  static {
    this.ɵfac = function FormlyForm_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyForm)(ɵɵdirectiveInject(FormlyFormBuilder), ɵɵdirectiveInject(FormlyConfig), ɵɵdirectiveInject(NgZone), ɵɵdirectiveInject(FormlyFieldTemplates));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyForm,
      selectors: [["formly-form"]],
      contentQueries: function FormlyForm_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
          ɵɵcontentQuery(dirIndex, FormlyTemplate, 4);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
        }
      },
      inputs: {
        form: "form",
        model: "model",
        fields: "fields",
        options: "options"
      },
      outputs: {
        modelChange: "modelChange"
      },
      features: [ɵɵProvidersFeature([FormlyFormBuilder, FormlyFieldTemplates]), ɵɵNgOnChangesFeature],
      decls: 1,
      vars: 1,
      consts: [[3, "field"]],
      template: function FormlyForm_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵelement(0, "formly-field", 0);
        }
        if (rf & 2) {
          ɵɵproperty("field", ctx.field);
        }
      },
      dependencies: [FormlyField],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyForm, [{
    type: Component,
    args: [{
      selector: "formly-form",
      template: '<formly-field [field]="field"></formly-field>',
      providers: [FormlyFormBuilder, FormlyFieldTemplates],
      imports: [FormlyField],
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true
    }]
  }], () => [{
    type: FormlyFormBuilder
  }, {
    type: FormlyConfig
  }, {
    type: NgZone
  }, {
    type: FormlyFieldTemplates
  }], {
    form: [{
      type: Input
    }],
    model: [{
      type: Input
    }],
    fields: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    modelChange: [{
      type: Output
    }],
    templates: [{
      type: ContentChildren,
      args: [FormlyTemplate]
    }]
  });
})();
var LegacyFormlyForm = class _LegacyFormlyForm extends FormlyForm {
  set templates(templates) {
    this.fieldTemplates.templates = templates;
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵLegacyFormlyForm_BaseFactory;
      return function LegacyFormlyForm_Factory(__ngFactoryType__) {
        return (ɵLegacyFormlyForm_BaseFactory || (ɵLegacyFormlyForm_BaseFactory = ɵɵgetInheritedFactory(_LegacyFormlyForm)))(__ngFactoryType__ || _LegacyFormlyForm);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _LegacyFormlyForm,
      selectors: [["formly-form"]],
      contentQueries: function LegacyFormlyForm_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
          ɵɵcontentQuery(dirIndex, LegacyFormlyTemplate, 4);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
        }
      },
      standalone: false,
      features: [ɵɵProvidersFeature([FormlyFormBuilder, FormlyFieldTemplates]), ɵɵInheritDefinitionFeature],
      decls: 1,
      vars: 1,
      consts: [[3, "field"]],
      template: function LegacyFormlyForm_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵelement(0, "formly-field", 0);
        }
        if (rf & 2) {
          ɵɵproperty("field", ctx.field);
        }
      },
      dependencies: [LegacyFormlyField],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LegacyFormlyForm, [{
    type: Component,
    args: [{
      selector: "formly-form",
      template: '<formly-field [field]="field"></formly-field>',
      providers: [FormlyFormBuilder, FormlyFieldTemplates],
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false
    }]
  }], null, {
    templates: [{
      type: ContentChildren,
      args: [LegacyFormlyTemplate]
    }]
  });
})();
var FormlyAttributes = class _FormlyAttributes {
  get props() {
    return this.field.props || {};
  }
  get fieldAttrElements() {
    return this.field?.["_elementRefs"] || [];
  }
  constructor(renderer, elementRef, _document) {
    this.renderer = renderer;
    this.elementRef = elementRef;
    this.uiAttributesCache = {};
    this.uiEvents = {
      listeners: [],
      events: ["click", "keyup", "keydown", "keypress", "focus", "blur", "change", "wheel"],
      callback: (eventName, $event) => {
        switch (eventName) {
          case "focus":
            return this.onFocus($event);
          case "blur":
            return this.onBlur($event);
          case "change":
            return this.onChange($event);
          default:
            return this.props[eventName](this.field, $event);
        }
      }
    };
    this.document = _document;
  }
  ngOnChanges(changes) {
    if (changes.field) {
      this.field.name && this.setAttribute("name", this.field.name);
      this.uiEvents.listeners.forEach((listener) => listener());
      this.uiEvents.events.forEach((eventName) => {
        if (this.props?.[eventName] || ["focus", "blur", "change"].indexOf(eventName) !== -1) {
          this.uiEvents.listeners.push(this.renderer.listen(this.elementRef.nativeElement, eventName, (e) => this.uiEvents.callback(eventName, e)));
        }
      });
      if (this.props?.attributes) {
        observe(this.field, ["props", "attributes"], ({
          currentValue,
          previousValue
        }) => {
          if (previousValue) {
            Object.keys(previousValue).forEach((attr) => this.removeAttribute(attr));
          }
          if (currentValue) {
            Object.keys(currentValue).forEach((attr) => {
              if (currentValue[attr] != null) {
                this.setAttribute(attr, currentValue[attr]);
              }
            });
          }
        });
      }
      this.detachElementRef(changes.field.previousValue);
      this.attachElementRef(changes.field.currentValue);
      if (this.fieldAttrElements.length === 1) {
        !this.id && this.field.id && this.setAttribute("id", this.field.id);
        this.focusObserver = observe(this.field, ["focus"], ({
          currentValue
        }) => {
          this.toggleFocus(currentValue);
        });
      }
    }
    if (changes.id) {
      this.setAttribute("id", this.id);
    }
  }
  /**
   * We need to re-evaluate all the attributes on every change detection cycle, because
   * by using a HostBinding we run into certain edge cases. This means that whatever logic
   * is in here has to be super lean or we risk seriously damaging or destroying the performance.
   *
   * Formly issue: https://github.com/ngx-formly/ngx-formly/issues/1317
   * Material issue: https://github.com/angular/components/issues/14024
   */
  ngDoCheck() {
    if (!this.uiAttributes) {
      const element = this.elementRef.nativeElement;
      this.uiAttributes = [...FORMLY_VALIDATORS, "tabindex", "placeholder", "readonly", "disabled", "step"].filter((attr) => !element.hasAttribute || !element.hasAttribute(attr));
    }
    for (let i = 0; i < this.uiAttributes.length; i++) {
      const attr = this.uiAttributes[i];
      const value = this.props[attr];
      if (this.uiAttributesCache[attr] !== value && (!this.props.attributes || !this.props.attributes.hasOwnProperty(attr.toLowerCase()))) {
        this.uiAttributesCache[attr] = value;
        if (value || value === 0) {
          this.setAttribute(attr, value === true ? attr : `${value}`);
        } else {
          this.removeAttribute(attr);
        }
      }
    }
  }
  ngOnDestroy() {
    this.uiEvents.listeners.forEach((listener) => listener());
    this.detachElementRef(this.field);
    this.focusObserver?.unsubscribe();
  }
  toggleFocus(value) {
    const element = this.fieldAttrElements ? this.fieldAttrElements[0] : null;
    if (!element || !element.nativeElement.focus) {
      return;
    }
    const isFocused = !!this.document.activeElement && this.fieldAttrElements.some(({
      nativeElement
    }) => this.document.activeElement === nativeElement || nativeElement.contains(this.document.activeElement));
    if (value && !isFocused) {
      Promise.resolve().then(() => element.nativeElement.focus());
    } else if (!value && isFocused) {
      Promise.resolve().then(() => element.nativeElement.blur());
    }
  }
  onFocus($event) {
    this.focusObserver?.setValue(true);
    this.props.focus?.(this.field, $event);
  }
  onBlur($event) {
    this.focusObserver?.setValue(false);
    this.props.blur?.(this.field, $event);
  }
  // handle custom `change` event, for regular ones rely on DOM listener
  onHostChange($event) {
    if ($event instanceof Event) {
      return;
    }
    this.onChange($event);
  }
  onChange($event) {
    this.props.change?.(this.field, $event);
    this.field.formControl?.markAsDirty();
  }
  attachElementRef(f) {
    if (!f) {
      return;
    }
    if (f["_elementRefs"]?.indexOf(this.elementRef) === -1) {
      f["_elementRefs"].push(this.elementRef);
    } else {
      defineHiddenProp(f, "_elementRefs", [this.elementRef]);
    }
  }
  detachElementRef(f) {
    const index = f?.["_elementRefs"] ? this.fieldAttrElements.indexOf(this.elementRef) : -1;
    if (index !== -1) {
      f["_elementRefs"].splice(index, 1);
    }
  }
  setAttribute(attr, value) {
    this.renderer.setAttribute(this.elementRef.nativeElement, attr, value);
  }
  removeAttribute(attr) {
    this.renderer.removeAttribute(this.elementRef.nativeElement, attr);
  }
  static {
    this.ɵfac = function FormlyAttributes_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyAttributes)(ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(DOCUMENT));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _FormlyAttributes,
      selectors: [["", "formlyAttributes", ""]],
      hostBindings: function FormlyAttributes_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("change", function FormlyAttributes_change_HostBindingHandler($event) {
            return ctx.onHostChange($event);
          });
        }
      },
      inputs: {
        field: [0, "formlyAttributes", "field"],
        id: "id"
      },
      features: [ɵɵNgOnChangesFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyAttributes, [{
    type: Directive,
    args: [{
      selector: "[formlyAttributes]",
      standalone: true,
      host: {
        "(change)": "onHostChange($event)"
      }
    }]
  }], () => [{
    type: Renderer2
  }, {
    type: ElementRef
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], {
    field: [{
      type: Input,
      args: ["formlyAttributes"]
    }],
    id: [{
      type: Input
    }]
  });
})();
var LegacyFormlyAttributes = class _LegacyFormlyAttributes extends FormlyAttributes {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵLegacyFormlyAttributes_BaseFactory;
      return function LegacyFormlyAttributes_Factory(__ngFactoryType__) {
        return (ɵLegacyFormlyAttributes_BaseFactory || (ɵLegacyFormlyAttributes_BaseFactory = ɵɵgetInheritedFactory(_LegacyFormlyAttributes)))(__ngFactoryType__ || _LegacyFormlyAttributes);
      };
    })();
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _LegacyFormlyAttributes,
      selectors: [["", "formlyAttributes", ""]],
      hostBindings: function LegacyFormlyAttributes_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("change", function LegacyFormlyAttributes_change_HostBindingHandler($event) {
            return ctx.onHostChange($event);
          });
        }
      },
      standalone: false,
      features: [ɵɵInheritDefinitionFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LegacyFormlyAttributes, [{
    type: Directive,
    args: [{
      selector: "[formlyAttributes]",
      host: {
        "(change)": "onHostChange($event)"
      }
    }]
  }], null, null);
})();
var FormlyValidationMessage = class _FormlyValidationMessage {
  constructor(config) {
    this.config = config;
  }
  ngOnChanges() {
    const EXPR_VALIDATORS = FORMLY_VALIDATORS.map((v) => `templateOptions.${v}`);
    this.errorMessage$ = merge(this.field.formControl.statusChanges, !this.field.options ? of(null) : this.field.options.fieldChanges.pipe(filter(({
      field,
      type,
      property
    }) => {
      return field === this.field && type === "expressionChanges" && (property.indexOf("validation") !== -1 || EXPR_VALIDATORS.indexOf(property) !== -1);
    }))).pipe(startWith(null), switchMap(() => isObservable(this.errorMessage) ? this.errorMessage : of(this.errorMessage)));
  }
  get errorMessage() {
    const fieldForm = this.field.formControl;
    for (const error in fieldForm.errors) {
      if (fieldForm.errors.hasOwnProperty(error)) {
        let message = this.config.getValidatorMessage(error);
        if (isObject(fieldForm.errors[error])) {
          if (fieldForm.errors[error].errorPath) {
            return void 0;
          }
          if (fieldForm.errors[error].message) {
            message = fieldForm.errors[error].message;
          }
        }
        if (this.field.validation?.messages?.[error]) {
          message = this.field.validation.messages[error];
        }
        if (this.field.validators?.[error]?.message) {
          message = this.field.validators[error].message;
        }
        if (this.field.asyncValidators?.[error]?.message) {
          message = this.field.asyncValidators[error].message;
        }
        if (typeof message === "function") {
          return message(fieldForm.errors[error], this.field);
        }
        return message;
      }
    }
    return void 0;
  }
  static {
    this.ɵfac = function FormlyValidationMessage_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyValidationMessage)(ɵɵdirectiveInject(FormlyConfig));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyValidationMessage,
      selectors: [["formly-validation-message"]],
      inputs: {
        field: "field"
      },
      features: [ɵɵNgOnChangesFeature],
      decls: 2,
      vars: 3,
      template: function FormlyValidationMessage_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtext(0);
          ɵɵpipe(1, "async");
        }
        if (rf & 2) {
          ɵɵtextInterpolate(ɵɵpipeBind1(1, 1, ctx.errorMessage$));
        }
      },
      dependencies: [AsyncPipe],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyValidationMessage, [{
    type: Component,
    args: [{
      selector: "formly-validation-message",
      template: "{{ errorMessage$ | async }}",
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      imports: [AsyncPipe]
    }]
  }], () => [{
    type: FormlyConfig
  }], {
    field: [{
      type: Input
    }]
  });
})();
var LegacyFormlyValidationMessage = class _LegacyFormlyValidationMessage extends FormlyValidationMessage {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵLegacyFormlyValidationMessage_BaseFactory;
      return function LegacyFormlyValidationMessage_Factory(__ngFactoryType__) {
        return (ɵLegacyFormlyValidationMessage_BaseFactory || (ɵLegacyFormlyValidationMessage_BaseFactory = ɵɵgetInheritedFactory(_LegacyFormlyValidationMessage)))(__ngFactoryType__ || _LegacyFormlyValidationMessage);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _LegacyFormlyValidationMessage,
      selectors: [["formly-validation-message"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 3,
      template: function LegacyFormlyValidationMessage_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtext(0);
          ɵɵpipe(1, "async");
        }
        if (rf & 2) {
          ɵɵtextInterpolate(ɵɵpipeBind1(1, 1, ctx.errorMessage$));
        }
      },
      dependencies: [AsyncPipe],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LegacyFormlyValidationMessage, [{
    type: Component,
    args: [{
      selector: "formly-validation-message",
      template: "{{ errorMessage$ | async }}",
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
var FieldArrayType = class _FieldArrayType extends FieldType {
  onPopulate(field) {
    if (hasKey(field)) {
      const control = findControl(field);
      registerControl(field, control ? control : new UntypedFormArray([], {
        updateOn: field.modelOptions.updateOn
      }));
    }
    field.fieldGroup = field.fieldGroup || [];
    const length = Array.isArray(field.model) ? field.model.length : 0;
    if (field.fieldGroup.length > length) {
      for (let i = field.fieldGroup.length - 1; i >= length; --i) {
        unregisterControl(field.fieldGroup[i], true);
        field.fieldGroup.splice(i, 1);
      }
    }
    for (let i = field.fieldGroup.length; i < length; i++) {
      const f = __spreadValues({}, clone(typeof field.fieldArray === "function" ? field.fieldArray(field) : field.fieldArray));
      if (f.key !== null) {
        f.key = `${i}`;
      }
      field.fieldGroup.push(f);
    }
  }
  add(i, initialModel, {
    markAsDirty
  } = {
    markAsDirty: true
  }) {
    markAsDirty && this.formControl.markAsDirty();
    i = i == null ? this.field.fieldGroup.length : i;
    if (!this.model) {
      assignFieldValue(this.field, []);
    }
    this.model.splice(i, 0, initialModel ? clone(initialModel) : void 0);
    this.markFieldForCheck(this.field.fieldGroup[i]);
    this._build();
  }
  remove(i, {
    markAsDirty
  } = {
    markAsDirty: true
  }) {
    markAsDirty && this.formControl.markAsDirty();
    this.model.splice(i, 1);
    const field = this.field.fieldGroup[i];
    this.field.fieldGroup.splice(i, 1);
    this.field.fieldGroup.forEach((f, key) => this.updateArrayElementKey(f, `${key}`));
    unregisterControl(field, true);
    this._build();
  }
  _build() {
    const fields = this.field.formControl._fields ?? [this.field];
    fields.forEach((f) => this.options.build(f));
    this.options.fieldChanges.next({
      field: this.field,
      value: getFieldValue(this.field),
      type: "valueChanges"
    });
  }
  updateArrayElementKey(f, newKey) {
    if (hasKey(f)) {
      f.key = newKey;
      return;
    }
    if (!f.fieldGroup?.length) {
      return;
    }
    for (let i = 0; i < f.fieldGroup.length; i++) {
      this.updateArrayElementKey(f.fieldGroup[i], newKey);
    }
  }
  markFieldForCheck(f) {
    if (!f) {
      return;
    }
    f.fieldGroup?.forEach((c) => this.markFieldForCheck(c));
    if (f.hide === false) {
      this.options._hiddenFieldsForCheck.push({
        field: f
      });
    }
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFieldArrayType_BaseFactory;
      return function FieldArrayType_Factory(__ngFactoryType__) {
        return (ɵFieldArrayType_BaseFactory || (ɵFieldArrayType_BaseFactory = ɵɵgetInheritedFactory(_FieldArrayType)))(__ngFactoryType__ || _FieldArrayType);
      };
    })();
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _FieldArrayType,
      standalone: false,
      features: [ɵɵInheritDefinitionFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FieldArrayType, [{
    type: Directive
  }], null, null);
})();
var FieldWrapper = class _FieldWrapper extends FieldType {
  set _formlyControls(_) {
  }
  set _staticContent(content) {
    this.fieldComponent = content;
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFieldWrapper_BaseFactory;
      return function FieldWrapper_Factory(__ngFactoryType__) {
        return (ɵFieldWrapper_BaseFactory || (ɵFieldWrapper_BaseFactory = ɵɵgetInheritedFactory(_FieldWrapper)))(__ngFactoryType__ || _FieldWrapper);
      };
    })();
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _FieldWrapper,
      viewQuery: function FieldWrapper_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(_c2, 5, ViewContainerRef)(_c2, 7, ViewContainerRef);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.fieldComponent = _t.first);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._staticContent = _t.first);
        }
      },
      standalone: false,
      features: [ɵɵInheritDefinitionFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FieldWrapper, [{
    type: Directive
  }], null, {
    fieldComponent: [{
      type: ViewChild,
      args: ["fieldComponent", {
        read: ViewContainerRef
      }]
    }],
    _staticContent: [{
      type: ViewChild,
      args: ["fieldComponent", {
        read: ViewContainerRef,
        static: true
      }]
    }]
  });
})();
var FormlyModule = class _FormlyModule {
  static forRoot(config = {}) {
    return {
      ngModule: _FormlyModule,
      providers: [{
        provide: FORMLY_CONFIG,
        multi: true,
        useFactory: withDefaultConfig,
        deps: [FormlyConfig]
      }, provideFormlyConfig(config), FormlyConfig, FormlyFormBuilder]
    };
  }
  static forChild(config = {}) {
    return {
      ngModule: _FormlyModule,
      providers: [{
        provide: FORMLY_CONFIG,
        multi: true,
        useFactory: withDefaultConfig,
        deps: [FormlyConfig]
      }, provideFormlyConfig(config), FormlyFormBuilder]
    };
  }
  static {
    this.ɵfac = function FormlyModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyModule,
      declarations: [LegacyFormlyTemplate, LegacyFormlyForm, LegacyFormlyField, LegacyFormlyAttributes, LegacyFormlyValidationMessage, FormlyGroup, FormlyTemplateType],
      imports: [CommonModule],
      exports: [LegacyFormlyTemplate, LegacyFormlyForm, LegacyFormlyField, LegacyFormlyAttributes, LegacyFormlyValidationMessage, FormlyGroup]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyModule, [{
    type: NgModule,
    args: [{
      declarations: [LegacyFormlyTemplate, LegacyFormlyForm, LegacyFormlyField, LegacyFormlyAttributes, LegacyFormlyValidationMessage, FormlyGroup, FormlyTemplateType],
      exports: [LegacyFormlyTemplate, LegacyFormlyForm, LegacyFormlyField, LegacyFormlyAttributes, LegacyFormlyValidationMessage, FormlyGroup],
      imports: [CommonModule]
    }]
  }], null, null);
})();

export {
  hasKey,
  getFieldValue,
  reverseDeepMerge,
  clone,
  defineHiddenProp,
  observe,
  FieldType,
  FormlyConfig,
  FormlyTemplate,
  LegacyFormlyTemplate,
  FormlyField,
  LegacyFormlyField,
  FormlyGroup,
  FORMLY_CONFIG,
  provideFormlyCore,
  provideFormlyConfig,
  FormlyFormBuilder,
  FormlyForm,
  LegacyFormlyForm,
  FormlyAttributes,
  LegacyFormlyAttributes,
  FormlyValidationMessage,
  LegacyFormlyValidationMessage,
  FieldArrayType,
  FieldWrapper,
  FormlyModule
};
//# sourceMappingURL=chunk-YKBDMZNT.js.map
