import React from "react";
import { Blocks } from "react-loader-spinner";

function Spinner() {
  return (
    <div className="bg-black bg-opacity-50 h-full w-full flex items-center justify-center fixed top-0 z-50">
      <Blocks
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
      />
    </div>
  );
}

export default Spinner;
