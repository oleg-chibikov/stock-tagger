import { Styleable } from '@components/core/Styleable';
import clsx from 'clsx';
import React, { FunctionComponent, useEffect, useState } from 'react';
type StringOrNumber = string | number | null;
interface ComboBoxItem {
  label: string;
  value: StringOrNumber;
}

interface ComboBoxProps extends Styleable {
  items: ComboBoxItem[];
  onSelect: (item: StringOrNumber) => void;
  placeholder?: string;
  value?: StringOrNumber;
  enableSearch?: boolean;
  editable?: boolean;
  listClassName?: string;
  isLoading?: boolean;
  maxLength?: number;
  isResizable?: boolean;
  rows?: number;
}
const getDisplayNameByValue = (
  items: ComboBoxItem[],
  value?: StringOrNumber
): string =>
  value
    ? items.find((item) => item.value === value)?.label || value.toString()
    : '';

const ComboBox: FunctionComponent<ComboBoxProps> = ({
  items,
  onSelect,
  placeholder,
  value,
  enableSearch = false,
  editable = true,
  listClassName,
  className,
  maxLength,
  isResizable,
  rows = 1,
}: ComboBoxProps) => {
  const [inputValue, setInputValue] = useState(
    getDisplayNameByValue(items, value)
  );
  useEffect(() => {
    setInputValue(getDisplayNameByValue(items, value));
  }, [items, value]);
  const [showListWithOpacity, setShowListWithOpacity] = useState(false);
  const [showList, setShowList] = useState(false);

  let timeout: NodeJS.Timeout;

  const handleSelect = (item: ComboBoxItem) => {
    setInputValue(item.label);
    clearTimeout(timeout);
    setShowListWithOpacity(false);
    onSelect(item.value);
  };

  const renderItem = ({ item }: { item: ComboBoxItem }) => (
    <div
      onClick={() => (showListWithOpacity ? handleSelect(item) : undefined)}
      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 cursor-pointer border-gray-900 border-y-2 border-solid"
    >
      {item.label}
    </div>
  );

  const filterData = !enableSearch
    ? items
    : items.filter((item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      );

  return (
    <div className={clsx('flex relative w-full h-auto', className)}>
      <textarea
        maxLength={maxLength}
        className={isResizable ? undefined : 'resize-none'}
        rows={rows}
        onChange={(event) => {
          setInputValue(event.target.value);
          onSelect(event.target.value as StringOrNumber); // StringOrNumber must be string when ComboBox is editable
        }}
        value={inputValue}
        readOnly={!editable}
        onFocus={() => {
          clearTimeout(timeout);
          setShowList(true);
          // timeout is needed to make sure visibility starts animating when the element is already displayed
          setTimeout(() => {
            setShowListWithOpacity(true);
          }, 10);
        }}
        onBlur={() => {
          clearTimeout(timeout);
          timeout = setTimeout(() => setShowListWithOpacity(false), 250);
        }}
        placeholder={placeholder}
      />

      <div className="absolute top-0 right-0 h-full flex items-center pointer-events-none">
        <svg
          className={clsx(
            'w-4 h-4 mr-2 text-gray-600 transition-transform',
            showListWithOpacity && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {showList && (
        <div
          onTransitionEnd={() => {
            if (!showListWithOpacity) {
              setShowList(false);
            }
          }}
          className={clsx(
            `max-h-96 w-full shadow-lg absolute top-full left-0 overflow-y-auto transition-opacity duration-500 ease-out`,
            showListWithOpacity ? 'opacity-100' : 'opacity-0',
            listClassName
          )}
        >
          {filterData.map((item, index) => (
            <React.Fragment key={index}>{renderItem({ item })}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export type { StringOrNumber, ComboBoxProps, ComboBoxItem };
export { ComboBox };
