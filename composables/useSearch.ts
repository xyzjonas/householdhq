import type { Transaction } from "~/types";

export const useSearch = () => {
  function replaceUnicode(value: string) {
    // search without special czech chars
    return value
      .replaceAll("ě", "e")
      .replaceAll("š", "s")
      .replaceAll("č", "c")
      .replaceAll("ř", "r")
      .replaceAll("ž", "z")
      .replaceAll("ý", "y")
      .replaceAll("á", "a")
      .replaceAll("é", "e")
      .replaceAll("í", "i")
      .replaceAll("ů", "u")
      .replaceAll("ú", "u")
      .replaceAll("ť", "t")
      .replaceAll("ď", "d")
      .replaceAll("ó", "o")
      .replaceAll("ň", "n");
  }

  function isMatch(searchTerm: string, value: string) {
    const cleanTerm = replaceUnicode(searchTerm.toLowerCase());
    const cleanValue = replaceUnicode(value.toLowerCase());
    return cleanValue.includes(cleanTerm);
  }

  function doesTransactionMatch(searchTerm: string, value: Transaction) {
    return isMatch(
      searchTerm,
      [
        value.category.name,
        value.description,
        value.project?.name ?? "",
        value.source.name,
        value.target.name,
      ].join(" ")
    );
  }

  return {
    isMatch,
    doesTransactionMatch,
  };
};
