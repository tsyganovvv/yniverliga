import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from '../../pages/Home';
import MainLayout from '../Layouts/MainLayout'


export default function MainRouter() {

  return (
  <Router>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  </Router>
  )
}
