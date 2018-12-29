// @flow
import React, { useEffect, useState, useCallback } from 'react'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import styled from 'styled-components'
import compose from 'recompose/compose'
import { withApollo } from 'react-apollo'
import get from 'lodash/get'

import withActiveNodeArrayData from '../../modules/withActiveNodeArrayData'
import withData from './withData'
import withTreeData from '../Tree/withTreeData'
import Roles from './Roles'
import PCs from './PCs'
import TCs from './TCs'
import updateUserMutation from './updateUserMutation'
import updateUserMutationWithPass from './updateUserMutationWithPass'
import ErrorBoundary from '../shared/ErrorBoundary'

const Container = styled.div``
const OrgContainer = styled.div`
  padding: 10px;
`
const SaveButton = styled(Button)`
  border: 1px solid !important;
  margin-top: 10px !important;
`
const StyledPaper = styled(Paper)`
  background-color: #ffcc80 !important;
`

const enhance = compose(
  withApollo,
  withActiveNodeArrayData,
  withData,
  withTreeData,
)

const User = ({
  client,
  data,
  treeData,
  dimensions,
}: {
  client: Object,
  data: Object,
  treeData: Object,
  dimensions: Object,
}) => {
  const user = get(data, 'userById', {})

  const [name, setName] = useState(user.name)
  const [nameErrorText, setNameErrorText] = useState('')
  const [email, setEmail] = useState(user.email)
  const [emailErrorText, setEmailErrorText] = useState('')
  const [passNew, setPassNew] = useState('')
  const [tab, setTab] = useState(0)

  const { id } = user
  const { width } = dimensions
  const loginUsername = get(data, 'login.username')
  const orgUsers = get(user, 'organizationUsersByUserId.nodes', [])
  const pcs = get(user, 'propertyCollectionsByImportedBy.nodes', [])
  const tcs = get(user, 'taxonomiesByImportedBy.nodes', [])
  const saveEnabled =
    !data.loading &&
    (passNew ||
      ((!!name && !!data && !!user && name !== user.name) ||
        (!!email && !!data && !!user && email !== user.email)))
  const userIsLoggedIn =
    !!user && !!loginUsername && user.name === loginUsername

  useEffect(
    () => {
      setName(user.name)
      setEmail(user.email)
    },
    [user],
  )
  const onChangeTab = useCallback((event, value) => {
    setTab(value)
  })

  const onChangeName = useCallback(e => setName(e.target.value))
  const onChangeEmail = useCallback(e => setEmail(e.target.value))
  const onChangePassNew = useCallback(e => setPassNew(e.target.value))

  const onSave = useCallback(
    async () => {
      const variables = passNew
        ? {
            username: name,
            email,
            id,
            pass: passNew,
          }
        : {
            username: name,
            email,
            id,
          }
      const mutation = passNew ? updateUserMutationWithPass : updateUserMutation
      try {
        await client.mutate({
          mutation,
          variables,
        })
      } catch (error) {
        const messages = error.graphQLErrors.map(x => x.message).toString()
        const isProperEmailError = messages.includes('proper_email')
        if (isProperEmailError) {
          const message = 'Email ist nicht gültig'
          return setEmailErrorText(message)
        }
        return console.log(error)
      }
      // refetch to update
      data.refetch()
      treeData.refetch()
      setNameErrorText('')
      setEmailErrorText('')
      setPassNew('')
    },
    [user, name, email, passNew],
  )

  return (
    <ErrorBoundary>
      <Container>
        <OrgContainer>
          <FormControl
            fullWidth
            error={!!nameErrorText}
            aria-describedby="name-error-text"
          >
            <TextField
              name="name"
              label="Name"
              value={name || ''}
              onChange={onChangeName}
              fullWidth
              autoComplete="username"
            />
            <FormHelperText id="name-error-text">
              {nameErrorText}
            </FormHelperText>
          </FormControl>
          <FormControl
            fullWidth
            error={!!emailErrorText}
            aria-describedby="email-error-text"
          >
            <TextField
              name="email"
              label="Email"
              value={email || ''}
              onChange={onChangeEmail}
              fullWidth
              autoComplete="email"
            />
            <FormHelperText id="email-error-text">
              {emailErrorText}
            </FormHelperText>
          </FormControl>
          {userIsLoggedIn && (
            <FormControl fullWidth>
              <TextField
                name="passNew"
                label="Passwort ändern"
                type="password"
                value={passNew || ''}
                onChange={onChangePassNew}
                fullWidth
                autoComplete="new-password"
              />
            </FormControl>
          )}
          <SaveButton onClick={onSave} disabled={!saveEnabled}>
            Änderungen speichern
          </SaveButton>
        </OrgContainer>
        <StyledPaper>
          <Tabs
            centered={width > 779}
            value={tab}
            onChange={onChangeTab}
            indicatorColor="primary"
            scrollable={width <= 779}
            scrollButtons="auto"
          >
            <Tab label={`Rollen (${orgUsers.length})`} />
            <Tab label={`importierte Taxonomien (${tcs.length})`} />
            <Tab
              label={`importierte Eigenschaften-Sammlungen (${pcs.length})`}
            />
          </Tabs>
        </StyledPaper>
        {tab === 0 && <Roles orgUsers={orgUsers} />}
        {tab === 1 && <TCs tcs={tcs} />}
        {tab === 2 && <PCs pcs={pcs} />}
      </Container>
    </ErrorBoundary>
  )
}

export default enhance(User)
