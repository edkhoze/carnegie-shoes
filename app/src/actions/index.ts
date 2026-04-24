import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { env } from 'cloudflare:workers';

/**
 * Read an env var from Cloudflare runtime bindings (wrangler vars + dashboard secrets).
 * Falls back to import.meta.env for local dev with a .env file.
 */
function getEnv(key: string): string | undefined {
  // Cloudflare runtime bindings
  if (env && (env as any)[key]) return (env as any)[key];

  // Fallback: import.meta.env (local dev / .env file)
  return (import.meta.env as Record<string, string>)[key];
}

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().optional(),
      message: z.string().min(1, "Message is required"),
      'cf-turnstile-response': z.string().optional().default('')
    }),
    handler: async (input) => {
      // 1. Verify Turnstile token
      const turnstileToken = input['cf-turnstile-response'];
      if (!turnstileToken) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'Please complete the verification challenge before submitting.' });
      }

      const secret = getEnv('TURNSTILE_SECRET_KEY') || '1x0000000000000000000000000000000AA';
      
      const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secret,
          response: turnstileToken
        }).toString()
      });
      
      const turnstileOutcome = await turnstileVerify.json();
      if (!turnstileOutcome.success) {
        throw new ActionError({ code: 'FORBIDDEN', message: 'Bot verification failed. Please try again.' });
      }

      // 2. Send Email via Resend API
      const resendApiKey = getEnv('RESEND_API_KEY');
      const toEmail = getEnv('TO_EMAIL') || 'evagorelik@yahoo.com.au';
      
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY not found in env. Skipping email send for development.');
        return { success: true, message: "Message received (Development mode)" };
      }

      const fromEmail = getEnv('FROM_EMAIL') || 'Carnegie Shoes Website <website@carnegieshoes.com.au>';
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
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
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send email. Please try again later.' });
      }

      return { success: true, message: "Thank you! We have received your inquiry and will be in touch soon." };
    }
  })
};
