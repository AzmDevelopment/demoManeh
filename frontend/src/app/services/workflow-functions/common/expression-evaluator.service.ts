import { Injectable } from '@angular/core';

/**
 * Service to evaluate dynamic expressions from JSON configurations
 * Handles hideExpression, expressionProperties, and other dynamic behaviors
 */
@Injectable({
  providedIn: 'root'
})
export class ExpressionEvaluatorService {

  /**
   * Evaluate expression strings from JSON config
   * @param expr - Expression string (e.g., "model.field === 'value'")
   * @param model - Current form model data
   * @returns Evaluation result
   */
  evaluateExpression(expr: string, model: any): any {
    if (!expr || !model) return false;

    // Handle negation: !model.fieldName
    if (expr.startsWith('!model.')) {
      const fieldName = expr.substring(7);
      return !model[fieldName];
    }

    // Handle inequality: model.field !== 'value'
    const inequalityMatch = expr.match(/model\.(\w+)\s*!==\s*'([^']+)'/);
    if (inequalityMatch) {
      const [, fieldName, value] = inequalityMatch;
      return model[fieldName] !== value;
    }

    // Handle equality: model.field === 'value'
    const equalityMatch = expr.match(/model\.(\w+)\s*===\s*'([^']+)'/);
    if (equalityMatch) {
      const [, fieldName, value] = equalityMatch;
      return model[fieldName] === value;
    }

    // Handle ternary: model.field ? 'value1' : 'value2'
    const ternaryMatch = expr.match(/model\.(\w+)\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/);
    if (ternaryMatch) {
      const [, fieldName, trueValue, falseValue] = ternaryMatch;
      return model[fieldName] ? trueValue : falseValue;
    }

    // Handle array includes: model.field && ['A', 'B'].includes(model.field)
    const includesMatch = expr.match(/model\.(\w+)\s*&&\s*\[([^\]]+)\]\.includes\(model\.\w+\)/);
    if (includesMatch) {
      const [, fieldName, arrayStr] = includesMatch;
      const values = arrayStr.split(',').map(s => s.trim().replace(/'/g, ''));
      return model[fieldName] && values.includes(model[fieldName]);
    }

    return false;
  }

  /**
   * Evaluate expression properties for a field
   * Converts templateOptions.property to props.property format
   */
  evaluateExpressionProperties(
    expressionProperties: Record<string, string>,
    model: any
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [prop, expr] of Object.entries(expressionProperties)) {
      const formlyProp = prop.replace('templateOptions.', 'props.');
      result[formlyProp] = this.evaluateExpression(expr, model);
    }

    return result;
  }
}
