import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  FieldType,
  FieldWrapper,
  FormlyModule,
  LegacyFormlyAttributes,
  LegacyFormlyValidationMessage
} from "./chunk-2IMWCF3U.js";
import {
  CheckboxControlValueAccessor,
  DefaultValueAccessor,
  FormControlDirective,
  NgControlStatus,
  NgSelectOption,
  NumberValueAccessor,
  RadioControlValueAccessor,
  ReactiveFormsModule,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  UntypedFormControl,
  ɵNgSelectMultipleOption
} from "./chunk-KA6SXBIR.js";
import "./chunk-CNLYICNS.js";
import {
  AsyncPipe,
  CommonModule,
  NgClass,
  NgForOf,
  NgIf,
  NgTemplateOutlet
} from "./chunk-GWW5VEP7.js";
import "./chunk-UCDKWJ7P.js";
import "./chunk-IVHOKCR5.js";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  NgModule,
  Optional,
  Pipe,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  require_operators,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵinterpolate1,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction2,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵviewQuery
} from "./chunk-ZDGDSXJU.js";
import {
  require_cjs
} from "./chunk-KH4E7DFC.js";
import {
  __spreadProps,
  __spreadValues,
  __toESM
} from "./chunk-VIB2VHHA.js";

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-form-field.mjs
function FormlyWrapperFormField_ng_template_0_label_0_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 8);
    ɵɵtext(1, "*");
    ɵɵelementEnd();
  }
}
function FormlyWrapperFormField_ng_template_0_label_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "label", 6);
    ɵɵtext(1);
    ɵɵtemplate(2, FormlyWrapperFormField_ng_template_0_label_0_span_2_Template, 2, 0, "span", 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵattribute("for", ctx_r0.id);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r0.props.label, " ");
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r0.props.required && ctx_r0.props.hideRequiredMarker !== true);
  }
}
function FormlyWrapperFormField_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, FormlyWrapperFormField_ng_template_0_label_0_Template, 3, 3, "label", 5);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngIf", ctx_r0.props.label && ctx_r0.props.hideLabel !== true);
  }
}
function FormlyWrapperFormField_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelementContainer(1, 9);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    ɵɵnextContext();
    const labelTemplate_r2 = ɵɵreference(1);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", labelTemplate_r2);
  }
}
function FormlyWrapperFormField_ng_template_4_Template(rf, ctx) {
}
function FormlyWrapperFormField_ng_container_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelementContainer(1, 9);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    ɵɵnextContext();
    const labelTemplate_r2 = ɵɵreference(1);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", labelTemplate_r2);
  }
}
function FormlyWrapperFormField_div_7_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 10);
    ɵɵelement(1, "formly-validation-message", 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵstyleProp("display", "block");
    ɵɵadvance();
    ɵɵproperty("id", ɵɵinterpolate1("", ctx_r0.id, "-formly-validation-error"))("field", ctx_r0.field);
  }
}
function FormlyWrapperFormField_small_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "small", 12);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.props.description);
  }
}
var _c0 = ["fieldTypeTemplate"];
var FormlyWrapperFormField = class _FormlyWrapperFormField extends FieldWrapper {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyWrapperFormField_BaseFactory;
      return function FormlyWrapperFormField_Factory(__ngFactoryType__) {
        return (ɵFormlyWrapperFormField_BaseFactory || (ɵFormlyWrapperFormField_BaseFactory = ɵɵgetInheritedFactory(_FormlyWrapperFormField)))(__ngFactoryType__ || _FormlyWrapperFormField);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyWrapperFormField,
      selectors: [["formly-wrapper-form-field"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 9,
      vars: 8,
      consts: [["labelTemplate", ""], ["fieldComponent", ""], [4, "ngIf"], ["class", "invalid-feedback", 3, "display", 4, "ngIf"], ["class", "form-text text-muted", 4, "ngIf"], ["class", "form-label", 4, "ngIf"], [1, "form-label"], ["aria-hidden", "true", 4, "ngIf"], ["aria-hidden", "true"], [3, "ngTemplateOutlet"], [1, "invalid-feedback"], ["role", "alert", 3, "id", "field"], [1, "form-text", "text-muted"]],
      template: function FormlyWrapperFormField_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyWrapperFormField_ng_template_0_Template, 1, 1, "ng-template", null, 0, ɵɵtemplateRefExtractor);
          ɵɵelementStart(2, "div");
          ɵɵtemplate(3, FormlyWrapperFormField_ng_container_3_Template, 2, 1, "ng-container", 2)(4, FormlyWrapperFormField_ng_template_4_Template, 0, 0, "ng-template", null, 1, ɵɵtemplateRefExtractor)(6, FormlyWrapperFormField_ng_container_6_Template, 2, 1, "ng-container", 2)(7, FormlyWrapperFormField_div_7_Template, 2, 5, "div", 3)(8, FormlyWrapperFormField_small_8_Template, 2, 1, "small", 4);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵadvance(2);
          ɵɵclassProp("form-floating", ctx.props.labelPosition === "floating")("has-error", ctx.showError);
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.props.labelPosition !== "floating");
          ɵɵadvance(3);
          ɵɵproperty("ngIf", ctx.props.labelPosition === "floating");
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.showError);
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.props.description);
        }
      },
      dependencies: [NgIf, NgTemplateOutlet, LegacyFormlyValidationMessage],
      styles: ["[_nghost-%COMP%]{display:block;margin-bottom:1rem}"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyWrapperFormField, [{
    type: Component,
    args: [{
      selector: "formly-wrapper-form-field",
      template: `
    <ng-template #labelTemplate>
      <label *ngIf="props.label && props.hideLabel !== true" [attr.for]="id" class="form-label">
        {{ props.label }}
        <span *ngIf="props.required && props.hideRequiredMarker !== true" aria-hidden="true">*</span>
      </label>
    </ng-template>

    <div [class.form-floating]="props.labelPosition === 'floating'" [class.has-error]="showError">
      <ng-container *ngIf="props.labelPosition !== 'floating'">
        <ng-container [ngTemplateOutlet]="labelTemplate"></ng-container>
      </ng-container>

      <ng-template #fieldComponent></ng-template>

      <ng-container *ngIf="props.labelPosition === 'floating'">
        <ng-container [ngTemplateOutlet]="labelTemplate"></ng-container>
      </ng-container>

      <div *ngIf="showError" class="invalid-feedback" [style.display]="'block'">
        <formly-validation-message
          id="{{ id }}-formly-validation-error"
          [field]="field"
          role="alert"
        ></formly-validation-message>
      </div>

      <small *ngIf="props.description" class="form-text text-muted">{{ props.description }}</small>
    </div>
  `,
      styles: [":host{display:block;margin-bottom:1rem}\n"]
    }]
  }], null, null);
})();
function withFormlyFormField() {
  return {
    wrappers: [{
      name: "form-field",
      component: FormlyWrapperFormField
    }]
  };
}
var FormlyBootstrapFormFieldModule = class _FormlyBootstrapFormFieldModule {
  static {
    this.ɵfac = function FormlyBootstrapFormFieldModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapFormFieldModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapFormFieldModule,
      declarations: [FormlyWrapperFormField],
      imports: [CommonModule, ReactiveFormsModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyModule.forChild(withFormlyFormField())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapFormFieldModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyWrapperFormField],
      imports: [CommonModule, ReactiveFormsModule, FormlyModule.forChild(withFormlyFormField())]
    }]
  }], null, null);
})();
var FieldType2 = class _FieldType extends FieldType {
  set content(templateRef) {
    if (templateRef && this.hostContainerRef) {
      this.hostContainerRef.createEmbeddedView(templateRef);
    }
  }
  constructor(hostContainerRef) {
    super();
    this.hostContainerRef = hostContainerRef;
  }
  static {
    this.ɵfac = function FieldType_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FieldType)(ɵɵdirectiveInject(ViewContainerRef, 8));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _FieldType,
      viewQuery: function FieldType_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(_c0, 7);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.content = _t.first);
        }
      },
      standalone: false,
      features: [ɵɵInheritDefinitionFeature]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FieldType2, [{
    type: Directive
  }], () => [{
    type: ViewContainerRef,
    decorators: [{
      type: Optional
    }]
  }], {
    content: [{
      type: ViewChild,
      args: ["fieldTypeTemplate", {
        static: true
      }]
    }]
  });
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-input.mjs
function FormlyFieldInput_ng_template_0_input_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "input", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵclassProp("is-invalid", ctx_r0.showError);
    ɵɵproperty("type", ctx_r0.type)("formControl", ctx_r0.formControl)("formlyAttributes", ctx_r0.field);
    ɵɵattribute("aria-describedby", ctx_r0.id + "-formly-validation-error")("aria-invalid", ctx_r0.showError);
  }
}
function FormlyFieldInput_ng_template_0_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "input", 4);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵclassProp("is-invalid", ctx_r0.showError);
    ɵɵproperty("formControl", ctx_r0.formControl)("formlyAttributes", ctx_r0.field);
    ɵɵattribute("aria-describedby", ctx_r0.id + "-formly-validation-error")("aria-invalid", ctx_r0.showError);
  }
}
function FormlyFieldInput_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, FormlyFieldInput_ng_template_0_input_0_Template, 1, 7, "input", 2)(1, FormlyFieldInput_ng_template_0_ng_template_1_Template, 1, 6, "ng-template", null, 1, ɵɵtemplateRefExtractor);
  }
  if (rf & 2) {
    const numberTmp_r2 = ɵɵreference(2);
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngIf", ctx_r0.type !== "number")("ngIfElse", numberTmp_r2);
  }
}
var FormlyFieldInput = class _FormlyFieldInput extends FieldType2 {
  get type() {
    return this.props.type || "text";
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyFieldInput_BaseFactory;
      return function FormlyFieldInput_Factory(__ngFactoryType__) {
        return (ɵFormlyFieldInput_BaseFactory || (ɵFormlyFieldInput_BaseFactory = ɵɵgetInheritedFactory(_FormlyFieldInput)))(__ngFactoryType__ || _FormlyFieldInput);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyFieldInput,
      selectors: [["formly-field-input"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], ["numberTmp", ""], ["class", "form-control", 3, "type", "formControl", "formlyAttributes", "is-invalid", 4, "ngIf", "ngIfElse"], [1, "form-control", 3, "type", "formControl", "formlyAttributes"], ["type", "number", 1, "form-control", 3, "formControl", "formlyAttributes"]],
      template: function FormlyFieldInput_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyFieldInput_ng_template_0_Template, 3, 2, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [NgIf, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, FormControlDirective, LegacyFormlyAttributes],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldInput, [{
    type: Component,
    args: [{
      selector: "formly-field-input",
      template: `
    <ng-template #fieldTypeTemplate>
      <input
        *ngIf="type !== 'number'; else numberTmp"
        [type]="type"
        [formControl]="formControl"
        class="form-control"
        [formlyAttributes]="field"
        [class.is-invalid]="showError"
        [attr.aria-describedby]="id + '-formly-validation-error'"
        [attr.aria-invalid]="showError"
      />
      <ng-template #numberTmp>
        <input
          type="number"
          [formControl]="formControl"
          class="form-control"
          [formlyAttributes]="field"
          [class.is-invalid]="showError"
          [attr.aria-describedby]="id + '-formly-validation-error'"
          [attr.aria-invalid]="showError"
        />
      </ng-template>
    </ng-template>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
function withFormlyFieldInput() {
  return {
    types: [{
      name: "input",
      component: FormlyFieldInput,
      wrappers: ["form-field"]
    }, {
      name: "string",
      extends: "input"
    }, {
      name: "number",
      extends: "input",
      defaultOptions: {
        props: {
          type: "number"
        }
      }
    }, {
      name: "integer",
      extends: "input",
      defaultOptions: {
        props: {
          type: "number"
        }
      }
    }]
  };
}
var FormlyBootstrapInputModule = class _FormlyBootstrapInputModule {
  static {
    this.ɵfac = function FormlyBootstrapInputModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapInputModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapInputModule,
      declarations: [FormlyFieldInput],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule.forChild(withFormlyFieldInput())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapInputModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyFieldInput],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule.forChild(withFormlyFieldInput())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-textarea.mjs
function FormlyFieldTextArea_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "textarea", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵclassProp("is-invalid", ctx_r0.showError);
    ɵɵproperty("formControl", ctx_r0.formControl)("cols", ctx_r0.props.cols)("rows", ctx_r0.props.rows)("formlyAttributes", ctx_r0.field);
    ɵɵattribute("aria-describedby", ctx_r0.id + "-formly-validation-error")("aria-invalid", ctx_r0.showError);
  }
}
var FormlyFieldTextArea = class _FormlyFieldTextArea extends FieldType2 {
  constructor() {
    super(...arguments);
    this.defaultOptions = {
      props: {
        cols: 1,
        rows: 1
      }
    };
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyFieldTextArea_BaseFactory;
      return function FormlyFieldTextArea_Factory(__ngFactoryType__) {
        return (ɵFormlyFieldTextArea_BaseFactory || (ɵFormlyFieldTextArea_BaseFactory = ɵɵgetInheritedFactory(_FormlyFieldTextArea)))(__ngFactoryType__ || _FormlyFieldTextArea);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyFieldTextArea,
      selectors: [["formly-field-textarea"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], [1, "form-control", 3, "formControl", "cols", "rows", "formlyAttributes"]],
      template: function FormlyFieldTextArea_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyFieldTextArea_ng_template_0_Template, 1, 8, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [DefaultValueAccessor, NgControlStatus, FormControlDirective, LegacyFormlyAttributes],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldTextArea, [{
    type: Component,
    args: [{
      selector: "formly-field-textarea",
      template: `
    <ng-template #fieldTypeTemplate>
      <textarea
        [formControl]="formControl"
        [cols]="props.cols"
        [rows]="props.rows"
        class="form-control"
        [class.is-invalid]="showError"
        [formlyAttributes]="field"
        [attr.aria-describedby]="id + '-formly-validation-error'"
        [attr.aria-invalid]="showError"
      ></textarea>
    </ng-template>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
function withFormlyFieldTextArea() {
  return {
    types: [{
      name: "textarea",
      component: FormlyFieldTextArea,
      wrappers: ["form-field"]
    }]
  };
}
var FormlyBootstrapTextAreaModule = class _FormlyBootstrapTextAreaModule {
  static {
    this.ɵfac = function FormlyBootstrapTextAreaModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapTextAreaModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapTextAreaModule,
      declarations: [FormlyFieldTextArea],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule.forChild(withFormlyFieldTextArea())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapTextAreaModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyFieldTextArea],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule.forChild(withFormlyFieldTextArea())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/core/fesm2022/ngx-formly-core-select.mjs
var import_rxjs = __toESM(require_cjs(), 1);
var import_operators = __toESM(require_operators(), 1);
var FormlySelectOptionsPipe = class _FormlySelectOptionsPipe {
  transform(options, field) {
    if (!(options instanceof import_rxjs.Observable)) {
      options = this.observableOf(options, field);
    } else {
      this.dispose();
    }
    return options.pipe((0, import_operators.map)((value) => this.transformOptions(value, field)));
  }
  ngOnDestroy() {
    this.dispose();
  }
  transformOptions(options, field) {
    const to = this.transformSelectProps(field);
    const opts = [];
    const groups = {};
    options?.forEach((option) => {
      const o = this.transformOption(option, to);
      if (o.group) {
        const id = groups[o.label];
        if (id === void 0) {
          groups[o.label] = opts.push(o) - 1;
        } else {
          o.group.forEach((o2) => opts[id].group.push(o2));
        }
      } else {
        opts.push(o);
      }
    });
    return opts;
  }
  transformOption(option, props) {
    const group = props.groupProp(option);
    if (Array.isArray(group)) {
      return {
        label: props.labelProp(option),
        group: group.map((opt) => this.transformOption(opt, props))
      };
    }
    option = {
      label: props.labelProp(option),
      value: props.valueProp(option),
      disabled: !!props.disabledProp(option)
    };
    if (group) {
      return {
        label: group,
        group: [option]
      };
    }
    return option;
  }
  transformSelectProps(field) {
    const props = field?.props || field?.templateOptions || {};
    const selectPropFn = (prop) => typeof prop === "function" ? prop : (o) => o[prop];
    return {
      groupProp: selectPropFn(props.groupProp || "group"),
      labelProp: selectPropFn(props.labelProp || "label"),
      valueProp: selectPropFn(props.valueProp || "value"),
      disabledProp: selectPropFn(props.disabledProp || "disabled")
    };
  }
  dispose() {
    if (this._options) {
      this._options.complete();
      this._options = null;
    }
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }
  observableOf(options, f) {
    this.dispose();
    if (f && f.options && f.options.fieldChanges) {
      this._subscription = f.options.fieldChanges.pipe((0, import_operators.filter)(({
        property,
        type,
        field
      }) => {
        return type === "expressionChanges" && (property.indexOf("templateOptions.options") === 0 || property.indexOf("props.options") === 0) && field === f && Array.isArray(field.props.options) && !!this._options;
      }), (0, import_operators.tap)(() => this._options.next(f.props.options))).subscribe();
    }
    this._options = new import_rxjs.BehaviorSubject(options);
    return this._options.asObservable();
  }
  static {
    this.ɵfac = function FormlySelectOptionsPipe_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlySelectOptionsPipe)();
    };
  }
  static {
    this.ɵpipe = ɵɵdefinePipe({
      name: "formlySelectOptions",
      type: _FormlySelectOptionsPipe,
      pure: true
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlySelectOptionsPipe, [{
    type: Pipe,
    args: [{
      name: "formlySelectOptions",
      standalone: true
    }]
  }], null, null);
})();
var LegacyFormlySelectOptionsPipe = class _LegacyFormlySelectOptionsPipe extends FormlySelectOptionsPipe {
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵLegacyFormlySelectOptionsPipe_BaseFactory;
      return function LegacyFormlySelectOptionsPipe_Factory(__ngFactoryType__) {
        return (ɵLegacyFormlySelectOptionsPipe_BaseFactory || (ɵLegacyFormlySelectOptionsPipe_BaseFactory = ɵɵgetInheritedFactory(_LegacyFormlySelectOptionsPipe)))(__ngFactoryType__ || _LegacyFormlySelectOptionsPipe);
      };
    })();
  }
  static {
    this.ɵpipe = ɵɵdefinePipe({
      name: "formlySelectOptions",
      type: _LegacyFormlySelectOptionsPipe,
      pure: true,
      standalone: false
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LegacyFormlySelectOptionsPipe, [{
    type: Pipe,
    args: [{
      name: "formlySelectOptions",
      standalone: false
    }]
  }], null, null);
})();
var FormlySelectModule = class _FormlySelectModule {
  static {
    this.ɵfac = function FormlySelectModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlySelectModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlySelectModule,
      declarations: [LegacyFormlySelectOptionsPipe],
      exports: [LegacyFormlySelectOptionsPipe]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlySelectModule, [{
    type: NgModule,
    args: [{
      declarations: [LegacyFormlySelectOptionsPipe],
      exports: [LegacyFormlySelectOptionsPipe]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-radio.mjs
function FormlyFieldRadio_ng_template_0_div_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 2);
    ɵɵelement(1, "input", 3);
    ɵɵelementStart(2, "label", 4);
    ɵɵtext(3);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const option_r1 = ctx.$implicit;
    const i_r2 = ctx.index;
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵclassProp("form-check-inline", ctx_r2.props.formCheck === "inline");
    ɵɵadvance();
    ɵɵclassProp("is-invalid", ctx_r2.showError);
    ɵɵproperty("id", ctx_r2.id + "_" + i_r2)("name", ctx_r2.field.name || ctx_r2.id)("value", option_r1.value)("formControl", option_r1.disabled ? ctx_r2.disabledControl : ctx_r2.formControl)("formlyAttributes", ctx_r2.field);
    ɵɵattribute("value", option_r1.value)("aria-describedby", ctx_r2.id + "-formly-validation-error")("aria-invalid", ctx_r2.showError);
    ɵɵadvance();
    ɵɵproperty("for", ctx_r2.id + "_" + i_r2);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", option_r1.label, " ");
  }
}
function FormlyFieldRadio_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, FormlyFieldRadio_ng_template_0_div_0_Template, 4, 14, "div", 1);
    ɵɵpipe(1, "formlySelectOptions");
    ɵɵpipe(2, "async");
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("ngForOf", ɵɵpipeBind1(2, 4, ɵɵpipeBind2(1, 1, ctx_r2.props.options, ctx_r2.field)));
  }
}
var FormlyFieldRadio = class _FormlyFieldRadio extends FieldType2 {
  constructor() {
    super(...arguments);
    this.defaultOptions = {
      props: {
        formCheck: "default"
      }
    };
  }
  get disabledControl() {
    return new UntypedFormControl({
      value: this.formControl.value,
      disabled: true
    });
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyFieldRadio_BaseFactory;
      return function FormlyFieldRadio_Factory(__ngFactoryType__) {
        return (ɵFormlyFieldRadio_BaseFactory || (ɵFormlyFieldRadio_BaseFactory = ɵɵgetInheritedFactory(_FormlyFieldRadio)))(__ngFactoryType__ || _FormlyFieldRadio);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyFieldRadio,
      selectors: [["formly-field-radio"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], ["class", "form-check", 3, "form-check-inline", 4, "ngFor", "ngForOf"], [1, "form-check"], ["type", "radio", 1, "form-check-input", 3, "id", "name", "value", "formControl", "formlyAttributes"], [1, "form-check-label", 3, "for"]],
      template: function FormlyFieldRadio_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyFieldRadio_ng_template_0_Template, 3, 6, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [NgForOf, DefaultValueAccessor, RadioControlValueAccessor, NgControlStatus, FormControlDirective, LegacyFormlyAttributes, AsyncPipe, LegacyFormlySelectOptionsPipe],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldRadio, [{
    type: Component,
    args: [{
      selector: "formly-field-radio",
      template: `
    <ng-template #fieldTypeTemplate>
      <div
        *ngFor="let option of props.options | formlySelectOptions: field | async; let i = index"
        class="form-check"
        [class.form-check-inline]="props.formCheck === 'inline'"
      >
        <input
          type="radio"
          [id]="id + '_' + i"
          class="form-check-input"
          [name]="field.name || id"
          [class.is-invalid]="showError"
          [attr.value]="option.value"
          [value]="option.value"
          [formControl]="option.disabled ? disabledControl : formControl"
          [formlyAttributes]="field"
          [attr.aria-describedby]="id + '-formly-validation-error'"
          [attr.aria-invalid]="showError"
        />
        <label class="form-check-label" [for]="id + '_' + i">
          {{ option.label }}
        </label>
      </div>
    </ng-template>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
function withFormlyFieldRadio() {
  return {
    types: [{
      name: "radio",
      component: FormlyFieldRadio,
      wrappers: ["form-field"]
    }]
  };
}
var FormlyBootstrapRadioModule = class _FormlyBootstrapRadioModule {
  static {
    this.ɵfac = function FormlyBootstrapRadioModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapRadioModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapRadioModule,
      declarations: [FormlyFieldRadio],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule.forChild(withFormlyFieldRadio())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapRadioModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyFieldRadio],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule.forChild(withFormlyFieldRadio())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-checkbox.mjs
var _c02 = (a0, a1) => ({
  "form-check-inline": a0,
  "form-switch": a1
});
function FormlyFieldCheckbox_ng_template_0_label_2_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 6);
    ɵɵtext(1, "*");
    ɵɵelementEnd();
  }
}
function FormlyFieldCheckbox_ng_template_0_label_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "label", 4);
    ɵɵtext(1);
    ɵɵtemplate(2, FormlyFieldCheckbox_ng_template_0_label_2_span_2_Template, 2, 0, "span", 5);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("for", ctx_r0.id);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r0.props.label, " ");
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r0.props.required && ctx_r0.props.hideRequiredMarker !== true);
  }
}
function FormlyFieldCheckbox_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 1);
    ɵɵelement(1, "input", 2);
    ɵɵtemplate(2, FormlyFieldCheckbox_ng_template_0_label_2_Template, 3, 3, "label", 3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngClass", ɵɵpureFunction2(11, _c02, ctx_r0.props.formCheck === "inline" || ctx_r0.props.formCheck === "inline-switch", ctx_r0.props.formCheck === "switch" || ctx_r0.props.formCheck === "inline-switch"));
    ɵɵadvance();
    ɵɵclassProp("is-invalid", ctx_r0.showError)("position-static", ctx_r0.props.formCheck === "nolabel");
    ɵɵproperty("indeterminate", ctx_r0.props.indeterminate && ctx_r0.formControl.value == null)("formControl", ctx_r0.formControl)("formlyAttributes", ctx_r0.field);
    ɵɵattribute("aria-describedby", ctx_r0.id + "-formly-validation-error")("aria-invalid", ctx_r0.showError);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r0.props.formCheck !== "nolabel");
  }
}
var FormlyFieldCheckbox = class _FormlyFieldCheckbox extends FieldType2 {
  constructor() {
    super(...arguments);
    this.defaultOptions = {
      props: {
        indeterminate: true,
        hideLabel: true,
        formCheck: "default"
      }
    };
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyFieldCheckbox_BaseFactory;
      return function FormlyFieldCheckbox_Factory(__ngFactoryType__) {
        return (ɵFormlyFieldCheckbox_BaseFactory || (ɵFormlyFieldCheckbox_BaseFactory = ɵɵgetInheritedFactory(_FormlyFieldCheckbox)))(__ngFactoryType__ || _FormlyFieldCheckbox);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyFieldCheckbox,
      selectors: [["formly-field-checkbox"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], [1, "form-check", 3, "ngClass"], ["type", "checkbox", 1, "form-check-input", 3, "indeterminate", "formControl", "formlyAttributes"], ["class", "form-check-label", 3, "for", 4, "ngIf"], [1, "form-check-label", 3, "for"], ["aria-hidden", "true", 4, "ngIf"], ["aria-hidden", "true"]],
      template: function FormlyFieldCheckbox_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyFieldCheckbox_ng_template_0_Template, 3, 14, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [NgClass, NgIf, CheckboxControlValueAccessor, NgControlStatus, FormControlDirective, LegacyFormlyAttributes],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldCheckbox, [{
    type: Component,
    args: [{
      selector: "formly-field-checkbox",
      template: `
    <ng-template #fieldTypeTemplate>
      <div
        class="form-check"
        [ngClass]="{
          'form-check-inline': props.formCheck === 'inline' || props.formCheck === 'inline-switch',
          'form-switch': props.formCheck === 'switch' || props.formCheck === 'inline-switch',
        }"
      >
        <input
          type="checkbox"
          [class.is-invalid]="showError"
          class="form-check-input"
          [class.position-static]="props.formCheck === 'nolabel'"
          [indeterminate]="props.indeterminate && formControl.value == null"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [attr.aria-describedby]="id + '-formly-validation-error'"
          [attr.aria-invalid]="showError"
        />
        <label *ngIf="props.formCheck !== 'nolabel'" [for]="id" class="form-check-label">
          {{ props.label }}
          <span *ngIf="props.required && props.hideRequiredMarker !== true" aria-hidden="true">*</span>
        </label>
      </div>
    </ng-template>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
function withFormlyFieldCheckbox() {
  return {
    types: [{
      name: "checkbox",
      component: FormlyFieldCheckbox,
      wrappers: ["form-field"]
    }, {
      name: "boolean",
      extends: "checkbox"
    }]
  };
}
var FormlyBootstrapCheckboxModule = class _FormlyBootstrapCheckboxModule {
  static {
    this.ɵfac = function FormlyBootstrapCheckboxModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapCheckboxModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapCheckboxModule,
      declarations: [FormlyFieldCheckbox],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule.forChild(withFormlyFieldCheckbox())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapCheckboxModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyFieldCheckbox],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlyModule.forChild(withFormlyFieldCheckbox())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-multicheckbox.mjs
var _c03 = (a0, a1) => ({
  "form-check-inline": a0,
  "form-switch": a1
});
function FormlyFieldMultiCheckbox_ng_template_0_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 2)(1, "input", 3);
    ɵɵlistener("change", function FormlyFieldMultiCheckbox_ng_template_0_div_0_Template_input_change_1_listener($event) {
      const option_r2 = ɵɵrestoreView(_r1).$implicit;
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onChange(option_r2.value, $event.target.checked));
    });
    ɵɵelementEnd();
    ɵɵelementStart(2, "label", 4);
    ɵɵtext(3);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const option_r2 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵproperty("ngClass", ɵɵpureFunction2(12, _c03, ctx_r2.props.formCheck === "inline" || ctx_r2.props.formCheck === "inline-switch", ctx_r2.props.formCheck === "switch" || ctx_r2.props.formCheck === "inline-switch"));
    ɵɵadvance();
    ɵɵclassProp("is-invalid", ctx_r2.showError);
    ɵɵproperty("id", ctx_r2.id + "_" + i_r4)("value", option_r2.value)("checked", ctx_r2.isChecked(option_r2))("formlyAttributes", ctx_r2.field)("disabled", ctx_r2.formControl.disabled || option_r2.disabled);
    ɵɵattribute("aria-describedby", ctx_r2.id + "-formly-validation-error")("aria-invalid", ctx_r2.showError);
    ɵɵadvance();
    ɵɵproperty("for", ctx_r2.id + "_" + i_r4);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", option_r2.label, " ");
  }
}
function FormlyFieldMultiCheckbox_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, FormlyFieldMultiCheckbox_ng_template_0_div_0_Template, 4, 15, "div", 1);
    ɵɵpipe(1, "formlySelectOptions");
    ɵɵpipe(2, "async");
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("ngForOf", ɵɵpipeBind1(2, 4, ɵɵpipeBind2(1, 1, ctx_r2.props.options, ctx_r2.field)));
  }
}
var FormlyFieldMultiCheckbox = class _FormlyFieldMultiCheckbox extends FieldType2 {
  constructor() {
    super(...arguments);
    this.defaultOptions = {
      props: {
        formCheck: "default"
        // 'default' | 'inline' | 'switch' | 'inline-switch'
      }
    };
  }
  onChange(value, checked) {
    this.formControl.markAsDirty();
    if (this.props.type === "array") {
      this.formControl.patchValue(checked ? [...this.formControl.value || [], value] : [...this.formControl.value || []].filter((o) => o !== value));
    } else {
      this.formControl.patchValue(__spreadProps(__spreadValues({}, this.formControl.value), {
        [value]: checked
      }));
    }
    this.formControl.markAsTouched();
  }
  isChecked(option) {
    const value = this.formControl.value;
    return value && (this.props.type === "array" ? value.indexOf(option.value) !== -1 : value[option.value]);
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyFieldMultiCheckbox_BaseFactory;
      return function FormlyFieldMultiCheckbox_Factory(__ngFactoryType__) {
        return (ɵFormlyFieldMultiCheckbox_BaseFactory || (ɵFormlyFieldMultiCheckbox_BaseFactory = ɵɵgetInheritedFactory(_FormlyFieldMultiCheckbox)))(__ngFactoryType__ || _FormlyFieldMultiCheckbox);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyFieldMultiCheckbox,
      selectors: [["formly-field-multicheckbox"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], ["class", "form-check", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "form-check", 3, "ngClass"], ["type", "checkbox", 1, "form-check-input", 3, "change", "id", "value", "checked", "formlyAttributes", "disabled"], [1, "form-check-label", 3, "for"]],
      template: function FormlyFieldMultiCheckbox_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyFieldMultiCheckbox_ng_template_0_Template, 3, 6, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [NgClass, NgForOf, LegacyFormlyAttributes, AsyncPipe, LegacyFormlySelectOptionsPipe],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldMultiCheckbox, [{
    type: Component,
    args: [{
      selector: "formly-field-multicheckbox",
      template: `
    <ng-template #fieldTypeTemplate>
      <div
        *ngFor="let option of props.options | formlySelectOptions: field | async; let i = index"
        class="form-check"
        [ngClass]="{
          'form-check-inline': props.formCheck === 'inline' || props.formCheck === 'inline-switch',
          'form-switch': props.formCheck === 'switch' || props.formCheck === 'inline-switch',
        }"
      >
        <input
          type="checkbox"
          [id]="id + '_' + i"
          class="form-check-input"
          [class.is-invalid]="showError"
          [value]="option.value"
          [checked]="isChecked(option)"
          [formlyAttributes]="field"
          [disabled]="formControl.disabled || option.disabled"
          [attr.aria-describedby]="id + '-formly-validation-error'"
          [attr.aria-invalid]="showError"
          (change)="onChange(option.value, $any($event.target).checked)"
        />
        <label class="form-check-label" [for]="id + '_' + i">
          {{ option.label }}
        </label>
      </div>
    </ng-template>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
function withFormlyFieldMultiCheckbox() {
  return {
    types: [{
      name: "multicheckbox",
      component: FormlyFieldMultiCheckbox,
      wrappers: ["form-field"]
    }]
  };
}
var FormlyBootstrapMultiCheckboxModule = class _FormlyBootstrapMultiCheckboxModule {
  static {
    this.ɵfac = function FormlyBootstrapMultiCheckboxModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapMultiCheckboxModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapMultiCheckboxModule,
      declarations: [FormlyFieldMultiCheckbox],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule.forChild(withFormlyFieldMultiCheckbox())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapMultiCheckboxModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyFieldMultiCheckbox],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule.forChild(withFormlyFieldMultiCheckbox())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-select.mjs
function FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_option_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "option", 8);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const opt_r1 = ɵɵnextContext().$implicit;
    ɵɵproperty("ngValue", opt_r1.value)("disabled", opt_r1.disabled);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", opt_r1.label, " ");
  }
}
function FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_ng_template_2_option_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "option", 8);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const child_r2 = ctx.$implicit;
    ɵɵproperty("ngValue", child_r2.value)("disabled", child_r2.disabled);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", child_r2.label, " ");
  }
}
function FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "optgroup", 9);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_ng_template_2_option_1_Template, 2, 3, "option", 10);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const opt_r1 = ɵɵnextContext().$implicit;
    ɵɵproperty("label", opt_r1.label);
    ɵɵadvance();
    ɵɵproperty("ngForOf", opt_r1.group);
  }
}
function FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_option_1_Template, 2, 3, "option", 7)(2, FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_ng_template_2_Template, 2, 2, "ng-template", null, 2, ɵɵtemplateRefExtractor);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const opt_r1 = ctx.$implicit;
    const optgroup_r3 = ɵɵreference(3);
    ɵɵadvance();
    ɵɵproperty("ngIf", !opt_r1.group)("ngIfElse", optgroup_r3);
  }
}
function FormlyFieldSelect_ng_template_0_select_0_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_select_0_ng_container_1_ng_container_1_Template, 4, 2, "ng-container", 6);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const opts_r4 = ctx.ngIf;
    ɵɵadvance();
    ɵɵproperty("ngForOf", opts_r4);
  }
}
function FormlyFieldSelect_ng_template_0_select_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "select", 4);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_select_0_ng_container_1_Template, 2, 1, "ng-container", 5);
    ɵɵpipe(2, "formlySelectOptions");
    ɵɵpipe(3, "async");
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r4 = ɵɵnextContext(2);
    ɵɵclassProp("is-invalid", ctx_r4.showError);
    ɵɵproperty("formControl", ctx_r4.formControl)("compareWith", ctx_r4.props.compareWith)("formlyAttributes", ctx_r4.field);
    ɵɵattribute("aria-describedby", ctx_r4.id + "-formly-validation-error")("aria-invalid", ctx_r4.showError);
    ɵɵadvance();
    ɵɵproperty("ngIf", ɵɵpipeBind1(3, 11, ɵɵpipeBind2(2, 8, ctx_r4.props.options, ctx_r4.field)));
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_option_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "option", 13);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r4 = ɵɵnextContext(3);
    ɵɵproperty("ngValue", void 0);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r4.props.placeholder);
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_option_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "option", 8);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const opt_r6 = ɵɵnextContext().$implicit;
    ɵɵproperty("ngValue", opt_r6.value)("disabled", opt_r6.disabled);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", opt_r6.label, " ");
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_ng_template_2_option_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "option", 8);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const child_r7 = ctx.$implicit;
    ɵɵproperty("ngValue", child_r7.value)("disabled", child_r7.disabled);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", child_r7.label, " ");
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "optgroup", 9);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_ng_template_2_option_1_Template, 2, 3, "option", 10);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const opt_r6 = ɵɵnextContext().$implicit;
    ɵɵproperty("label", opt_r6.label);
    ɵɵadvance();
    ɵɵproperty("ngForOf", opt_r6.group);
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_option_1_Template, 2, 3, "option", 7)(2, FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_ng_template_2_Template, 2, 2, "ng-template", null, 2, ɵɵtemplateRefExtractor);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const opt_r6 = ctx.$implicit;
    const optgroup_r8 = ɵɵreference(3);
    ɵɵadvance();
    ɵɵproperty("ngIf", !opt_r6.group)("ngIfElse", optgroup_r8);
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_ng_container_1_Template, 4, 2, "ng-container", 6);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const opts_r9 = ctx.ngIf;
    ɵɵadvance();
    ɵɵproperty("ngForOf", opts_r9);
  }
}
function FormlyFieldSelect_ng_template_0_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "select", 11);
    ɵɵtemplate(1, FormlyFieldSelect_ng_template_0_ng_template_1_option_1_Template, 2, 2, "option", 12)(2, FormlyFieldSelect_ng_template_0_ng_template_1_ng_container_2_Template, 2, 1, "ng-container", 5);
    ɵɵpipe(3, "formlySelectOptions");
    ɵɵpipe(4, "async");
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r4 = ɵɵnextContext(2);
    ɵɵclassProp("is-invalid", ctx_r4.showError);
    ɵɵproperty("formControl", ctx_r4.formControl)("compareWith", ctx_r4.props.compareWith)("formlyAttributes", ctx_r4.field);
    ɵɵattribute("aria-describedby", ctx_r4.id + "-formly-validation-error")("aria-invalid", ctx_r4.showError);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r4.props.placeholder);
    ɵɵadvance();
    ɵɵproperty("ngIf", ɵɵpipeBind1(4, 12, ɵɵpipeBind2(3, 9, ctx_r4.props.options, ctx_r4.field)));
  }
}
function FormlyFieldSelect_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, FormlyFieldSelect_ng_template_0_select_0_Template, 4, 13, "select", 3)(1, FormlyFieldSelect_ng_template_0_ng_template_1_Template, 5, 14, "ng-template", null, 1, ɵɵtemplateRefExtractor);
  }
  if (rf & 2) {
    const singleSelect_r10 = ɵɵreference(2);
    const ctx_r4 = ɵɵnextContext();
    ɵɵproperty("ngIf", ctx_r4.props.multiple)("ngIfElse", singleSelect_r10);
  }
}
var FormlyFieldSelect = class _FormlyFieldSelect extends FieldType2 {
  constructor() {
    super(...arguments);
    this.defaultOptions = {
      props: {
        compareWith(o1, o2) {
          return o1 === o2;
        }
      }
    };
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵFormlyFieldSelect_BaseFactory;
      return function FormlyFieldSelect_Factory(__ngFactoryType__) {
        return (ɵFormlyFieldSelect_BaseFactory || (ɵFormlyFieldSelect_BaseFactory = ɵɵgetInheritedFactory(_FormlyFieldSelect)))(__ngFactoryType__ || _FormlyFieldSelect);
      };
    })();
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyFieldSelect,
      selectors: [["formly-field-select"]],
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], ["singleSelect", ""], ["optgroup", ""], ["class", "form-select", "multiple", "", 3, "formControl", "compareWith", "is-invalid", "formlyAttributes", 4, "ngIf", "ngIfElse"], ["multiple", "", 1, "form-select", 3, "formControl", "compareWith", "formlyAttributes"], [4, "ngIf"], [4, "ngFor", "ngForOf"], [3, "ngValue", "disabled", 4, "ngIf", "ngIfElse"], [3, "ngValue", "disabled"], [3, "label"], [3, "ngValue", "disabled", 4, "ngFor", "ngForOf"], [1, "form-select", 3, "formControl", "compareWith", "formlyAttributes"], [3, "ngValue", 4, "ngIf"], [3, "ngValue"]],
      template: function FormlyFieldSelect_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyFieldSelect_ng_template_0_Template, 3, 2, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [NgForOf, NgIf, NgSelectOption, ɵNgSelectMultipleOption, SelectControlValueAccessor, SelectMultipleControlValueAccessor, NgControlStatus, FormControlDirective, LegacyFormlyAttributes, AsyncPipe, LegacyFormlySelectOptionsPipe],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyFieldSelect, [{
    type: Component,
    args: [{
      selector: "formly-field-select",
      template: `
    <ng-template #fieldTypeTemplate>
      <select
        *ngIf="props.multiple; else singleSelect"
        class="form-select"
        multiple
        [formControl]="formControl"
        [compareWith]="props.compareWith"
        [class.is-invalid]="showError"
        [formlyAttributes]="field"
        [attr.aria-describedby]="id + '-formly-validation-error'"
        [attr.aria-invalid]="showError"
      >
        <ng-container *ngIf="props.options | formlySelectOptions: field | async as opts">
          <ng-container *ngFor="let opt of opts">
            <option *ngIf="!opt.group; else optgroup" [ngValue]="opt.value" [disabled]="opt.disabled">
              {{ opt.label }}
            </option>
            <ng-template #optgroup>
              <optgroup [label]="opt.label">
                <option *ngFor="let child of opt.group" [ngValue]="child.value" [disabled]="child.disabled">
                  {{ child.label }}
                </option>
              </optgroup>
            </ng-template>
          </ng-container>
        </ng-container>
      </select>

      <ng-template #singleSelect>
        <select
          class="form-select"
          [formControl]="formControl"
          [compareWith]="props.compareWith"
          [class.is-invalid]="showError"
          [formlyAttributes]="field"
          [attr.aria-describedby]="id + '-formly-validation-error'"
          [attr.aria-invalid]="showError"
        >
          <option *ngIf="props.placeholder" [ngValue]="undefined">{{ props.placeholder }}</option>
          <ng-container *ngIf="props.options | formlySelectOptions: field | async as opts">
            <ng-container *ngFor="let opt of opts">
              <option *ngIf="!opt.group; else optgroup" [ngValue]="opt.value" [disabled]="opt.disabled">
                {{ opt.label }}
              </option>
              <ng-template #optgroup>
                <optgroup [label]="opt.label">
                  <option *ngFor="let child of opt.group" [ngValue]="child.value" [disabled]="child.disabled">
                    {{ child.label }}
                  </option>
                </optgroup>
              </ng-template>
            </ng-container>
          </ng-container>
        </select>
      </ng-template>
    </ng-template>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, null);
})();
function withFormlyFieldSelect() {
  return {
    types: [{
      name: "select",
      component: FormlyFieldSelect,
      wrappers: ["form-field"]
    }, {
      name: "enum",
      extends: "select"
    }]
  };
}
var FormlyBootstrapSelectModule = class _FormlyBootstrapSelectModule {
  static {
    this.ɵfac = function FormlyBootstrapSelectModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapSelectModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapSelectModule,
      declarations: [FormlyFieldSelect],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule.forChild(withFormlyFieldSelect())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapSelectModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyFieldSelect],
      imports: [CommonModule, ReactiveFormsModule, FormlyBootstrapFormFieldModule, FormlySelectModule, FormlyModule.forChild(withFormlyFieldSelect())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap-addons.mjs
var _c04 = ["fieldTypeTemplate"];
function FormlyWrapperAddons_ng_template_0_div_1_i_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 7);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("ngClass", ctx_r1.props.addonLeft.class);
  }
}
function FormlyWrapperAddons_ng_template_0_div_1_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.props.addonLeft.text);
  }
}
function FormlyWrapperAddons_ng_template_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 4);
    ɵɵlistener("click", function FormlyWrapperAddons_ng_template_0_div_1_Template_div_click_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.addonLeftClick($event));
    });
    ɵɵtemplate(1, FormlyWrapperAddons_ng_template_0_div_1_i_1_Template, 1, 1, "i", 5)(2, FormlyWrapperAddons_ng_template_0_div_1_span_2_Template, 2, 1, "span", 6);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵclassProp("input-group-btn", ctx_r1.props.addonLeft.onClick);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.props.addonLeft.class);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.props.addonLeft.text);
  }
}
function FormlyWrapperAddons_ng_template_0_div_4_i_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 7);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("ngClass", ctx_r1.props.addonRight.class);
  }
}
function FormlyWrapperAddons_ng_template_0_div_4_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.props.addonRight.text);
  }
}
function FormlyWrapperAddons_ng_template_0_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 4);
    ɵɵlistener("click", function FormlyWrapperAddons_ng_template_0_div_4_Template_div_click_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.addonRightClick($event));
    });
    ɵɵtemplate(1, FormlyWrapperAddons_ng_template_0_div_4_i_1_Template, 1, 1, "i", 5)(2, FormlyWrapperAddons_ng_template_0_div_4_span_2_Template, 2, 1, "span", 6);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵclassProp("input-group-btn", ctx_r1.props.addonRight.onClick);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.props.addonRight.class);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.props.addonRight.text);
  }
}
function FormlyWrapperAddons_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 2);
    ɵɵtemplate(1, FormlyWrapperAddons_ng_template_0_div_1_Template, 3, 4, "div", 3);
    ɵɵelementContainer(2, null, 1);
    ɵɵtemplate(4, FormlyWrapperAddons_ng_template_0_div_4_Template, 3, 4, "div", 3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵclassProp("has-validation", ctx_r1.showError);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.props.addonLeft);
    ɵɵadvance(3);
    ɵɵproperty("ngIf", ctx_r1.props.addonRight);
  }
}
var FormlyWrapperAddons = class _FormlyWrapperAddons extends FieldWrapper {
  set content(templateRef) {
    if (templateRef && this.hostContainerRef) {
      this.hostContainerRef.createEmbeddedView(templateRef);
    }
  }
  constructor(hostContainerRef) {
    super();
    this.hostContainerRef = hostContainerRef;
  }
  addonRightClick($event) {
    this.props.addonRight.onClick?.(this.field, $event);
  }
  addonLeftClick($event) {
    this.props.addonLeft.onClick?.(this.field, $event);
  }
  static {
    this.ɵfac = function FormlyWrapperAddons_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyWrapperAddons)(ɵɵdirectiveInject(ViewContainerRef));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FormlyWrapperAddons,
      selectors: [["formly-wrapper-addons"]],
      viewQuery: function FormlyWrapperAddons_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(_c04, 7);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.content = _t.first);
        }
      },
      standalone: false,
      features: [ɵɵInheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["fieldTypeTemplate", ""], ["fieldComponent", ""], [1, "input-group"], ["class", "input-group-text", 3, "input-group-btn", "click", 4, "ngIf"], [1, "input-group-text", 3, "click"], [3, "ngClass", 4, "ngIf"], [4, "ngIf"], [3, "ngClass"]],
      template: function FormlyWrapperAddons_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵtemplate(0, FormlyWrapperAddons_ng_template_0_Template, 5, 4, "ng-template", null, 0, ɵɵtemplateRefExtractor);
        }
      },
      dependencies: [NgClass, NgIf],
      styles: ["formly-wrapper-form-field .input-group-btn{cursor:pointer}\n"],
      encapsulation: 2
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyWrapperAddons, [{
    type: Component,
    args: [{
      selector: "formly-wrapper-addons",
      encapsulation: ViewEncapsulation.None,
      template: '<ng-template #fieldTypeTemplate>\n  <div class="input-group" [class.has-validation]="showError">\n    <div\n      class="input-group-text"\n      *ngIf="props.addonLeft"\n      [class.input-group-btn]="props.addonLeft.onClick"\n      (click)="addonLeftClick($event)"\n    >\n      <i [ngClass]="props.addonLeft.class" *ngIf="props.addonLeft.class"></i>\n      <span *ngIf="props.addonLeft.text">{{ props.addonLeft.text }}</span>\n    </div>\n    <ng-container #fieldComponent></ng-container>\n    <div\n      class="input-group-text"\n      *ngIf="props.addonRight"\n      [class.input-group-btn]="props.addonRight.onClick"\n      (click)="addonRightClick($event)"\n    >\n      <i [ngClass]="props.addonRight.class" *ngIf="props.addonRight.class"></i>\n      <span *ngIf="props.addonRight.text">{{ props.addonRight.text }}</span>\n    </div>\n  </div>\n</ng-template>\n',
      styles: ["formly-wrapper-form-field .input-group-btn{cursor:pointer}\n"]
    }]
  }], () => [{
    type: ViewContainerRef
  }], {
    content: [{
      type: ViewChild,
      args: ["fieldTypeTemplate", {
        static: true
      }]
    }]
  });
})();
function addonsExtension(field) {
  if (!field.props || field.wrappers && field.wrappers.indexOf("addons") !== -1) {
    return;
  }
  if (field.props.addonLeft || field.props.addonRight) {
    field.wrappers = [...field.wrappers || [], "addons"];
  }
}
function withFormlyWrapperAddons() {
  return {
    wrappers: [{
      name: "addons",
      component: FormlyWrapperAddons
    }],
    extensions: [{
      name: "addons",
      extension: {
        postPopulate: addonsExtension
      }
    }]
  };
}
var FormlyBootstrapAddonsModule = class _FormlyBootstrapAddonsModule {
  static {
    this.ɵfac = function FormlyBootstrapAddonsModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapAddonsModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapAddonsModule,
      declarations: [FormlyWrapperAddons],
      imports: [CommonModule, ReactiveFormsModule, FormlyModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, ReactiveFormsModule, FormlyModule.forChild(withFormlyWrapperAddons())]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapAddonsModule, [{
    type: NgModule,
    args: [{
      declarations: [FormlyWrapperAddons],
      imports: [CommonModule, ReactiveFormsModule, FormlyModule.forChild(withFormlyWrapperAddons())]
    }]
  }], null, null);
})();

