/**
 * NB: If you update this file, please also update `docs/src/app/customization/Themes.js`
 */

import {
  orange900,
  orange50,
  cyan500,
  cyan700,
  pinkA200,
  grey100,
  grey300,
  grey400,
  grey500,
  darkBlack,
  fullBlack,
} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { fade } from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'
import constants from '../modules/constants'

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */
const theme = {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 2,
  palette: {
    primary1Color: orange900,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    secondaryTextColor: fade(darkBlack, 0.54),
    alternateTextColor: orange50,
    canvasColor: orange50,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
  appBar: {
    height: constants.appBarHeight,
  },
}

export default getMuiTheme(theme)
