import { cn } from "./Button";

export const Input = ({ className, ...props }: any) => (
  <input 
    className={cn("w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", className)} 
    {...props} 
  />
);