import React, {Fragment} from 'react';

import {Listbox, Transition} from '@headlessui/react';

import Nullable from 'components/atom/Nullable';

import {identity} from 'crocks';

const Box = ({
  Label,
  ContentContainer,
  label = '',
  twLabel,
  Button,
  Options,
  Option, optionClassNameFn,
  children,
  value,
  onChange,
  displayValue = identity,
  multiple,
  placeholder,
  ...props
}) => {
  // console.log('selectbox initial value', value);

  const onChangeValue = (e) => {
    // console.log(e);
    onChange({value: e.props.value, name: e.props.children})
    // onChange(e.props.value)
  };
  
  return (
    <Listbox value={value} onChange={onChangeValue} {...props}>
      {({open}) => (
        <div>
          <Nullable on={label}><Label className={twLabel}>{label}</Label></Nullable>
          <ContentContainer>
            <Button displayName={displayValue(value)} placeholder={placeholder} />
            {children && (
              <Transition
                show={open}
                as={Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                {children && (
                  <Options>
                    {children.map(component => (
                      <Option
                        {...component.props}
                        value={component}
                        key={component?.key || component?.props?.key || component.props.children}
                        selected={
                          multiple
                            ? value.includes(component.props.children)
                              ? displayValue(component.props.children)
                              : ''
                            : displayValue(value)
                        }
                        className={optionClassNameFn}
                      />
                    ))}
                  </Options>
                )}
              </Transition>
            )}
          </ContentContainer>
        </div>
      )}
    </Listbox>
  )
}

export default Box;
