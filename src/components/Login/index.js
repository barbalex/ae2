// @flow
import React, { useState, useCallback, useContext } from 'react'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import styled from 'styled-components'
import get from 'lodash/get'
import { useQuery, useApolloClient } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import fetchLoginModule from './fetchLogin'
import setLoginMutation from '../../modules/loginMutation'
import ErrorBoundary from '../shared/ErrorBoundary'
import idbContext from '../../idbContext'
import historyContext from '../../historyContext'

const Container = styled.div`
  padding: 10px;
`
const StyledButton = styled(Button)`
  border: 1px solid !important;
  margin-top: 5px;
`
const StyledSnackbar = styled(Snackbar)`
  div {
    min-width: auto;
    background-color: #2e7d32 !important;
  }
`

const storeQuery = gql`
  query storeQuery {
    historyAfterLogin @client
    login @client {
      token
      username
    }
  }
`

const Login = () => {
  const client = useApolloClient()
  const { idb } = useContext(idbContext)
  const { history } = useContext(historyContext)

  const { data: storeData } = useQuery(storeQuery, { suspend: false })

  const token = get(storeData, 'login.token')
  const historyAfterLogin = get(storeData, 'historyAfterLogin')

  const [name, changeName] = useState('')
  const [pass, changePass] = useState('')
  const [showPass, changeShowPass] = useState(false)
  const [nameErrorText, changeNameErrorText] = useState('')
  const [passErrorText, changePassErrorText] = useState('')
  const [loginSuccessfull, changeLoginSuccessfull] = useState(false)

  const fetchLogin = useCallback(
    (namePassed, passPassed) =>
      fetchLoginModule({
        client,
        changeNameErrorText,
        changePassErrorText,
        name,
        changeName,
        pass,
        changePass,
        changeLoginSuccessfull,
        historyAfterLogin,
        namePassed,
        passPassed,
        idb,
        history,
      }),
    [name, pass, historyAfterLogin],
  )
  const onLogout = useCallback(() => {
    idb.users.clear()
    client.mutate({
      mutation: setLoginMutation,
      variables: {
        username: '',
        token: '',
      },
      optimisticResponse: {
        setLoginInStore: {
          username: '',
          token: '',
          __typename: 'Login',
        },
        __typename: 'Mutation',
      },
    })
  })
  const onBlurName = useCallback(
    e => {
      changeNameErrorText('')
      const name = e.target.value
      changeName(name)
      if (!name) {
        changeNameErrorText('Geben Sie den Ihnen zugeteilten Benutzernamen ein')
      } else if (pass) {
        fetchLogin(name, pass)
      }
    },
    [pass],
  )
  const onBlurPassword = useCallback(
    e => {
      changePassErrorText('')
      const pass = e.target.value
      changePass(pass)
      if (!pass) {
        changePassErrorText('Bitte Passwort eingeben')
      } else if (name) {
        fetchLogin(name, pass)
      }
    },
    [name],
  )
  const onKeyPressName = useCallback(e => {
    if (e.key === 'Enter') {
      onBlurName(e)
    }
  })
  const onKeyPressPass = useCallback(e => {
    if (e.key === 'Enter') {
      onBlurPassword(e)
    }
  })
  const onClickTogglePass = useCallback(() => changeShowPass(!showPass), [
    showPass,
  ])
  const onMouseDownTogglePass = useCallback(e => e.preventDefault())

  return (
    <ErrorBoundary>
      <Container>
        {!token && (
          <FormControl fullWidth error={!!nameErrorText}>
            <TextField
              label="Name"
              defaultValue={name}
              onBlur={onBlurName}
              fullWidth
              autoFocus
              onKeyPress={onKeyPressName}
              autoComplete="username"
            />
            <FormHelperText id="name-error-text">
              {nameErrorText}
            </FormHelperText>
          </FormControl>
        )}
        {!token && (
          <FormControl fullWidth error={!!passErrorText}>
            <InputLabel htmlFor="password">Passwort</InputLabel>
            <Input
              id="adornment-password"
              type={showPass ? 'text' : 'password'}
              defaultValue={pass}
              onBlur={onBlurPassword}
              fullWidth
              onKeyPress={onKeyPressPass}
              autoComplete="current-password"
              autoCorrect="off"
              spellCheck="false"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={onClickTogglePass}
                    onMouseDown={onMouseDownTogglePass}
                    title={showPass ? 'verstecken' : 'anzeigen'}
                  >
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText id="name-error-text">
              {passErrorText}
            </FormHelperText>
          </FormControl>
        )}
        {!token && <StyledButton>anmelden</StyledButton>}
        {!!token && <StyledButton onClick={onLogout}>abmelden</StyledButton>}
        <StyledSnackbar
          open={loginSuccessfull}
          message={`Willkommen ${name}`}
        />
      </Container>
    </ErrorBoundary>
  )
}

export default Login
