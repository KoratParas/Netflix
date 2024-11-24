import React from "react";
import "./SignUpScreen.css";

function SignUpScreen() {
  return (
    <div className="signUpScreen">
      <form>
        <h1>Sign In</h1>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign In</button>
        <h4>
          <span className="signUpScreen__gray">New to Netflix? </span>
          <span className="signUpScreen_link">Sign Up now.</span>
        </h4>
      </form>
    </div>
  );
}

export default SignUpScreen;
