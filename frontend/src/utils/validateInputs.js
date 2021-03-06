const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validatePassword = (password) => {
  // (?=.*[0-9]) - Assert a string has at least one number;
  // (?=.*[!@#$%^&*]) - Assert a string has at least one special character.
  // const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
  const re = /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,16}$/
  return re.test(password)
}


export {
  validateEmail,
  validatePassword
}