// node_modules/@ngx-formly/bootstrap/fesm2022/ngx-formly-bootstrap.mjs
function withFormlyBootstrap() {
  return [withFormlyFormField(), withFormlyFieldInput(), withFormlyFieldTextArea(), withFormlyFieldRadio(), withFormlyFieldCheckbox(), withFormlyFieldMultiCheckbox(), withFormlyFieldSelect(), withFormlyWrapperAddons()];
}
var FormlyBootstrapModule = class _FormlyBootstrapModule {
  static {
    this.ɵfac = function FormlyBootstrapModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FormlyBootstrapModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FormlyBootstrapModule,
      imports: [FormlyBootstrapFormFieldModule, FormlyBootstrapInputModule, FormlyBootstrapTextAreaModule, FormlyBootstrapRadioModule, FormlyBootstrapCheckboxModule, FormlyBootstrapMultiCheckboxModule, FormlyBootstrapSelectModule, FormlyBootstrapAddonsModule]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [FormlyBootstrapFormFieldModule, FormlyBootstrapInputModule, FormlyBootstrapTextAreaModule, FormlyBootstrapRadioModule, FormlyBootstrapCheckboxModule, FormlyBootstrapMultiCheckboxModule, FormlyBootstrapSelectModule, FormlyBootstrapAddonsModule]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FormlyBootstrapModule, [{
    type: NgModule,
    args: [{
      imports: [FormlyBootstrapFormFieldModule, FormlyBootstrapInputModule, FormlyBootstrapTextAreaModule, FormlyBootstrapRadioModule, FormlyBootstrapCheckboxModule, FormlyBootstrapMultiCheckboxModule, FormlyBootstrapSelectModule, FormlyBootstrapAddonsModule]
    }]
  }], null, null);
})();
export {
  FormlyBootstrapModule,
  withFormlyBootstrap
};
//# sourceMappingURL=@ngx-formly_bootstrap.js.map
