// components/Container.tsx
import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={
        "w-full max-w-screen-2xl mx-auto px-4 md:px-6 " + className
      }
    >
      {children}
    </div>
  );
}
