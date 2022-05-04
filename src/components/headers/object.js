import React, { useContext } from "react";
import GlobalContext from "../../context/globalContext";

export function ObjectHeader() {
  const {objectName, setObjectName} = useContext(GlobalContext);

  return (
    <div className="flex flex-row border h-16 bg-white justify-between">
      <div className="md:flex hidden md:flex-row ml-4 items-center">
        <h4 className="ml-2 text-normal font-normal">Klientai</h4>
        <p className="pl-2 text-gray-600">/</p>
        <h4 className="ml-2  text-normal font-normal">
          {objectName}
        </h4>
      </div>
      <div className="flex flex-row items-center">
        <button
          type="submit"
          className="hidden sm:w-40 sm:h-10 rounded sm:flex mr-2 mt-2 mb-1 justify-center py-2 px-4 border border-transparent drop-shadow shadow text-sm font-light text-black font-montserrat hover:shadow-none bg-gray-200 focus:outline-none"
        >
          Atšaukti
        </button>
        <button
          type="submit"
          className="hidden sm:w-40 sm:h-10 rounded sm:flex mr-2 mt-2 mb-1 justify-center py-2 px-4 border border-transparent drop-shadow shadow text-sm font-light text-white font-montserrat hover:shadow-none bg-slate-600 focus:outline-none"
        >
          Įšsaugoti
        </button>
      </div>
    </div>
  );
}
