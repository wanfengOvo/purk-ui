import React, { useState, useMemo } from 'react';
import styles from './index.module.less';

// --- 你提供的 Props Interface (保持不变) ---
interface SelectProps {
  options: Array<{
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
    children?: Array<{
      label: React.ReactNode;
      value: string | number;
      disabled?: boolean;
    }>;
  }>;
  value: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  size?: 'small' | 'large' | 'default';
  disabled?: boolean;
  mode?: 'tags' | 'multiple';
  multiple?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onBlur?: () => void;
}
// --- ----------------------- ---


/**
 * 展平 options 数组（包括 children）
 */
function flattenOptions(options: SelectProps['options']) {
  const result: Array<{
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
  }> = [];

  options.forEach((opt) => {
    if (opt.children) {
      // 如果有子选项，也把它们展平
      result.push(...opt.children);
    } else {
      result.push(opt);
    }
  });
  return result;
}


export default function Select(props: SelectProps) {
  const {
    options,
    value,
    onChange,
    disabled,
    mode,
    multiple,
    prefix,
    suffix,
    placeholder,
    size = 'default',
    onBlur,
  } = props;

  const [isFocused, setIsFocused] = useState(false);

  // 确定是否为多选模式
  const isMultiple = multiple || mode === 'multiple' || mode === 'tags';

  // --- 关键改动 1：创建值映射表 ---
  // 创建一个 Map，键是 value 的 string 形式，值是 value 的原始形式 (number 或 string)
  // 例如：{ "10": 10, "apple": "apple" }
  const allOptionsMap = useMemo(() => {
    const map = new Map<string, string | number>();
    flattenOptions(options).forEach((opt) => {
      map.set(String(opt.value), opt.value);
    });
    return map;
  }, [options]);


  // --- 事件处理 ---

  /**
   * 处理原生 <select> 的 onChange 事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMultiple) {
      // 1. 获取所有选中的 string 值
      const selectedStringValues = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      
      // 2. 将 string 值转换回原始的 (string | number)[]
      const originalValues = selectedStringValues.map(
        // 从 Map 中查找原始值，如果找不到(理论上不应该)，则返回 string
        (strVal) => allOptionsMap.get(strVal) ?? strVal
      );
      
      // 3. 调用父组件的 onChange
      onChange(originalValues);

    } else {
      // 1. 获取选中的 string 值
      const selectedStringValue = e.target.value;

      // 2. 将 string 值转换回原始的 (string | number)
      const originalValue = allOptionsMap.get(selectedStringValue) ?? selectedStringValue;

      // 3. 调用父组件的 onChange
      onChange(originalValue);
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // --- 渲染逻辑 ---
  const renderOptions = (opts: SelectProps['options']) => {
    return opts.map((option, index) => {
      if (option.children) {
        return (
          <optgroup
            label={String(option.label)}
            key={`${String(option.label)}-${index}`}
            disabled={option.disabled}
          >
            {option.children.map((child) => (
              <option
                key={child.value}
                value={child.value} // 这里是 string | number
                disabled={child.disabled}
              >
                {child.label}
              </option>
            ))}
          </optgroup>
        );
      }
      return (
        <option
          key={option.value}
          value={option.value} // 这里是 string | number
          disabled={option.disabled}
        >
          {option.label}
        </option>
      );
    });
  };

  // --- 动态 Class ---
  const wrapperClasses = [
    styles.selectWrapper,
    styles[`size-${size}`],
    isFocused ? styles.focused : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const selectClasses = [
    styles.selectElement,
    styles[`size-${size}`],
    prefix ? styles.withPrefix : '',
    suffix ? styles.withSuffix : '',
  ]
    .filter(Boolean)
    .join(' ');

  // --- 关键改动 2：将 value 转换为 string | string[] ---
  // 这是传递给原生 <select> 的值，它必须是 string 或 string[]
  const internalValue = React.useMemo(() => {
    const v = value ?? (isMultiple ? [] : '');
    
    if (Array.isArray(v)) {
      // 将 (string | number)[] 转换为 string[]
      return v.map(String);
    }
    // 将 string | number 转换为 string
    return String(v);
  }, [value, isMultiple]);


  return (
    <div className={wrapperClasses}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <select
        className={selectClasses}
        // 使用转换后的 internalValue
        value={internalValue} 
        multiple={isMultiple}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {placeholder && !isMultiple && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {renderOptions(options)}
      </select>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
      {!isMultiple && !suffix && <span className={styles.arrow}></span>}
    </div>
  );
}