import React, { memo } from "react";
import cn from "@sindresorhus/class-names";

interface LoaderProps {
  color?: string;
  scale?: number;
  className?: string;
}

const _Loader: React.FunctionComponent<LoaderProps> = ({
  color = "#fff",
  scale = 1,
  className
}) => {
  const style = {
    backgroundColor: color
  };
  return (
    <div
      className={cn("dot-loader", className)}
      style={{ transform: `scale(${scale})` }}
    >
      <div style={style} />
      <div style={style} />
      <div style={style} />
    </div>
  );
};

export const Loader = memo(_Loader);
