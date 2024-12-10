import React from 'react'
import './signin.css'
import { SignIn } from '@clerk/clerk-react'
function SignInPage() {
  return (
    <div className='signIn'> <SignIn path="/sign-in" signUpUrl='/sign-up' forceRedirectUrl="/dashboard"/></div>
  )
}

export default SignInPage