import React from 'react';
import {
  Flex,
  FlexItem,
  TextInputTypes,
  Button,
  ButtonVariant,
  ButtonType,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon, GripVerticalIcon } from '@patternfly/react-icons/dist/esm/icons';
import { InputField } from 'formik-pf';
import {
  TextColumnItemProps,
  TextColumnFieldChildParameterProps,
  MergeNewValueUtil,
} from './text-column-types';

export type TextColumntItemContentProps = TextColumnItemProps & {
  previewDropRef: (node) => void | null;
  dragRef: (node) => void | null;
  opacity: number;
};

const DEFAULT_CHILDREN = (
  props: TextColumnFieldChildParameterProps,
  mergeNewValue: MergeNewValueUtil,
) => {
  const { name, onChange, isReadOnly, placeholder } = props;

  return (
    <InputField
      disabled={isReadOnly}
      placeholder={placeholder}
      name={name}
      type={TextInputTypes.text}
      onChange={(e) => {
        if (onChange) {
          const values = mergeNewValue(e.target.value as string);
          onChange(values);
        }
      }}
    />
  );
};

const TextColumnItemContent: React.FC<TextColumntItemContentProps> = ({
  name,
  dndEnabled,
  children = DEFAULT_CHILDREN,
  idx,
  isReadOnly,
  placeholder,
  onChange,
  arrayHelpers,
  rowValues,
  disableDeleteRow,
  tooltip,
  previewDropRef,
  dragRef,
  opacity,
}) => {
  const mergeNewValue: MergeNewValueUtil = (newValue) => {
    const values: string[] = [...rowValues];
    values[idx] = newValue;

    return values;
  };

  const removeButton = (
    <Tooltip content={tooltip || 'Remove'}>
      <Button
        data-test={`${name}-${idx}-remove-button`}
        aria-label={tooltip || 'Remove'}
        variant={ButtonVariant.plain}
        type={ButtonType.button}
        isInline
        isDisabled={disableDeleteRow}
        onClick={() => {
          arrayHelpers.remove(idx);
          if (onChange) {
            const values = [...rowValues];
            values.splice(idx, 1);
            onChange(values);
          }
        }}
      >
        <MinusCircleIcon />
      </Button>
    </Tooltip>
  );

  return (
    <div ref={previewDropRef} style={{ opacity }}>
      <Flex
        alignItems={{ default: 'alignItemsFlexStart' }}
        style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}
      >
        {dndEnabled && (
          <FlexItem style={{ cursor: 'move' }}>
            <div ref={dragRef} data-test="drag-and-drop-handle">
              <GripVerticalIcon />
            </div>
          </FlexItem>
        )}
        <FlexItem grow={{ default: 'grow' }}>
          {children(
            { name: `${name}.${idx}`, isReadOnly, placeholder, onChange, removeButton },
            mergeNewValue,
          )}
        </FlexItem>
        {
          <FlexItem style={{ minWidth: 'var(--pf-v5-global--spacer--2xl)' }}>
            {!isReadOnly && removeButton}
          </FlexItem>
        }
      </Flex>
    </div>
  );
};

export default TextColumnItemContent;
