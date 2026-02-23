import nodemailer from 'nodemailer'

interface EmailOptions {
    to: string
    subject: string
    text: string
    html?: string
}

// SMTP configuration from environment variables
const createTransporter = () => {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn('Email not configured: missing SMTP credentials')
        return null
    }

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    })
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        if (!transporter) {
            transporter = createTransporter()
        }

        if (!transporter) {
            console.error('Cannot send email: transporter not configured')
            return false
        }

        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html || options.text,
        })

        console.log('Email sent:', result.messageId)
        return true
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}

export const sendOtpEmail = async (email: string, code: string): Promise<boolean> => {
    const appName = 'Waelio / PEACE2074'

    const text = `
Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Thank you,
${appName} Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Verification Code</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
        
        <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${code}</span>
        </div>
        
        <p style="font-size: 14px; color: #666; margin: 20px 0;">This code will expire in <strong>10 minutes</strong>.</p>
        
        <p style="font-size: 14px; color: #666;">If you didn't request this code, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
            Thank you,<br>
            <strong>${appName}</strong> Team
        </p>
    </div>
</body>
</html>
    `.trim()

    return sendEmail({
        to: email,
        subject: `Your verification code: ${code}`,
        text,
        html,
    })
}

export const isEmailConfigured = (): boolean => {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}
