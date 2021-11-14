const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



const sendOTPEmail = async(email, otp, next) =>{
    const msg = {
        to: email, // Change to your recipient
        from: '', // Change to your verified sender
        subject: 'ATLAS: Your One Time Password',
        html: `<strong>Your generated One Time Password is ${otp}. Please don't share it with anyone.</strong>`,
      }
      
     return sgMail
        .send(msg);
}

const sendWelcomeMail = async(email, name, next) =>{
  const msg = {
      to: email, // Change to your recipient
      from: '', // Change to your verified sender
      subject: 'ATLAS: Welcome To Altlas',
      html: `<strong>Welcome mail................ </strong><br>
               <p>${name}</p>`,
    }
    
   return sgMail
      .send(msg);
}

const sendPasswordResetMail = async(email, userID, next) =>{
  const msg = {
      to: email, // Change to your recipient
      from: '', // Change to your verified sender
      subject: 'ATLAS: Reset Password',
      html: `You are receiving this because you have requested the reset of the password for your account.<br></br>
                  Please use the following credentials, to login in to your account:<br></br> 
                 
                  <a href="${process.env.BASEURL}/view/forgetPassword_page.html?user=${userID}" style="margin-left:40%; color:white;background-color:#1E90FF;text-decoration:none;"> Reset Password</a>
                  <br></br>If you did not request this, please ignore this email and your password will remain unchanged.<br></br>
                 
                  Regards<br></br> <br></br>Team Atlas <br> <br></br>`
    }
    
   return sgMail
      .send(msg);
}



module.exports = {sendOTPEmail,sendWelcomeMail,sendPasswordResetMail};

