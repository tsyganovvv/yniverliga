export const loadFonts = async (): Promise<void> => {
  await Promise.all([
    document.fonts.load("400 1rem WixMadeForDisplay"),
    document.fonts.load("700 1rem WixMadeForDisplay"),
  ]);
};
