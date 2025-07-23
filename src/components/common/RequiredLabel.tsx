import React from "react";

type Props = {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
};

const RequiredLabel: React.FC<Props> = ({ children, htmlFor, required = true }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1 font-medium text-[15px] text-foreground flex items-center gap-1"
  >
    {children}
    {required && <span className="text-red-600 text-base ml-0.5">*</span>}
  </label>
);

export { RequiredLabel };
export default RequiredLabel;
