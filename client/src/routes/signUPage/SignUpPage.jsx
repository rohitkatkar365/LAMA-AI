import React from 'react';
import './signup.css';
import { SignUp } from '@clerk/clerk-react';

function SignUpPage() {
  return (
    <div className="signUp">
      <SignUp path="/sign-up" signInUrl='/sign-in'/>
    </div>
  );
}

export default SignUpPage;
