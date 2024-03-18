export const shouldInvert = (colorHex: string): boolean => {
  const hexToRgb = (hex: string): number[] => {
      return [
          parseInt(hex.substring(1, 3), 16),
          parseInt(hex.substring(3, 5), 16),
          parseInt(hex.substring(5, 7), 16)
      ];
  };

    const rgb = hexToRgb(colorHex);
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 170;
}