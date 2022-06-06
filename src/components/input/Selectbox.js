import React, {useState, useCallback, useEffect} from "react";

import {generate} from "shortid";
import {ChevronDownIcon} from "@heroicons/react/outline";

const Selectbox = ({value, setValue, selectedValue, title, twSelect}) => {
  const onValueChangeHandler = useCallback((event) => {
    setValue(event.currentTarget.value);
  }, [selectedValue]);

  useEffect(() => {
    setValue(selectedValue ? selectedValue : String(value[0].value))
  }, []);

  return (
    <div className={`flex flex-col ${twSelect}`}>
      <label className={"text-gray-600"}>{title}</label>
      <div className={`relative mt-1`}>
        <ChevronDownIcon className={"absolute z-10 right-2 top-2 text-gray-300"} height={20} width={20} />
        <select
          className={`p-1 border border-gray-300 rounded-sm w-full appearance-none relative focus:outline-none text-gray-600`}
          onChange={onValueChangeHandler}
          value={selectedValue}
        >
          {value.map(({key, value}) => (
            <option key={generate()} value={value}> {key} </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Selectbox;