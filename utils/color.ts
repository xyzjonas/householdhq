export const shouldInvert = (colorHex: string): boolean => {
  const hexToRgb = (hex: string) => {
      return {
          red: parseInt(hex.substring(1, 3), 16),
          green: parseInt(hex.substring(3, 5), 16),
          blue: parseInt(hex.substring(5, 7), 16)
      }
  };

    const rgb = hexToRgb(colorHex);
    const brightness = (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;
    return brightness > 135;
}