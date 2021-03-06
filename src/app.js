/*
 * @Author: 刁琪
 * @Date: 2020-08-13 13:44:18
 * @LastEditors: わからないよう
 */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import dva from './utils/dva'
import models from './models/index'
import './app.scss'

const dvaApp = dva.createApp({
  initialState: {},
  models: models
})
const store = dvaApp.getStore()
class App extends Component {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
