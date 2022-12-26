import React, { useState, useCallback, useContext, useRef } from 'react'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import Snackbar from '@mui/material/Snackbar'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import {
  MdVisibility as VisibilityIcon,
  MdVisibilityOff as VisibilityOffIcon,
} from 'react-icons/md'
import styled from '@emotion/styled'
import { useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'

import fetchLoginModule from './fetchLogin'
import idbContext from '../../idbContext'
import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'

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

const Login = () => {
  const client = useApolloClient()
  const idb = useContext(idbContext)
  const store = useContext(storeContext)
  const { login } = store
  const { token, setLogin } = login

  const navigate = useNavigate()

  const [name, changeName] = useState('')
  const [pass, changePass] = useState('')
  const [showPass, changeShowPass] = useState(false)
  const [nameErrorText, changeNameErrorText] = useState('')
  const [passErrorText, changePassErrorText] = useState('')
  const [loginSuccessfull, changeLoginSuccessfull] = useState(false)

  const nameInput = useRef(null)
  const passwordInput = useRef(null)

  const fetchLogin = useCallback(
    (namePassed, passPassed, navigate) =>
      fetchLoginModule({
        client,
        changeNameErrorText,
        changePassErrorText,
        name,
        changeName,
        pass,
        changePass,
        changeLoginSuccessfull,
        namePassed,
        passPassed,
        idb,
        store,
        nameInput,
        passwordInput,
        navigate
      }),
    [client, name, pass, idb, store],
  )
  const onLogout = useCallback(() => {
    idb.users.clear()
    setLogin({
      username: '',
      token: '',
    })
  }, [idb.users, setLogin])
  const onBlurName = useCallback(
    (e) => {
      changeNameErrorText('')
      const name = e.target.value
      changeName(name)
      if (!name) {
        changeNameErrorText('Geben Sie den Ihnen zugeteilten Benutzernamen ein')
      } else if (pass) {
        fetchLogin(name, pass, navigate)
      }
    },
    [fetchLogin, navigate, pass],
  )
  const onBlurPassword = useCallback(
    (e) => {
      changePassErrorText('')
      const pass = e.target.value
      changePass(pass)
      if (!pass) {
        changePassErrorText('Bitte Passwort eingeben')
      } else if (name) {
        fetchLogin(name, pass, navigate)
      }
    },
    [fetchLogin, name, navigate],
  )
  const onKeyPressName = useCallback(
    (e) => e.key === 'Enter' && onBlurName(e),
    [onBlurName],
  )
  const onKeyPressPass = useCallback(
    (e) => e.key === 'Enter' && onBlurPassword(e),
    [onBlurPassword],
  )
  const onClickTogglePass = useCallback(
    () => changeShowPass(!showPass),
    [showPass],
  )
  const onMouseDownTogglePass = useCallback((e) => {
    e.preventDefault()
  }, [])

  return (
    <ErrorBoundary>
      <Container>
        {!token && (
          <FormControl fullWidth error={!!nameErrorText} variant="standard">
            <TextField
              inputRef={nameInput}
              label="Name"
              defaultValue={name}
              onBlur={onBlurName}
              fullWidth
              autoFocus
              onKeyPress={onKeyPressName}
              autoComplete="username"
              variant="standard"
            />
            <FormHelperText id="name-error-text">
              {nameErrorText}
            </FormHelperText>
          </FormControl>
        )}
        {!token && (
          <FormControl fullWidth error={!!passErrorText} variant="standard">
            <InputLabel htmlFor="password">Passwort</InputLabel>
            <Input
              id="adornment-password"
              inputRef={passwordInput}
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
                    size="large"
                  >
                    {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText id="name-error-text">
              {passErrorText}
            </FormHelperText>
          </FormControl>
        )}
        {!token && <StyledButton color="inherit">anmelden</StyledButton>}
        {!!token && (
          <StyledButton onClick={onLogout} color="inherit">
            abmelden
          </StyledButton>
        )}
        <StyledSnackbar
          open={loginSuccessfull}
          message={`Willkommen ${name}`}
        />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Login)
