// @flow
import extendStore from './extend'
import ObservableHistory from './ObservableHistory'

function Store(): void {
  this.props = {}
  this.setProps = () => {}
  this.nodes = []
  this.setNodes = () => {}
  this.history = ObservableHistory
  this.treeFilter = {}
  this.export = {
    categories: [],
    combineTaxonomies: false,
    setCombineTaxonomies: () => {},
  }
  this.categories = []
}

const MyStore = new Store()

extendStore(MyStore)

export default MyStore
