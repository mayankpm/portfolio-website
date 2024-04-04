"use client"
import React from 'react'
import Hero from '../components/Hero'
import Sidenav from '../components/Sidenav'
import '../styles/Hero.css'

export default function Home() {


  return (
    <>
      <Sidenav/>
      <h1 className="about-text-container font-bold">
        <Hero/>
      </h1>
    </>
  )
}