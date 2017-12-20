// @flow
import React from 'react'
import TextField from 'material-ui/TextField'
import styled from 'styled-components'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import withState from 'recompose/withState'
import { withApollo } from 'react-apollo'
import get from 'lodash/get'
import jwtDecode from 'jwt-decode'
import app from 'ampersand-app'

import loginMutation from './loginMutation'

const Container = styled.div`
  padding: 10px;
`

const enhance = compose(
  withApollo,
  withState('name', 'changeName', ''),
  withState('pass', 'changePass', ''),
  withState('nameErrorText', 'changeNameErrorText', ''),
  withState('passErrorText', 'changePassErrorText', ''),
  withHandlers({
    fetchLogin: props => async (namePassed, passPassed) => {
      const {
        client,
        changeNameErrorText,
        changePassErrorText,
        changeName,
        changePass,
      } = props
      // when bluring fields need to pass event value
      // on the other hand when clicking on Anmelden button,
      // need to grab props
      const name = namePassed || props.name
      const pass = passPassed || props.pass
      if (!name) {
        return changeNameErrorText(
          'Geben Sie den Ihnen zugeteilten Benutzernamen ein'
        )
      }
      if (!pass) {
        return changePassErrorText('Bitte Passwort eingeben')
      }
      let result
      try {
        result = await client.mutate({
          mutation: loginMutation,
          variables: { username: name, pass },
        })
        const jwtToken = get(result, 'data.login.jwtToken')
        console.log('Login: jwtToken:', jwtToken)
        if (jwtToken) {
          const tokenDecoded = jwtDecode(jwtToken)
          console.log('Login: tokenDecoded:', tokenDecoded)
          // refresh currentUser in idb
          app.db.currentUser.clear()
          app.db.currentUser.put({
            username: tokenDecoded.username,
            token: tokenDecoded.token,
            role: tokenDecoded.role,
          })
          changeNameErrorText(null)
          changePassErrorText(null)
          setTimeout(() => {
            changeName('')
            changePass('')
          }, 2000)
          // TODO: set jwtToken to store
          // TODO: message success
          // TODO: setHistory to Taxonomien or stored value
          // TODO: empty stored value
        }
      } catch (error) {
        const messages = error.graphQLErrors.map(x => x.message)
        const isNamePassError = messages.includes('invalid user or password')
        if (isNamePassError) {
          const message = 'Name oder Passwort nicht bekannt'
          changeNameErrorText(message)
          changePassErrorText(message)
        }
      }
    },
  }),
  withHandlers({
    onBlurName: ({
      pass,
      changeName,
      changeNameErrorText,
      fetchLogin,
    }) => e => {
      changeNameErrorText('')
      const name = e.target.value
      changeName(name)
      if (!name) {
        changeNameErrorText('Geben Sie den Ihnen zugeteilten Benutzernamen ein')
      } else if (pass) {
        fetchLogin(name, pass)
      }
    },
    onBlurPassword: props => e => {
      const { name, changePass, changePassErrorText, fetchLogin } = props
      changePassErrorText('')
      const pass = e.target.value
      changePass(pass)
      if (!pass) {
        changePassErrorText('Bitte Passwort eingeben')
      } else if (name) {
        fetchLogin(name, pass)
      }
    },
  })
)

const Login = ({
  store,
  name,
  pass,
  nameErrorText,
  passErrorText,
  changeNameErrorText,
  changePassErrorText,
  onBlurName,
  onBlurPassword,
  fetchLogin,
}: {
  store: Object,
  name: string,
  changeName: () => void,
  pass: string,
  changePass: () => void,
  nameErrorText: string,
  changeNameErrorText: () => void,
  passErrorText: string,
  changePassErrorText: () => void,
  onBlurName: () => void,
  onBlurPassword: () => void,
  fetchLogin: () => void,
}) => (
  <Container>
    <TextField
      floatingLabelText="Name"
      defaultValue={name}
      onBlur={onBlurName}
      errorText={nameErrorText}
      fullWidth
      autoFocus
      onKeyPress={e => {
        if (e.key === 'Enter') {
          onBlurName(e)
        }
      }}
    />
    <TextField
      floatingLabelText="Passwort"
      type="password"
      defaultValue={pass}
      onBlur={onBlurPassword}
      errorText={passErrorText}
      fullWidth
      onKeyPress={e => {
        if (e.key === 'Enter') {
          onBlurPassword(e)
        }
      }}
    />
  </Container>
)

export default enhance(Login)
