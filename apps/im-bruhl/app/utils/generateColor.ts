export const generateColor = (index: number) => {
  const colors = ["#ff9999", "#99ccff", "#99ff99", "#ffcc99", "#cc99ff"];
  return colors[index % colors.length];
};
