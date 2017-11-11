// @flow
import { graphql } from 'react-apollo'

import appQuery from '../modules/appQuery'
import variablesFromStore from '../modules/variablesFromStore'

const AppData = graphql(appQuery, {
  options: ({ store }: { store: Object }) => ({
    variables: variablesFromStore({ store }),
  }),
})

export default AppData
