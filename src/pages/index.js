import React from 'react'

import Router from '../components/Router'
import Header from '../components/Head'

const Index = ({ location }) => <Router location={location} />

export default Index

export const Head = () => <Header />
