import nodemailer from 'nodemailer';


const transporter= nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    },
    tls : {
        rejectUnauthorized : false
    }
}, )

export const sendPaymentConfirmationEmail = async(to : string, invoiceId : string, amount : number) => {
    try {
        const mailOptions = {
            from : process.env.EMAIL_USER,
            to,
            subject: "Payment Confirmation - Invoice Paid",
            html: `
            <h2>Payment Successful</h2>
            <p>Your payment for Invoice <strong>#${invoiceId}</strong> of <strong>$${amount.toFixed(2)}</strong> has been received successfully.</p>
            <p>Thank you for your business!</p>
            <br/>
            <p>Best Regards,</p>
            <p>Your Company Name</p>
        `,
        }
        await transporter.sendMail(mailOptions);
        console.log(`📧 Payment confirmation email sent to ${to}`);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}