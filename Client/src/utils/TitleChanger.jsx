import { useEffect } from "react";

export const TitleChanger = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
