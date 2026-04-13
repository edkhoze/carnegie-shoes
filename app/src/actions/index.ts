import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().optional(),
      message: z.string().min(1, "Message is required"),
      'cf-turnstile-response': z.string()
    }),
    handler: async (input) => {
      // 1. Verify Turnstile token
      const secret = import.meta.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'; // dummy secret
      
      const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secret,
          response: input['cf-turnstile-response']
        }).toString()
      });
      
      const turnstileOutcome = await turnstileVerify.json();
      if (!turnstileOutcome.success) {
        throw new Error('Bot verification failed. Please try again.');
      }

      // 2. Send Email via Resend API
      const resendApiKey = import.meta.env.RESEND_API_KEY;
      const toEmail = import.meta.env.TO_EMAIL || 'evagorelik@yahoo.com.au';
      
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY not found in env. Skipping email send for development.');
        return { success: true, message: "Message received (Development mode)" };
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Carnegie Shoes Website <website@resend.dev>', // Update this with verified domain later
          to: toEmail,
          subject: `New Contact Form Submission from ${input.name}`,
          html: `<p><strong>Name:</strong> ${input.name}</p>
                 <p><strong>Email:</strong> ${input.email}</p>
                 <p><strong>Phone:</strong> ${input.phone}</p>
                 <p><strong>Message:</strong></p>
                 <p>${input.message.replace(/\n/g, '<br>')}</p>`
        })
      });

      if (!emailResponse.ok) {
        const err = await emailResponse.json();
        console.error('Resend Error:', err);
        throw new Error('Failed to send email. Please try again later.');
      }

      return { success: true, message: "Thank you! We have received your inquiry and will be in touch soon." };
    }
  })
};
