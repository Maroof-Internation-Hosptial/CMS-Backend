import nodemailer from 'nodemailer'

export const sendMail=async(email,subject,html)=>{

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
          secure:false,
            auth: {
                user: process.env.GMAIL_USER,
                pass:process.env.PASS
            }
        })
       let result= await transporter.sendMail({
            to:email,
            subject: subject,
            html:html
        })
        return result
    } catch (error) {
        console.log(error,"email not sent");
    }
}
