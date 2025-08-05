import React from "react";
import { QuestionMCQ } from "./QuestionMCQ";
import { QuestionNumeric } from "./QuestionNumeric";
export function ActiveTaskCard({ item, onCheck, onHint }) {
  if (!item) return null;
  return item.variant==="mcq" ? <QuestionMCQ item={item} onCheck={onCheck} onHint={onHint}/> : <QuestionNumeric item={item} onCheck={onCheck} onHint={onHint}/>;
}
