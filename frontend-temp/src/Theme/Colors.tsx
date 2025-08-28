export const Colors = {
  primary: '#162A83',
  black:'#15161F',
  grey:'#6F6F6F',
  placeholderText:'#15161F',
  dullWhite:'#F5F5F5',
  dashBoardInactive:'#DCDCDC',
  greyIcn:'#464646',
  greyLine:'#334155',
  dummyText:'#BBBBBB',
  chartPurple:'#5373FF',
  green:'#18DC43',
  lightGreen:'#5BEF4E',
  shadeGreen:'#32BA7C',
  shadeBlue:'#347EE7',
  lightWhite:'#D9D9D9',
  parrot:'#74CB3F',
  white:'#FFFFFF',
  red:'#CA2424',
  lightOrange:'#F08201',
  darkGrey:'#C9C9C9',
  transparentGreen:'rgba(22, 248, 44, 0.09)',
  shadeOrange:'#F08201',
  shadeDullBlue:'#5178E7',
  shadeLightBlue:'#7A91D8',
  shadeRed:'#FF6853',
  shadeGrey:'#787781'
};
export const rgba = (hex: any, opacity: any) => {
  const hexValue = hex.replace('#', '');
  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
