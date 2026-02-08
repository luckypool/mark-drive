import { describe, it, expect } from 'vitest';
import { flattenStyle } from './flattenStyle';

describe('flattenStyle', () => {
  it('should return undefined for falsy values', () => {
    expect(flattenStyle(undefined)).toBeUndefined();
    expect(flattenStyle(null)).toBeUndefined();
    expect(flattenStyle(false)).toBeUndefined();
    expect(flattenStyle(0)).toBeUndefined();
    expect(flattenStyle('')).toBeUndefined();
  });

  it('should return the object as-is for a plain style object', () => {
    const style = { color: 'red', fontSize: '16px' };
    expect(flattenStyle(style)).toEqual(style);
  });

  it('should flatten an array of style objects', () => {
    const result = flattenStyle([{ color: 'red' }, { fontSize: '16px' }]);
    expect(result).toEqual({ color: 'red', fontSize: '16px' });
  });

  it('should handle later values overriding earlier ones', () => {
    const result = flattenStyle([{ color: 'red' }, { color: 'blue' }]);
    expect(result).toEqual({ color: 'blue' });
  });

  it('should filter out falsy entries in arrays', () => {
    const result = flattenStyle([{ color: 'red' }, false, null, undefined, { fontSize: '16px' }]);
    expect(result).toEqual({ color: 'red', fontSize: '16px' });
  });

  it('should handle nested arrays', () => {
    const result = flattenStyle([[{ color: 'red' }], { fontSize: '16px' }]);
    expect(result).toEqual({ color: 'red', fontSize: '16px' });
  });

  it('should handle empty arrays', () => {
    const result = flattenStyle([]);
    expect(result).toEqual({});
  });
});
