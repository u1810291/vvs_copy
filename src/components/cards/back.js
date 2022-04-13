import React from "react";

export function BackCard() {
  return (
    <div
      href="#"
      className="flex flex-row border w-full h-16 bg-white justify-between hover:shadow items-center"
    >
      <div className="flex flex-row items-center">
        <div className="flex rounded-full border-4 border-red-600 bg-white w-8 h-8 ml-6 text-black text-sm font-normal justify-center items-center">
          <p className="flex">T3</p>
        </div>
        <div className="flex flex-col ml-4">
          <p className="text-xs text-black">Įvykis: Spindulio Nr. X sabotažas</p>
          <p className="text-xs">Vilniaus, A Goštauto g.</p>
        </div>
      </div>
      <div className="flex">
        <button className="flex justify-center py-1 mr-2 rounded-sm px-4 border border-transparent text-xs font-normal text-white font-montserrat hover:shadow-none bg-slate-600 focus:outline-none">
          Gryžti
        </button>
      </div>
    </div>
  );
}