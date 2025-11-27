import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = ({ className, ...props }: any) => (
  <button 
    className={cn("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50", className)} 
    {...props} 
  />
);