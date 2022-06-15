import React from "react";
import {Combobox} from "@headlessui/react";

const Options = (props) => (
  <Combobox.Options className="absolute w-1/2 z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" {...props}/>
);

export default Options;
