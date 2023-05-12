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
      className="p-2 hover:bg-gray-800 cursor-pointer"
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
    <div className="relative w-full h-auto">
      <input
        maxLength={maxLength}
        className={className}
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

      {showList && (
        <div
          onTransitionEnd={() => {
            if (!showListWithOpacity) {
              setShowList(false);
            }
          }}
          className={clsx(
            `max-h-96 w-full shadow-lg absolute top-full left-0 bg-gray-900 py-1 overflow-y-auto transition-opacity duration-500 ease-out`,
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
